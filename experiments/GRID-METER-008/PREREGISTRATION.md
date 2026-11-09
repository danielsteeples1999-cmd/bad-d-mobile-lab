# GRID-METER-008 pre-registration (committed with the fixtures, before any tracker ran on them)

**Question:** Does a track-level fail-closed rule fix C6's held-out failure (GRID-METER-007) on a **second, untouched** held-out set?

## Rule T, chosen on already-seen data only
- Count the separate **clusters** of consecutive flagged downbeats in a track. The final-bar rule-E flag is excluded.
- If there are **3 or more clusters**, mark **every** downbeat in the track as flagged (`ambiguous`).
- K = 3 was chosen on the GRID-METER-005 design fixtures and the GRID-METER-007 held-out set. Both have now been seen, so neither is used for this test.
- On those seen sets, K = 3 gave silent error rates of 0.005 (design) and 0.020 (held-out 1), blanking 7/32 and 3/16 tracks.
- This is reported as design information only, not as evidence.

**C7** = C6 + T. One network, no extra model.

## Held-out set 2 (new)
20 fixtures: 5 kinds × tempos 118, 136, 156, 176. All 20 pass the acceptance gate, and all 72 earlier fixtures re-render bit-identically.

| Fixture | Class | What it is |
|---|---|---|
| `h2_weak_steady` | simple | Weak cue, steady 4/4 |
| `h2_weak_odd2` | simple | Weak cue, one 2-beat bar |
| `h2_odd7` | simple | One 7-beat bar |
| `h2_three_odd` | complex | 2-, 3- and 6-beat bars in one track |
| `h2_repeat_odd3` | complex | Repeating 4,4,4,3 phrase |

## Decision rule
**C7 passes** if both hold:
1. **Safety:** pooled silent error rate over all 20 fixtures ≤ 0.0336 (the same bound used since GRID-METER-004).
2. **Usefulness:** pooled trustworthy coverage on the *simple* fixtures ≥ 0.85.

The false-alarm rate is reported but is not a pass criterion. A track-level rule deliberately flags correct bars on blanked tracks, so false alarms measure coverage loss here, and criterion 2 covers that.

C6 (no T) and C1 (two networks) are reported on the same fixtures for comparison. Nothing is changed after the results are seen.
