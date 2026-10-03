# EXPERIMENT PRIORITY QUEUE — LIVE ONLY

> This file contains **current executable work only**.
> Keep it short. Historical tasks belong in git history or deep-reference documents.
> Claude should not read a long backlog at session start.

## Queue rule

Pick the first item that is **runnable and high-information**.

Priority is based on:

**cross-goal leverage × information gain × prevalence × reversibility ÷ cost**

Evidence can reorder the queue.

Never keep an item active merely because it is old.

## P0 — BUILD THE COMPOUNDING ENGINE

### 1. ENGINE-CYCLE-001 — Engineering Cycle Runner
Question: Can the lab execute one experiment through a repeatable machine-readable lifecycle?

Minimum lifecycle:

**load → preflight → validate fixture/prerequisites → run → collect evidence → validate result → record cycle → explicit decision**

Required:
- bounded execution budget
- deterministic result schema
- clear failure/blocked states
- compact output
- evidence record
- no production access
- reusable by the next experiment

Exit condition:
One real existing experiment can run through the cycle and leave a trustworthy result.

### 2. ENGINE-ATTACK-001 — Attack Harness
Question: Can the lab deliberately break an experiment instead of only proving the happy path?

Start with the cheapest useful attack classes:
- invalid input
- missing prerequisite
- interruption
- timeout
- resource pressure
- corrupted result/evidence

Exit condition:
At least one experiment is automatically attacked and the failure is recorded without corrupting the evidence store.

### 3. ENGINE-REGRESS-001 — Regression Comparator
Question: Can a new result automatically detect whether an existing behavior got worse?

Need:
- baseline vs candidate
- stable comparison schema
- pass/fail/changed/unknown states
- preserved evidence
- no tolerance cheating

Exit condition:
A known-good fixture and an intentional regression are both classified correctly.

### 4. ENGINE-MEMORY-001 — Experiment Memory
Question: Can a future Claude find what was already tested without rereading the repository?

Need compact searchable records for:
- question
- hypothesis
- baseline
- result
- evidence
- failure
- decision
- reusable artifact
- next question

Exit condition:
A new session can answer “what has already been tried here?” from structured records rather than broad document reading.

### 5. ENGINE-PRIORITY-001 — Evidence-Driven Queue
Question: Can the queue choose the next useful experiment from evidence rather than stale planning?

Need:
- one active P0/P1 item at a time unless two cheap tests are truly parallel
- explicit dependencies
- information gain
- cost/budget
- known unknowns
- stop conditions
- automatic demotion of answered questions

Exit condition:
The queue can explain why its top item is next and can change order when new evidence changes the economics.

## P1 — PULL FORWARD WHEN THE ENGINE IS READY

These are **not active unless the P0 engine can run them**:

- SCALE-100-001 — concurrency/scale reproduction and plateau measurement
- mobile startup reproduction
- RAM/object-lifetime probe
- cooperative scheduler/yield benchmark
- adaptive workload governor
- checkpoint/recovery interruption matrix
- audio continuity under load
- mobile capability matrix
- device-local diagnostics
- Testing Deck evidence/admission gates
- benchmark/soak/stress harness

