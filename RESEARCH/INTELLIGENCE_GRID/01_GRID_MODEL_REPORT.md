# Pass 01 Report: Intelligence Grid Model

> Status: **COMPLETE (research-only, no code)** · 2026-10-02 · answers [01_GRID_MODEL_RESEARCH.md](01_GRID_MODEL_RESEARCH.md)
> Evidence class: literature review. Nothing here is runtime, device or listening evidence. Every claim about human response is a **hypothesis** until BAD-D's own listening or crowd tests confirm it.

---

## Summary

- A conventional beat grid has one global tempo, one global meter, one phase and nothing else. The Intelligence Grid is a **stack of time-aligned layers**. Each layer keeps its own uncertainty, and the layers may disagree. The grid describes *what the music sets up* (expectation) as well as *where the beats are*.
- Every layer belongs to exactly one **epistemic class**:
  - **M**: measured from the signal
  - **E**: estimated by a model, so it can be wrong
  - **P**: a perceptual interpretation, where listeners may legitimately disagree
  - **H**: a human-response hypothesis
  - **C**: an observed crowd or DJ response

  Values from different classes must never be merged into one number.
- **Local events are the main content, not noise.** Examples: an added beat, a dropped bar, a half-time switch, a fill, a pickup, a beatless breakdown. A grid that "smooths" them away loses most of what a DJ needs to know.
- The most valuable new layer compared with today's DJ software is **expectation**: what a listener with genre experience predicts will happen next, and where that prediction fails. Only parts of it can be estimated (see §C.4). The rest requires human annotation.

---

## A. Definition

> **The Intelligence Grid is a time-indexed, multi-layer, uncertainty-carrying description of a track's temporal organisation.**
>
> It covers:
> - **pulse and meter** (what the listener can entrain to)
> - **grouping** (how events chunk into phrases and sections)
> - **dynamics of expectation** (what is predicted, delayed, broken or resolved)
> - **affordances** (where an action such as a cut, blend, loop or drop is structurally supported)
> - **response annotations** (hypothesised and observed human reactions)
>
> Each value records its source, confidence and epistemic class. Competing interpretations are kept side by side; none is chosen by default.

Design invariants (they follow from the master instructions and the evidence below):

1. **Meter is a function of time** (`meter(t)`), never a property of the whole track.
2. **Every layer may be absent, unknown or ambiguous.** "Unknown" is a valid output, not an error.
3. **Multiple hypotheses can coexist** (for example a 2× or ½× tempo reading, or a downbeat-phase offset), each with its own weight.
4. **Deviations are first-class events.** They are not residuals left over from fitting a regular model.
5. **No composite "danceability" scalar** sits at the core. Any summary score is a derived view that can be explained, and the layers underneath it can be audited.
6. **Measured, perceptual, hypothesised and observed values are stored separately** and never averaged together.

---

## B. Layered data model

Each row is a layer. "Class" is the epistemic class defined in the summary. "Unit" is the time base the layer is indexed on.

