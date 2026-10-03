# Pass 02 Report: Meter Change and 4/4 Bias

> Status: **COMPLETE (research-only, no code)** · 2026-10-02 · answers [02_METER_CHANGE_4_4_BIAS.md](02_METER_CHANGE_4_4_BIAS.md)
> Builds on [01_GRID_MODEL_REPORT.md](01_GRID_MODEL_REPORT.md) (layers L2–L5).
> Evidence class: literature and documentation review. **No measurements were made in this pass.** Section E specifies the experiment that would measure them.

---

## Summary

1. **4/4 bias is built into the whole pipeline at several points, not just one.** It comes from five places that reinforce each other:
   - training data (§A.1)
   - decoder priors (§A.2)
   - single-label task framing (§A.3)
   - evaluation metrics that forgive metrical-level errors (§A.4)
   - DJ-software grids that store one meter per track (§A.5)

   Fixing only one of these leaves the others in place.
2. **Beat tracking on percussive 4/4 music is reliable. Everything above the beat is not.** That includes:
   - downbeat phase
   - bar length per bar
   - phrase position
   - tempo octave on half-time genres
3. **One wrong bar breaks everything after it.** If a single 2-beat bar is read as 4 beats, every later downbeat label is wrong. A "mix on the phrase" decision can then be off by half a bar for the rest of the track (§C.1).
4. The system **must** be able to output `unknown` / `ambiguous` per bar. Today's published tools almost never do this. Their output is "confident but wrong" (Ahn et al., 2026).

---

## A. Why audio systems settle on 4/4

### A.1 Data prior
- Most labelled beat and downbeat corpora (Ballroom, Hainsworth, GTZAN-rhythm, Harmonix, Raveform) are Western popular or dance music, and are overwhelmingly in 4/4. Harmonix covers 912 Western pop/dance tracks; Raveform covers EDM in DJ mixes, where 16-bar ≈ 30 s segments are the mode.
- Even METER2800, a dataset built *to fix this*, has 1,200 tracks each of 3/4 and 4/4 but only 200 each of 5/x and 7/x. It labels **one meter per 30 s clip** (Abimbola et al., 2023).
- **Effect:** a model learns "a bar is 4 beats" as a very strong prior. Odd bars look like noise.

### A.2 Decoder prior (DBN / HMM)
- The madmom `DBNDownBeatTrackingProcessor` (Böck, Krebs & Widmer, 2016) has a `beats_per_bar` setting. You can give it a list such as `[3, 4]`, but it then picks **one bar length for the whole track**.
- Its tempo range also has hard limits. The default minimum tempo of 55 BPM makes the correct tempo impossible to reach for **21 % of SMC tracks**, which forces a double-tempo reading (Ahn et al., 2026).
- Foscarin et al. (2024) removed the DBN in *Beat This!* specifically because it "introduces constraints on the meter and tempo".

### A.3 Task framing
- Time-signature detection is usually posed as **classifying a whole clip** into 3/4, 4/4, 5/x or 7/x (Abimbola et al. survey, 2021).
- The survey reports roughly 10 % error on duple-vs-triple and roughly 28 % on 3/4/6 classification for classical methods. Deep models score 72–93 % depending on dataset.
- None of this framing allows meter to change within the clip.

### A.4 Evaluation hides metrical-level errors
- The standard beat-tracking metrics AMLt / AMLc (Davies, Degara & Plumbley, 2009; implemented in mir_eval) **count double-tempo, half-tempo and off-beat outputs as correct**.
- That choice is reasonable for beat tracking. But it means papers with excellent headline numbers can still be wrong about exactly the things a DJ grid needs: tempo octave and downbeat phase.
- Davies & Böck (ISMIR 2014, "Evaluating the evaluation measures for beat tracking") examine this further.
- Downbeat F-measure is computed per beat. A metric that rewards **consistent per-bar meter** is rarely reported.

