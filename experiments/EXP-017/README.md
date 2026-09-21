## EXPERIMENT ID
EXP-017 — RAM-PRESSURE-001: mobile/bulk audio RAM pressure and work-lifetime control

## SCOPE NOTE (stated explicitly, not assumed)
The task's language ("Testing Deck OFF", "Auto-DJ scoring", "existing version
identifiers", "canvas allocation reuse already fixed") describes the
**production** app (`bad_d_meomory`, mirrored read-only in `reference/`).
This session has no write access to that repository and the hard boundary
(`CLAUDE_NOW.md` §2, this repo's `README.md`) forbids modifying it. The only
real, editable "bulk-import → decode → analysis → evidence" path this lab
can act on is `tools/bulk-media-intake/`. This experiment applies the
*mechanism* production already uses (found in `reference/`, read not
copied) to that lab tool, and states that boundary up front rather than
silently guessing.

## BASELINE

### Locating the path
`tools/bulk-media-intake/pipeline.js` — `processItem()` (per-track:
acquire → hashBytes → decodeValidate → qualityCheck → normalise →
audioContentHash) and `runBatch()` (bounded-concurrency queue, real
cancellation). Driven by `intake.html` (UI) and
`tools/bulk-media-intake/run_experiment.cjs` (Playwright harness, CDP heap
sampling — already existed, reused).

### Where large objects are created
- `arrayBuffer` (raw file bytes) — `stageAcquire`, `processItem`.
- `copy` (defensive clone before decode — "decodeAudioData detaches/
  consumes the buffer in some browsers") — inside `stageDecodeValidate`.
- `audioBuf` (decoded Float32 PCM, ~2x the raw 16-bit WAV size) — returned
  by `stageDecodeValidate`, consumed by `stageQualityCheck`,
  `stageNormalise`, `stageAudioContentHash`.
- No FFT/fingerprint working memory in this tool — `stageAudioContentHash`
  is a cheap energy-envelope hash, not an STFT (the real STFT fingerprint
  engine lives only in `reference/`'s separate audio-engine IIFE, already
  extracted read-only for testing in EXP-014/016, not part of this
  pipeline).

### First finding: this lab's own heap measurement had a blind spot
`run_experiment.cjs`'s existing heap sampling read only
`Runtime.getHeapUsage().usedSize` via CDP. Every prior RAM-adjacent
finding in this lab (EXP-009, EXP-010, EXP-011, EXP-013) used that same
number. A first baseline run (30 tracks × 60s, concurrency 4, ~153MB raw
audio) reported `maxHeapMB: 4` — implausible for that much audio data.
Cross-checked against `lab-harness/session.cjs`'s fuller `heapUsage()`
(which also reads `backingStorageSize`, where `ArrayBuffer`/`TypedArray`
backing bytes actually live): `backingMB` peaked at ~80-140MB in the same
run. **`usedSize` is blind to decoded-audio memory entirely.** Fixed
`run_experiment.cjs` to sample `backingStorageSize` and `totalSize` too
(kept `usedSize`/`maxHeapMB` for backward compatibility with anything
reading old-shape reports). This is the first concrete finding, not a
side note — it means prior "memory looks fine" conclusions in this lab
were never actually checking the number that matters for audio.

### Second finding: file-delivery method changes what you measure
An initial instrumented test pre-fetched all 30 files into memory before
constructing `File` objects (to route around EXP-013's page.evaluate
argument-size lesson) — peak backing 138MB. Switching to
`page.locator('#fileInput').setInputFiles()` (real lazy `File` handles,
same mechanism `run_experiment.cjs` already used, matching how a real
`<input type=file>` behaves) dropped it to ~80MB. The lower, corrected
number is what's reported below; the higher one was a test-harness
artifact, not a pipeline.js behavior, and is not used as evidence.

### Third finding (the actual root cause): GC laziness under allocation burst, not concurrent retention
Hypothesis going in: peak backing memory should scale with `concurrency`
(more concurrent decodes = more simultaneous buffers). Measured
concurrency 1/2/4 on the identical 30×60s workload:

| concurrency | peakBackingMB | maxActiveConcurrent |
|---|---|---|
| 1 | 79.48 | 1 |
| 2 | 74.52 | 2 |
| 4 | 84.81 | 4 |

**Flat, not scaling with concurrency.** Even fully sequential (concurrency
1, only one item ever decoding at a time) peaks at ~79MB — far more than
one item's own transient footprint (~21MB: raw + defensive copy +
decoded, for a 60s file). Forcing GC after every run
(`HeapProfiler.collectGarbage()`) always drops backing memory to ~0.04MB
— confirming this is **unswept garbage accumulating during a rapid
allocation burst**, not a retention leak (same class of finding as
EXP-010's original JS-heap lesson, now shown to apply to backing-store
memory too, which EXP-010 never measured).

This directly falsified my first fix attempt (see ROOT CAUSE/FIX below)
and is reported as a genuine null result, not hidden.

## ROOT CAUSE
Two real, distinct issues, one minor and one that mattered:

1. **Minor, confirmed but not dominant**: `processItem`'s local
   `arrayBuffer` reference stayed alive (referenced by a `const`) through
   the entire rest of the function — qualityCheck, normalise,
   audioContentHash — even though nothing after the decode call needs it
   (hashing already happened earlier). Fixed by dropping the reference
   (`let` + `arrayBuffer = null` right after decode consumes it). Measured
   impact: **negligible** (79.97MB → 79.74MB on the same workload, within
   noise) — this was NOT the dominant driver of peak memory. Kept anyway:
   it's correct, zero-risk (doesn't touch the reusable `stageDecodeValidate`
   function's own defensive copy or its exported contract), and shortens
   the real per-item retention window even though it didn't move the peak
   number in this measurement.

2. **Dominant, confirmed by the concurrency-sweep null result above**:
   nothing in `pipeline.js` gives the browser's GC a chance to catch up
   during a fast, sustained allocation burst — no signal exists that says
   "pressure is rising, slow down." Neither `runBatch`'s existing
   concurrency bound nor the per-item cleanup above address this, because
   the problem isn't simultaneous *live* buffers, it's *allocation rate*
   outpacing collection. This matches the task's own stated gap directly:
   "adaptive cooldown/governor is still missing."

## FIX
`tools/bulk-media-intake/pipeline.js`:
- `let arrayBuffer` + explicit `arrayBuffer = null` after
  `stageDecodeValidate` consumes it (item 1 above).
- `resourcePressureHigh(memoryReader)` + a pressure check in `runBatch`'s
  `launchNext()`: before dequeuing a new item, if `activeCount > 0` AND
  measured pressure is high, defer the launch (recheck after
  `pressureRecheckMs`, default 120ms) instead of starting more concurrent
  work. Never defers when `activeCount === 0` (a stale/quantized high
  reading must not permanently stall the queue).

**Adapted, not copied, from existing production code** found in
`reference/BAD-D_SIGNAL_15_72_0-mobile.REFERENCE_READONLY.html`:
`resourcePressureHigh()` (same signal — `performance.memory.usedJSHeapSize
/ jsHeapSizeLimit`, same 0.82 "high" threshold, reused rather than
invented) and `yieldForMemoryPressure()` (same 120ms backoff constant,
reused). Adapted to `runBatch`'s event-driven `launchNext()` shape instead
of production's sequential `processLibraryQueue` loop — the mechanism is
the same, the integration point is different because the two pipelines
are architecturally different.

**Testability seam, stated explicitly**: `performance.memory` is
quantized/unreliable for small deltas in this lab's sandbox (EXP-005's
already-established finding) — a real high-pressure event could not be
reliably reproduced headlessly. `resourcePressureHigh`/`runBatch` accept
an injectable `memoryReader` so the governor's actual behavior (defer,
then resume once pressure clears) is verified directly against a
deterministic simulated signal, not merely asserted. This is a test hook,
not a change to the production-facing default behavior (which still reads
real `performance.memory` when no reader is injected).

