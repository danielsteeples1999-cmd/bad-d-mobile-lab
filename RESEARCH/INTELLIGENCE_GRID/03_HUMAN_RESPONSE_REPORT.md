# Pass 03 Report: Musical Structure → Human Response

> Status: **COMPLETE (research-only, no code)** · 2026-10-02 · answers [03_HUMAN_RESPONSE_RESEARCH.md](03_HUMAN_RESPONSE_RESEARCH.md)
> Builds on [01_GRID_MODEL_REPORT.md](01_GRID_MODEL_REPORT.md) (layers L5, L8, L9, L11, L12).
> **Boundary rule (from the pass brief): crowd behaviour is never inferred directly from audio.** Audio supports *hypotheses*. Only observation produces *responses*.

---

## Summary

1. **There is a four-step chain from audio to crowd response, and every step loses certainty.**
   - The steps are: **A** audio fact → **B** perceptual interpretation → **C** human-response hypothesis → **D** observed crowd response.
   - The research does support A→B links for groove, syncopation, pulse clarity, surprise and energy, and some B→C links with modest effect sizes.
   - It does **not** support going straight from A to D. Context, familiarity, social presence, and live vs recorded playback each shift the response substantially. Examples:
     - group synchrony rose with play-count / familiarity (Ellamil et al. 2016)
     - head movement was faster at a live concert than at album playback (Swarbrick et al. 2019)
     - other dancers shaped each participant's experience (Solberg & Jensenius 2017)
2. **Several effects are inverted-U or interaction effects, not monotonic.**
   - Groove peaks at **medium** syncopation (Witek et al. 2014).
   - Pleasure depends on surprise **×** uncertainty: surprise is pleasant when the listener was confident; predictability is pleasant when the listener was uncertain (Cheung et al. 2019; Gold et al. 2019).
   - A single "more is better" score is therefore structurally wrong. This is the evidence-based reason for the brief's "no single danceability score" rule.
3. **Some of the strongest response drivers are not visible in the track file at all.** Very-low-frequency bass at **8–37 Hz**, below conscious hearing, raised dancing by **11.8 %** at a live concert (Cameron et al. 2022). Playback system and venue are part of the causal path. They must be recorded as context, not inferred from the audio.
4. **The EDM break routine is the best-evidenced structure → response pattern for BAD-D's domain.** The routine is breakdown → build-up → drop. The evidence covers motion, skin conductance and self-report (Solberg & Jensenius 2017; Solberg & Dibben 2019). Even so, the samples are small (n = 16 and n = 24).

---

## A. Concept-by-concept boundary table

Columns:
- **A** — audio fact: measured from the signal.
- **B** — perceptual interpretation.
- **C** — human-response hypothesis.
- **D** — observed crowd response: what would count as evidence.