| # | Layer | Content | Class | Unit / form | Can say "unknown"? |
|---|---|---|---|---|---|
| L0 | **Signal** | Onset strength, spectral flux, band energy (low/mid/high), loudness (LUFS curve), stems if separated | M | frames (~10 ms) | n/a (raw) |
| L1 | **Onsets / events** | Onset times; per-band/per-stem percussive events (kick, snare, hat) | M→E | event list | yes, sparse or ambient passages |
| L2 | **Pulse (tactus)** | Beat times, each with confidence; **tempo hypotheses** (e.g. 87 vs 174 BPM) with weights; local tempo curve | E + P | event list + curve | yes, rubato, beatless, free-time |
| L3 | **Metrical hierarchy** | Subdivision (2/3/swing ratio) · beat · **downbeat** · **bar length in beats, per bar** · hypermeter (2/4/8/16-bar groups) | E + P | per-bar records | yes, required |
| L4 | **Metrical deviations** | Typed events: added or dropped beat, truncated or extended bar, pickup/anacrusis, meter change, half/double-time switch, tuplet span, polymeter span, phase shift (downbeat re-anchoring), tempo jump | E (+ human confirmation) | typed spans | each event carries confidence |
| L5 | **Rhythmic texture** | Syncopation index relative to the active meter; microtiming / swing; density; groove-template similarity | E | per bar | yes, when no stable meter |
| L6 | **Grouping / phrase** | Phrase boundaries; phrase length in bars; whether a phrase has a regular length; "phrase-level displacement" (phrase starts off the hypermetric grid) | E + P | spans | yes, often ambiguous |
| L7 | **Sections** | Boundaries + functional labels (intro, verse, chorus, build-up, breakdown, drop, outro …) at **multiple hierarchical levels** | P (E as estimate) | hierarchical spans | yes; competing segmentations allowed |
| L8 | **Energy / tension** | Separate curves: loudness, spectral brightness, low-end presence, rhythmic density, harmonic tension (if tonal), **each kept separate** | M/E per curve; "tension" itself is P | curves | partially |
| L9 | **Expectation** | Predicted continuation; *surprise* (information content) per event or bar; build-ups (rising predictability of a coming arrival); **violations** (expected downbeat absent, phrase cut short); release points | E (models) + P | curves + events | yes, most of it |
| L10 | **Transition affordances** | Candidate mix-in/mix-out points, loopable regions, "safe" cut points, entry/exit energy, phrase-aligned windows, warnings ("odd bar ahead") | Derived (inherits weakest class of inputs) | ranked spans | yes |
| L11 | **Response hypotheses** | e.g. "drop at 2:14 predicted to raise movement"; "4-beat stall may cause dancer mis-step" | **H** | annotated spans | always explicit |
| L12 | **Observed response** | Human annotations (listener tags, tap tests), crowd observations, DJ actions in real mixes | **C** | annotated spans with provenance | n/a |

### Record shape (conceptual only, not an implementation)

```
GridValue {
  layer, t_start, t_end,
  value | hypotheses: [{value, weight}],
  confidence: 0..1 | "unknown" | "ambiguous",
  class: M | E | P | H | C,
  source: {method, version, params} | {annotator_id, protocol},
  depends_on: [GridValue ids]      # makes derived claims auditable
}
```

Key consequences of this shape:
- **Bar length lives on each bar.** A 3-beat bar inside 4/4 music is one record with `beats=3`. No global flag is needed.
- **Disagreement can be represented.** Two segmentations, or a 128 BPM reading next to a 64 BPM half-time reading, coexist as weighted hypotheses.
- **Derived layers inherit uncertainty.** If L10 marks a cut point as "safe" but depends on an L3 downbeat with confidence 0.4, the cut point cannot be reported as confident.

---

## C. Current MIR / DJ approaches

### C.1 Beat, downbeat and meter (layers L2–L3)

| Approach | What it gives | Limits relevant to us |
|---|---|---|
| RNN + Dynamic Bayesian Network (DBN): Böck, Krebs & Widmer, ISMIR 2016; implemented in `madmom` | Joint beat and downbeat tracking. `beats_per_bar` can be a list, e.g. `[3, 4]` | The DBN restricts tempo and meter to a configured set. It decodes **one bar length per track**, chosen from the allowed list, rather than tracking bar-to-bar changes. |
| Temporal Convolutional Network (TCN) multi-task tempo/beat/downbeat: Böck & Davies, ISMIR 2020 | Strong benchmark results | Still uses DBN post-processing, so inherits its meter priors. |
| **Beat This!** (Foscarin, Schlüter & Widmer, ISMIR 2024) | State-of-the-art accuracy **without** a DBN | The authors removed the DBN specifically because it "introduces constraints on the meter and tempo". This is the most suitable published starting point for time-varying meter. |
| Bayesian meter tracking for long cycles (Srinivasamurthy, Holzapfel, Cemgil & Serra, ISMIR 2015 / ICASSP 2016) | Tracks Carnatic tāla and Turkish makam usul cycles | Shows that bar or cycle length must be a modelled variable. Cost of exact inference is high, so the authors use particle filters. |
| Meter-tracking adaptation (Maia, Rocamora, Biscainho & Fuentes, ISMIR 2022) and Carnatic transfer learning (Prabhu, 2025) | Pretrained Western models under-perform on non-Western meters. A few minutes of annotation plus fine-tuning recovers much of the gap. | Pretrained models carry a cultural and meter **prior**, but it can be corrected cheaply. |
| Whole-track time-signature classification (Abimbola et al. survey, *Sensors* 2021; METER2800, *Data in Brief* 2023) | Classifies a track into meter 3/4/5/7 | **One label per 30 s clip or per track.** The dataset also has a 4:1 imbalance of 3/4 + 4/4 over 5/7. This is exactly the global-meter assumption we reject; it is useful only as a prior. |

