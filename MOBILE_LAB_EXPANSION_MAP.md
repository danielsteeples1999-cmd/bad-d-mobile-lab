# MOBILE LAB EXPANSION MAP — NEW RESEARCH FOLDERS

This document deliberately expands the lab beyond the existing executive brain, maturity stages, performance backlog, and research notes.

These are NEW search spaces, not a repetition of existing priorities.

The folders are ideas, not mandatory features. Claude should create them when evidence shows they are useful, and combine, split, rename, or discard them when a better structure emerges.

Rule: prefer a small experimental artifact over a giant speculative subsystem.

---

## 01 — DETERMINISTIC REPLAY LAB

Purpose:
Make a previous run reproducible enough to investigate differences.

Explore:
- serialized operation inputs
- random-seed capture
- browser capability snapshot
- analysis configuration snapshot
- event ordering
- checkpoint replay
- deterministic synthetic fixtures
- replay divergence markers
- “same input, different result” detection
- minimal replay packages

Questions:
- Can a failure be replayed without the original session?
- Which inputs are genuinely nondeterministic?
- Can nondeterminism be isolated instead of hidden?

---

## 02 — AUDIO CLOCK LAB

Investigate timing as a first-class engineering problem.

Explore:
- AudioContext clock versus wall clock
- performance.now() drift
- scheduling jitter
- buffer quantum behavior
- timer throttling
- playback clock drift
- analyser timing
- long-session synchronization
- crossfade timing error
- cumulative timing error

Build:
- clock comparison probes
- drift plots
- timing-error fixtures
- sample-to-time conversion tests

---

## 03 — SAMPLE-ACCURACY LAB

Study whether operations that appear musically equivalent are actually sample aligned.

Explore:
- frame boundaries
- fractional sample positions
- resampling boundaries
- fade endpoints
- loop points
- trim positions
- crossfade joins
- zero-crossing assumptions
- off-by-one-frame errors

Test with:
- impulses
- single-sample markers
- alternating polarity signals
- known phase relationships

---

## 04 — CROSSFADE MATHEMATICS LAB

Do not assume every fade sounds the same.

Compare:
- linear amplitude fades
- equal-power fades
- custom curves
- tempo-aware fades
- energy-aware fades
- spectral-aware fades
- vocal-protection curves
- silence-aware curves

Measure:
- level continuity
- perceived energy continuity
- clipping
- phase interaction
- low-frequency accumulation

---

## 05 — TEMPO-RAMP SAFETY LAB

Study gradual tempo changes without letting DJ behavior become absurd.

Explore:
- maximum acceleration
- maximum deceleration
- curve shapes
- beat-grid preservation
- phrase-boundary restrictions
- transient distortion
- pitch consequences
- confidence-aware limits
- fallback to no tempo change

Every experiment should include a clearly defined safe envelope.

---

## 06 — KEY-TRANSITION GEOMETRY LAB

Investigate musical compatibility without reducing it to a single label.

Explore:
- key distance
- mode changes
- confidence-weighted compatibility
- ambiguous keys
- low-confidence suppression
- transition direction
- phrase context
- energy interaction
- instrumentation interaction

Test:
- known compatible pairs
- deliberately incompatible pairs
- ambiguous cases
- “unknown key” cases

---

## 07 — LOUDNESS & DYNAMICS LAB

Separate loudness from musical energy.

Explore:
- integrated loudness
- short-term loudness
- momentary loudness
- crest factor
- dynamic range proxies
- peak versus true-peak behavior
- loudness changes across transitions
- quiet-intro/huge-drop structures

Goal:
prevent “louder = better” from contaminating analysis.

---

## 08 — PHASE & CHANNEL LAB

Investigate stereo behavior that ordinary level meters miss.

Explore:
- channel correlation
- phase inversion
- mono compatibility
- stereo width
- center energy
- side energy
- polarity mistakes
- bass cancellation
- widened vocal cancellation

Create synthetic pathological fixtures.

---