| Concept | A. Audio fact | B. Perceptual interpretation | C. Human-response hypothesis | D. Observed crowd response (evidence) |
|---|---|---|---|---|
| **Groove** | Onset density, low-frequency (bass/kick) energy, microtiming deviations, syncopation index relative to the estimated meter, event density per bar | "This makes me want to move." Rated groove varies widely across tracks: Janata et al. 2012 report means from 29.3 to 108.7 on a 128-point scale | High-groove passages raise movement and tapping accuracy | Tapping to high-groove music matched the music's periodicities more closely and was felt as easier (Janata et al. 2012, lab, n = 19) |
| **Entrainment** | Pulse periodicity and pulse clarity (beat-salience strength) | Felt beat; chosen metrical level (tactus) | Movement locks to the beat at a preferred level | Club accelerometers: group phase-synchrony covaried with metrical clarity and with walking-like pulse rates (Ellamil et al. 2016, n = 46) |
| **Rhythmic prediction** | Regularity of inter-onset intervals; meter-change events (Pass 02 L4) | Feeling "locked in" vs "stumbled" | A metrical deviation (e.g. the CE-1 2-beat bar) causes a brief loss of synchrony followed by recovery | **Unknown.** No published club data on reactions to odd bars, which makes this a BAD-D research opportunity |
| **Expectation** | Model-estimated predictive distribution (IDyOM-style for symbolic data; audio-domain proxies) | Feeling that "something is coming" | Build-ups raise anticipation and arousal | Skin conductance during the break routine, highest at the drop (Solberg & Dibben 2019, n = 24, lab listening) |
| **Prediction error / surprise** | Information content of an event under a model; spectral novelty | "That was unexpected" | Pleasure depends on surprise **×** prior uncertainty | Chord-level IC × entropy predicted pleasure ratings and amygdala, hippocampus and auditory-cortex activity (Cheung et al. 2019, 80,000 chords from 745 pop songs; fMRI) |
| **Syncopation** | Metrical-weight syncopation score; **valid only relative to the assumed meter** (Pass 02) | Rhythmic tension; "off-beat pull" | Inverted U: medium syncopation gives the most wanting-to-move and pleasure | Ratings with drum-pattern stimuli (Witek et al. 2014, online and lab); not club data |
| **Surprise (structural)** | Section-boundary novelty; dropout or return of a layer | "Shock", "lift" | Withheld and then delivered events produce peak responses | Drop sections drew higher skin conductance than other sections (Solberg & Dibben 2019) |
| **Tension / release** | Separate curves: loudness, brightness, roughness, rhythmic density, rising pitch (risers), harmonic instability | Felt tension builds and resolves; Farbood 2012 models it as a weighted combination of features | Release at the drop raises movement | Group quantity of motion **fell during breakdowns and rose at the drop** (Solberg & Jensenius 2017, n = 16 dancers, club-like lab) |
| **Perceived energy** | Loudness (LUFS), low-end energy, onset rate, brightness. Each is kept as its own curve | "Energy level"; perceived arousal | Energy trajectory across a set shapes fatigue and engagement | **Unknown** at set scale; no published long-form crowd energy data found in this pass |
| **Movement synchronisation** | (needs a sensor; not in the audio) | n/a | Clear meter and familiar music raise group synchrony | Synchrony was higher with metrical clarity, high-frequency energy, and **play-count / familiarity** (ρ = 0.80) (Ellamil et al. 2016) |
| **Dance response** | Pulse clarity, spectral flux, low-frequency content | n/a | Specific features predict specific movement qualities | Pulse clarity and spectral flux predicted movement features in motion capture (Burger et al. 2013, n = 60, 30 pop stimuli) |
| **Audience engagement** | (needs a sensor, survey or observation) | n/a | Live > recorded; fans > neutral listeners | Head movement was faster at a live concert than at album playback, and fans entrained more (Swarbrick et al. 2019) |
| **Repetition / habituation** | Self-similarity matrices; repetition counts at loop, bar and phrase scale | Familiarity; boredom vs "hypnotic" absorption | Repetition first builds entrainment, then habituation sets in; the turning point is unknown | Indirect: familiarity raised synchrony (Ellamil 2016). **No direct club evidence** on when repetition turns into boredom |
| **Climax and reset** | Structural position (drop, outro); energy maxima followed by drop-offs | "Peak", then "breather" | A reset after a climax restores capacity for the next peak | Breakdown motion reduction is consistent with a reset (Solberg & Jensenius 2017). Set-level reset timing is **unknown** |
| **(Context, not in file)** | Playback system: sub-bass extension, SPL, venue | Felt bass | Infrasonic and VLF bass raise movement | **+11.8 % dancing** with VLF speakers (8–37 Hz) on vs off (Cameron et al. 2022, live concert, motion-sensing headbands) |

### Reading the table
- **Column D is the only evidence of crowd response.** Every D entry above comes from a specific population, setting and stimulus set; the setting is noted in brackets each time.
- **Rows marked "Unknown" in D are where BAD-D could generate original evidence.** The two clearest cases are rhythmic prediction (odd bars) and set-scale energy.

---

