# GRID-METER-001: Do open beat trackers silently mis-phase after one odd-length bar?

**Status:** MEASURED (machine evidence, synthetic fixtures) · 2026-10-02
**Spec:** [RESEARCH/INTELLIGENCE_GRID/02_METER_CHANGE_4_4_BIAS_REPORT.md §E](../../RESEARCH/INTELLIGENCE_GRID/02_METER_CHANGE_4_4_BIAS_REPORT.md)
**Tooling:** [tools/grid-meter/](../../tools/grid-meter/) · **Raw evidence:** [results.json](results.json) · **Tables:** [summary.md](summary.md) · **Cycle record:** [cycle.json](cycle.json)

Evidence labels (as in the main experiment log):
- **MACHINE**: measured by the tool, reproducible from `results.json`.
- **INTERPRETATION**: my reading of what a measurement implies.
- **UNKNOWN**: not established.

---

## Problem
Pass 02 argued that 4/4 bias is built into beat and downbeat tracking. If that is right, a single non-4-beat bar should shift every "downbeat" label by part of a bar for a long stretch, while the beats themselves remain correct. Phrase-aligned DJ craft (cue points, 32-beat transitions) would then silently land half a bar off.

## Hypothesis (pre-registered in Pass 02 §E)
"Current tools silently mis-phase after one odd bar."
- **Confirmed** if, for ≥ 1 system, phase error is ≥ 1 beat for ≥ 4 bars **and** activations show no confidence dip.
- **Refuted** otherwise.

**Pre-registration amendment (made before the full run, after a 2-fixture smoke test):**
- The smoke test showed madmom's offline Viterbi decoder can put the mis-phased span **before** the odd bar.
- A direction-neutral metric was therefore added: the *longest run of consecutive missed true downbeats*.
- The original forward-only metric is still reported (`post4_hits`, `pre4_hits`).

## Fixtures

**Generation** (MACHINE)
- 6 bar plans × 4 tempos (120, 128, 140, 174 BPM) = 24 fixtures.
- Synthesised deterministically; the ground truth is exact by construction.
- The kick is four-on-the-floor, so it carries no bar information. Downbeats are cued by a chord change on every bar, plus a crash on phrase starts and after any deviation.

**Bar plans**
- `control_44`: 33 bars of 4/4.
- `ce1_stumble2`: one 2-beat bar after 16 bars.
- `ce2_extend6`: one 6-beat bar after 16 bars.
- `ce5_pickup1`: a 1-beat anacrusis.
- `heyya_pattern`: a repeating 4,4,4,2,4,4 phrase.
- `waltz_34`: 40 bars of 3/4.

**Fixture acceptance gate** (MACHINE)
- **24/24 accepted.** The gate checks determinism, matched-filter kick positions against the truth (≤ 12 ms), no spurious kicks, and no clipping.
- The gate was itself attacked by self-tests: an inserted extra kick, and a truth beat moved by 30 ms. Both were correctly rejected.
- Three detector designs were rejected along the way: a peak envelope, a linear-rise detector and a dB-jump detector. Each fired on artefacts inside the kick or bass tail. The detector was changed each time; **no threshold was loosened**. This is recorded in `fixtures.py`.

## Systems
- `madmom_dbn_bpb4`: madmom RNN + DBN, `beats_per_bar=[4]`.
- `madmom_dbn_bpb234`: the same, with `beats_per_bar=[2,3,4]`.
- `beat_this_minimal`: Beat This! `final0`, no DBN.
- `beat_this_dbn`: Beat This! `final0` + madmom DBN `[3,4]`.

**Metric window:** 70 ms, fixed in advance.

---

## Result

### 1. madmom DBN: CONFIRMED silent mis-phase (MACHINE)

**One odd bar, all 4 tempos, both bar-length settings:**
- Beat F = 0.996–0.997 (the beats are right).
- Downbeat F = **0.48–0.52**.
- The longest run of missed downbeats is **15–16 consecutive bars**, every one shifted by exactly 2 beats (phase histogram `{1: 16, 3: 16}`).
- That is half the track mis-labelled by half a bar.

**Which side the error lands on is arbitrary** (INTERPRETATION of MACHINE data)
- At 120, 128 and 140 BPM the *first* 16 bars are wrong.
- At 174 BPM the *last* 16 bars are wrong.
- The global Viterbi path chooses one consistent 4-beat phase for the whole track, and which half "wins" changes with tempo.

**Allowing other bar lengths changes nothing** (MACHINE)
- `beats_per_bar=[2,3,4]` gave **identical** output to `[4]` on every odd-bar fixture.
- The decoder picks **one bar length per track**. It never emits the 2-beat or 6-beat bar: no estimated bar has length 2 or 6 in any odd-bar run.

**Silent at the output, but the network knew** (MACHINE)
- The DBN outputs no confidence.
- The underlying RNN downbeat activation *does* separate the decoder's correct downbeats from its wrong ones: AUC 0.89–1.00, with median activation 0.47 correct vs 0.32 wrong.
- **INTERPRETATION:** the evidence needed to flag the error exists in the network output and is discarded by the decoding step.

