# CLAUDE MOBILE LAB — EXECUTION PROGRAM

## Purpose

This is a long-horizon research program, NOT a schedule.

There are no deadlines, monthly time targets, weekly targets, hour targets, completion promises, or expectations that a particular amount of work must be completed within a particular period.

The six sections are **maturity stages**. Move forward when the evidence and foundations justify it. Stay on a stage when deeper testing is valuable. Revisit earlier stages whenever new evidence exposes a problem.

The single command is:

> RUN THE MOBILE LAB PROGRAM. START WITH THE HIGHEST-VALUE REVERSIBLE EXPERIMENT, MEASURE IT, RECORD IT, AND CONTINUE UNTIL STOPPED.

Never modify the production BAD-D source of truth from this repository.

---

# STAGE 1 — MAKE THE LAB SCIENTIFIC

## Goal

Turn the mobile build into something that can reproduce, measure, break, recover, and explain problems.

### Establish the baseline

Build:

- startup benchmark
- first-interactive benchmark
- upload/decode benchmark
- scan benchmark
- memory observation
- long-task observation
- audio-playback stability probe
- browser/API capability report
- session ID and experiment ID
- machine-readable experiment ledger

Record:

- device/browser
- screen dimensions
- available APIs
- track/file characteristics
- elapsed time
- memory indicators when available
- failures
- recovery state

### Startup war room

Find every startup failure mode:

- undefined globals
- initialization ordering
- race conditions
- stale persisted state
- IndexedDB errors
- localStorage corruption
- desktop-only API references
- eager expensive work
- unavailable browser APIs
- malformed recovery state

Target:

APP OPENS → UI BECOMES USABLE → OPTIONAL WORK STARTS

not

LOAD EVERYTHING → HOPE IT WORKS → SHOW ERROR.

### RAM and lifetime

Create controlled experiments for:

- decoded audio lifetime
- AudioBuffer retention
- scope/waveform buffers
- analyser data
- temporary typed arrays
- result accumulation
- event listener retention
- DOM retention
- caches
- IndexedDB growth
- repeated upload/delete cycles
- repeated scans
- interrupted scans

Test across small, normal, large, repeated, and interrupted workloads.

### Audio protection

Measure:

- playback interruption
- audio dropout
- scheduling jitter where observable
- latency
- analyser overhead
- simultaneous analysis + playback
- long scan + playback
- memory pressure + playback

Create a regression test that prevents a RAM improvement being called successful if audio becomes worse.

### Stage 1 exit evidence

Advance when the lab has:

1. Baseline evidence.
2. Experiment ledger.
3. Startup diagnostics.
4. Memory diagnostics.
5. Audio stability diagnostics.
6. Browser capability information.
7. Reproducible test procedures.
8. Multiple documented experiments.
9. Documented failed experiments.

---

# STAGE 2 — BUILD THE MOBILE GOVERNOR

## Goal

Make heavy work adapt to the device instead of treating every phone as a desktop.

### Workload model

Create a workload estimate using observable inputs:

- file size
- duration
- cached state
- historical runtime
- current queue size
- recent failures
- recent memory pressure
- device capability

Do not pretend this is a perfect device benchmark.

It is a control signal.

### Concurrency experiments

Compare:

- serial
- fixed small concurrency
- adaptive concurrency
- burst then cooldown
- priority queue
- cheap-first / expensive-later

Measure:

- total completion time
- UI responsiveness
- memory peak
- audio stability
- failure rate

### Cooperative scheduling

Test:

- chunked work
- yielding
- requestAnimationFrame scheduling where appropriate
- idle opportunities where appropriate
- worker-based analysis where useful
- avoiding giant synchronous loops

The goal is:

FAST ENOUGH + RESPONSIVE + AUDIO SAFE.

### Cooling and recovery

Build a state model such as:

READY
→ RUNNING
→ COOLING
→ RESUMING
→ COMPLETE

Test automatic slowdown after pressure.

Do not allow cooling logic to silently discard evidence.