## B. Candidate measurable features (audio side only, A-class)

Each feature is grouped by the Pass 01 grid layer it belongs to.

| Feature | Layer | Linked concepts | Estimability on mobile (guess, to be measured) |
|---|---|---|---|
| Onset-strength envelope, onset rate | L1 | groove, density, energy | cheap |
| Pulse clarity (autocorrelation peak strength, or tracker activation contrast) | L2 | entrainment, dance response | cheap given L2 |
| Tempo + tempo-octave hypotheses | L2 | entrainment level | cheap (Pass 02 caveats) |
| Syncopation index **relative to L3** | L5 | groove (inverted U), tension | cheap *if* L3 is right; inherits L3 errors |
| Microtiming / swing ratio | L5 | groove | medium (needs accurate onsets) |
| Band energies (sub < 60 Hz, low, mid, high) | L0/L8 | energy, VLF effect, synchrony (high-frequency) | cheap |
| Loudness curve (LUFS, short-term) | L8 | energy, tension | cheap |
| Roughness / sensory dissonance | L8 | tension; it correlated with synchrony in Ellamil 2016 | medium |
| Spectral flux / novelty curve | L7/L9 | surprise, section boundaries | cheap |
| Self-similarity / repetition count | L7 | habituation, structure | medium (memory) |
| Riser detection (rising pitch or noise sweeps, snare-roll density) | L9 | build-up anticipation | research |
| Layer dropout / re-entry (kick present?) | L7/L9 | breakdown / drop | medium (stems help) |
| Symbolic surprise / entropy (IDyOM on transcribed chords) | L9 | surprise × uncertainty | research (needs transcription) |

**Never computed from audio:** synchrony, engagement, movement quantity, pleasure. These are D-class and require sensors or annotation.

---

## C. Experimental designs (ranked by information gain ÷ cost for BAD-D)

### E1. Odd-bar disruption tap test (cheapest; fills an evidence gap)

**Question:** Does a single metrical deviation measurably disrupt entrainment, and how many bars does recovery take?

**Design**
- Stimuli: the GRID-METER-001 synthetic fixtures (control vs CE-1 / CE-2 / CE-5). The ground truth is exact and the audio is copyright-free.
- Task: participants tap to the beat on a phone touchscreen.

**Measures**
- Tap asynchrony and its variability, before and after the deviation.
- Bars until asynchrony returns to its baseline.
- One-tap subjective "stumble" rating.

**Why first**
- Needs no club access. A browser page is enough, so this is a lab tool.
- Directly tests the C-class hypothesis in the rhythmic-prediction row.
- Matched-pair design: each fixture has a control twin.

**Limitations**
- Tapping is not dancing.
- Phone touch latency must be calibrated first. Measure it with a known-delay click test.

### E2. Break-routine replication with section-level features

**Question:** Do BAD-D's estimated section boundaries and energy curves predict self-reported anticipation and peak moments?

**Design**
- Continuous slider rating ("anticipation" / "intensity") while listening to EDM tracks with annotated break routines (Raveform-style labels).

**Measures**
- Lagged correlation between the slider trace and each A-class curve, computed **per feature**, never as a combined score.

**Prior to replicate:** drop > build-up > breakdown (Solberg & Dibben 2019).

### E3. Surprise × uncertainty on drop timing

**Question:** Is a delayed drop (an extended bar, as in CE-2) rated as more pleasurable or less, depending on how predictable the preceding build-up was?

**Design**
- 2 × 2: build-up predictability (regular 8 bars vs irregular) × drop timing (on time vs +2 beats).

**Basis:** Cheung et al. 2019 predict an interaction effect.

### E4. Field observation (requires Daniel / venue; human-gated)

**Question:** Do crowd movement and synchrony change at structurally marked points in real DJ sets?

**Design**
- Ellamil-style phone accelerometers, or video-based quantity of motion.
- The DJ set's grid layers are logged in BAD-D.
- Ethics, consent and privacy approval are required.

