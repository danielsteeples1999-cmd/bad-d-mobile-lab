# Pass 05 Report: Adversarial Reality Check

> Status: **COMPLETE (research + one lab measurement)** · 2026-10-02 · answers [05_ADVERSARIAL_REALITY_CHECK.md](05_ADVERSARIAL_REALITY_CHECK.md)
> Targets: Passes 01–04 and the Intelligence Grid concept itself.
> Unlike Passes 01–04, this pass has **lab evidence of its own**: [GRID-METER-001](../../experiments/GRID-METER-001/README.md).

---

## Summary
- The case against the Intelligence Grid is stronger than Passes 01–04 admit. Four objections stand:
  1. **The lower layers are fragile, and the upper layers inherit that fragility.**
     - GRID-METER-001 showed a widely used, state-of-the-art decoder mislabelling half a track by half a bar from **one** odd bar, with near-perfect beat accuracy and no warning.
     - Every layer above meter (syncopation, phrase, transition affordance, expectation) is computed *relative to* that meter.
     - If L3 is wrong, everything built on it is wrong in a coherent-looking way. That is worse than being obviously wrong.
  2. **The "uncertainty" the grid promises is not available off the shelf.**
     - Beat This! is the best tested system for a single odd bar. Its confidence was saturated: wrong downbeats scored 0.96–0.99 against 1.00 for correct ones.
     - On a repeating odd bar, confidence ranking fell to near chance (AUC 0.42–0.85).
     - A grid that "carries uncertainty" is only as honest as its least-calibrated input, and none of the inputs are calibrated today.
  3. **The upper layers (L9 expectation, L11 response hypotheses, intent states) have almost no BAD-D-relevant validation.**
     - The best human-response evidence is from n = 16–60 lab or lab-club studies (Pass 03).
     - Building these layers now risks producing **plausible-sounding fiction**.
  4. **Most of the claimed value could come from much less.**
     - Per-bar meter plus a confidence flag plus a "don't auto-act on ambiguous bars" rule may deliver most of the practical DJ benefit.
     - The rich expectation and response layers may never pay for their complexity.
- **What survives:**
  - The core architectural claims survive and are strengthened by the evidence: meter as a function of time, `unknown` as a valid output, epistemic classes, no composite score.
  - The **content** of the upper layers is mostly *not justified yet*.

---

## A. Failure modes

**Classification column:**
- **Defensible now**: backed by evidence; can be built and relied on.
- **Experimental**: plausible, but must be measured before use.
- **Not justified yet**: building it now would mainly produce fiction.

### Meter, beat and tempo

**F1. False 4/4 assumption**
- **Attack:** A global 4/4 grid is applied to music with odd bars. *Measured* in GRID-METER-001: madmom DBN, 15–16 bars mis-phased at every tempo.
- **Detection:** (a) Per-bar disagreement between decoded downbeats and raw activation peaks. (b) Disagreement between two decoders with different priors (DBN vs no-DBN). (c) Harmonic-change and crash onsets inconsistent with the decoded bar lines.
- **Confidence representation:** Per-bar `status ∈ {confident, ambiguous, unknown}` plus alternative bar lengths with weights (Pass 02 §F).
- **Human verification:** The DJ confirms or corrects a flagged bar in a waveform view. Each correction is logged as an L12 annotation.
- **Test data:** GRID-METER fixtures (exists); real tracks with human bar annotations (Harmonix downbeats; Pass 02 §C.2 list, annotated by a human).
- **Classification:** Detecting that the grid *may* be wrong: **experimental** (GRID-METER-002). The rule that no global meter is assumed: **defensible now**.

