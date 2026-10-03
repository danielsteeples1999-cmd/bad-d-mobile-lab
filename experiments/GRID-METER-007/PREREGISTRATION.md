# GRID-METER-007 pre-registration (committed with the fixtures, before any tracker ran on them)

**Question:** Does the lab candidate C6 hold up on fixtures it was **not** designed on? C5's rule R and C6's rule E were chosen after looking at the 24 GRID-METER-004/005 decision fixtures, so their pass may be overfitted.

## Held-out fixtures
16 fixtures (4 kinds × 4 new tempos: 124, 132, 150, 170 BPM). All pass the acceptance gate. The 56 earlier fixtures re-render bit-identically.

| Fixture | What it is |
|---|---|
| `ho_weak_control` | 33×4/4 with a **weak downbeat cue**: harmony changes every 2 bars, and only the first bar gets a crash |
| `ho_weak_odd3` | Weak cue, plus one **3-beat** bar after 12 bars |
| `ho_odd5` | One **5-beat** bar after 20 bars (normal cues) |
| `ho_two_odd` | A 2-beat bar after 8 bars **and** a 6-beat bar 12 bars later |

## Configurations
Scored with exactly the same code and 70 ms window as before.
- **C1:** madmom DBN + D3 (two networks).
- **C6:** Beat This! minimal + (D1 ∨ R ∨ E) (one network).

## Decision rule
All 16 fixtures are pooled. **C6 keeps its candidacy** if both hold:
1. silent error rate ≤ 0.0336 (the same absolute bound used since GRID-METER-004);
2. false-alarm rate ≤ 0.05.

If either fails, C6 is **demoted to "synthetic-only pass"** and the failure is recorded. C1 is reported alongside on the same fixtures for comparison. No rule or threshold is changed after the results are seen. Any new rule suggested by these results must be pre-registered and tested on yet another held-out set.