### Stage 2 exit evidence

Advance when the lab has:

- adaptive workload evidence
- concurrency comparisons
- scheduling comparisons
- cooling behavior
- measurable reasons for governor decisions
- rollback controls for experimental governors

---

# STAGE 3 — MAKE INTERRUPTION BORING

## Goal

Assume the browser will kill, suspend, reload, background, or interrupt the app.

### Checkpoint architecture

Define the minimum trustworthy checkpoint:

- session
- playlist identity
- track identity
- completed stages
- active stage
- configuration
- evidence
- timestamp
- schema/version
- integrity marker

Never call partial data complete.

### Recovery testing

Inject:

- reload
- tab close
- browser kill
- backgrounding
- low memory
- interrupted upload
- interrupted decode
- interrupted scan
- storage failure

Measure:

- detection
- recovery behavior
- repeated work
- lost evidence
- incorrect state
- user confusion

### Corruption and duplication

Test:

- stale checkpoint
- duplicate checkpoint
- partially written checkpoint
- malformed checkpoint
- conflicting sessions
- same track imported twice
- interrupted migration

Recovery must choose the last trustworthy state, not simply the newest state.

### Device-local diagnostics

Prototype an exportable diagnostic package containing:

- session ID
- timestamp
- device/browser capability summary
- operation
- recent events
- memory indicators
- queue state
- checkpoint state
- error
- stack where available
- recovery action
- experiment ID

Keep private user audio/data out unless explicitly necessary.

### Stage 3 exit evidence

A user should be able to lose the page during a long operation without turning the entire test run into a disaster.

---

# STAGE 4 — TESTING DECK AS AN EVIDENCE ENGINE

## Goal

Turn the Testing Deck into a trustworthy experimental laboratory.

### Admission

Define explicit states:

NOT ADMITTED
ADMITTED
RUNNING
PAUSED
INTERRUPTED
RECOVERING
COMPLETE
FAILED
REQUIRES HUMAN TEST

Do not infer state from UI appearance alone.

### Evidence contract

Every test result should be traceable to:

- input
- configuration
- algorithm
- timestamp
- device/browser
- result
- uncertainty
- failure state

### Component evidence

Test components separately:

- BPM
- beat stability
- downbeat
- key
- mode
- phrase boundaries
- energy
- spectral balance
- loudness/dynamics
- vocal likelihood
- instrumental likelihood
- transition compatibility
- clash risk
- style continuity
- genre bleed
- journey coherence

Never allow one attractive score to erase component evidence.

### Human evidence boundary

Maintain:

NOT TESTED
AUTO TESTED
HUMAN TESTED
HUMAN + AUTO VERIFIED

Automation cannot create human evidence.

### Stage 4 exit evidence

Testing Deck can explain:

WHAT WAS TESTED?
ON WHAT?
HOW?
WHEN?
WITH WHICH CONFIG?
WHAT HAPPENED?
HOW CERTAIN ARE WE?
WHAT FAILED?
WHAT STILL NEEDS A HUMAN?

---

# STAGE 5 — CREATIVE INTELLIGENCE LAB

## Goal

Explore better music intelligence without contaminating measured evidence.

### Style representation

Separate:

- genre identity
- flavor
- blend
- tone
- role safety
- human weirdness
- journey context

Do not collapse them into one genre label.

### Controlled genre bleeding

Build candidate experiments such as:

- country → industrial
- folk → dark trap
- metal → mechanical hip-hop
- acoustic → electronic
- gothic → country
- orchestral → street percussion
- precise rhythm → deliberately wrong texture

Test whether each transformation is:

- recognizable
- useful
- controllable
- reversible
- musically coherent

### Search engines for weird ideas

Implement disposable candidate generators using:

- mutation
- crossover
- inversion
- constraint
- removal
- exaggeration
- minimalism
- adversarial testing
- counterfactuals
- controlled randomness
- grid search
- evolutionary search
- uncertainty-driven search