## 09 — CODEC / CONTAINER LAB

Build an input-compatibility matrix.

Investigate:
- WAV variants
- MP3 edge cases
- AAC variants
- M4A containers
- FLAC
- OGG/Opus where supported
- unusual sample rates
- unusual channel counts
- malformed headers
- truncated files
- metadata-only files
- zero-duration files

Record:
- browser support
- decode behavior
- error mode
- recovery behavior
- memory footprint

---

## 10 — METADATA CHAOS LAB

Attack assumptions in filenames and metadata.

Test:
- missing metadata
- contradictory metadata
- duplicate tags
- absurd BPM
- impossible duration
- Unicode filenames
- emoji filenames
- RTL text
- extremely long names
- punctuation-heavy names
- same title/different audio
- different title/same audio
- album art with extreme dimensions

The system should trust measured audio appropriately rather than blindly trusting labels.

---

## 11 — INGESTION FORENSICS LAB

Study everything that can happen between selecting a file and producing a stable internal track identity.

Explore:
- partial reads
- repeated selection
- duplicate selection
- cancelled selection
- permission denial
- file replacement during processing
- changing file handles
- stale object URLs
- revoked object URLs
- interrupted decode
- storage failure during import

Produce an ingestion state machine.

---

## 12 — IDENTITY COLLISION LAB

Challenge track identity.

Explore:
- identical audio under different names
- different audio with identical metadata
- near-identical edits
- re-encoded copies
- trimmed copies
- live versus studio versions
- alternate masters
- mono/stereo derivatives

Goal:
separate file identity, audio identity, and human-facing identity.

---

## 13 — FINGERPRINT ROBUSTNESS LAB

Test whether fingerprints survive normal transformations.

Transform fixtures with:
- gain change
- normalization
- codec conversion
- sample-rate conversion
- trimming
- silence added
- fade added
- channel conversion
- mild EQ
- tempo change
- pitch shift where appropriate

Measure false matches and missed matches.

---

## 14 — NUMERICAL STABILITY LAB

Investigate calculations that behave differently at extreme values.

Test:
- very quiet signals
- very loud signals
- near-zero values
- long accumulations
- floating-point rounding
- NaN propagation
- Infinity propagation
- empty arrays
- one-sample inputs
- huge dynamic ranges

Rules:
- NaN must not silently become a believable measurement.
- Invalid numerical states must be visible and safely handled.

---

## 15 — ALLOCATION TOPOLOGY LAB

Instead of only asking “how much RAM?”, investigate WHERE allocation occurs.

Track:
- allocation bursts
- repeated temporary allocations
- retained references
- array resizing
- copied buffers
- duplicated decoded audio
- duplicated waveform data
- cache retention
- closure retention
- event-listener retention

Build small probes that isolate each allocation pattern.

---

## 16 — EVENT-STORM LAB

Investigate UI and application behavior under excessive event frequency.

Test:
- rapid touch
- repeated play/stop
- repeated upload
- rapid mode changes
- repeated seek
- orientation changes
- resize storms
- visibility changes
- multiple queued commands

Measure:
- event queue growth
- duplicate work
- stale state
- UI starvation
- audio interference

---

## 17 — GESTURE SEMANTICS LAB

Mobile controls can fail even when the underlying code works.

Explore:
- accidental double taps
- long press
- swipe conflicts
- scroll versus drag
- touch target size
- gesture cancellation
- interrupted gestures
- one-handed reach
- landscape/portrait changes
- touch feedback latency

Use real interaction traces rather than assumptions.

---

## 18 — ACCESSIBILITY ENGINEERING LAB

Go beyond visual accessibility.

Investigate:
- screen-reader semantics
- focus order
- dynamic status announcements
- reduced motion
- large text
- contrast
- touch target sizing
- keyboard fallback where relevant
- non-color state indicators
- error-message clarity

Test critical workflows from a zero-visual-information perspective.

---

## 19 — LOCALIZATION STRESS LAB