**F2. Beat / bar / phrase confusion**
- **Attack:** A correct beat is mistaken for a correct bar, and a correct bar for a correct phrase. *Measured:* beat F 0.997 alongside downbeat F 0.49 in GRID-METER-001. Beat accuracy says nothing about bar accuracy.
- **Detection:** Score each level separately. Never report beat F as "grid accuracy". The phrase layer refuses to emit 8/16/32-bar phrases across a flagged bar.
- **Confidence representation:** Separate confidence per level (L2, L3, L6). Phrase confidence ≤ the minimum bar confidence inside it.
- **Human verification:** The DJ checks phrase starts at proposed cue points.
- **Test data:** Phrase-labelled EDM (Raveform, Harmonix segments) plus synthetic irregular phrases.
- **Classification:** Separate scoring is **defensible now**. Phrase inference is **experimental**.

**F3. Syncopation mistaken for meter change**
- **Attack:** Heavy off-beat accents, such as anticipated downbeats or pushed chord changes, look like a shifted downbeat. The tracker "changes meter" when the music only syncopated.
- **Detection:** A meter change must persist (≥ 2 bars) or be supported by several independent cues: harmony, kick/bass pattern, phrase. A single-bar accent shift is classed as syncopation unless confirmed.
- **Confidence representation:** Keep both readings as alternatives: "syncopation under 4/4" vs "meter shift". Mark `ambiguous` when the cues disagree.
- **Human verification:** Listening test: tap the "1" through the passage.
- **Test data:** Synthetic fixtures with syncopated chord anticipation but constant 4/4 (**needs building**), paired with true meter-change fixtures.
- **Classification:** **Experimental.** The opposite error (meter change mistaken for syncopation) is equally likely.

**F4. Half-time / double-time error**
- **Attack:** The tracker reports 87 instead of 174 BPM, or reads a half-time feel switch as a tempo change. *Not observed* in GRID-METER-001: tempo ratio 0.98–1.003, and the fixtures did not test feel switches.
- **Detection:** Keep tempo-octave hypotheses (×½, ×1, ×2) with weights. Flag a "feel switch" when the snare pattern period doubles while the kick IBI stays constant.
- **Confidence representation:** Store a tempo hypothesis set, not a scalar. Mark the feel as `ambiguous` when the snare and kick periodicities disagree.
- **Human verification:** The DJ chooses the counting level once per track; the choice is stored.
- **Test data:** CE-3 half-time fixture (**needs building**); a DnB and dubstep subset with annotations.
- **Classification:** Hypothesis sets are **defensible now**. Feel-switch detection is **experimental**.

**F5. Polymeter mistaken for tracking failure (or the reverse)**
- **Attack:** A 3-against-4 layer makes the tracker oscillate. The system then either calls it "tracking failure" and discards real structure, or calls a real failure "polymeter".
- **Detection:** Stem-wise periodicity analysis. If two stems are each internally stable but have different bar lengths, call it polymeter. If no stem is stable, call it a failure.
- **Confidence representation:** Two concurrent meter streams, each with its own confidence, plus a realignment period.
- **Human verification:** Listening, plus a stem solo check.
- **Test data:** CE-4 fixture (**needs building**); a few known polymetric tracks.
- **Classification:** **Not justified yet.** It depends on stem separation quality on mobile, which is unknown.

### Inference about intent and response

**F6. Hallucinated musical intention**
- **Attack:** The system labels a bar as "tease", "delay" or "disrupt" (Pass 04 states) when the producer or DJ intended nothing of the sort, or when the "event" is a tracker error.
- **Detection:** Intent labels may come **only** from the DJ (Pass 04 INTENT-001), never from audio. Audio may only say "structural event X occurred".
- **Confidence representation:** Intent is a *user annotation* class; it has no automatic confidence field.
- **Human verification:** Always required. That is the point of the state.
- **Test data:** The DJ's own labelled sets.
- **Classification:** Automatic intent inference is **not justified yet**. A shared intent *vocabulary* the DJ selects from is **experimental**.

