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