Even if localization is not currently planned, discover hidden assumptions.

Test:
- long translated labels
- right-to-left layouts
- decimal separators
- time formats
- number formatting
- pluralization
- unusual Unicode normalization
- mixed-script filenames
- locale-dependent parsing

Find places where UI width or parsing secretly depends on English.

---

## 20 — POWER / THERMAL BEHAVIOR LAB

Study work per useful result rather than only elapsed speed.

Explore:
- CPU bursts versus sustained work
- repeated wakeups
- background throttling
- charging versus battery conditions
- thermal slowdown
- screen-on/off behavior
- heavy analysis during playback
- expensive visualizers

Potential metric:
useful evidence produced per unit of device stress.

---

## 21 — BROWSER LIFECYCLE LAB

Map behavior across:
- visible
- hidden
- frozen
- discarded
- restored
- navigation
- reload
- browser restart

Determine what state is safe to persist and what state must be reconstructed.

---

## 22 — WEBVIEW / EMBEDDED-BROWSER LAB

Do not assume Android WebView behaves exactly like desktop Chrome.

Compare where possible:
- API availability
- memory limits
- audio behavior
- storage behavior
- lifecycle events
- file input behavior
- worker behavior
- autoplay restrictions

Keep browser identity in evidence.

---

## 23 — PWA / INSTALLABILITY LAB

If BAD-D ever behaves like an installed mobile application, investigate:

- manifest correctness
- launch behavior
- display modes
- standalone lifecycle
- icon loading
- offline shell behavior
- update behavior
- stale service-worker assets
- cache invalidation
- recovery after an interrupted update

Do not add a service worker casually; prove its value first.

---

## 24 — STORAGE TRANSACTION LAB

Study storage as a failure-prone subsystem.

Test:
- quota exhaustion
- partial writes
- transaction abort
- concurrent writes
- stale records
- schema changes
- migration failure
- corrupted serialized values
- version upgrades
- cleanup races

A failed storage operation must not masquerade as successful evidence.

---

## 25 — SCHEMA EVOLUTION LAB

Design for changing evidence structures without destroying old evidence.

Explore:
- schema versions
- migration functions
- backward reading
- forward incompatibility
- unknown fields
- optional fields
- migration dry-runs
- rollback
- fixture migration tests

Never silently rewrite historical evidence.

---

## 26 — CONFIGURATION PROVENANCE LAB

Record exactly which configuration produced a result.

Track:
- analysis settings
- user settings
- experimental flags
- fallback paths
- browser capability decisions
- algorithm identifiers
- data-source identifiers

Goal:
make two apparently identical runs explainable when they differ.

---

## 27 — UNCERTAINTY PROPAGATION LAB

Study how uncertainty travels through the pipeline.

Example:
low-confidence BPM → weak beat grid → weak phrase boundary → reduced transition confidence.

Do not convert uncertainty into false certainty.

Build explicit confidence propagation experiments.

---

## 28 — CALIBRATION LAB

A confidence value should mean something.

Test whether:
- 0.9 confidence cases are actually more reliable than 0.6 cases
- confidence varies by genre
- confidence varies by recording quality
- confidence collapses on edge cases
- thresholds need calibration

Use held-out fixtures.

---

## 29 — DRIFT DETECTION LAB

Watch for changes caused by:
- browser updates
- operating-system updates
- library changes
- algorithm changes
- hardware changes
- data-source changes

Build a lightweight regression signature rather than relying only on version numbers.

---

## 30 — DIFFERENTIAL BROWSER LAB

Run the same fixture through different browser engines/versions when available.

Compare:
- decode result
- timing
- memory
- audio output behavior
- storage
- worker behavior
- API support

Differences become evidence, not assumptions.

---

## 31 — GOLDEN FIXTURE FACTORY

Create a curated set of tiny audio fixtures where the expected behavior is known.