**F7. Unsupported crowd prediction**
- **Attack:** "This drop will raise movement by X" stated as fact. The evidence base is small, context-bound and lab-based (Pass 03). Context can dominate the track: sub-bass alone moved dancing by 11.8 % (Cameron et al. 2022).
- **Detection:** Reject any L11 record lacking a prior source, a context and an expected direction.
- **Confidence representation:** A C-class hypothesis with explicit population and context. It is never displayed as a percentage without L12 calibration.
- **Human verification:** Field observation (Pass 04 FLOOR-001).
- **Test data:** D-class data from comparable contexts. **None exists for BAD-D yet.**
- **Classification:** **Not justified yet** beyond direction-only priors with citations.

**F8. Loudness mistaken for energy**
- **Attack:** "Energy" is computed as LUFS. Loudness does causally raise perceived arousal (Dean, Bailes & Schubert 2011). But spectral flux and spectral entropy explained 65 % of arousal-rating variance in Gingras et al. 2014. Mastering loudness also varies by era and genre independently of musical energy.
- **Detection:** Keep separate curves for loudness, low end, density, brightness and flux. Normalise loudness per track before comparing across tracks.
- **Confidence representation:** No "energy" scalar. If a DJ-facing summary is shown, it is a labelled derived view with its components visible.
- **Human verification:** The DJ ranks energy for a small set of their own tracks; check which curve agrees.
- **Test data:** The DJ's rated tracks, plus loudness-matched pairs.
- **Classification:** Separate curves: **defensible now**. Any single energy number: **not justified yet**.

**F9. Surprise mistaken for quality**
- **Attack:** High information content is treated as "better" or "more exciting". Cheung et al. 2019 show that pleasure depends on surprise **×** uncertainty: surprise is pleasant when the listener was certain and unpleasant when uncertain. Witek et al. 2014 found an inverted U for syncopation.
- **Detection:** Never rank by surprise. Surprise is shown only alongside uncertainty and context.
- **Confidence representation:** A two-dimensional (surprise, uncertainty) value, not a score.
- **Human verification:** Pass 03 E3 (drop delay × predictability).
- **Test data:** Listener ratings.
- **Classification:** As a descriptor: **experimental**. As a quality signal: **not justified yet**.

**F10. Irregularity mistaken for intention**
- **Attack:** Every detected odd bar is treated as a deliberate artistic event. Some are DJ-edit mistakes, bad loops, or *tracker errors*. GRID-METER-001 shows trackers create apparent irregularities: spurious 3-beat bars appear even in control runs.
- **Detection:** An irregularity is "real" only if it is (a) stable across two trackers, (b) supported by non-percussive cues, and (c) consistent on re-analysis.
- **Confidence representation:** Status `irregular-confirmed` vs `irregular-unconfirmed`.
- **Human verification:** A listening check on unconfirmed ones.
- **Test data:** Control fixtures (false-positive rate) plus odd-bar fixtures (recall).
- **Classification:** **Experimental** (GRID-METER-002 measures the false-positive rate).

### Scope and generality

**F11. Genre overfitting**
- **Attack:** The grid's priors come from 4/4 EDM: 16-bar phrases, 32-beat transitions, break routines. Applied to hip-hop, open-format, live bands or non-Western music, the priors become errors. Kim et al. 2020's statistics come from 1001Tracklists mixes centred on 127 BPM.
- **Detection:** A per-track genre/style hypothesis gates which priors apply. Priors are disabled when the style is unknown.
- **Confidence representation:** The prior's provenance is stored with every derived value ("16-bar prior: EDM").
- **Human verification:** The DJ sets the style for out-of-domain crates.
- **Test data:** Cross-genre evaluation: Harmonix (multi-genre), SMC (expressive), Ballroom.
- **Classification:** Priors as labelled, switchable assumptions: **defensible now**. Their validity outside EDM: **not justified yet**.