### C.2 Structure (layers L6–L7)

- Nieto et al. 2020 (TISMIR overview) name **subjectivity, ambiguity and hierarchy** as the core open problems. Several different segmentations can be valid for the same track. Evaluating against a single reference is therefore limited.
- **SALAMI** provides multi-annotator, multi-level (fine / coarse / functional) structure annotations. **Harmonix Set** (Nieto et al., ISMIR 2019) provides beats, downbeats and functional segments for 912 Western pop/dance tracks. **Raveform** (Kim et al., TISMIR) provides EDM tracks from DJ mixes: 4,902 mixes, 1,423 tracks with tempo, beat, downbeat and EDM-function labels (intro, buildup, breakdown, drop, cooldown, outro…). The most common segment length is **16 bars ≈ 30 s**.

### C.3 DJ practice and software (layers L2, L10)

- **rekordbox** offers a static beatgrid (one BPM) or *dynamic analysis*. Dynamic analysis places multiple tempo markers for drifting tempo, but it still models **tempo** variation, not **meter** variation (source: Lexicon DJ explainer).
- **Ableton Live** supports time-signature markers in the Arrangement. Clips do **not** follow meter changes automatically; the user must split them by hand at the boundaries.
- **Real DJ mixes** were measured by Kim, Choi, Sacks, Yang & Nam (ISMIR 2020): 1,557 mixes, 13,728 tracks, 20,765 transitions aligned via mix-to-track alignment. This gives empirical cue points and transition lengths and is ground truth for L10 behaviour, though only for EDM-style mixing.

### C.4 Expectation, syncopation, groove (layers L5, L9, L11)

- **Syncopation** can be computed relative to a metrical hierarchy: Longuet-Higgins & Lee 1984, building on Lerdahl & Jackendoff's GTTM metrical weights; comparison of measures in Gómez et al. 2005. **It is only meaningful relative to an assumed meter.** If the meter is wrong, the syncopation score is wrong too. This is a direct coupling between L3 and L5.
- **Groove**: Witek et al. 2014 (*PLoS ONE*) found an **inverted-U** relation: medium syncopation produced the most wanting-to-move and pleasure. This is evidence for an H-class prior, not a law.
- **Expectation as probabilistic prediction**: Pearce 2018 (IDyOM) models expectation, segmentation and meter as statistical prediction learned from exposure. Information content (surprise) is a computable proxy for L9 on symbolic data. Audio-domain use is still research-level.
- **EDM structure → movement**: Solberg & Jensenius 2017 (*Empirical Musicology Review*) used motion capture on 16 dancers. Group quantity of motion **fell in breakdowns and rose at the drop**, and participants rated build-up and drop as most pleasurable. This is a small-N, lab-club study. It is useful C-class precedent but not general proof.

---

## D. What a conventional beat grid loses

A conventional grid stores `(BPM, first-downbeat offset, beats_per_bar = 4)`, sometimes with tempo markers. It loses the following:

| Lost information | Example consequence |
|---|---|
| Per-bar meter | A single 2/4 or 3/4 bar shifts every following "downbeat" by 1–2 beats. Phrase-aligned mixing is then wrong for the rest of the track (see Pass 02 counterexamples). |
| Downbeat confidence | Software presents a guessed bar-1 position as fact. |
| Tempo-octave ambiguity | 87 vs 174 BPM (drum & bass, half-time trap) is collapsed into one reading. Mix-compatibility judgments then flip. |
| Hypermeter / phrase | Without phrase lengths, "mix in at the next phrase" is undefined, and irregular phrases (e.g. a 12-bar or 7-bar phrase) go unnoticed. |
| Pickups and fills | An anacrusis is mis-read as bar 1. A fill is mis-read as a tempo error. |
| Beatless regions | A grid is extrapolated through ambient breakdowns, giving false precision exactly where a DJ needs warning. |
| Expectation / violation | No representation of "listeners expect a drop here", or of a deliberately withheld drop. |
| Disagreement | No place to store alternative readings, so mistakes cannot be audited. |
| Epistemic class | Measured, perceptual and hypothesised values are all presented with the same authority. |

---

## E. Vocabulary (working definitions)