### A.5 Product prior
- **rekordbox** dynamic analysis follows *tempo* drift. Its grid still counts bars as 4 beats.
- **Ableton Live** supports time-signature markers, but audio clips do not follow them automatically. The user has to split clips at each boundary.
- **Effect:** even when an analyser could represent meter change, the storage format and the user interface discard it.

---

## B. Phenomena: what the grid must not erase

Each row gives a phenomenon, why it matters for DJ structure, and how detectable it is today.

| Phenomenon | DJ / structural relevance | Detectability today |
|---|---|---|
| **Mixed / changing meter** (e.g. one 2/4 bar inside 4/4) | Shifts downbeat and phrase alignment for the rest of the track | Low. Per-bar decoding is not standard. |
| **Additive / asymmetric meter** (5, 7, 9 = 2+2+2+3) | Bars feel uneven, and a 4-beat loop will drift against them | Medium for clip classification; low for the grouping inside the bar |
| **Polymeter / polyrhythm** (3-over-4, 3+3+2 tresillo patterns) | Several downbeat readings are each valid; the kick and the hats may imply different bars | Low. Models pick one stream. |
| **Syncopation** | Changes feel and groove; it is only defined relative to the active meter | Computable *given* a meter (Longuet-Higgins & Lee, 1984), so it inherits meter errors |
| **Tuplets** (triplet fills, quintuplet runs) | Short local subdivision change; often appears at build-up peaks | Low; usually absorbed as "noise" |
| **Pickup bars / anacrusis** | Bar 1 mis-anchored, so cue points are off by a partial bar | Medium; the first downbeat is a frequent error |
| **Truncated / extended bars** (phrase cut short, extra beat before the drop) | Common in edits and in DJ-friendly versions of pop; dancers feel the "stumble" | Low |
| **Half-time / double-time** (DnB at 87 vs 174 BPM; trap; dubstep 140 / 70) | Changes which tracks match each other; the feel switches inside a track | Tempo octave is a known AMLt-forgiven error; the switch inside a track is rarely represented |
| **Tempo ambiguity / rubato / beatless intros** | The grid is extrapolated where no pulse exists | Low; trackers rarely report "no pulse here" |
| **Phrase-level displacement** (a 16-bar phrase starting on bar 3 of an 8-bar group) | "Mix on the next 16" is wrong even when every downbeat is right | Very low; needs hypermeter modelling (Pass 01 L6) |

---

## C. Concrete counterexamples where a 4/4 grid gives the wrong structure

### C.1 Synthetic counterexamples (exact and falsifiable)

These are constructed so the error can be computed exactly. They are the intended **first lab fixtures** (§E).

**CE-1: One inserted 2/4 bar (the "stumble bar")**
- Setup:
  - 128 BPM, so a 4/4 bar lasts 1.875 s.
  - The phrase runs 16 bars of 4/4.
  - Bar 17 has only **2 beats**.
  - Then the next 16-bar phrase begins: the drop.
- What a 4/4 grid does: it labels the drop's first downbeat as **beat 3 of bar 17**. The true drop starts 0.9375 s (2 beats) earlier than the grid's next bar line.
- Consequences:
  - Every later downbeat label is shifted by 2 beats for the rest of the track.
  - Phrase-aligned transitions land half a bar off.
  - A loop started "on the 1" is now out of phase.
- Pop music contains documented cases of the same thing; see CE-R1 below.

**CE-2: Extended bar before the drop**
- Setup: identical to CE-1, except bar 17 has **6 beats** (4 + 2).
- What a 4/4 grid does: it places a downbeat in the middle of the build-up's last held hit and reads the drop as beat 3.
- Consequences:
  - Same phase error as CE-1, but in the opposite direction.
  - Gives the grid an expectation layer that is wrong in the opposite direction: the listener is made to wait, then released.

**CE-3: Half-time switch inside a track**
- Setup:
  - The track is 174 BPM throughout.
  - Drums switch from a two-step pattern to a half-time pattern (snare every 2nd beat at 87) for 16 bars.