Include:
- impulse
- silence
- sine
- chirp
- click
- stereo inversion
- mono signal
- phase-shifted signal
- tempo-controlled rhythm
- known loudness
- known clipping
- synthetic vocal-like spectrum
- synthetic bass-heavy material

Keep fixtures tiny enough to run repeatedly.

---

## 32 — METAMORPHIC TEST LAB

When exact answers are hard to know, test relationships that must remain true.

Examples:
- gain change should not radically change tempo
- filename change should not change audio identity
- silence appended to a track should not change the core key
- stereo-to-mono conversion may change phase metrics but should not invent a new filename identity
- re-running unchanged input should not randomly alter stable evidence without explanation

This creates test oracles where exact ground truth is difficult.

---

## 33 — ORACLE DESIGN LAB

For each detector, explicitly ask:

“What would prove this detector wrong?”

Build:
- positive fixtures
- negative fixtures
- ambiguous fixtures
- adversarial fixtures
- unknown fixtures

Unknown must be a valid output.

---

## 34 — ADVERSARIAL AUDIO LAB

Deliberately construct recordings designed to fool analysis.

Examples:
- strong kick at misleading tempo
- half-time/double-time ambiguity
- sustained drone mistaken for tonal center
- vocals with heavy effects
- percussion that resembles melodic content
- silence-heavy intros
- abrupt genre changes
- fake drops
- distorted masters
- extreme stereo widening

The goal is to discover blind spots before users do.

---

## 35 — UNKNOWN-STATE LAB

Make “I don't know” a designed system state.

Explore:
- unknown BPM
- uncertain key
- ambiguous style
- unavailable browser capability
- incomplete evidence
- failed decode
- interrupted analysis

Study how the UI behaves when knowledge is incomplete.

---

## 36 — EXPLANATION TRACE LAB

Instead of only displaying a result, prototype a compact explanation trail.

Example:
“Transition confidence reduced because BPM confidence is low and phrase boundary evidence is incomplete.”

The explanation must be traceable to actual evidence.

---

## 37 — USER-OVERRIDE BOUNDARY LAB

Map which decisions automation may make and which require explicit user intent.

Examples:
- safe performance settings → automatic
- creative style direction → user-controlled
- evidence interpretation → transparent
- irreversible deletion → explicit
- production promotion → explicit

Turn vague authority into testable boundaries.

---

## 38 — PERMISSION FAILURE LAB

Simulate users saying no.

Test:
- storage permission denied
- file access denied
- microphone permission denied if ever relevant
- notification permission denied
- browser capability absent

The app should degrade honestly instead of becoming mysteriously broken.

---

## 39 — OFFLINE-FIRST DEGRADATION LAB

Map exactly what remains useful without network access.

Explore:
- cached app shell
- local analysis
- local evidence
- local recovery
- unavailable remote features
- later synchronization

Network loss should produce an understandable state, not silent corruption.

---

## 40 — NETWORK FAILURE INJECTION LAB

When network-dependent features exist, test:
- no connection
- slow connection
- intermittent connection
- timeout
- server error
- partial response
- malformed response
- duplicate response
- response arriving after cancellation

No late response should overwrite newer state.

---

## 41 — RACE-CONDITION LAB

Actively hunt timing-dependent bugs.

Vary:
- operation completion order
- user interaction timing
- upload completion timing
- storage completion timing
- worker completion timing
- cancellation timing
- recovery timing

Use artificial delays to force rare orderings.

---

## 42 — CANCELLATION SEMANTICS LAB

Cancellation is not the same as failure.

Define and test:
- requested cancellation
- forced cancellation
- superseded operation
- browser interruption
- internal abort
- completed-before-cancel
- cancellation during checkpoint

Every state should end in a known disposition.

---

## 43 — BACKPRESSURE LAB

Study what happens when producers generate work faster than consumers can process it.

Examples:
- upload faster than decode
- decode faster than analysis
- analysis faster than persistence
- UI events faster than state updates

Build queue-pressure experiments.

---

## 44 — PRIORITY-INVERSION LAB