Grouped by topic. Each term is followed by its usual epistemic class in brackets (classes defined in the summary).

**Pulse and tempo**
- **Onset** [M]: the start of an acoustic event.
- **Tactus / beat** [E/P]: the pulse level most listeners tap to.
- **Tempo octave / metrical-level ambiguity** [P]: the beat could plausibly be read at ×2 or ×½ (sometimes ×3).
- **Tempo curve** [E]: local tempo as a function of time.

**Meter**
- **Subdivision** [E]: the pulse level below the beat. Duple, triple, or swung (with a long-short ratio).
- **Downbeat** [E/P]: the first beat of a bar.
- **Bar / measure** [E/P]: a span from one downbeat to the next. Its length is in beats and is stored per bar.
- **Hypermeter** [P]: a regular grouping of bars, e.g. 4, 8, 16.
- **Meter** [P]: the hierarchy of pulse levels a listener entrains to. It can change over time.
- **Additive / asymmetric meter** [P]: bars built from unequal groups, e.g. 7 = 2+2+3.
- **Polymeter / polyrhythm** [P]: concurrent streams that imply different bar lengths, or different pulse divisions within the same span.
- **Half-time / double-time feel** [P]: the perceived pulse level changes while the absolute tempo does not.
- **Metrical deviation** [E]: any bar or beat that departs from the locally prevailing pattern (see L4 types).

**Phrase and section**
- **Anacrusis / pickup** [E/P]: events that lead into a downbeat from before it.
- **Phrase** [P]: a perceptually grouped unit, usually several bars.
- **Phrase displacement** [P]: a phrase begins off the hypermetric grid.
- **Section** [P]: a structurally distinct region with a function.
- **Build-up / breakdown / drop** [P]: EDM functional sections. Respectively: rising tension; reduced texture; re-entry of the full beat and bass.

**Expectation and response**
- **Syncopation** [E relative to a meter]: emphasis on metrically weak positions.
- **Surprise / information content** [E]: negative log-probability of an event under a predictive model.
- **Tension / release** [P]: perceived build and resolution. Several measured curves correlate with it; none of them *is* it.
- **Re-entry** [P]: return of a previously removed layer, typically the kick or bass.
- **Affordance** [derived]: a structurally supported opportunity for a DJ action.
- **Response hypothesis** [H] / **observed response** [C]: see L11 and L12.

---

## F. Open research questions

Each question names the later pass that should pick it up.

1. How reliably can **per-bar** meter be estimated on real DJ material, and what fraction of tracks contain at least one non-4-beat bar? → Pass 02, then a lab experiment on Harmonix or Raveform annotations.
2. Which **confidence signals** from DBN-free trackers (e.g. Beat This! activations) actually predict errors? The SMC failure analysis (Ahn et al., 2026) shows models that are **confidently wrong**. → Pass 02 / 05.
3. Can expectation (L9) be estimated from audio well enough to be useful, or must it rely on proxies (energy-curve slope, filter sweeps, snare-roll density) plus human labels? → Pass 03.
4. Does the inverted-U groove relation (Witek et al. 2014) hold for club EDM at the bar level, and do dancers punish or reward metrical deviations? → Pass 03.
5. Which L10 affordances do real DJs actually use? Mine Kim et al. 2020's transition data for cue-point vs phrase alignment. → Pass 04.
6. How should disagreement between layers be shown to a DJ without overload? → Pass 04 / 06.
7. What is the minimal L0–L4 subset that can run on **mobile** within BAD-D's resource budget? → Pass 06, then an engine experiment.

---

## G. Sources and datasets

**Beat / downbeat / meter tracking**
- Böck, Krebs, Widmer, "Joint Beat and Downbeat Tracking with Recurrent Neural Networks", ISMIR 2016: https://archives.ismir.net/ismir2016/paper/000186.pdf
- madmom `DBNDownBeatTrackingProcessor` docs: https://madmom.readthedocs.io/en/v0.16/modules/features/downbeats.html
- Böck, Davies, "Deconstruct, Analyse, Reconstruct: How to improve Tempo, Beat, and Downbeat Estimation", ISMIR 2020: https://archives.ismir.net/ismir2020/paper/000223.pdf
- Foscarin, Schlüter, Widmer, "Beat this! Accurate beat tracking without DBN postprocessing", ISMIR 2024: https://arxiv.org/abs/2407.21658
- Srinivasamurthy, Holzapfel, Cemgil, Serra, "Particle Filters for Efficient Meter Tracking with Dynamic Bayesian Networks", ISMIR 2015: https://compmusic.upf.edu/ismir-2015-pf
- Maia, Rocamora, Biscainho, Fuentes, "Adapting Meter Tracking Models to Latin American Music", ISMIR 2022: https://arxiv.org/abs/2304.07186
- Prabhu, "Revisiting Meter Tracking in Carnatic Music using Deep Learning Approaches", 2025: https://arxiv.org/abs/2509.11241
- Ahn, Hwang, Jung, "The SMC Blind Spot: A Failure Mode Analysis of State-of-the-Art Beat Tracking", 2026: https://arxiv.org/abs/2605.12287

