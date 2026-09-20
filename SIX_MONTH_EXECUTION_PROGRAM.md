# CLAUDE MOBILE LAB — SIX-MONTH EXECUTION PROGRAM

## Purpose

This is the long-horizon program for the isolated mobile laboratory.

You are not expected to complete every item mechanically. Use the program as a six-month search space. Reorder work when evidence says a different path is more valuable.

The single command is:

> RUN THE SIX-MONTH MOBILE LAB PROGRAM. START WITH THE HIGHEST-VALUE REVERSIBLE EXPERIMENT, MEASURE IT, RECORD IT, AND KEEP MOVING UNTIL STOPPED.

Never modify the production BAD-D source of truth from this repository.

---

# MONTH 1 — MAKE THE LAB SCIENTIFIC

## Goal

Turn the mobile build into something that can reproduce, measure, break, recover, and explain problems.

## Week 1 — Establish the baseline

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

## Week 2 — Startup war room

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

Create startup probes that fail loudly and safely.

Target:

APP OPENS → UI BECOMES USABLE → OPTIONAL WORK STARTS

not

LOAD EVERYTHING → HOPE IT WORKS → SHOW ERROR.

## Week 3 — RAM and lifetime

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

Test 1 track, 5 tracks, 20 tracks, large files, repeated scans, and interrupted scans.

## Week 4 — Audio protection

Measure:

- playback interruption
- audio dropout
- scheduling jitter where observable
- latency
- analyser overhead
- simultaneous analysis + playback
- long scan + playback
- memory pressure + playback

Create a regression test that makes it impossible to call a RAM improvement successful if audio becomes worse.

## Month 1 exit criteria

Have:

1. Baseline report.
2. Experiment ledger.
3. Startup diagnostics.
4. Memory diagnostics.
5. Audio stability diagnostics.
6. Browser capability matrix.
7. At least 10 documented experiments.
8. At least 3 deliberately failed experiments.
9. Reproducible test procedures.

---

# MONTH 2 — BUILD THE MOBILE GOVERNOR

## Goal

Make heavy work adapt to the device instead of treating every phone as a desktop.

## Week 5 — Workload model

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

## Week 6 — Concurrency experiments

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

## Week 7 — Cooperative scheduling

Test:

- chunked work
- yielding
- requestAnimationFrame scheduling where appropriate
- idle opportunities where appropriate
- worker-based analysis where useful
- avoiding giant synchronous loops

The goal is not merely faster completion.

The goal is:

FAST ENOUGH + RESPONSIVE + AUDIO SAFE.

## Week 8 — Cooling and recovery

Build a state model such as:

READY
→ RUNNING
→ COOLING
→ RESUMING
→ COMPLETE

Test automatic slowdown after pressure.

Do not allow cooling logic to silently discard evidence.

## Month 2 exit criteria

Have:

- adaptive workload model
- benchmark matrix
- concurrency comparison
- scheduling comparison
- cooling model
- measurable reason for each governor decision
- rollback switch for experimental governors

---

# MONTH 3 — MAKE INTERRUPTION BORING

## Goal

Assume the browser will kill, suspend, reload, background, or interrupt the app.

## Week 9 — Checkpoint architecture

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

## Week 10 — Recovery testing

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
- recovery time
- repeated work
- lost evidence
- incorrect state
- user confusion

## Week 11 — Corruption and duplication

Test:

- stale checkpoint
- duplicate checkpoint
- partially written checkpoint
- malformed checkpoint
- conflicting sessions
- same track imported twice
- interrupted migration

Recovery must choose the last trustworthy state, not simply the newest state.

## Week 12 — Device-local diagnostics

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

## Month 3 exit criteria

A user should be able to lose the page during a long operation without turning the entire test run into a disaster.

---

# MONTH 4 — TESTING DECK AS AN EVIDENCE ENGINE

## Goal

Turn the Testing Deck into a trustworthy experimental laboratory.

## Week 13 — Admission

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

## Week 14 — Evidence contract

Every test result should be traceable to:

- input
- configuration
- algorithm
- timestamp
- device/browser
- result
- uncertainty
- failure state

## Week 15 — Component evidence

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

## Week 16 — Human evidence boundary

Maintain:

NOT TESTED
AUTO TESTED
HUMAN TESTED
HUMAN + AUTO VERIFIED

Automation cannot create human evidence.

## Month 4 exit criteria

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

# MONTH 5 — CREATIVE INTELLIGENCE LAB

## Goal

Use the mobile lab to explore better music intelligence without contaminating measured evidence.

## Week 17 — Style representation

Separate:

- genre identity
- flavor
- blend
- tone
- role safety
- human weirdness
- journey context

Do not collapse them into one genre label.

## Week 18 — Controlled genre bleeding

Build candidate experiments:

- country → industrial
- folk → dark trap
- metal → mechanical hip-hop
- acoustic → electronic
- gothic → country
- orchestral → street percussion
- precise rhythm → deliberately wrong texture

Test whether the transformation is:

- recognizable
- useful
- controllable
- reversible
- musically coherent

## Week 19 — Search engines for weird ideas

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

## Week 20 — Human preference

Prototype preference capture for:

- sub weight
- low-mid warmth
- vocal presence
- brightness
- harshness
- punch
- dynamic density

Treat preference as musical taste, not medical measurement.

## Month 5 exit criteria

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

# MONTH 6 — INTEGRATION, SOAK TESTING, AND FUTURE ARCHITECTURE

## Goal

Find what survives reality.

## Week 21 — Long-duration tests

Run:

- 30-minute
- 1-hour
- multi-hour

tests where practical.

Watch for:

- memory drift
- growing queues
- accumulating listeners
- stale buffers
- performance degradation
- audio degradation
- storage growth
- checkpoint growth

## Week 22 — Large playlist tests

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

## Week 23 — Adversarial mobile tests

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

## Week 24 — Architecture decision month

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
- next six-month research queue

## Month 6 exit criteria

The lab should know substantially more than it did six months earlier.

The most valuable output may be a fix, a benchmark, a rejected architecture, a safer fallback, or a discovery that changes the roadmap.

---

# CONTINUOUS RULES — ALL SIX MONTHS

1. Never silently modify production.
2. Never silently change version identity.
3. Never fabricate evidence.
4. Never convert estimates into facts.
5. Never treat human testing as automated testing.
6. Never sacrifice audio quality for a benchmark win.
7. Never hide failure to make the UI look successful.
8. Never let one bad track kill the whole playlist.
9. Never require the human to choose a reversible implementation detail when the lab can test it.
10. Never keep complexity without evidence that it earns its cost.
11. Always record what failed.
12. Always record what changed.
13. Always record the next question.
14. When uncertain about DJ safety, fail closed.
15. When an experiment is cheap and reversible, run it.
16. When an experiment is expensive, first design a cheaper falsification test.
17. When a result looks too good, try to break it.
18. When a result looks bad, determine whether the mechanism or measurement is wrong.
19. Prefer component evidence over opaque scores.
20. Preserve provenance.

# MONTHLY DELIVERABLE FORMAT

At the end of each month produce:

## Executive Summary
What changed?

## Evidence
What measurements changed?

## Failures
What did not work?

## Regressions
What became worse?

## Surprises
What was not expected?

## Reusable Tools
What diagnostic/benchmark/prototype should survive?

## Decisions
KEEP / REVERT / DEFER / INVESTIGATE

## Next Month
Top 10 experiments, ranked by expected information gain and reversibility.

# IMPORTANT

This is a research program, not a promise that every feature will be implemented.

The lab exists to make BAD-D smarter about what is actually worth building.