Investigate whether low-value work can block high-value work.

Examples:
- visualization blocking audio
- metadata parsing blocking playback
- deep analysis blocking recovery
- optional research work blocking essential evidence

Define priority classes and test them.

---

## 45 — FAIRNESS LAB

When multiple tracks compete for resources, investigate starvation.

Test:
- one huge track plus many small tracks
- many equal tracks
- repeated retries
- failed tracks
- cached tracks
- new uploads during an existing scan

Explore scheduling policies that remain responsive without destroying throughput.

---

## 46 — QUEUE-STATE VISUALIZATION LAB

Make hidden work understandable.

Prototype:
- waiting
- active
- paused
- cooling
- retrying
- completed
- failed
- skipped
- recovered

The visualization should reflect real state, not decorative animation.

---

## 47 — DATA-LINEAGE LAB

Trace every displayed conclusion back to its source.

Potential chain:

SOURCE FILE
→ INGESTION
→ NORMALIZATION
→ ANALYSIS
→ DERIVED EVIDENCE
→ INTERPRETATION
→ USER DISPLAY
→ DJ DECISION

Use this to detect stale or orphaned values.

---

## 48 — STALE-DATA LAB

Deliberately create:
- old analysis with new audio
- new analysis with old metadata
- old checkpoint with new configuration
- cached result after algorithm change
- UI state after underlying record deletion

Verify stale information cannot silently masquerade as current.

---

## 49 — CACHE-INVALIDATION LAB

For every cache ask:

“What exact event makes this cache invalid?”

Test invalidation on:
- source change
- algorithm change
- schema change
- configuration change
- browser capability change
- user setting change

Prefer explicit cache identity over guesswork.

---

## 50 — PRIVACY-MINIMIZATION LAB

Inventory data that never needs to leave the device.

Explore:
- local-only diagnostics
- local audio processing
- redacted error reports
- opt-in export
- data minimization
- sensitive filename handling
- metadata scrubbing

Privacy should be an architectural property, not only a policy sentence.

---

## 51 — SECURITY BOUNDARY LAB

Within safe defensive scope, inspect:
- unsafe HTML insertion
- untrusted filenames
- malformed metadata
- prototype pollution risks
- storage poisoning
- cross-context messaging
- unexpected URL handling
- imported content boundaries

Do not add risky capabilities merely to test them.

---

## 52 — DEPENDENCY RESILIENCE LAB

Track what happens when an external dependency disappears or changes.

Explore:
- browser API removal
- CDN failure if any
- library API change
- unavailable model
- unsupported codec
- missing optional module

Every optional dependency needs an honest failure mode.

---

## 53 — BUILD REPRODUCIBILITY LAB

Make experimental builds explainable.

Record:
- source revision
- generated artifacts
- toolchain assumptions
- configuration
- feature flags
- fixture version
- browser/device context

Goal:
another agent can reconstruct what was tested.

---

## 54 — ARTIFACT REGISTRY LAB

Give experiments stable names.

For each artifact:
- experiment ID
- purpose
- source commit
- input fixtures
- expected behavior
- actual behavior
- evidence location
- disposition

This prevents useful prototypes becoming anonymous junk.

---

## 55 — EXPERIMENT GRAPH LAB

Instead of a flat list of experiments, model relationships:

HYPOTHESIS
→ EXPERIMENT
→ RESULT
→ NEW HYPOTHESIS

Also record:
- contradicted by
- depends on
- supersedes
- reproduced by
- invalidated by

This becomes a map of the project's actual knowledge.

---

## 56 — DECISION REVERSIBILITY LAB

Before making a structural decision, classify:

- reversible cheaply
- reversible with migration
- reversible with data conversion
- difficult to reverse
- effectively irreversible

Prefer cheap-to-reverse decisions while evidence is weak.

---

## 57 — MINIMUM-VIABLE-COMPLEXITY LAB

For every proposed subsystem, build the smallest version that can answer the question.

If a 100-line probe answers the question, do not build a framework.