**Verdict on the hypothesis**
- **Part 1, mis-phase ≥ 1 beat for ≥ 4 bars: CONFIRMED** (15–16 bars, 8/8 runs).
- **Part 2, no confidence signal:** *confirmed at the output level, refuted at the activation level.*

### 2. Beat This! (no DBN): mostly handles a single odd bar (MACHINE)
- `ce1` and `ce2`: mean downbeat F 0.945 / 0.939. The longest missed run is ≤ 2 bars, and it **does emit the 2-beat bar**.
- Its confidence is **saturated**: median activation 0.96–0.99 at wrong downbeats vs 1.00 at correct ones.
  - AUC is high only because the correct ones sit at the ceiling.
  - **INTERPRETATION:** usable as a ranking, but not as a calibrated probability. A threshold would sit at ~0.99 and be fragile.
- Adding madmom's DBN on top (`beat_this_dbn`) made things *worse* on ce1/ce2: miss-runs up to 3, and local beat recall in the run down to 0.25.

### 3. Repeating odd bar (`heyya_pattern`): every system fails (MACHINE)
- Downbeat F: 0.47–0.71.
- Confidence AUC drops to **0.42–0.85**, near chance for Beat This!.
- Beat This! minimal partly re-reads the music as **2-beat bars**: 145 of 186 estimated bars have length 2.
  - Its downbeats land on both the true downbeat and beat 3 (phase histogram `{1: 27, 3: 18}`).
  - **INTERPRETATION:** an unlabelled hedge between two meter hypotheses.
- All three DBN-based systems mis-phase 6-bar spans that repeat with the pattern.

### 4. Steady 3/4 (`waltz_34`): only an explicitly allowed bar length works (MACHINE)

| System | Downbeat F | Notes |
|---|---|---|
| madmom `[2,3,4]` | 0.988 | |
| madmom `[4]` | 0.285 | Expected: 3/4 is not allowed |
| Beat This! + DBN `[3,4]` | 0.28–0.98 | Chose 4/4 at 3 of 4 tempos |
| Beat This! minimal | 0.46–0.80 | Unstable bar lengths |

**INTERPRETATION:** these EDM-style synthetic waltzes are atypical training material, so this is a *capability-under-distribution-shift* result, not a claim about real waltzes.

### 5. Pickup (`ce5_pickup1`): no failure (MACHINE)
- All systems scored 0.96–0.985 downbeat F.
- The Pass 02 CE-5 concern (an anacrusis mis-anchoring bar 1) did **not** reproduce on this fixture.
- **UNKNOWN** whether it reproduces with a stronger pickup, e.g. one that includes a kick or a vocal.

### 6. Tempo octave: no errors (MACHINE)
- The estimated/true IBI ratio was 0.98–1.003 for every system and tempo, including 174 BPM.
- These fixtures do not test half-time *feel*; CE-3 was not built.

---

## Measurements

| Measure | Value |
|---|---|
| Wall time | 490 s (4 vCPU, CPU only) |
| Generated data on disk | 0 MB (WAVs rendered in memory) |
| Persisted results | 95 KB |

Full per-cell tables are in [summary.md](summary.md).

## Failures / limitations
- **Synthetic, clean, EDM-styled fixtures.** Passing is necessary, not sufficient. Real tracks have weaker or contradictory downbeat cues.
- One pre-trained checkpoint per system. No fine-tuning.
- The madmom RNN activation and the Beat This! sigmoid output are *not* calibrated probabilities. AUC measures ranking only.
- The waltz result may reflect the fixture's EDM-style instrumentation (kick on every beat) rather than 3/4 in general.
- CE-3 (half-time switch) and CE-4 (polymeter) were not built in this cycle.

## Regressions
**NOT APPLICABLE**: this is the first run. `results.json` is now the baseline for future comparisons.

## Decision
**KEEP** the tooling as reusable lab infrastructure, and **record the finding**:
> An offline DBN downbeat decoder will mislabel ~half a track's bars by half a bar after a single 2- or 6-beat bar, with near-perfect beat accuracy and no output-level warning. Raw-activation trackers handle a single odd bar but give saturated, uncalibrated confidence, and all tested systems fail on a *repeating* odd bar.

**Implication for BAD-D** (INTERPRETATION; production untouched):
- Phrase-aligned automation must not trust a single global downbeat phase.
- Candidate guard: compare DBN downbeats against raw activation peaks per bar. Disagreement means `ambiguous`; craft automation must then hand control to the DJ (Pass 04 fail-closed craft).
- That guard is the next experiment.

## Next question
**GRID-METER-002:** Can a per-bar disagreement signal flag mis-phased bars, with high recall and few false alarms on controls? Candidates:
- (a) DBN-vs-activation peak mismatch
- (b) a two-decoder disagreement (DBN vs Beat This! minimal)
- (c) the activation ratio at the estimated downbeat vs ±2 beats

Measured on the same 24 fixtures, plus CE-3 and CE-4 once built.

**Reusable artifact:** `tools/grid-meter/` (fixtures + acceptance gate + adapters + scorer + tests). Used once (`USED_ONCE`).
