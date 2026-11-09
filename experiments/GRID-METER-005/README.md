# GRID-METER-005: A zero-cost regularity check makes one network as safe as two

**Status:** MEASURED (machine evidence, synthetic fixtures, CPU-time proxy for mobile) · 2026-10-03

> **Held-out update (GRID-METER-007, 2026-10-03):** on 16 unseen fixtures, C6 had a 4.7 % silent error rate and 11.2 % false alarms. It failed both limits, so this result is a **synthetic-only pass**. See [GRID-METER-007](../GRID-METER-007/README.md).


**Files:**
- Pre-registration: [PREREGISTRATION.md](PREREGISTRATION.md). Committed in `355eb3b` before the check ran.
- Raw: [regularity_results.json](regularity_results.json).
- Verdicts: [verdicts.json](verdicts.json).
- Cycle record: [cycle.json](cycle.json).

## Problem
GRID-METER-004 left a trade-off:
- **C1** (madmom DBN + D3, two networks) had the fewest silent errors, but cost 16.4 CPU-s per audio-minute and could only safely act on 79 % of bars.
- **C2** (Beat This! minimal + D1, one network) was 3× cheaper with 99 % coverage, but had 1.7× the silent errors. Those were concentrated where an odd bar made it insert or misplace a downbeat.

## Hypothesis
A model-free check R removes most of C2's silent errors at no measurable cost. R flags a downbeat when its bar, or the bar before it, has a beat count different from the track's most common bar length.

## Result
Decision set: 24 fixtures, 1 thread.

| Config | Networks | Silent error rate | False-alarm rate | Trustworthy coverage | CPU s / audio-min |
|---|---|---|---|---|---|
| C1 (GRID-METER-004) | 2 | 0.0286 (23/804) | 0.0474 | 0.791 | 16.38 |
| C2 (recomputed) | 1 | 0.0485 (40/824) | 0.000 | 0.991 | 5.84 |
| **C5 = C2 + R** | **1** | **0.0279 (23/824)** | **0.0256** | **0.966** | **5.84** |

**Pre-registered verdict: C5 is RECOMMENDED over C1.** All three conditions hold:
- silent error rate 0.0279 ≤ 0.0336;
- false-alarm rate 0.0256 ≤ 0.05;
- cost 5.84 ≤ 9.83.

**Regression check: PASS.** Recomputed C2 reproduces GRID-METER-004 exactly (40/824 silent, 0 false alarms).

**Cost:** R costs 0.002 CPU-s per audio-minute. The C2 network cost re-measured 6 % higher than in GRID-METER-004 (5.84 vs 5.49), which is ordinary CPU-timing noise.

**Wilson 95 % intervals**
- C5 silent error rate: 0.019–0.042. This is essentially the same as C1's 0.019–0.043.
- C5 false-alarm rate: 0.017–0.039. Entirely under the 0.05 limit.

### Per fixture (C5)

| Fixture | Silent errors C2 → C5 | False alarms | Coverage | Note |
|---|---|---|---|---|
| ce1_stumble2 | 10 → 3 | 10/128 | 0.894 | R flags the real odd bar |
| ce2_extend6 | 13 → 5 | 9/129 | 0.909 | Same |
| ce5_pickup1 | 6 → 4 | 0 | 1.000 | |
| control_44 | 3 → 3 | 1 | 0.992 | |
| sync_anticip | 4 → 4 | 0 | 1.000 | |
| halftime_switch | 4 → 4 | 0 | 1.000 | |
| heyya_pattern *(not in decision)* | 85 → 62 | 29/105 | 0.633 | Still unsafe |
| waltz_34 *(not in decision)* | 101 → 14 | 85/108 | 0.144 | Fails closed, as intended |

## Interpretation (INTERPRETATION of MACHINE data)
1. **One network plus one counting rule matches two networks on safety, at about a third of the cost, with much more usable coverage** (97 % vs 79 % of bars the craft layer could act on).
2. **Why it works:** when the tracker inserts or misplaces a downbeat around an odd bar, the surrounding bar lengths stop matching the track's usual bar length. R needs no model to see that.
3. **R's false alarms are mostly the genuine odd bars.** The music really does change there, so a cautious "ambiguous" status is arguably the correct output for DJ automation.
4. **What R cannot fix:** silent errors that keep regular bar lengths. These are 3–4 per steady-meter fixture, likely track-edge downbeats; this was not investigated in this cycle. On `heyya_pattern` the odd bar *is* the regular pattern, so R's "most common length" assumption breaks and 62 silent errors remain. Repeated irregular phrases are an open problem for every configuration tested so far.

## Limitations
- Synthetic fixtures only. Real music may break R's assumption that the most common bar length is the true one, especially for tracks with many irregular bars.
- CPU time on an x86 container core is a proxy, not a device measurement.
- The remaining silent errors on steady fixtures were not investigated.

## Decision
**KEEP.** **C5 replaces C1 as the lab candidate** for the per-bar downbeat status rule:
- downbeats from Beat This! minimal;
- flagged if D1 (in-bar activation contrast) or R (bar-length irregularity) fires.

This is still lab-only. Promotion needs real-track evidence (GRID-METER-003) and an explicit production adapter/contract.

## Next question
- **GRID-METER-003** (real tracks) should verify **C5's** grid rather than C1's.
- This amends the GRID-METER-003 method, which was written before this result and has not yet been run. The change will be recorded in that experiment before any real track is analysed.