If the probe proves the mechanism, then decide whether architecture is justified.

---

## 58 — DEAD-WORK DETECTOR LAB

Identify work that consumes resources without increasing useful knowledge.

Examples:
- repeated scans with no changed inputs
- redundant visualization updates
- duplicate evidence serialization
- abandoned retries
- stale cache refreshes
- tests whose results are never recorded

Measure waste before removing it.

---

## 59 — HUMAN-OBSERVATION CAPTURE LAB

Create structured ways for the user to record what automation cannot know.

Potential observations:
- sounds better/worse
- transition feels late
- groove feels wrong
- vocal feels buried
- bass feels weak
- style feels wrong
- weirdness is good/bad
- result is technically correct but musically useless

Keep human observation separate from machine measurement.

---

## 60 — PREFERENCE-LEARNING LAB

Explore whether repeated human choices can reveal stable preferences.

Use:
- pairwise comparisons
- A/B choices
- “keep/discard”
- intensity preference
- transition preference
- style-neighbour preference

Avoid pretending a small number of choices proves a permanent preference.

---

## 61 — CREATIVE COUNTEREXAMPLE LAB

When the system believes two styles are similar, actively search for a pair that sounds obviously different.

When it believes two tracks are incompatible, search for a human-plausible bridge.

This prevents the model from becoming trapped by its own categories.

---

## 62 — GENRE-BOUNDARY LAB

Study where genre identity changes rather than assuming fixed boxes.

Explore:
- stable core traits
- surface traits
- rhythmic traits
- instrumentation traits
- vocal traits
- production traits
- cultural/contextual metadata
- time-period effects

Model genre as evidence with boundaries and uncertainty.

---

## 63 — JOURNEY-ARC LAB

Analyze sets as trajectories rather than lists.

Explore:
- opening conditions
- energy slope
- valley placement
- peak spacing
- recovery sections
- tonal movement
- texture changes
- repetition fatigue
- ending behavior

Generate alternative journeys without automatically changing the user's set.

---

## 64 — TRANSITION-COUNTEREXAMPLE LAB

Build deliberately difficult pairs.

Examples:
- huge tempo mismatch
- key uncertainty
- extreme loudness difference
- sparse-to-dense
- vocal-to-vocal clash
- rhythmic incompatibility
- long ambient intro
- abrupt genre boundary

Use them to discover where the transition engine needs to say “no.”

---

## 65 — AUDIO-QUALITY REGRESSION LAB

Keep reference signals and reference tracks specifically for listening regressions.

Compare:
- frequency response
- clipping
- phase
- noise
- timing
- level
- transient preservation
- stereo image

A performance optimization should have an audio-quality regression check when relevant.

---

## 66 — PERCEPTUAL-VS-NUMERICAL LAB

Find cases where:
- metrics improve but listening gets worse
- metrics worsen but listening gets better
- both improve
- both worsen

These are valuable training cases for deciding which measurements actually matter.

---

## 67 — HUMAN-AI DISAGREEMENT LAB

Record disagreements rather than forcing consensus.

For each disagreement:
- machine result
- human result
- evidence available
- uncertainty
- eventual resolution if known

Repeated disagreement can reveal missing features or misleading metrics.

---

## 68 — FAILURE-TAXONOMY LAB

Create a reusable failure vocabulary.

Possible dimensions:
- correctness
- availability
- performance
- quality
- evidence
- recovery
- UX
- compatibility
- data integrity
- safety

One failure can belong to multiple dimensions.

---

## 69 — REGRESSION-CAUSE LAB

When a regression appears, classify its mechanism rather than only its symptom.

Examples:
- changed allocation lifetime
- altered scheduling
- stale cache
- changed fallback
- browser-specific behavior
- race
- schema mismatch
- numerical instability

Store causal hypotheses separately from confirmed causes.

---

## 70 — EXPERIMENT-COST ACCOUNTING LAB

Track the real cost of experimentation:

- CPU
- memory
- storage
- battery/thermal stress
- user attention
- test time
- repeated downloads
- manual cleanup
- evidence size

Prefer experiments with high information gained per unit cost.

---

## 71 — SEARCH-SPACE VISUALIZATION LAB

For tunable systems, visualize what has actually been explored.

Show:
- tested regions
- untested regions
- failed regions
- promising regions
- uncertainty
- boundaries

This helps prevent the optimizer from repeatedly rediscovering the same local optimum.

---

## 72 — LOCAL-OPTIMUM ESCAPE LAB

When a tuner repeatedly chooses similar results, deliberately perturb the search.

Methods:
- larger mutation
- alternate initialization
- temporary constraint removal
- reverse search direction
- random restart
- novelty pressure

Only retain changes that produce measurable value.

---

## 73 — NOVELTY DETECTION LAB

A candidate can be interesting because it is genuinely different, not because it has a slightly higher score.

Explore:
- distance from previous candidates
- structural novelty
- spectral novelty
- rhythmic novelty
- style novelty

Use novelty as a search signal, not as proof of quality.

---

## 74 — EXPLORATION / EXPLOITATION LAB

Separate:
- exploiting known good configurations
- exploring unknown regions

Investigate policies for deciding when to stop refining a known result and search somewhere new.

---

## 75 — STOP-CONDITION LAB

The system needs defensible reasons to stop searching.

Possible conditions:
- no meaningful improvement
- evidence saturation
- repeated candidate convergence
- uncertainty floor
- resource pressure
- diminishing information gain
- user cancellation
- safety boundary

A stop condition should be observable and explainable.

---

## 76 — INFORMATION-GAIN LAB

Ask:
“What experiment would teach us the most?”

Prioritize experiments that discriminate between competing hypotheses.

This can outperform simply fixing the most visible symptom.

---

## 77 — FALSE-CONFIDENCE LAB

Construct cases where the system is tempted to sound certain.

Examples:
- clean metadata but poor audio evidence
- high detector confidence on an adversarial fixture
- cached old result
- partial scan
- browser capability incorrectly assumed

Test whether uncertainty survives to the UI and downstream decisions.

---

## 78 — HUMAN-INTENT AMBIGUITY LAB

Study requests such as:
- “make it darker”
- “make it smoother”
- “make this transition work”
- “less aggressive”
- “more energy”

Translate ambiguous intent into candidate measurable dimensions without pretending the interpretation is certain.

---

## 79 — CONTROL-SURFACE LAB

Determine which controls deserve direct user exposure.

A control should earn its place by changing an important outcome in an understandable way.

Prototype:
- expert controls
- simplified controls
- progressive disclosure
- safe presets
- advanced override

---

## 80 — EXPERIMENTAL-GRAVEYARD

Do not delete every failed idea.

Store compact records of:
- what was attempted
- why it failed
- what was learned
- what future condition might revive it

The graveyard prevents circular rediscovery while keeping useful ideas recoverable.

---

# HOW CLAUDE SHOULD USE THIS MAP

Do not create all 80 folders just because they exist.

Instead:

1. Detect the current bottleneck.
2. Find the smallest relevant research space.
3. Create a tiny experiment.
4. Measure it.
5. Record what was learned.
6. Cross-link related experiments.
7. Look for a second method that could falsify the first result.
8. Keep useful tools.
9. Archive dead ends.
10. Move to the next highest-information question.

When a new problem does not fit these folders, invent a new folder.

When several folders are really the same mechanism, merge them.

The folder tree is not sacred.

The knowledge is.

# NEW EXPANSION PRINCIPLE

The lab should gradually become a map of:

WHAT WE KNOW
WHAT WE THINK
WHAT WE HAVE MEASURED
WHAT WE HAVE FAILED TO EXPLAIN
WHAT WE HAVE NOT TESTED
WHAT WE SHOULD TEST NEXT

The purpose of expansion is not to make GitHub look busy.

It is to make the next engineering decision smarter.
