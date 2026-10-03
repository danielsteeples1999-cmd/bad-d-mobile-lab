# GRID-METER-007: Held-out test — C6's synthetic pass does not generalise

**Status:** MEASURED (machine evidence, synthetic held-out fixtures) · 2026-10-03

**Files:**
- Pre-registration: [PREREGISTRATION.md](PREREGISTRATION.md). Committed with the fixtures in `bd097c3`, before any tracker ran on them.
- Raw: [heldout_results.json](heldout_results.json).
- Verdicts: [verdicts.json](verdicts.json).
- Cycle record: [cycle.json](cycle.json).

## Problem
C6 (Beat This! minimal + D1 ∨ R ∨ E) was designed by looking at the same 24 fixtures it was scored on. A held-out test was needed before trusting it.

## Held-out set
16 new fixtures at new tempos (124, 132, 150, 170 BPM):

| Fixture | What it is |
|---|---|
| `ho_weak_control` | Weak downbeat cue: harmony every 2 bars, a single crash |
| `ho_weak_odd3` | Weak cue plus one 3-beat bar |
| `ho_odd5` | One 5-beat bar |
| `ho_two_odd` | A 2-beat bar and a 6-beat bar in the same track |

## Result (MACHINE, all 16 pooled)

| Config | Silent error rate | False-alarm rate | Trustworthy coverage | CPU s / audio-min |
|---|---|---|---|---|
| C1 (two networks) | 0.069 (38/551), CI 0.051–0.093 | 0.075 (28/371) | 0.645 | 16.4 |
| C6 (one network) | 0.047 (28/595), CI 0.033–0.067 | **0.112** (58/520), CI 0.087–0.142 | 0.868 | 5.5 |

**Pre-registered verdict: C6 FAILS both limits** (silent ≤ 0.0336, false alarms ≤ 0.05). It is **demoted to "synthetic-only pass"**.

**Per fixture: silent errors / decoded · false alarms / correct · coverage**

| Fixture | C1 | C6 |
|---|---|---|
| ho_weak_control | 7/139 · 1/132 · 0.992 | 3/140 · 0/132 · 1.000 |
| ho_weak_odd3 | 6/136 · 17/60 · 0.326 | 6/138 · 6/123 · 0.886 |
| ho_odd5 | 2/136 · 3/95 · 0.697 | 1/143 · 7/132 · 0.947 |
| ho_two_odd | 23/140 · 7/84 · 0.566 | **18/174 · 45/133** · 0.647 |

## Interpretation (INTERPRETATION of MACHINE data)
1. **The earlier pass was partly overfitted.** On designed-on fixtures C6 had a 0.6 % silent error rate. Held out, it is 4.7 %. The gap is a measure of how much rule-picking-by-looking inflated the result. This is the reason held-out tests exist.
2. **Two odd bars in one track break the regularity rule R.** `ho_two_odd` alone causes 45 of C6's 58 false alarms and 18 of its 28 silent errors.
   - R's "most common bar length is the truth" assumption degrades as irregular bars accumulate.
   - The same weakness showed up earlier on `heyya_pattern`.
   - Without `ho_two_odd` (descriptive only, not a re-scored verdict), C6 would be 10/421 silent (0.024) and 13/387 false alarms (0.034).
3. **C1 is not the answer either.** On the same held-out set it is worse than C6 on silent errors (0.069 vs 0.047) and coverage (0.645 vs 0.868), and it costs 3× more.
   - On the weak-cue odd-bar fixture, C1 can only act on 33 % of bars.
4. **The weak downbeat cue alone (`ho_weak_control`) is handled well by both.** What hurts is *irregularity*, not weak cues.

## What this changes
- The lab has **no configuration that passes held-out criteria**. C6 remains the *best measured* option (lowest silent error rate, highest coverage, lowest cost), but its status is **"best available, not passing"**.
- **Fail-closed rule for any future integration:** a track whose flagged fraction is high, or which has several irregular bars, must be treated as wholly `ambiguous`, not trusted bar by bar. This is a hypothesis. It must be pre-registered and tested on a further held-out set before use.
- **Real tracks matter more than ever (GRID-METER-003).** Whether multiple-odd-bar tracks are common in a DJ library decides whether this weakness matters.

## Limitations
- Synthetic fixtures only: 16 held-out, one timbre family.
- Single tracker checkpoints.
- CPU time is a container proxy.

## Decision
**INVESTIGATE.** C6 stays in `run_real.py` as the default because it is the best measured option. Its status is downgraded in every record.

The next synthetic experiment, if run, should be a pre-registered **track-level fail-closed rule**: for example, mark the whole track `ambiguous` when more than X % of bars are flagged, with X fixed in advance. It must be scored on another new held-out set, never on this one.