- What happens: the tempo grid is still "correct". But the *perceived* bar doubles, so energy and phrase analysis that counts 4-beat bars reports 32 "bars" where listeners hear 16.
- Effect on mixing: whether a 174-BPM track matches an 87-BPM one depends on which reading is active.

**CE-4: 3-against-4 polymetric lead over a 4/4 kick**
- Setup: a 3-beat melodic cycle runs over a 4/4 kick for 12 beats. 12 is the least common multiple of 3 and 4, so the two streams realign every 12 beats (3 bars of 4/4, or 4 cycles of 3).
- What a 4/4 grid does: it describes the kick correctly but says nothing about the melodic accents. A DJ looping 1 bar cuts the melody mid-cycle every time.
- What the grid needs: **two concurrent meter hypotheses** with a realignment period, not one forced reading.

**CE-5: Pickup into bar 1**
- Setup: a vocal or riff starts 1 beat before the first kick downbeat (anacrusis).
- What a tracker does: it anchors bar 1 on the first strong onset (the pickup).
- Consequence: every bar is offset by 1 beat (a ¼-bar error). This is invisible to AMLt-style metrics and destructive for phrase mixing.

### C.2 Real-music counterexamples (widely documented in music analysis)

**Caveat:** these readings come from published and well-known music analyses. They have **not** been verified against audio in this lab. Before use as fixtures, each needs a human-confirmed bar-level annotation. No copyrighted audio goes in this public repository; reference by metadata only.

| ID | Track | Documented meter feature | What a 4/4 grid gets wrong |
|---|---|---|---|
| CE-R1 | OutKast, "Hey Ya!" (2003) | The main phrase contains a 2/4 bar: 4/4 ×3, then 2/4, then 4/4 ×2 (22 beats per phrase, not 24) | Downbeats drift by 2 beats every phrase. A 4/4 grid cannot keep the hook on "1" consistently. |
| CE-R2 | Pink Floyd, "Money" (1973) | Mainly 7/4; the guitar-solo section is in 4/4 | A single global meter is wrong for at least one of the two sections |
| CE-R3 | The Beatles, "All You Need Is Love" (1967) | The verse is commonly analysed as 7/4 (or 4/4 + 3/4), the chorus as 4/4 | Section-dependent meter; whole-track classification must fail somewhere |
| CE-R4 | Dave Brubeck Quartet, "Blue Rondo à la Turk" (1959) | 9/8 grouped 2+2+2+3, alternating with 3+3+3; the solos are in 4/4 | The bar length is consistent but the grouping inside it changes: an additive-grouping change |
| CE-R5 | Radiohead, "15 Step" (2007) | 5/4 throughout | A 4/4 grid drifts 1 beat per bar; the error grows without bound |
| CE-R6 | Drum & bass generally (≈170–175 BPM) | Half-time / double-time ambiguity; Raveform shows a secondary BPM cluster at 170–175 | The tempo octave determines which tracks are compatible to mix |

---

## D. Method classification

Classes:
- **RELIABLE**: safe for automatic use, with stated scope.
- **UNCERTAIN**: useful, but output must carry confidence.
- **RESEARCH**: not deployable.
- **HUMAN**: needs human confirmation before being trusted.

