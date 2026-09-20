## EXPERIMENT ID
EXP-007 — Trace the real scheduler, find the exact bottleneck, build and A/B test the minimal fix

> **UPDATE (EXP-008):** Daniel ran this record's HTML artifact on his real
> Android device (P9 Pro 5G). The scheduling result reproduced strongly
> (94,910ms → 15,176ms main-thread blocked, matching this record's headless
> A/B in direction and rough magnitude). **But the correctness check reported
> a fingerprint MISMATCH** — something this record's own headless
> correctness check (byte-identical fingerprints) did not catch. **The
> "KEEP" decision below is suspended.** Do not treat the yield patch as
> correctness-validated until EXP-008 resolves. Full forensic investigation,
> device profile, and next steps: `experiments/EXP-008/README.md`.

## PROBLEM
EXP-006 measured severe main-thread blocking during bulk import (71.5% of
the window, max 863ms) but explicitly could not say whether it threatens
real audio scheduling — that required tracing actual code, not inference.

## PART 1 — AUDIO SCHEDULER TRACE (CASE A vs CASE B)

Traced every `.start(...)` call site in `bad_d_meomory/BAD-D_SIGNAL_15_72_0-mobile.html`
(read-only). Two are red herrings: the `bStartAt = Math.max(0, segADur-xf)` /
`.start(bStartAt, plan.spliceEnd, segBDur)` pair (~line 4958) is inside
`applyRepairPlan()`, which renders through an `OfflineAudioContext` —
offline, non-real-time rendering used for health-gate silence repair, not
live deck playback. Not relevant to this question.

**The real live-deck scheduler:** `startTransition()` (~line 8371) does the
actual crossfade. It is armed by `armBeatSnappedTransition()` (~line 9075),
which computes a beat-aligned delay and fires via:

```js
beatSnapTimer = setTimeout(()=>{
  beatSnapTimer = null;
  transitionArmed = false;
  if(autoDjEnabled && !transitioning && fromDeck.playing && !toDeck.playing){
    startTransition(fromDeck, toDeck);
  }
}, delayMs);
```

**This is CASE B, confirmed by direct code reading, not inferred.**
`setTimeout` callbacks are ordinary main-thread tasks — they queue behind
whatever else is running and do not preempt a long task in progress. This is
not a pre-scheduled `AudioBufferSourceNode.start(ctx.currentTime + lookahead)`
call; it's a reactive main-thread timer.

