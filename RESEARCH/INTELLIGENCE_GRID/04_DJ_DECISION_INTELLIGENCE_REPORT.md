# Pass 04 Report: DJ Decision Intelligence

> Status: **COMPLETE (research-only, no implementation)** · 2026-10-02 · answers [04_DJ_DECISION_INTELLIGENCE.md](04_DJ_DECISION_INTELLIGENCE.md)
> Builds on Pass 01 (grid layers, esp. L10 affordances), Pass 02 (meter uncertainty), Pass 03 (A/B/C/D response boundary).
> All "states" in this report are **hypotheses about DJ intent**. They are not established facts about DJ cognition or crowd response.

---

## Summary

1. **Two questions, often confused:**
   - *"Can these two tracks be mixed cleanly?"* is a **compatibility** question. It is mostly automatable from audio.
   - *"Should this track be played now?"* is a **strategy** question. It depends on set history, crowd state and venue context, and needs a human or live feedback.
   - DJ software today mostly automates the first and presents it as if it answered the second.
2. **Large-scale evidence from real mixes** (Kim et al., ISMIR 2020: 1,557 mixes, 13,728 tracks, 20,765 transitions) shows:
   - **Phrase-aligned transitions.** Transition lengths peak at every **32 beats**.
   - **Small tempo changes.** Tempo is adjusted < 5 % for 86.1 % of tracks, < 10 % for 94.5 %.
   - **Almost no key transposition.** Only 2.5 % of 24,202 tracks are transposed; of those, 94.3 % by one semitone.
   - **Partial cue agreement between DJs.** For the same track, 23.6 % of cue-point pairs match exactly, 40.4 % are within one bar, and 73.6 % within 8 bars.

   So phrase structure is close to a hard constraint, tempo and key are soft constraints, and cue choice is partly shared and partly personal.
3. **Order matters, and "most similar next" is not what DJs do.** Real DJ track orders differ significantly from shuffled ones. The standard "return the nearest neighbour" playlist model may not be optimal for EDM (Kell & Tzanetakis 2013).
4. **Existing automation reaches about 90 % on the craft layer within narrow genres:**
   - Vande Veire & De Bie (2018), drum & bass: 91 % of songs fully correctly annotated (beats, downbeats, segments).
   - Zehren et al. (2022): about 90 % of generated switch points usable.
   - Nobody has shown the **strategy** layer working in the wild.
5. **Proposed model:** a three-layer decision stack.
   - **Craft:** automatic, with confidence.
   - **Tactics:** suggested by the system, confirmed by the DJ.
   - **Strategy:** set by the DJ, informed by feedback.

   A small set of *intent states* (establish, build, tease, release, reset …) acts as a shared vocabulary between the DJ and the system. The states are not inferred as truth.

---

## A. "Musically compatible" vs "strategically useful"

| Dimension | Compatibility question (can it mix?) | Strategy question (should it play now?) |
|---|---|---|
| BPM | Is the tempo difference within a pitch range that doesn't sound unnatural? Evidence: 86 % of real adjustments are < 5 % | Should the set's tempo arc rise, hold or drop here? |
| Key / harmony | Is the key clash-free (Camelot neighbours: same, ±1, relative major/minor)? | A deliberate "energy boost" (+1 or +2 steps on the Camelot wheel) or deliberate tension; avoiding harmonic monotony |
| Phrase structure | Can the outro of A overlap the intro of B on phrase boundaries (multiples of 32 beats)? **Requires a correct meter (Pass 02).** | Should the transition land on B's drop, or let B's intro breathe? |
| Energy | Is the energy step between the two tracks small enough to avoid a jarring change? | Build, hold, release or reset? Where are we in the arc? |
| Rhythmic compatibility | Do the groove templates and percussion densities overlap without flamming? | Would a contrasting groove refresh the floor? |
| Arrangement | Does B's intro carry no competing lead or vocal during the overlap? | Is a long blend wanted, or a hard cut for impact? |
| Vocals | Will vocals clash in the overlap? | Is a vocal moment wanted now (sing-along, recognition)? |
| Breakdowns / drops | Can B's drop be aligned with A's breakdown end? | Should the drop be delayed (tease) or delivered (release)? |
| Tension / release | (n/a: a compatibility check has no tension goal) | The core strategic variable (Pass 03: surprise × uncertainty) |
| Crowd feedback | (n/a) | The primary input to strategy; not in the audio |
| Venue / context | (n/a, except playback limits) | Time of night, set slot (warm-up vs peak), sound system (Cameron et al. 2022 showed sub-bass alone changes dancing) |

**Rule:** a compatibility score may filter candidates. It must **never** be shown as a recommendation without a strategy context.

---

