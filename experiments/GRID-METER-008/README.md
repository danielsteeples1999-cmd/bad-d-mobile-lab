# GRID-METER-008: A track-level fail-closed rule passes a second held-out test

**Status:** MEASURED (machine evidence, synthetic held-out set 2) · 2026-10-03

**Files:**
- Pre-registration: [PREREGISTRATION.md](PREREGISTRATION.md). Committed with the fixtures in `bb4e194`, before any tracker ran on them.
- Raw: [heldout2_results.json](heldout2_results.json).
- Verdicts: [verdicts.json](verdicts.json).
- Cycle record: [cycle.json](cycle.json).

## Problem
C6 failed the first held-out test (GRID-METER-007). Tracks with several irregular bars broke its bar-regularity rule, which judges each bar against the track's most common bar length.

## Change
Rule **T**: count separate clusters of flagged downbeats (excluding the final-bar flag). With **3 or more**, mark the whole track `ambiguous`. K = 3 was chosen on already-seen data, then frozen. **C7** = C6 + T. Still one network.

## Result
Held-out set 2: 20 new fixtures, tempos 118, 136, 156, 176 BPM.

| Config | Silent error rate (all 20) | Trustworthy coverage (12 simple) | Silent error rate (simple) | CPU s / audio-min |
|---|---|---|---|---|
| C1 (two networks) | 0.043 (28/650) | 0.706 | 0.047 | 14.7 |
| C6 | 0.032 (26/816) | 0.941 | 0.032 | 5.3 |
| **C7 = C6 + T** | **0.016 (13/816)**, CI 0.009–0.027 | **0.941** | 0.032 | 5.3 |

**Pre-registered verdict: C7 PASSES.**
- Silent error rate 0.016 ≤ 0.0336. The upper 95 % bound, 0.027, is also below it.
- Coverage on simple tracks 0.941 ≥ 0.85.

**Rule T separated the two classes perfectly on unseen data** (MACHINE)
- Simple tracks had 0–1 flagged clusters: 12/12 kept.
- Complex tracks (three odd bars; repeating 4,4,4,3 phrase) had 3–20 clusters: 8/8 blanked.
- Silent errors on complex tracks went from 13 to 0.

## What is still weak (MACHINE)
- **The remaining 13 silent errors are all on simple tracks.**
  - 9 are on the weak-cue track with one 2-beat bar (`h2_weak_odd2`).
  - 3 on `h2_weak_steady`, 1 on `h2_odd7`.
- **Simple-track silent rate is 0.032**, with a 95 % interval of 0.019–0.053. That is just under the bound, and the interval crosses it.
  - **A weak downbeat cue combined with an odd bar is the current weak spot.**
- **C6 alone would also have met the safety bound on this set** (0.0319). The track rule's measured contribution is removing all silent errors from complex tracks.
  - This set happened to be kinder to C6 than held-out set 1 was.

## Status of the lab candidate
**C7 is the first configuration to pass a pre-registered test on fixtures it was not designed on.** It replaces C6 as the default in `run_real.py`.

Limits on that claim:
- Synthetic material only, one timbre family, single checkpoints.
- The weak-cue odd-bar case sits near the bound.
- Real-track evidence (GRID-METER-003) is still required before any production use.

## Decision
**KEEP: C7 is the lab candidate.**
- Lab-only. Promotion needs real-track evidence and an explicit production adapter/contract.