- **GRID-METER-001 — DONE (MEASURED, 2026-10-02).** One odd-length bar makes madmom's offline DBN mislabel 15–16 consecutive bars by 2 beats at every tested tempo (beat F ≈ 0.997, no output warning); Beat This! (no DBN) handles a single odd bar; all systems fail on a repeating odd bar. Record: [experiments/GRID-METER-001](experiments/GRID-METER-001/README.md). Tooling: [tools/grid-meter](tools/grid-meter/README.md).
- **GRID-METER-002 — DONE (MEASURED, 2026-10-02).** Pre-registered detector D3 (in-bar activation contrast OR disagreement with a no-DBN tracker) flags madmom DBN mis-phase with recall 0.920 (126/137) at a 0.038 false-alarm rate on steady 4/4 incl. syncopation and half-time traps — passes on point estimates; 95 % intervals straddle both thresholds. Record: [experiments/GRID-METER-002](experiments/GRID-METER-002/README.md).
- **GRID-METER-003 — PIPELINE READY, WAITING ON ONE HUMAN INPUT.** Real-track runner (`tools/grid-meter/run_real.py`) and listener page ([Downbeat Check](https://claude.ai/artifact/6gry5DKb99xqTB4PqQ4mLv)) built and validated end-to-end on synthetic stand-ins (WAV/FLAC/MP3; reproduces GRID-METER-002 exactly; hash-mismatch attack rejected). Needs 10–20 of Daniel's tracks uploaded to a session (never committed) and one listen per track. Record: [experiments/GRID-METER-003](experiments/GRID-METER-003/README.md).
- **GRID-METER-004 — DONE (MEASURED, 2026-10-03).** No single-network configuration matches madmom DBN + D3 on silent errors (0.029 vs best single-network 0.049), so the two-network candidate stays; its cost (~16 CPU-s per audio-minute, 1 thread, container proxy) is recorded as a mobile risk. Beat This! alone is 3× cheaper with 99 % trustworthy coverage but more silent errors. Record: [experiments/GRID-METER-004](experiments/GRID-METER-004/README.md).
- **GRID-METER-005 — DONE (MEASURED, 2026-10-03).** A model-free bar-regularity check (R) on Beat This! minimal downbeats gives configuration C5: silent error rate 0.0279 (vs two-network C1 0.0286), false alarms 0.026, 97 % usable bars (vs 79 %), at 5.8 vs 16.4 CPU-s per audio-minute. Pre-registered rule passed; **C5 is the new lab candidate.** Repeated irregular phrases (heyya_pattern) remain unsafe for every configuration. Record: [experiments/GRID-METER-005](experiments/GRID-METER-005/README.md). GRID-METER-003 amended to verify C5 (default `run_real.py --config C5`).
- **GRID-METER-006 — DONE (MEASURED, 2026-10-03).** Marking the final bar line `unknown` (rule E) cuts C5's silent errors from 23 to 5 of 824 (0.6 %) with no change in false alarms or coverage. **C6 = Beat This! minimal + (D1 or R or E) is the lab candidate**; `run_real.py` defaults to it. Record: [experiments/GRID-METER-006](experiments/GRID-METER-006/README.md).
- **GRID-METER-007 — DONE (MEASURED, 2026-10-03): C6 FAILS held-out test.** On 16 unseen fixtures C6's silent error rate is 0.047 and false alarms 0.112 (limits 0.0336 / 0.05). The designed-on pass was partly overfitted, and two odd bars in one track break the regularity rule. C6 is still better than two-network C1 on the same set (silent 0.069, coverage 0.645 vs 0.868) and stays the default as **best available, not passing**. Record: [experiments/GRID-METER-007](experiments/GRID-METER-007/README.md). Next synthetic step, if any: a pre-registered track-level fail-closed rule, tested on a *new* held-out set.

When one is selected, give it a fresh experiment ID and record the actual evidence. Do not resurrect a stale task description unchanged.

## P2 — DEFERRED RESEARCH

Keep these out of the active brain until the current mechanism is measurable:

- music intelligence
- transition/journey experiments
- controlled genre bleeding
- perceptual-vs-numerical disagreement
- personal preference calibration
- future adapter contracts
- old-code archaeology
- broad architecture research
- tutorial/documentation expansion

## Queue maintenance

After every substantive experiment:

1. mark the item with evidence-backed status;
2. record the commit/artifact;
3. record the remaining unknown;
4. promote a lower item only when its expected information gain is higher;
5. remove answered/stale items from the live queue;
6. update this file if ordering changed.

## Never do this

- Do not maintain a 30–50 item active backlog.
- Do not repeat a completed experiment because its old task still exists.
- Do not read historical planning documents just because they exist.
- Do not create a new framework when an existing probe/tool can answer the question.
- Do not spend a cycle polishing documentation while executable work is available.
- Do not call simulation physical-device evidence.
- Do not claim verified without the required evidence.

**Live queue = what Claude should act on now.**
**Git history = what happened before.**
**Deep-reference docs = only what is needed to reason about the current task.**