**F12. False certainty**
- **Attack:** Outputs carry no uncertainty, or uncalibrated scores presented as probabilities. *Measured:* Beat This! wrong downbeats at 0.96–0.99; the madmom DBN emits no confidence at all.
- **Detection:** Calibration curves on fixtures and annotated tracks (reliability diagrams). Agreement between independent methods as an empirical confidence.
- **Confidence representation:** Discrete status (`confident` / `ambiguous` / `unknown`) set by **measured** thresholds, not raw scores.
- **Human verification:** Spot checks on `confident` bars to estimate the residual error rate.
- **Test data:** GRID-METER fixtures plus human-annotated real tracks.
- **Classification:** Discrete status: **defensible now** as a representation. Calibrated thresholds: **experimental**.

**F13. Culturally narrow metrical assumptions**
- **Attack:** The grid assumes isochronous beats and Western bar hierarchies. Malian jembe music uses **non-isochronous** beat subdivision as part of its meter (Polak 2010; Polak & London 2014). Carnatic tāla cycles need long-cycle tracking (Srinivasamurthy et al. 2015). Pretrained Western models under-perform on these without adaptation (Maia et al. 2022).
- **Detection:** Detect when no isochronous-subdivision model fits well (high residual microtiming that is *structured*, not noise).
- **Confidence representation:** Allow non-isochronous subdivision templates and long cycles. Otherwise say `unknown`, never "4/4 with bad timing".
- **Human verification:** Expert or culturally informed annotation.
- **Test data:** CompMusic rhythm corpora; jembe corpora (Polak).
- **Classification:** Admitting `unknown`: **defensible now**. Modelling these meters: **not justified yet** for BAD-D's scope.

**F14. Meaningless composite score**
- **Attack:** Summing groove, energy, tension and surprise into a "danceability" number. Interactions (inverted U, surprise × uncertainty, familiarity × synchrony) make any fixed weighted sum wrong somewhere. Mixed In Key's 1–10 energy and rekordbox's High/Mid/Low mood are product-level examples of such collapse.
- **Detection:** Code review rule: no scalar without decomposable components and a stated calibration target.
- **Confidence representation:** n/a. Composites are views, not data.
- **Human verification:** If a composite is ever shown, check its ranking against the DJ's own ranking.
- **Test data:** The DJ's rated tracks.
- **Classification:** The "no composite at core" rule: **defensible now**. Any composite: **not justified yet**.

---

## B. Component classification (the whole grid)

| Component (Pass 01 layer) | Classification | Reason |
|---|---|---|
| L0 signal features | **Defensible now** | Measurement |
| L1 onsets | **Defensible now** | Mature; percussive material |
| L2 beats on steady percussive music | **Defensible now** | GRID-METER-001: beat F ≈ 0.97–1.0 on every fixture |
| L2 tempo-octave hypotheses | **Defensible now** (as a set) | No octave errors measured; ambiguity still real in DnB / dubstep |
| L3 per-bar meter | **Experimental** | Representation is right; current decoders fail (GRID-METER-001) |
| L3 confidence / status | **Experimental** | Activation separates errors in madmom (AUC 0.89–1.00) but Beat This! is saturated; GRID-METER-002 is required |
| L4 deviation events | **Experimental** | Depends on L3; false-positive rate unknown |
| L5 syncopation / microtiming | **Experimental** | Exact *given* a meter; inherits L3 errors |
| L6 phrase / hypermeter | **Experimental** | Strong EDM prior (16 bars / 32 beats) but fails across odd bars |
| L7 sections (multi-level) | **Experimental** | Subjective (Nieto et al. 2020); product phrase analysis exists |
| L8 separate energy curves | **Defensible now** | Measurement; kept separate |
| L9 expectation / surprise | **Not justified yet** | Audio-domain models are research-level; symbolic IDyOM needs transcription |
| L10 transition affordances | **Experimental** | Craft constraints are evidence-based (Kim et al. 2020), but depend on L3 / L6 |
| L11 response hypotheses | **Not justified yet** (except cited direction-only priors) | No BAD-D D-class data |
| L12 observed responses | **Defensible now** as a *data container* | Requires collection protocols with consent |
| Intent states (Pass 04) | **Experimental** as a DJ-selected vocabulary; **not justified** as inference | |
| Composite scores | **Not justified yet** | F14 |

