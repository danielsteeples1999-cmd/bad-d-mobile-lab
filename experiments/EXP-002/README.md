## EXPERIMENT ID
EXP-002 — Library bulk-import stress test under a constrained-heap proxy

> **CORRECTION (added after EXP-005):** the heap numbers below were read via
> `page.evaluate(() => performance.memory)`. EXP-005 found this API returns a
> frozen, non-responsive value in this sandbox's headless Chromium (a real
> 160MB allocation did not move it). **The "flat 10MB heap" claim below is
> retracted as memory evidence.** The completion/error findings (45/45
> committed, 0 errors, no crash) are unaffected and still stand — those don't
> depend on the broken metric. EXP-005 re-ran an equivalent batch with a
> validated CDP-based instrument and got real, moving, still-reassuring
> numbers — see `experiments/EXP-005/README.md`.

## PROBLEM
`PROJECT_STATE.md` and `docs/MOBILE_CRASH_SAFETY_AND_SCAN_GOVERNOR.md` (both
in `bad_d_meomory`, as of 2026-09-18/17) state: "The current repository does
not show an explicit `cooldown` implementation" and record real crashes at
roughly 18 and 27 songs during bulk upload. Static reading of the current
15.72.0 build contradicts the "no cooldown" claim: `processLibraryQueue()`
calls `yieldForMemoryPressure(statusEl, idx, total)` before decoding each
file, which checks `performance.memory` and inserts extra `await` yields
(and a 120ms delay) once heap usage crosses 76%/86% of the limit, or
unconditionally every 8th file. This is a documentation-vs-code discrepancy
worth resolving with a real run rather than trusting either side blind.

## HYPOTHESIS
H1: The `yieldForMemoryPressure` cooldown is real and functional — a bulk
import of 45 files (beyond the reported 18–27 crash point) completes without
crashing, and per-track decoded buffers are actually released (flat heap),
not merely deferred.

## BASELINE
EXP-001 established clean startup with ~10MB heap. No prior bulk-import
measurement existed.

## CHANGE
None to the app. The experiment varies only the input: batch size (5 → 45
synthetic WAV files) and an added heap ceiling.

## TEST
- `tools/make_synth_wavs.cjs` generated 45 valid, decodable, distinct-size
  mono WAV files (~55s each, so decode produces a non-trivial buffer per
  track, not a trivial one).
- `tools/bulk_import_stress.cjs` set `#fileLib`'s file list to all 45 at
  once (matching how a real multi-select bulk upload arrives), then polled
  `window.library.length`, the `#libStatus` text, and `performance.memory`
  every 700ms until the queue drained.
- Chromium was launched with `--js-flags=--max-old-space-size=256`, which
  Chromium honors for `performance.memory.jsHeapSizeLimit` (confirmed: it
  reports ~386MB instead of the default ~3760MB) — a cheap proxy for a
  memory-constrained mobile Chrome tab, since this sandbox has no real phone
  to test against.
- A 5-track pilot ran first to validate the harness (`pilot_5tracks.json`)
  before committing to the full 45-track run.

## RESULT
**Passed.** All 45 tracks committed (`finalLibraryLength: 45`), zero console
errors, zero page errors, no crash, no timeout. Total wall time ~30.7s
(~0.68s/track). The `yieldForMemoryPressure` cooldown never visibly
triggered (no "cooling memory" status text appeared) because heap usage
never approached the 76% threshold.

## MEASUREMENTS (MACHINE MEASUREMENT — see `library_45tracks_256mb.json`)
- Heap stayed flat at **10.0MB used** across the entire run (386MB limit),
  from the first sample to the last — no growth trend at all as library
  size grew from 0 to 45.
- This matches the doc's claim that decoded `AudioBuffer`/`ArrayBuffer`/STFT
  temporaries are released per-track and only compact fingerprint data is
  retained.

## FAILURES
None observed in this run.

## REGRESSIONS
N/A — first measurement of this path.

## EVIDENCE
`pilot_5tracks.json` (5-file pilot), `library_45tracks_256mb.json` (full run).
Both MACHINE MEASUREMENT.

## DECISION
KEEP as evidence that `processLibraryQueue`'s memory hygiene is real and
works, at least for this input shape. **Do not treat this as a full
falsification of the 18–27-song crash reports** — see caveat below. This
result redirects suspicion away from the library-intake path and toward
Testing Deck's separate intake path (`#testingFiles`), which turned out
(EXP-003) to have a much more fundamental problem than memory.

## CAVEAT — measurement problem, flagged honestly
These are short (~55s), simple mono sine-tone synthetic files — much lighter
to decode and analyze than real 3–5 minute stereo tracks with dense spectral
content. The in-code comment at `runAutoPipelineQueue` says "each decoded
AudioBuffer is tens of MB" for real tracks; my 45 synthetic buffers were
roughly ~2.4MB decoded each (55s × 44100Hz × 4 bytes float32, mono). A
10MB-flat heap trace across the whole run may reflect files too light to
ever pressure the governor, not proof the governor scales to real-world
files. This is UNKNOWN, not confirmed either way, and is the natural
next-step experiment if this repo needs to keep investigating library
intake specifically (lower priority than EXP-003's finding right now).

## NEXT QUESTION
Re-run this same harness with longer/heavier synthetic files (or, better,
real royalty-free full-length tracks) to see whether the flat-heap result
holds at realistic per-file decode size. Deprioritized below EXP-003's
finding, since Testing Deck's pipeline currently can't process a single
track regardless of memory behavior.