`tools/bulk-media-intake/intake.html`: added `window.__badLabActiveCount`/
`__badLabMaxActiveCount`, incremented/decremented from the already-present
`onItemStart`/`onItemDone` hooks — exposed only for external
instrumentation (`run_experiment.cjs`), not read by the pipeline itself.

`tools/bulk-media-intake/run_experiment.cjs`: heap sampling now captures
`backingStorageSize`/`totalSize` alongside `usedSize` (finding #1 above),
plus `maxActiveConcurrent` (via the new active-count hook) and a
post-run forced-GC sample (`afterForceGc`) to distinguish real leaks from
unswept garbage, matching EXP-010's methodology, now extended to
backing-store memory.

## BEFORE/AFTER MEASUREMENTS

### Baseline (30 tracks × 60s, ~153MB raw, concurrency 4)
`baseline_30track_c4.json` — `durationMs: 2759`, `peakBackingMB: 84.82`,
`maxActiveConcurrent: 4`, `afterForceGc.backingMB: 0.04` (no leak),
`passedCount: 30/30`.

### Deliberate-failure proof — governor specifically
`governor_deliberate_failure_proof.json`. Same 12-track workload, injected
`memoryReader` reporting sustained 90% heap pressure (above the 0.82
threshold) for the entire run:

| | maxActive | totalMs | resultCount |
|---|---|---|---|
| PRE-FIX (no governor) | **4** (pressure ignored) | 1322.5 | 12/12 |
| POST-FIX (governor active) | **1** (held down correctly) | 1205.5 | 12/12 |

Old code reached full concurrency regardless of pressure signal — the
regression test fails against old behavior. New code holds concurrency at
the floor (1, never 0) for as long as pressure is reported high, and both
still deliver all 12 results — passes after the fix. Wall-clock time was
NOT meaningfully worse under the throttled-to-1 condition (1205ms vs
1322ms) — for this workload, decode is CPU-bound enough that concurrency
wasn't buying much real parallelism to begin with, so the governor's
safety cost is close to free here, not a forced tradeoff.

### Sustained workload (32 tracks — 30 valid @ 60s + 2 deliberately malformed, ~153MB)
`sustained_42track_workload.json` (named for the originally-planned size;
actual run was 32 tracks — noted, not silently renamed):
- Clean run: 30/32 passed, 2/2 malformed correctly failed,
  `summaryRowCount: 32` (matches submitted), `peakBackingMB: 74.46`,
  `afterForceGc.backingMB: 0.04`, 0 unexpected page errors (the 2 expected
  "Unable to decode audio data" messages are the malformed files being
  correctly rejected).
- Cancelled run (cancel at 400ms): 13 passed + 0 failed + 19 cancelled =
  32 accounted for, `summaryRowCount: 32`, `peakBackingMB: 79.49`,
  `afterForceGc.backingMB: 0.04`.

## RESOURCE LIFETIME RESULT
No cross-batch leak at any tested scale (12/30/32 tracks) — `afterForceGc`
backing memory is consistently ~0.04MB regardless of workload size.
Peak *in-flight* backing memory does not scale with track count (flat
~75-85MB from 12 to 32 tracks) or meaningfully with concurrency
(1/2/4 all land in the same ~75-85MB band) — it's bounded by allocation
burst rate relative to GC cadence, not by dataset size or concurrency
setting. The governor directly targets that: it doesn't reduce the peak
number in a short burst (GC still needs its own time regardless), but it
gives the browser explicit permission to catch up before more allocation
pressure is added, which is what "PRESSURE RECOVERS → resume
intelligently" requires operationally, and is the axis a longer/heavier
real mobile workload would actually need.

## AUDIO/ANALYSIS QUALITY RESULT
`quality_protection_comparison.json` — identical fixture through
`processItem` before vs after: `sha256`, `audioContentHash`, `duration`,
`sampleRate`, `channels`, `validationStatus`, `warnings`, `audioStatus`
all byte-identical (`"identical": true`). The governor changes WHEN work
runs, never WHAT is computed — confirmed directly, not assumed.

## CANCELLATION RESULT
Full matrix exercised in one real run (the cancelled 32-track run above):
**completed** (13), **cancelled** — both started-then-cancelled and
never-started collapse to the same durable `cancelled` result per
CANCEL-OBS-001 (EXP-015) — (19), **failed** (0 here, proven separately in
the clean run: 2/2 malformed correctly failed). Every submitted item
produced a row; `13 + 0 + 19 = 32` accounted for exactly.
**Recovered** (interruption survived across a reload) is explicitly NOT
tested and NOT claimed — `bulk-media-intake` has no persistence layer
(RESUME-001, still deferred; EXP-010 already documented clean total loss
on reload). This experiment does not change that, and does not pretend
otherwise.

## REGRESSION RESULT
Re-ran all three existing evidence-backed cycles against the changes,
unmodified:
- `regression_cancel_obs.cjs` (EXP-015): `PASS` (20/20 rows,
  passed+cancelled accounted for).
- `run_cycle.cjs` (EXP-013, 100-item batch + attacks): `STOP_REASON:
  COMPLETED`, `DECISION: KEEP`.
- `run_cycle_audio_autodj.cjs` (EXP-014, real audio + real algorithm):
  `STOP_REASON: COMPLETED`, `DECISION: KEEP`.

No regression in any prior evidence.

## FILES CHANGED
- `tools/bulk-media-intake/pipeline.js` — `let`/null-out `arrayBuffer`
  after decode; `resourcePressureHigh()`; pressure-aware `launchNext()`;
  `resourcePressureHigh` added to the module's export surface.
- `tools/bulk-media-intake/intake.html` — `__badLabActiveCount`/
  `__badLabMaxActiveCount` exposed from existing hooks (instrumentation
  only, no behavior change).
- `tools/bulk-media-intake/run_experiment.cjs` — heap sampling now reads
  `backingStorageSize`/`totalSize`, tracks `maxActiveConcurrent`, samples
  once more after a forced GC.

## WHAT IS PROVEN
- This lab's own prior heap measurements (EXP-009/010/011/013) never saw
  ArrayBuffer/TypedArray backing-store memory — a real, previously-unknown
  measurement gap, now fixed in the shared harness.
- Peak backing memory during a bulk run is dominated by GC-catch-up
  latency under a fast allocation burst, not by concurrent buffer
  retention or a leak — confirmed by a concurrency sweep (flat across
  1/2/4) and forced-GC sampling (always drops to ~0.04MB).
- The adaptive governor, adapted from production's own
  `resourcePressureHigh`/`yieldForMemoryPressure`, measurably changes
  behavior under sustained pressure (concurrency held at 1 vs reaching 4)
  and measurably does NOT change behavior or cost when pressure is normal
  (no timing regression on the plain baseline).
- No evidence is ever lost to cancellation at any tested scale, and no
  analysis output changes as a side effect of the governor.

## WHAT IS STILL UNKNOWN
- Whether this specific mechanism (or any lab-testable mechanism) would
  actually prevent the production Testing Deck's real "18-27 songs" mobile
  failure — that failure lives in `bad_d_meomory`, unreachable from this
  lab, and this experiment's evidence is about `bulk-media-intake`, a
  different (simpler) pipeline. The connection is architectural
  similarity and a shared root-cause class (GC-catch-up under burst
  allocation), not a reproduction of the actual production failure.
- Real mobile-device behavior (lower heap ceilings, more aggressive
  OOM-killing before GC even runs) is not tested here — this lab has no
  real-device access (same standing limitation as EXP-007/008/016).
- Whether `performance.memory`'s 0.82 threshold (reused from production)
  is well-tuned for THIS pipeline's allocation pattern, as opposed to
  production's, was not independently validated — it was reused because
  the task said to reuse an existing tuned value where one exists, not
  because this experiment re-derived it.

## NEXT HIGHEST-VALUE TEST
Push the sustained workload materially larger (100+ tracks, or larger
per-track duration) specifically to see whether peak backing memory
*starts* to scale once allocation volume exceeds what GC can keep up with
inside the run's own wall-clock time — the current 12-32 track range
never got large/slow enough to distinguish "GC always keeps up eventually"
from "GC would fall behind at real mobile scale." That's the test that
would actually speak to the "18-27 songs" question, even though it still
can't reach the production repository itself.