## B. Intent states (hypotheses)

Each state is a **DJ-intent hypothesis**. It is defined by the musical moves typically used to realise it and the grid signals that make it possible. The "expected response" column is a **C-class hypothesis** (Pass 03), and every one is untested in BAD-D.

| State | Typical moves | Grid signals needed (Pass 01 layers) | Expected response (hypothesis) |
|---|---|---|---|
| **Establish** | Steady 4/4, clear pulse, low surprise | L2 pulse clarity high, L5 syncopation low–medium | Entrainment and early synchrony build |
| **Build** | Rising energy curves, risers, density increase | L8 rising, L9 anticipation | Rising anticipation (EDM build-up evidence) |
| **Reinforce** | Same groove family, matched key | L5 groove similarity, key compatibility | Sustained movement; habituation risk over time |
| **Intensify** | Higher energy, +1/+2 Camelot step, harder drums | L8 step up, harmonic lift | Increased movement, if the floor is not fatigued |
| **Tease** | Withhold the drop: loop the build, filter the bass | L9 expectation high, release withheld | Anticipation rises, but over-teasing is a risk |
| **Delay** | Extend a build or bar; an odd-length bar before the drop (Pass 02 CE-2) | L4 deviation events, L9 | Surprise × uncertainty interaction (Cheung et al. 2019) |
| **Disrupt** | Meter or tempo change, genre switch, hard cut | L4, L2 tempo jump | Short loss of synchrony, then possible re-engagement (untested; see Pass 03 E1) |
| **Release** | Drop / full re-entry | L7 drop label, L9 resolution | Movement peak (Solberg & Jensenius 2017) |
| **Reset** | Breakdown, ambient section, lower BPM | L8 drop in energy, L7 breakdown | Recovery; motion dips during breakdowns |
| **Re-entry** | Kick or bass returns | L7/L9 layer re-entry | Collective re-sync moment |
| **Contrast** | Different timbre or groove family | L0/L5 distance | Renewed attention; timbre matters to ordering (Kell & Tzanetakis 2013) |
| **Recover** | Familiar, high-clarity track after a disruption | L2 clarity, familiarity (context) | Synchrony recovers; familiarity raises synchrony (Ellamil et al. 2016) |
| **Extend** | Loop or extended mix to hold a working groove | L6/L7 loopable regions | Keeps a working state going |
| **Transition** | Overlap or cut between tracks | L10 affordances | Musical continuity |
| **Social / reset window** | Low-intensity passage that permits talking, drinks, rest | L8 low, vocals or recognisable hooks | Floor turnover; impossible to judge without crowd data |

**Decision dynamics (hypothesis):**
- The states form a loop: **establish → (reinforce ↔ build) → tease/delay → release → reset/recover → …**, with *contrast* or *disrupt* used to escape habituation.
- The cycle length and the depth of each state depend on context (set slot, crowd, venue). Context is never inferred from audio.

---

## C. How professional systems and DJs use each variable