**Rule:** results are D-class. They are **never** used to back-label the audio as "danceable" in general.

### E5. Playback-context control

**Question:** How much of a measured response is due to the playback system rather than the track?

**Design:** the same set on headphones, phone speaker, and club PA (sub-bass on vs off), following Cameron et al. 2022.

**Output:** a context covariate stored with every D record.

---

## D. Datasets and candidate annotations

### Datasets

**Groove and movement**

| Dataset / source | Content | Use for BAD-D |
|---|---|---|
| Janata et al. 2012 stimulus set | Groove ratings for 148 excerpts across genres (lab) | B-class groove prior; not EDM-specific |
| Burger et al. 2013 (Jyväskylä mocap) | 60 participants × 30 pop stimuli, motion capture | Feature → movement-quality priors |
| AIST++ (Li et al., ICCV 2021, "AI Choreographer") | Large 3D dance-motion dataset paired with music | Movement modelling; **performed** choreography, not crowd response |
| Ellamil et al. 2016 data | Club accelerometry, 46 dancers, 31-min disco set | Closest public analogue to E4 |

**Structure annotations**

| Dataset / source | Content | Use for BAD-D |
|---|---|---|
| Raveform (Kim et al.) | EDM function labels in real DJ mixes | Stimuli + section annotations for E2 |
| Harmonix Set | Beats, downbeats, segments | Structure ground truth |

### Candidate annotation schema (L11/L12 records)

```
ResponseAnnotation {
  span: [t0, t1], track_id, set_position,
  class: "C_hypothesis" | "D_observed",
  concept: groove | entrainment | anticipation | surprise | tension | release |
           energy | synchrony | engagement | habituation | reset,
  measure: {kind: "slider" | "tap_asynchrony" | "accelerometry" | "QoM_video" |
                  "SCR" | "self_report" | "DJ_note",
            value, units},
  population: {n, expertise, familiarity_with_track},
  context: {setting: lab|home|club|live, playback: headphones|phone|PA,
            sub_bass: bool, time_in_set, crowd_density},
  provenance: {protocol_id, annotator/sensor, consent_ref},
  supports: [grid layer refs]   # which A/B features the hypothesis was about
}
```

Rules:
- A `C_hypothesis` may be **generated** from audio features.
- A `D_observed` record may only come from a measurement with a populated `population` and `context`.
- Summaries **never** average across contexts.

---

## E. Proposed layered model (extends Pass 01)

```
L0–L8   audio facts + estimates           (A, E-class)   — from the track file
L9      expectation / surprise / uncertainty (E + P)     — model-based, uncertain
B-layer perceptual readings  (P)          — groove, tension, energy, felt beat;
                                             each a separate dimension, never merged
L11     response hypotheses (H)           — "if X at t, expect Y", with direction,
                                             prior source, and expected effect size
L12     observed responses (C/D)          — with population + context; may falsify L11
CTX     context (not in file)             — playback, venue, time in set, crowd, familiarity
```

Dimensions kept separate on purpose: **groove, entrainability (pulse clarity), tension, energy, surprise, familiarity, context.** Their interactions are documented: inverted U for syncopation, surprise × uncertainty, and familiarity × synchrony. Because of these interactions, no fixed weighted sum can represent them. Any summary score shown to a DJ must be:
- (a) labelled as a derived view
- (b) decomposable back into its dimensions
- (c) calibrated against L12 data from comparable contexts

---

## F. Limitations
- Most evidence comes from **small, WEIRD-sample, lab or lab-club studies** (n = 16 to 60). Effect sizes may not transfer to real clubs, other genres or other cultures.
- Several sources are reviewed from abstracts and secondary summaries, not full-text re-analysis. Numbers are quoted only where the source states them.
- Ellamil et al. 2016 is correlational and disco-only. The causal direction between music features and synchrony is not established.
- The inverted-U results (Witek et al. 2014) use controlled drum-break stimuli. Whether they hold for full EDM productions is unknown.
- **Nothing in this pass is BAD-D evidence.** E1 is the cheapest way to start generating some.