**Time-signature classification**
- Abimbola et al., "Time Signature Detection: A Survey", *Sensors* 21(19), 2021: https://doi.org/10.3390/s21196494
- Abimbola, Kostrzewa, Kasprowski, "METER2800", *Data in Brief*, 2023: https://pmc.ncbi.nlm.nih.gov/articles/PMC10700346/

**Structure**
- Nieto et al., "Audio-Based Music Structure Analysis: Current Trends, Open Challenges, and Applications", TISMIR 2020: https://transactions.ismir.net/articles/10.5334/tismir.54

**Evaluation**
- Davies, Degara, Plumbley, "Evaluation Methods for Musical Audio Beat Tracking Algorithms", C4DM-TR-09-06, 2009: https://www.researchgate.net/publication/228724188
- Raffel et al., "mir_eval", ISMIR 2014: https://archives.ismir.net/ismir2014/paper/000320.pdf

**Datasets**
- Harmonix Set, Nieto et al., ISMIR 2019: https://archives.ismir.net/ismir2019/paper/000068.pdf · https://github.com/urinieto/harmonixset
- Raveform, Kim et al., TISMIR: https://transactions.ismir.net/articles/10.5334/tismir.288
- SMC, Holzapfel et al., IEEE TASLP 20(9), 2012: http://mtg.upf.edu/system/files/publications/HolzapfelEtAl12-taslp.pdf
- CompMusic Carnatic / Hindustani rhythm corpora: https://compmusic.upf.edu/phd-thesis-ajay
- METER2800: https://doi.org/10.7910/DVN/0CLXBQ

**DJ practice**
- Kim, Choi, Sacks, Yang, Nam, "A Computational Analysis of Real-World DJ Mixes using Mix-To-Track Subsequence Alignment", ISMIR 2020: https://arxiv.org/abs/2008.10267
- rekordbox static vs dynamic beatgrid (Lexicon DJ explainer): https://www.lexicondj.com/blog/understanding-rekordbox-beatgrid-analysis
- Ableton Live 12 manual, Arrangement View (time-signature markers): https://www.ableton.com/en/manual/arrangement-view/

**Rhythm, expectation, groove**
- Longuet-Higgins & Lee, "The rhythmic interpretation of monophonic music", *Music Perception* 1, 1984. Metrical-weight syncopation; builds on Lerdahl & Jackendoff, *A Generative Theory of Tonal Music*, MIT Press 1983.
- Gómez, Melvin, Rappaport, Toussaint, "Mathematical Measures of Syncopation", BRIDGES 2005.
- Witek, Clarke, Wallentin, Kringelbach, Vuust, "Syncopation, Body-Movement and Pleasure in Groove Music", *PLoS ONE* 9(4): e94446, 2014: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0094446
- Pearce, "Statistical learning and probabilistic prediction in music cognition", *Ann. N.Y. Acad. Sci.* 1423, 2018: https://pmc.ncbi.nlm.nih.gov/articles/PMC6849749/
- Solberg & Jensenius, "Pleasurable and Intersubjectively Embodied Experiences of Electronic Dance Music", *Empirical Musicology Review*, 2017: https://www.researchgate.net/publication/316478370

### Limitations of this pass
- Reviewed from abstracts, documentation and secondary summaries. Full papers were not re-read line by line. Numeric results are quoted only where the source states them.
- Coverage is skewed toward Western and EDM material, because that is BAD-D's domain. The non-Western meter literature is cited mainly as evidence *against* global-meter assumptions.
- No experiment was run. Every layer's feasibility is an estimate until a lab experiment measures it.