**The code already knows this is a risk and partially guards against it:**
`remainingLead = Math.max(0, remainingReal(fromDeck)-0.08)` — an explicit
**80ms "continuity reserve"** so a slightly-late fire doesn't run past the
outgoing track's natural end, with the comment "Never let beat alignment
outlive the outgoing audio." **80ms is roughly 6x smaller than EXP-006's
measured worst-case block (863ms, later re-measured at up to 982ms in this
experiment's own baseline run).** If a bulk import's long task is in
progress when `beatSnapTimer` should fire, the transition can genuinely
fire late enough to either miss the beat it was aligned to, or in the worst
case run past the outgoing track's remaining audio — the 80ms reserve
cannot absorb an 863–982ms delay. **DONE — NOT YET VERIFIED as an audible
defect** (no listening test performed), but the mechanism is real and
directly traced, not speculated.

## PART 2 — FIND THE EXACT 700–980ms BLOCK (CPU profile, not guessing)

CDP `Profiler` (`tools/cpu_profile_import.cjs`) profiled the unmodified
reference build during a real 15-track bulk import (16.2s wall-clock,
51,167 samples). Self-time by function:

| Function | % of wall-clock | ~ms |
|---|---:|---:|
| `fft` (line 1617) | 27.6% | 4472 |
| `simpleFFTMag` (line 1599) | 21.7% | 3515 |
| `computeFingerprint` (line 1646, own body) | 19.6% | 3180 |
| idle | 20.6% | 3348 |
| (program/GC/other) | ~7% | ~1100 |
| everything else combined (`quickEnergyScan`, `runHealthGate`, `runPreparationScans`, `render`, …) | <1% | <100 |

**~69% of total wall-clock time is inside `fft`+`simpleFFTMag`+`computeFingerprint`'s
own body — nothing else is close.** Traced the call chain: `computeFingerprint`
runs a full-track STFT — `hop=1024` samples, so a 60s/44.1kHz track is
`nFrames ≈ 2584` — in a single synchronous `for(let i=0;i<nFrames;i++){ ...
spec[i]=simpleFFTMag(windowed); ... }` loop with **zero yield points**. That
loop, run to completion in one synchronous call, is the entire mechanism
behind EXP-006's long tasks.

**Bonus finding, already-known-and-partially-fixed territory:** the comment
directly above the sibling function `computeVisuals` (same STFT-loop shape)
reads: *"This matters most during a GO/Auto DJ set: `advanceQueueInto()`
calls `loadFromLibrary()` on every transition, which used to mean a full
`computeFingerprint()` pass ... on the main thread for every track change
... — the real source of the crash."* The codebase's own authors already
identified and (per the comment) fixed *per-transition* recompute via
caching. **What they did not cover: first-time analysis during bulk
import**, which cannot be cached away (there's nothing to cache yet) and is
exactly what EXP-006/007 measured. `computeVisuals` did not appear anywhere
in the profile's top functions — confirms it is NOT invoked during bulk
import, so it was correctly left untouched by this experiment's fix.

## PART 3 — MINIMAL EXPERIMENTAL FIX (lab-only, `bad_d_meomory` untouched)

Copied the reference build to `experiments/EXP-007/lab-yield-patch.html`
(the *only* file modified — production repo was never touched). Change,
in full:

1. `function computeFingerprint(buf){` → `async function computeFingerprint(buf){`
2. Inside the STFT loop, after each frame: `if(i>0 && i%32===0) await new Promise(r=>setTimeout(r,0));` — same frames, same math, same output, just yields to the event loop every 32 frames (~10ms of work per chunk, using the codebase's own established yield idiom — `prepYield()` elsewhere in the same file uses the identical `setTimeout(resolve, …)` pattern).
3. Every *real* caller updated to `await` it, traced exhaustively (this file's own `AGENTS.md` warns against exactly this class of mistake — "never claim a feature is complete merely because code was written"):
   - `processLibraryQueue`'s two health-gate call sites (`await computeFingerprint(health.buffer)`) — already inside `async` functions, one-word change.
   - `analyzeBuffer(deck)` — the **manual Deck A/B file-load path** (`fileA`/`fileB` inputs). This one is NOT inside an async function/wrapped in await anywhere — had to trace its one caller (`ctx.decodeAudioData(e.target.result, buf=>{...})` inside the deck-load flow, ~line 2756) and convert that callback to `async buf=>{...}` too, then `await analyzeBuffer(deck)`. Missing this would have been a **silent correctness bug**: `computeFingerprint` returning a Promise into non-awaiting code means `result.fingerprint` reads `undefined` off a Promise object, not an error — deck fingerprint/energy/spectro data would silently go missing. Caught by exhaustively grepping every real call site before declaring the patch complete, not by assuming two call sites were the whole picture.
   - The two broken Testing Deck call sites (EXP-003) were deliberately left untouched — different closure, already broken, out of scope for this fix, not this lab's decision to make in the production repo regardless.

## PART 4 — CORRECTNESS CHECK (before any performance claim)

Ran the identical 3-file batch through baseline and patched builds, extracted
`window.library[*].fingerprint` from both, deep-compared as JSON.

**Result: byte-for-byte identical for all 3 tracks.** `MACHINE MEASUREMENT`.
The yield changes *when* control returns to the event loop; it does not
change *what* is computed. This was checked before any speed claim, per
"Audio is sacred."

## PART 5 — A/B PERFORMANCE MEASUREMENT

Identical 20-track × 60s batch (same files, same order) through
`tools/mainthread_jank_probe.cjs` against baseline (unmodified reference)
and experiment (yield-patched), back to back, same machine:

| Metric | BASELINE | EXPERIMENT | Change |
|---|---:|---:|---:|
| Import wall-clock duration | 19,016ms | 20,736ms | **+9.0% slower** |
| Long-task count | 20 | 6 | −70% |
| Total main-thread blocked | 13,647ms | 544ms | **−96%** |
| Max single task | 982ms | 155ms | **−84%** |
| % of window blocked | 71.8% | 2.6% | −69.2 points |
| Idle-phase tasks (both) | 0 | 0 | control clean |
| Console/page errors | 0 / 0 | 0 / 0 | none introduced |

## TRADE-OFF, STATED PLAINLY (not cherry-picked)
The fix makes bulk import **~9% slower in total wall-clock time** (an honest
cost — each yield genuinely costs a little real time) in exchange for
**cutting main-thread blocking by 96%** and the worst single block by 84%.
The remaining max task (155ms) is still larger than the code's own 80ms
continuity reserve, so this is a **large reduction in risk, not a proof of
zero risk** — see NEXT QUESTION.

## FAILURES
None in execution. Two real correctness hazards were found and fixed during
implementation (the `analyzeBuffer` silent-Promise bug being the more
serious one) — preserved here as the value of tracing exhaustively instead
of stopping at the first two call sites found.

## REGRESSIONS
None measured. Fingerprint output identical; no new console/page errors;
completion still succeeds 100%. Import speed regressed 9%, disclosed above,
not hidden.

## EVIDENCE
`ab_baseline_jank.json`, `ab_experiment_jank.json` (MACHINE MEASUREMENT, the
A/B numbers above), `cpu_profile_15tracks.json` (MACHINE MEASUREMENT, the
bottleneck breakdown), `patched_startup.json` (MACHINE MEASUREMENT, clean
startup, no errors introduced), inline correctness-check output above
(MACHINE MEASUREMENT, reproducible, not saved to a separate file — a
one-liner, see this record).

## DECISION
**KEEP** the experimental patch in the lab; **do not port to `bad_d_meomory`**
(no write access, not this lab's call). **INVESTIGATE further** before
calling the audible-glitch question closed — the scheduling mechanism (CASE
B) and the bottleneck (STFT loop) are now both real, traced, machine-measured
facts, and the fix demonstrably shrinks the risk window by 96%, but nobody
has listened to a real transition happen during bulk import, on this build
or the patched one, on a device or off. That claim stays `DONE — NOT YET VERIFIED`.

## PART 6 — DANIEL'S TEST ARTIFACT (`DANIEL_TEST_scheduler-lab.html`)

Built a standalone, self-contained test page for real-device verification,
sent to Daniel directly in chat (not just committed here — see session
report). It extracts *only* the self-contained FFT/fingerprint engine
(explicitly isolated from DOM/Deck/Library per its own header comment) in
two copies — unmodified and yield-patched — runs the identical baseline-vs-
experiment long-task A/B this record describes, live, in Daniel's own
browser, plus a "play a track while testing" toggle so he can listen for
himself. No network calls, no connection to any real library/Auto-DJ/evidence
store, cannot promote anything into production.

**A second instrumentation gotcha found while building it, distinct from
EXP-005's `performance.memory` freeze:** the artifact's first working
version used the modern `await ctx.decodeAudioData(arrayBuf)` form and
reported **zero long tasks for baseline** — contradicting this record's own
CPU-profile evidence. Verified with `performance.now()` that the ~450-500ms
synchronous block was really happening either way; the `PerformanceObserver`
longtask API simply wasn't attributing it in this environment when the
following synchronous work ran as the continuation of a Promise-based
`decodeAudioData` call. Switching to the **callback-style**
`ctx.decodeAudioData(arrayBuf, resolve, reject)` — which is also what the
production app itself actually uses — restored correct detection (isolated
repro: 0 tasks detected via the promise form, 1 task of 508ms detected via
the callback form, same underlying work). Fixed in the artifact before
sending it. Filed here as a second reminder that this lab's long-task and
memory instruments both need this kind of adversarial self-check before
being trusted, not just used.

## NEXT QUESTION
Does the residual 155ms max block (down from 982ms) still fall inside the
80ms continuity reserve enough of the time to matter? And: has anyone
listened yet? Both need Daniel's phone — see the attached test build and
DANIEL'S TEST in the session report.