---

## C. Strongest argument against building the grid at all, and the response

**Argument.** DJs already mix successfully with static 4/4 grids and their ears. Odd bars are rare in DJ-oriented EDM. The expectation and response layers are unvalidated. So the Intelligence Grid is a large research programme with no proven user benefit. A simpler fix captures most of the value: detect per-bar meter, warn on odd bars, and refuse auto-actions there.

**Response.**
- Accept most of it. The **minimal viable grid** is L0–L3 + L8 + per-bar status, plus the fail-closed craft rule.
- Everything else waits for evidence:
  - The prevalence of odd bars in BAD-D's actual library is **unknown**. It decides the value of even the minimal grid, so it is the first thing to measure on real data.
  - L9 / L11 are gated behind Pass 03 E1–E3 results.
- The research is still worth having for its **negative** value. It specifies what the system must *not* claim.

---

## D. Required next evidence (feeds Pass 06)
1. **GRID-METER-002.** A per-bar disagreement detector: recall on odd bars and false-alarm rate on controls.
2. **Odd-bar prevalence** in a real library. Run the detector over a sample of the DJ's tracks; hand-verify flagged bars.
3. **CE-3 / CE-4 fixtures** (half-time, polymeter) and a **syncopation-not-meter-change** fixture (F3).
4. **Cross-genre check** of priors (F11) on Harmonix / SMC subsets.
5. **Pass 03 E1** odd-bar tap test. This gives the first human evidence on whether odd bars matter to listeners.

---

## E. Sources

**Lab evidence**
- GRID-METER-001 (this repository): [experiments/GRID-METER-001/README.md](../../experiments/GRID-METER-001/README.md)

**Energy and arousal (F8)**
- Dean, Bailes, Schubert, "Acoustic Intensity Causes Perceived Changes in Arousal Levels in Music: An Experimental Investigation", *PLoS ONE* 2011: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0018591
- Gingras, Marin, Fitch, "Beyond Intensity: Spectral Features Effectively Predict Music-Induced Subjective Arousal", *Q. J. Exp. Psychol.* 2014: https://doi.org/10.1080/17470218.2013.863954

**Non-Western and non-isochronous meter (F13)**
- Polak, "Rhythmic Feel as Meter: Non-Isochronous Beat Subdivision in Jembe Music from Mali", *Music Theory Online* 16(4), 2010: https://www.mtosmt.org/issues/mto.10.16.4/mto.10.16.4.polak.pdf
- Polak & London, "Timing and Meter in Mande Drumming from Mali", *Music Theory Online* 20(1), 2014: https://mtosmt.org/issues/mto.14.20.1/mto.14.20.1.polak-london.html
- London, *Hearing in Time: Psychological Aspects of Musical Meter*, 2nd ed., Oxford University Press, 2012.
- Srinivasamurthy et al., ISMIR 2015: https://compmusic.upf.edu/ismir-2015-pf
- Maia et al., ISMIR 2022: https://arxiv.org/abs/2304.07186

**Response evidence (F7, F9)**
- Cheung et al., *Current Biology* 2019: https://www.cell.com/current-biology/fulltext/S0960-9822(19)31258-8
- Witek et al., *PLoS ONE* 2014: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0094446
- Cameron et al., *Current Biology* 2022: https://digitalcommons.unomaha.edu/biomechanicsarticles/399/

**Structure and DJ practice (F2, F11)**
- Nieto et al., TISMIR 2020: https://transactions.ismir.net/articles/10.5334/tismir.54
- Kim et al., ISMIR 2020: https://archives.ismir.net/ismir2020/paper/000352.pdf

**Tracker failure modes (F12)**
- Ahn, Hwang, Jung, "The SMC Blind Spot", 2026: https://arxiv.org/abs/2605.12287
