## EXPERIMENT ID
EXP-001 — Mobile startup smoke test

## PROBLEM
`docs/MOBILE_CRASH_SAFETY_AND_SCAN_GOVERNOR.md` (in `bad_d_meomory`) lists
"Mobile startup has no ReferenceError/syntax failure" as a required
verification item, and notes it has not been separately verified. This lab
had no instrumentation to check that claim at all — it's the cheapest,
highest-priority thing to actually measure before touching anything else.

## HYPOTHESIS
The current build (`BAD-D_SIGNAL_15_72_0-mobile.html`) loads cleanly under a
mobile browser profile, with no console errors, no uncaught page errors, and
no failed sub-resource requests.

## BASELINE
None existed. This experiment establishes the baseline.

## CHANGE
None — read-only observation of the unmodified reference build.

## TEST
`tools/startup_probe.cjs` loads the file under Playwright Chromium emulating
a Pixel 7 (mobile UA, touch, coarse pointer, narrow viewport — the exact
signals the app's own `DEVICE_TIER` detector reads), waits for `load` +
1.5s settle time, and records console errors, page errors, failed requests,
load timing, and `performance.memory`.

## RESULT
Clean start. `ok: true`. 0 console errors, 0 page errors, 0 failed requests.

## MEASUREMENTS (MACHINE MEASUREMENT — see `result.json`)
- `loadEventMs`: 736
- `settledMs`: 2237
- heap after settle: 10.0 MB used / 11.2 MB total / 3760 MB limit (unconstrained run)
- title read back correctly: `BAD-D // SIGNAL — Command Center · v15.62.7 Auto Testing + DJ Handoff`
  — confirms the filename/title version mismatch already noted in
  `docs/MOBILE_CRASH_SAFETY_AND_SCAN_GOVERNOR.md` is real, not stale.

## FAILURES
None at this stage.

## REGRESSIONS
N/A — first measurement.

## EVIDENCE
`result.json` in this folder (MACHINE MEASUREMENT).

## DECISION
KEEP the tool, treat startup as verified-clean. Do not spend further time on
startup reliability — it was never the actual bottleneck. Move investigation
to the two bulk-intake paths, which is where the reported real-world crashes
(18–27 songs) and the docs' governor requirements actually live.

## NEXT QUESTION
Does either bulk-intake path (`#fileLib` library import, or `#testingFiles`
Testing Deck autonomous pipeline) survive a realistic-scale batch? → EXP-002, EXP-003.