---

## G. Sources

**Groove and entrainment**
- Janata, Tomic, Haberman, "Sensorimotor coupling in music and the psychology of the groove", *J. Exp. Psychol.: General* 141, 54–75, 2012: https://scispace.com/pdf/sensorimotor-coupling-in-music-and-the-psychology-of-the-5cs2hq6vjr.pdf
- Witek, Clarke, Wallentin, Kringelbach, Vuust, "Syncopation, Body-Movement and Pleasure in Groove Music", *PLoS ONE* 9(4): e94446, 2014: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0094446
- Marmoret, Farrugia, Stupacher, "Can pre-trained Deep Learning models predict groove ratings?", 2026: https://arxiv.org/abs/2603.27237. Deep features encode style-dependent groove components.

**Movement and dance**
- Burger, Thompson, Luck, Saarikallio, Toiviainen, "Influences of rhythm- and timbre-related musical features on characteristics of music-induced movement", *Front. Psychol.* 2013: https://doi.org/10.3389/fpsyg.2013.00183
- Li et al., "AI Choreographer: Music Conditioned 3D Dance Generation with AIST++", ICCV 2021: https://arxiv.org/abs/2101.08779

**Crowds and live audiences**
- Ellamil, Berson, Wong, Buckley, Margulies, "One in the Dance: Musical Correlates of Group Synchrony in a Real-World Club Environment", *PLoS ONE* 2016: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0164783
- Swarbrick et al., "How Live Music Moves Us: Head Movement Differences in Audiences to Live Versus Recorded Music", *Front. Psychol.* 2019: https://doi.org/10.3389/fpsyg.2018.02682
- Cameron, Dotov, Flaten, Bosnyak, Hove, Trainor, "Undetectable very-low frequency sound increases dancing at a live concert", *Current Biology* 2022: https://digitalcommons.unomaha.edu/biomechanicsarticles/399/

**EDM structure**
- Solberg & Jensenius, "Pleasurable and Intersubjectively Embodied Experiences of Electronic Dance Music", *Empirical Musicology Review* 2017: https://www.researchgate.net/publication/316478370
- Solberg & Dibben, "Peak Experiences with Electronic Dance Music: Subjective Experiences, Physiological Responses, and Musical Characteristics of the Break Routine", *Music Perception* 36(4), 371–389, 2019: https://eprints.whiterose.ac.uk/id/eprint/145911/1/Solberg%26Dibben2019.pdf

**Expectation, surprise and tension**
- Cheung, Harrison, Meyer, Pearce, Haynes, Koelsch, "Uncertainty and Surprise Jointly Predict Musical Pleasure and Amygdala, Hippocampus, and Auditory Cortex Activity", *Current Biology* 29(23), 2019: https://www.cell.com/current-biology/fulltext/S0960-9822(19)31258-8
- Gold, Pearce, Mas-Herrero, Dagher, Zatorre, "Predictability and uncertainty in the pleasure of music: a reward for learning?", *J. Neurosci.* 39(47), 9397–9409, 2019: https://doi.org/10.1523/JNEUROSCI.0428-19.2019
- Pearce, "Statistical learning and probabilistic prediction in music cognition", *Ann. N.Y. Acad. Sci.* 2018: https://pmc.ncbi.nlm.nih.gov/articles/PMC6849749/
- Farbood, "A Parametric, Temporal Model of Musical Tension", *Music Perception* 29(4), 2012.
- Huron, *Sweet Anticipation: Music and the Psychology of Expectation*, MIT Press, 2006.
- Salimpoor et al., "Anatomically distinct dopamine release during anticipation and experience of peak emotion to music", *Nature Neuroscience* 14, 2011.
- Margulis, *On Repeat: How Music Plays the Mind*, Oxford University Press, 2014. Repetition and habituation.

**Datasets**
- Raveform (Kim et al.): https://transactions.ismir.net/articles/10.5334/tismir.288