### Human preference

Prototype preference capture for:

- sub weight
- low-mid warmth
- vocal presence
- brightness
- harshness
- punch
- dynamic density

Treat preference as musical taste, not medical measurement.

### Stage 5 exit evidence

Produce a catalogue of creative experiments with:

- candidate
- hypothesis
- evidence
- human observation
- failure mode
- useful effect
- production suitability

No candidate becomes production truth merely because it sounds interesting.

---

# STAGE 6 — INTEGRATION, SOAK TESTING, AND FUTURE ARCHITECTURE

## Goal

Find what survives reality.

### Long-duration testing

Run sufficiently long tests to expose:

- memory drift
- growing queues
- accumulating listeners
- stale buffers
- performance degradation
- audio degradation
- storage growth
- checkpoint growth

Do not use a fixed duration as proof of safety. Continue until the test has meaningful evidence for the question being investigated.

### Large-playlist testing

Test:

- tiny playlists
- normal playlists
- large playlists
- mixed durations
- mixed formats
- duplicate tracks
- problematic tracks
- missing evidence

Measure scaling rather than assuming linear behavior.

### Adversarial mobile tests

Deliberately combine:

- audio playback
- heavy analysis
- backgrounding
- low memory
- repeated imports
- rapid navigation
- interruption
- recovery
- malformed data

The objective is to discover failure combinations that normal testing misses.

### Architecture decisions

For every major subsystem classify:

KEEP
SIMPLIFY
REPLACE
DEFER
MOVE OFF MOBILE
EXPERIMENT FURTHER

Produce:

- benchmark summary
- winning mechanisms
- failed mechanisms
- known limitations
- production-ready recommendations
- rollback plans
- next research queue

### Stage 6 exit evidence

The lab should know substantially more than it did before entering this stage.

The most valuable output may be a fix, a benchmark, a rejected architecture, a safer fallback, or a discovery that changes the roadmap.

---

# CONTINUOUS RULES — ALL STAGES

1. There are no deadlines.
2. There are no quotas for hours, days, weeks, or months.
3. There is no requirement to finish a stage by a calendar date.
4. Do not rush an experiment to satisfy an artificial schedule.
5. Do not stretch work merely to fill a schedule.
6. Move forward when evidence justifies it.
7. Stay on a stage when deeper investigation has high value.
8. Revisit earlier stages whenever new evidence exposes a problem.
9. Never silently modify production.
10. Never silently change version identity.
11. Never fabricate evidence.
12. Never convert estimates into facts.
13. Never treat human testing as automated testing.
14. Never sacrifice audio quality for a benchmark win.
15. Never hide failure to make the UI look successful.
16. Never let one bad track kill the whole playlist.
17. Never require the human to choose a reversible implementation detail when the lab can test it.
18. Never keep complexity without evidence that it earns its cost.
19. Always record what failed.
20. Always record what changed.
21. Always record the next question.
22. When uncertain about DJ safety, fail closed.
23. When an experiment is cheap and reversible, run it.
24. When an experiment is expensive, first design a cheaper falsification test.
25. When a result looks too good, try to break it.
26. When a result looks bad, determine whether the mechanism or measurement is wrong.
27. Prefer component evidence over opaque scores.
28. Preserve provenance.

# SESSION DELIVERABLE

At the end of each meaningful work session produce:

## What changed
Concrete changes.

## Evidence
Measurements and observations.

## Failures
What did not work.

## Regressions
What became worse.

## Surprises
What was not expected.

## Reusable tools
Diagnostics, benchmarks, prototypes, or tests worth keeping.

## Decision
KEEP / REVERT / DEFER / INVESTIGATE

## Next experiments
The highest-value next experiments, selected by expected information gain, evidence quality, reversibility, and cost.

Do not rank work by calendar urgency.

# IMPORTANT

This is a research program, not a promise that every feature will be implemented.

The stages are a map of the search space, not a timetable.

The lab exists to make BAD-D smarter about what is actually worth building.
