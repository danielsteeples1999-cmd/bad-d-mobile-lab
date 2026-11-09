# GRID-METER-002: Can a per-bar flag catch silent downbeat mis-phase?

**Status:** MEASURED (machine evidence, synthetic fixtures) · 2026-10-02

**Files:**
- Pre-registration: [PREREGISTRATION.md](PREREGISTRATION.md). Committed in `671d9eb` *before* any detector ran.
- Raw evidence: [detect_results.json](detect_results.json).
- Verdicts: [verdicts.json](verdicts.json).
- Tables: [summary.md](summary.md).
- Cycle record: [cycle.json](cycle.json).

**Builds on:** [GRID-METER-001](../GRID-METER-001/README.md). The madmom DBN mislabels 15–16 bars by 2 beats after one odd bar, with no warning.

---

## Problem
The Intelligence Grid needs a per-bar `confident / ambiguous / unknown` status (Pass 02 §F). Pass 04's fail-closed craft rule needs it too: never auto-transition on an uncertain downbeat. GRID-METER-001 showed the information exists in the network activations, but the decoder discards it.

## Hypothesis
A parameter-free per-bar check can flag ≥ 90 % of mis-phased downbeats while flagging ≤ 5 % of correct downbeats on steady-meter material.

## Detectors (pre-registered, no tuning)

| ID | Rule |
|---|---|
| **D1** | Another decoded beat in the bar has a higher downbeat activation than the decoded downbeat. |
| **D2** | A second system with no DBN (Beat This! minimal) has no downbeat within 70 ms of the decoded one. |
| **D3** | D1 ∨ D2 (flag if either fires). |

## Fixtures (MACHINE)
- **32 fixtures, all accepted by the gate:** the 24 GRID-METER-001 fixtures plus 8 new ones (2 kinds × 4 tempos).
- **The original 24 are unchanged:** all re-rendered bit-identically (0/24 audio hashes changed). That is a regression check on the fixture generator.
- **The new fixtures keep a steady 4/4**, so any flag on them is a false alarm:
  - `sync_anticip`: chords arrive an 8th note early every second bar. Syncopation, not a meter change.
  - `halftime_switch`: 16 bars of half-time drums.
- **Runtime:** 358 s, CPU only.

## Result vs pre-registered criteria

Thresholds: recall ≥ 0.90, false-alarm rate ≤ 0.05.

| Primary decoder | Detector | Recall (wrong downbeats, odd-bar fixtures) | False-alarm rate (correct downbeats, steady 4/4) | Verdict |
|---|---|---|---|---|
| madmom DBN `[4]` | D1 | 0.591 (81/137) | 0.038 (20/524) | FAIL (recall) |
| madmom DBN `[4]` | D2 | 0.869 (119/137) | **0.000** (0/524) | FAIL (recall, by 0.031) |
| madmom DBN `[4]` | **D3** | **0.920 (126/137)** | **0.038 (20/524)** | **PASS** |
| Beat This! + DBN | D1 | 0.219 (7/32) | 0.000 | FAIL |
| Beat This! + DBN | D2 | 0.594 (19/32) | 0.000 | FAIL |
| Beat This! + DBN | D3 | 0.594 (19/32) | 0.000 | FAIL |

### What the numbers say

**1. The silent madmom failure can be made loud, on these fixtures** (MACHINE)
- D3 catches 126 of 137 mis-phased downbeats.
- It falsely flags 20 of 524 correct downbeats.
- **Hypothesis: SUPPORTED for madmom DBN.**

**2. The two signals are complementary** (MACHINE → INTERPRETATION)
- D2 (decoder disagreement) is *precise*: zero false alarms in 524 correct downbeats, including the syncopation and half-time traps.
- D1 (in-bar activation contrast) adds the recall D2 misses.
- No single signal passes on its own.

**3. Where D1's false alarms come from** (MACHINE: `detect_results.json`, per-bar indices)
- At every tempo, mostly the **last bar** of the track, where the music ends.
- At 174 BPM also the **phrase-start bars** (8, 16, 24), which carry a crash cymbal.
- **INTERPRETATION:** the D1 rule is sensitive to track ends and to crash tails at high tempo.
- This is recorded as a *lead*. The pre-registered rule was **not** changed.

**4. Beat This! + DBN: no detector passes** (MACHINE)
- Its errors are few (32) and short (≤ 3 bars).
- D2 compares it against its own network's raw output, so the two share failure modes. That is correlated evidence, not independent evidence.
- **INTERPRETATION:** decoder disagreement is useful only when the two systems are genuinely different.

**5. Outside the decision set** (MACHINE, reported as pre-registered)

| Fixture | Recall (D3) | False alarms (D3) | Note |
|---|---|---|---|
| `heyya_pattern`, madmom | 33/54 | 14/58 | Repeated odd bars degrade both signals |
| `waltz_34`, madmom forced to `[4]` | 76/81 | 25/40 | The detector strongly notices a wholesale meter mismatch, but also flags many bars the decoder got right by chance |

---

## Measurements

| Measure | Value |
|---|---|
| Wall time | 358 s |
| Persisted evidence | ~130 KB |
| Data written to disk during the run | 0 MB (in-memory WAVs) |
| Self-tests | 10/10 pass (3 new: detector quiet on correct output, detector flags a phase shift, variants keep constant-meter truth) |

## Limitations
- **Synthetic, clean fixtures.** Real music has weaker downbeat cues. Recall and false-alarm rates on real tracks are **UNKNOWN**.
- D3 requires **two networks per track**: about double the analysis cost. Mobile cost is **UNKNOWN**.
- The pass is not statistically secure. Wilson 95 % intervals:
  - recall 0.920 → **0.862–0.955** (the lower bound is below the 0.90 threshold);
  - false-alarm rate 0.038 → **0.025–0.058** (the upper bound is above 0.05).
- The verdict is PASS on the point estimates, as pre-registered. Confirming it needs more data.
- False-alarm sources are structured (track end, crash tails at high tempo), so real tracks with many crashes may score worse.

## Regressions
- **NO_REGRESSION** on the fixture generator: 24/24 GRID-METER-001 audio hashes are identical.
- The trackers were not re-scored against GRID-METER-001 numbers. This cycle measures detectors, not trackers.

## Decision
**KEEP** D3 as the **candidate** rule (point-estimate pass; confidence intervals straddle both thresholds) for the L3 per-bar `ambiguous` status. It stays lab-only. Production promotion needs an explicit adapter/contract and real-track evidence.

## Next question
**GRID-METER-003:** Does D3 hold on **real** tracks?

- **Needs:** a small set of human-confirmed bar annotations. This is the one step that needs Daniel.
  - **Option 1:** 10–20 tracks from Daniel's own library, with odd bars marked by ear.
  - **Option 2:** a public set with downbeat annotations (Harmonix Set beats/downbeats), so no audio has to be redistributed here.
- **Measure:** D3 recall and false alarms per track, plus how often odd bars occur at all. Odd-bar prevalence is still the biggest unknown that decides whether any of this matters in practice (Pass 05 §C).

**Reusable artifacts**

| Path | Status |
|---|---|
| `tools/grid-meter/detect.py` | `USED_ONCE` |
| `tools/grid-meter/run_detect.py` | `USED_ONCE` |
| `tools/grid-meter/score_detect.py` | `USED_ONCE` |
| `tools/grid-meter/fixtures.py` | Now `USED_TWICE_PLUS` |