| Variable | What tools do today | Evidence on DJ behaviour | Automation status |
|---|---|---|---|
| **BPM** | Beat grids (static or dynamic) and sync in every major platform | Tempo change < 5 % for 86.1 % of played tracks; < 20 % for 98.6 % (Kim et al. 2020) | **Automatable** (beats); tempo octave **uncertain** (Pass 02) |
| **Key** | Key detection plus Camelot wheel (Mixed In Key; built into rekordbox, Serato, Traktor) | Key-lock is the default; DJs rarely transpose (2.5 % of tracks) | Detection **automatable but error-prone**; *harmonic intent* is human |
| **Phrase structure** | rekordbox *phrase analysis* (Intro / Up / Down / Chorus / Bridge / Outro; mood High/Mid/Low) | Transition lengths peak at multiples of 32 beats | **Automatable for regular EDM**; breaks on odd bars (Pass 02) → must expose confidence |
| **Energy** | Mixed In Key energy level 1–10 (single scalar) | Practitioners describe energy as drums + bass + arrangement + tension + crowd response; a single scalar collapses this | Separate energy curves are **automatable**; the meaning of "energy" is **human** |
| **Rhythmic compatibility** | Mostly implicit (genre tags) | Timbre is important for ordering (Kell & Tzanetakis 2013) | Groove and timbre similarity **automatable**; deliberate contrast is **human** |
| **Arrangement / vocals** | Stems separation (rekordbox, Serato, djay, Traktor) enables vocal removal live | (No large-scale study found in this pass) | Vocal detection **automatable**; vocal intent is **human** |
| **Breakdowns / drops** | Drop detection research (Yadati et al., ISMIR 2014); rekordbox Up/Down phrases | Drops carry peak responses (Solberg & Dibben 2019) | Detection **useful but uncertain**; *timing strategy* is **human + live** |
| **Cue points** | Hot cues; auto-cue (first beat); research cue detection (Zehren et al. 2022, ~90 % usable) | DJs partly agree: 40.4 % within 1 bar, 86.2 % within 16 bars | **Suggestible** with confidence; final choice **human** |
| **Track order** | Auto-DJ, similarity playlists | Real orders differ from shuffled; nearest-neighbour ordering is likely sub-optimal (Kell & Tzanetakis 2013) | **Research**; needs a strategy model |
| **Crowd feedback** | None in mainstream tools; research systems with audience motion sensors (Feldmeier & Paradiso 2007) | Club synchrony is measurable via phones (Ellamil et al. 2016) | **Requires live feedback** (sensors or the DJ's eyes) |
| **Venue / context** | Manual (DJ knowledge) | Sound system changes behaviour (Cameron et al. 2022); live vs recorded differs (Swarbrick et al. 2019) | **Human-entered context** |

---

## D. What can be automated vs needs human control vs needs live feedback

**Automate (with confidence values; never silent)**
- Beat, tempo and downbeat. Meter must be reported per bar with `unknown` allowed (Pass 02).
- Key estimate and Camelot relationships.
- Phrase and section candidates, each with confidence. Every odd bar raises a warning.
- Separate energy curves (loudness, low end, density, brightness).
- Vocal / stem activity.
- Candidate cue and transition windows (L10), ranked by craft constraints.
- Compatibility filtering of the next-track candidates.

**Human control (system suggests; the DJ decides)**
- Intent state for the next section (build / tease / reset …).
- Selecting among compatible candidates: strategic fit, contrast, recognition moments.
- Drop timing: deliver now, or tease or delay.
- Harmonic intent: a deliberate key lift, or deliberate tension.
- Overriding any low-confidence grid value.
- Venue and context entry: set slot, sound system, crowd type.

**Live feedback required (cannot be resolved offline)**
- Crowd state: energy, fatigue, synchrony, floor density.
- Whether a tease is working or being punished.
- When a reset or social window is needed.
- The response to a disruption.
- Calibrating any response hypothesis (Pass 03 L11 → L12).

---

## E. Cited DJ decision model

```
                ┌──────────── STRATEGY (DJ-owned) ────────────┐
 context ──────►│ set arc · slot · venue · crowd read · intent │◄──── live feedback
 (human entry)  └──────────────┬──────────────────────────────┘      (D-class only)
                               │ intent state (shared vocabulary, §B)
                ┌──────────────▼───────── TACTICS (suggest → confirm) ┐
                │ candidate tracks filtered by compatibility,          │
                │ ranked by fit to intent; cue/transition window       │
                │ choices; drop timing options                         │
                └──────────────┬───────────────────────────────────────┘
                               │ chosen action
                ┌──────────────▼──────────── CRAFT (automatic) ───────┐
                │ beat/phrase alignment, sync, key-lock, EQ/fade      │
                │ executed only when grid confidence ≥ threshold;     │
                │ otherwise WARN and hand control back to the DJ      │
                └─────────────────────────────────────────────────────┘
```

**Invariants**
1. Each layer only uses inputs whose epistemic class it is allowed to use. Strategy may use C-hypotheses and D-observations. Craft may use only A/E-class grid values.
2. **Fail-closed craft.** A transition is never auto-executed on a downbeat with `ambiguous` or `unknown` status. This directly addresses the confidently-wrong mis-phase found in Pass 02 and GRID-METER-001.
3. **Every suggestion is explainable.** It is decomposable into compatibility evidence plus intent fit. No opaque single score.
4. **Feedback cannot quietly change the model.** Live feedback updates *hypotheses* (L11 weights) only through logged L12 records with context.

---

## F. Experimental roadmap

Ordered by information gain ÷ cost. Each item names its evidence class and the gate it must pass.

**Phase 1: lab, no humans needed**

1. **GRID-METER-001** (running) — meter reliability as a precondition of phrase-aligned craft.
   - Gate: per-bar confidence must flag mis-phase before craft automation is trusted.
2. **CUE-001** — reproduce the "transition lengths peak at multiples of 32 beats" structure on synthetic phrase fixtures.
   - Test that BAD-D's phrase layer proposes cue windows on 32-beat boundaries.
   - Then test that it **refuses** on odd-bar fixtures.
3. **COMPAT-001** — a compatibility filter (BPM ratio including octave hypotheses, Camelot distance, energy step) as a pure function with test vectors.
   - Measured on: (a) synthetic pairs; (b) transitions in a public DJ-mix dataset (e.g. Kim et al.'s mix-to-track alignment data) to see how often real DJ choices violate "compatibility". **Violations reveal strategy.**

**Phase 2: single human, controlled**

4. **INTENT-001** — the DJ labels intent states on their own past sets (BAD-D history).
   - Measure inter-session consistency and which grid signals co-occur with each label.
   - Evidence class: P/C. Gate: a state is kept in the vocabulary only if it is used consistently.
5. **TEASE-001** — Pass 03 E3 (drop delay × build-up predictability) with listeners.

**Phase 3: live feedback (human-gated: venue, consent, privacy)**

6. **FLOOR-001** — phone-accelerometer or video quantity-of-motion during real sets, with BAD-D logging intent and grid state.
   - Evidence class: D.
   - Purpose: calibrate L11 hypotheses per context. **Never** back-label tracks as globally "good".

**Promotion gate (for any decision feature)**
- Only craft-layer features may ever auto-execute.
- Tactics and strategy features stay suggestions unless D-class evidence from comparable contexts shows benefit.
- Production use requires the explicit adapter/contract described in `CLAUDE_NOW.md`.

---

## G. Limitations
- The Kim et al. 2020 statistics come from 1001Tracklists mixes. Those are dominated by EDM / house / techno at around 127 BPM, so the constraints may not hold in hip-hop, open-format or live-band contexts.
- The intent-state vocabulary is a synthesis. It is **not** derived from a DJ cognition study. Ethnographic sources (e.g. Butler 2006) describe practice qualitatively, and no large-scale study validating a state vocabulary was found.
- Product-feature descriptions (rekordbox, Mixed In Key) come from vendor documentation and guides, not independent evaluation.
- Crowd-feedback evidence is from small or specific settings (n = 46 disco club; one concert for VLF bass).

---

## H. Sources

**Analyses of real DJ mixes**
- Kim, Choi, Sacks, Yang, Nam, "A Computational Analysis of Real-World DJ Mixes using Mix-To-Track Subsequence Alignment", ISMIR 2020: https://archives.ismir.net/ismir2020/paper/000352.pdf. The tempo, key, transition-length and cue-agreement statistics in this report are read from §6 and Figs. 4–7 of the PDF.
- Kell & Tzanetakis, "Empirical Analysis of Track Selection and Ordering in Electronic Dance Music using Audio Feature Extraction", ISMIR 2013: https://archives.ismir.net/ismir2013/paper/000210.pdf

**Automatic DJ systems and detectors**
- Vande Veire & De Bie, "From raw audio to a seamless mix: creating an automated DJ system for Drum and Bass", *EURASIP J. Audio, Speech, and Music Processing*, 2018. Code: https://github.com/lenvdv/dnb-autodj-3
- Zehren, Alunno, Bientinesi, "Automatic Detection of Cue Points for the Emulation of DJ Mixing", *Computer Music Journal* 46(3), 67–82, 2022: http://www.diva-portal.org/smash/get/diva2:1811100/FULLTEXT02.pdf
- Yadati, Larson, Liem, Hanjalic, "Detecting Drops in Electronic Dance Music: Content-Based Approaches to a Socially Significant Music Event", ISMIR 2014: https://archives.ismir.net/ismir2014/paper/000297.pdf

**Interactive and audience systems**
- Feldmeier & Paradiso, "An Interactive Music Environment for Large Groups with Giveaway Wireless Motion Sensors", *Computer Music Journal* 31(1), 50–67, 2007.

**Vendor documentation**
- rekordbox phrase analysis (PHRASE EDIT operation guide): https://cdn.rekordbox.com/files/20200312172204/rekordbox5.1.0_Phrase_Edit_operation_guide_EN.pdf
- Mixed In Key, Camelot wheel / harmonic mixing: https://mixedinkey.com/harmonic-mixing-guide/ · https://mixedinkey.com/workflows/change-energy-with-camelot-wheel/

**Crowd and response evidence**
- Ellamil et al., *PLoS ONE* 2016: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0164783
- Cameron et al., *Current Biology* 2022: https://digitalcommons.unomaha.edu/biomechanicsarticles/399/
- Swarbrick et al., *Front. Psychol.* 2019: https://doi.org/10.3389/fpsyg.2018.02682
- Solberg & Jensenius 2017; Solberg & Dibben 2019. See [03_HUMAN_RESPONSE_REPORT.md](03_HUMAN_RESPONSE_REPORT.md).
- Cheung et al., *Current Biology* 2019: https://www.cell.com/current-biology/fulltext/S0960-9822(19)31258-8

**Ethnography and practice**
- Butler, *Unlocking the Groove: Rhythm, Meter, and Musical Design in Electronic Dance Music*, Indiana University Press, 2006.