| Method / output | Class | Scope / reason |
|---|---|---|
| Onset detection, spectral flux, band energy | **RELIABLE** | Signal-level measurement. |
| Beat tracking on steady, percussive, ≈100–180 BPM music (madmom RNN, TCN, *Beat This!*) | **RELIABLE** | Near-saturated scores on Ballroom/GTZAN-type data. The scope is percussive and steady only. |
| Global tempo, *modulo octave* | **RELIABLE** | Octave left as a hypothesis pair. |
| Tempo octave choice (87 vs 174) | **UNCERTAIN** | Genre-dependent; AMLt hides the errors; keep both readings. |
| Beat tracking on expressive / rubato / non-percussive music | **UNCERTAIN** | SMC failure modes: confident-but-wrong activations and a tempo floor (Ahn et al., 2026). |
| Downbeat phase, steady 4/4 EDM | **UNCERTAIN** (approaching reliable) | Usually right. Pickups and intros cause ¼–½-bar errors. |
| Downbeat tracking with DBN `beats_per_bar=[3,4]` | **UNCERTAIN** | Picks one bar length per track; cannot represent CE-1 or CE-2. |
| DBN-free downbeat activations + per-bar decoding | **RESEARCH** | *Beat This!* removes the constraint, but per-bar meter decoding with calibrated confidence is unpublished as a standard tool. |
| Whole-clip time-signature classification (METER2800-style) | **UNCERTAIN** as a prior / **wrong** as a grid | Useful to set a prior. Never use it as a per-bar truth. |
| Long-cycle Bayesian meter tracking (tāla / usul) | **RESEARCH** | Works when the cycle type is known in advance; costly inference. |
| Fine-tuning a meter tracker with a few minutes of annotation (Maia et al., 2022) | **RESEARCH → promising** | A cheap way to cover a new style; needs our own annotations. |
| Additive grouping inside the bar (2+2+3 vs 3+2+2) | **HUMAN** | Little dependable audio-domain method. |
| Polymeter / polyrhythm stream separation | **RESEARCH + HUMAN** | Stem separation helps; interpretation remains perceptual. |
| Syncopation index | **UNCERTAIN** | Exact *given* a meter; it inherits any meter error. |
| Truncated / extended bar detection | **RESEARCH** | Detectable as downbeat-interval outliers *if* calibrated confidence exists; unvalidated. |
| Phrase / hypermeter / phrase displacement | **HUMAN** (plus estimation) | Structure analysis is subjective and hierarchical (Nieto et al., 2020). EDM 16-bar regularity is a strong but breakable prior. |
| Half-time feel switches inside a track | **RESEARCH** | Needs a pattern-level feature (snare position), not tempo. |

**Rule derived from this table:** any grid value whose class is UNCERTAIN, RESEARCH or HUMAN must carry a confidence field, and must be allowed to be `unknown`. Only RELIABLE values may be shown without a qualifier.

---

## E. Proposed first lab experiment (for the engine queue, not executed here)

**ID:** `GRID-METER-001`

**Question:** Do current open trackers detect a single non-4-beat bar? When they miss it, do they at least signal low confidence?

**Fixtures**
- CE-1 through CE-5 synthesised deterministically:
  - click and drum samples generated in code; no copyrighted audio
  - tempos 120, 128, 140 and 174 BPM
  - the odd bar placed at 4 positions
- The exact ground truth is known by construction.

**Systems under test**
- madmom DBN with `beats_per_bar=[4]`
- madmom DBN with `beats_per_bar=[2,3,4]`
- *Beat This!* raw output (no DBN)

**Measures**
- Per-bar beat-count error.
- Downbeat phase error after the odd bar, in beats.
- Recovery time: the number of bars until phase is re-acquired.
- Whether confidence or activation drops around the odd bar.

**Pass/fail**
- The hypothesis "current tools silently mis-phase after one odd bar" is **confirmed** if, for ≥ 1 system:
  - phase error is ≥ 1 beat for ≥ 4 bars after the odd bar, **and**
  - activations show no confidence dip.
- The hypothesis is **refuted** otherwise.
- **No tolerance tuning**: ground truth is exact by construction.

**Cost:** within the CLAUDE_NOW 20-minute budget. CPU only. Fixtures under 50 MB.

**Reuse:** this becomes the first deterministic fixture set for ENGINE-REGRESS-001 (regression comparator).

---

## F. Answer to the pass's requirement

> "The system must be allowed to output unknown/ambiguous instead of forcing a meter."

**Specification**

The meter layer emits one record per bar:

```
{ beats: int | null, grouping: [int] | null, confidence: 0..1,
  status: "confident" | "ambiguous" | "unknown",
  alternatives: [{beats, grouping, weight}] }
```

**Status thresholds** (to be calibrated by GRID-METER-001, not chosen in advance):
- `unknown`: no pulse detected.
- `ambiguous`: two or more alternatives with weight above the threshold.
- `confident`: otherwise.

**Downstream rule:** every downstream layer (syncopation, phrase, transition affordance) must propagate the weakest status of its inputs.

---

## G. Sources

**Data and task framing (§A.1, §A.3)**
- Abimbola et al., "Time Signature Detection: A Survey", *Sensors* 2021: https://doi.org/10.3390/s21196494
- Abimbola, Kostrzewa, Kasprowski, "METER2800", *Data in Brief* 2023: https://pmc.ncbi.nlm.nih.gov/articles/PMC10700346/
- Nieto et al., "The Harmonix Set", ISMIR 2019: https://archives.ismir.net/ismir2019/paper/000068.pdf
- Kim et al., "Raveform", TISMIR: https://transactions.ismir.net/articles/10.5334/tismir.288

**Trackers and decoder priors (§A.2, §D)**
- Böck, Krebs, Widmer, ISMIR 2016: https://archives.ismir.net/ismir2016/paper/000186.pdf
- madmom downbeats docs: https://madmom.readthedocs.io/en/v0.16/modules/features/downbeats.html
- Böck & Davies, ISMIR 2020: https://archives.ismir.net/ismir2020/paper/000223.pdf
- Foscarin, Schlüter, Widmer, "Beat this!", ISMIR 2024: https://arxiv.org/abs/2407.21658
- Ahn, Hwang, Jung, "The SMC Blind Spot", 2026: https://arxiv.org/abs/2605.12287
- Holzapfel et al., "Selective Sampling for Beat Tracking Evaluation" (SMC dataset), IEEE TASLP 2012: http://mtg.upf.edu/system/files/publications/HolzapfelEtAl12-taslp.pdf
- Srinivasamurthy et al., "Particle Filters for Efficient Meter Tracking", ISMIR 2015: https://compmusic.upf.edu/ismir-2015-pf
- Maia, Rocamora, Biscainho, Fuentes, "Adapting Meter Tracking Models to Latin American Music", ISMIR 2022: https://arxiv.org/abs/2304.07186
- Prabhu, "Revisiting Meter Tracking in Carnatic Music", 2025: https://arxiv.org/abs/2509.11241

**Evaluation (§A.4)**
- Davies, Degara, Plumbley, "Evaluation Methods for Musical Audio Beat Tracking Algorithms", 2009: https://www.researchgate.net/publication/228724188
- Davies & Böck, "Evaluating the Evaluation Measures for Beat Tracking", ISMIR 2014: https://archives.ismir.net/ismir2014/paper/000238.pdf
- Raffel et al., "mir_eval", ISMIR 2014: https://archives.ismir.net/ismir2014/paper/000320.pdf

**Structure (§D)**
- Nieto et al., TISMIR 2020: https://transactions.ismir.net/articles/10.5334/tismir.54

**Syncopation (§B, §D)**
- Longuet-Higgins & Lee, *Music Perception* 1, 1984.
- Gómez et al., "Mathematical Measures of Syncopation", BRIDGES 2005.

**Product behaviour (§A.5)**
- rekordbox static vs dynamic grids: https://www.lexicondj.com/blog/understanding-rekordbox-beatgrid-analysis
- Ableton Live 12 manual, Arrangement View: https://www.ableton.com/en/manual/arrangement-view/

### Limitations
- Real-music counterexamples (§C.2) rely on documented musical analysis. They are **not** verified against audio here.
- No tracker was run in this pass. Every "detectability" rating is literature-based and must be confirmed by GRID-METER-001.
- The prevalence of non-4-beat bars in BAD-D's actual library is **unknown**. That number decides how much this matters in practice.
