# EXPERIMENT PRIORITY QUEUE

This is the active work queue for Claude.

## Priority model

Rank by:

**cross-goal impact × prevalence × information gain × reversibility ÷ experiment cost**

The queue is deliberately mechanism-first. Fixing a shared mechanism can solve many visible symptoms at once.

---

## P0 — MOBILE STABILITY CORE

### M-001 — Startup failure reproduction
Question: What exact sequence causes current mobile startup failure(s)?
Targets:
- undefined globals
- eager work
- unsupported APIs
- persisted-state failures
- race/order problems

Evidence:
- startup timeline
- failure point
- capability state
- recovery path

Success:
- deterministic reproduction or strong narrowing of cause.

### M-002 — Work scheduler / cooperative yielding
Question: Can heavy work be scheduled without blocking audio/UI?
Targets:
- bulk import
- scan
- scope processing
- analysis

Compare:
- monolithic loop
- chunked loop
- adaptive chunking
- cooldown/yield strategy

Measure:
- throughput
- long tasks
- responsiveness
- audio continuity
- memory

### M-003 — RAM lifetime experiment
Question: What objects/buffers remain alive after work that should have been released?
Targets:
- decoded audio
- scope buffers
- analyser data
- temporary arrays
- queue entries
- cached results

Success:
- identify retention mechanism or eliminate major uncertainty.

### M-004 — Persistent scope-buffer strategy
Question: Which scope representation gives acceptable visual fidelity at the lowest memory/lifetime cost?

Compare:
- full-resolution retention
- downsampled representation
- ring buffer
- compact typed representation
- recompute-on-demand

Do not optimize only for RAM; measure visual/audio behavior.

### M-005 — Adaptive governor
Question: Can workload adapt to file size, duration, cached work, observed runtime and memory pressure without starving audio/UI?

Test:
- concurrency
- chunk size
- cooldown
- yield cadence

---

## P1 — RECOVERY + AUDIO

### M-006 — Checkpoint/recovery interruption matrix
Interrupt:
- upload
- decode
- scan
- storage write
- background/foreground
- reload

Verify:
- no false completion
- deterministic resume
- stale/corrupt state handling.

### M-007 — Audio continuity under load
Run audio playback while background analysis/import runs.

Measure:
- glitches/dropouts
- latency
- long tasks
- CPU pressure
- memory pressure

### M-008 — Mobile capability matrix
Probe:
- Web MIDI
- getDisplayMedia
- folder APIs
- filesystem assumptions
- audio APIs
- storage APIs
- worker APIs

Turn unsupported capabilities into explicit capability states/fallbacks.

### M-009 — Device-local diagnostic package
Build compact exportable diagnostics:
- session
- capability
- operation
- recent events
- error
- memory indicators
- queue state
- checkpoint state
- recovery action

No cloud dependency required.

---

## P2 — TESTING DECK / EVIDENCE

### M-010 — Upload mirror isolation
Test whether imported test material can be mirrored into the lab without contaminating production/library state.

### M-011 — Admission/evidence gate reproduction
Verify state separation:
NOT TESTED / AUTO TESTED / HUMAN TESTED / HUMAN+AUTO VERIFIED.

### M-012 — Evidence journal integrity
Test interrupted writes, duplicate writes, stale checkpoints and provenance.

### M-013 — Human-vs-auto evidence enforcement
Attempt adversarial state promotion and confirm it fails closed.

---

## P3 — PERFORMANCE SYSTEM

### M-014 — Benchmark harness
One harness for:
- startup
- import
- scan
- scope
- playback
- recovery

Standardize machine-readable results.

### M-015 — Long-duration soak
Find leaks/drift that short tests miss.

### M-016 — Large-playlist stress
Test queue growth, cache pressure, storage and responsiveness.

### M-017 — Weak-device simulation
Simulate constrained CPU/memory where real devices are unavailable. Label simulation honestly.

### M-018 — Background lifecycle matrix
Test hidden/background/frozen/discarded/reloaded states.

---

## P4 — MUSIC INTELLIGENCE

Only begin after the mobile stability core has enough evidence to support reliable experiments.

### M-019 — Component-level music evidence
Keep BPM, beat, key, mode, phrase, energy, spectral and confidence evidence separate.

### M-020 — Transition counterexamples
Build deliberately difficult transitions to discover failure boundaries.

### M-021 — Journey simulation
Model set energy, valleys, peaks, tonal movement and repetition.

### M-022 — Controlled genre bleed
Experiment with genre adjacency and deliberate cross-genre movement.

### M-023 — Perceptual-vs-numerical disagreement
Find cases where scores improve but listening worsens.

### M-024 — Human-AI disagreement ledger
Record disagreements as training/research evidence rather than forcing consensus.

### M-025 — Personal ear preference vector
Experimental musical preference calibration, not medical assessment.

---

## P5 — FUTURE / ARCHITECTURE

### M-026 — Adapter contract
Define the smallest stable interface for a lab tool to become a BAD-D component later.

### M-027 — Old-code archaeology
Recover useful mechanisms from prior versions/branches without importing obsolete coupling.

### M-028 — Regression suite
Create golden + synthetic + real-world fixtures.

### M-029 — Failure injection framework
Standardize crash, storage, timing, lifecycle and corrupted-state tests.

### M-030 — Experiment search-space manager
Track explored/untested/promising/failed regions to prevent repeated local searches.

---

# QUEUE RULES

1. Do not work top-to-bottom blindly.
2. If a lower item has much higher information gain and shares the same harness, pull it forward.
3. If an experiment can answer several P0/P1 questions simultaneously, prioritize it.
4. Never sacrifice audio integrity to improve a benchmark number.
5. Never claim verified without the required evidence.
6. Never repeatedly inspect documents that do not affect the current experiment.
7. After each experiment, update this queue with:
   - status
   - evidence level
   - next question
   - dependencies
8. If blocked, build a smaller reproduction instead of writing a long explanation.
9. Do not create folders or features merely to make the repository look complete.
10. The queue is subordinate to measured evidence: if the data contradicts the ordering, reorder it and explain why.
