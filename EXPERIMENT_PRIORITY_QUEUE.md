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

## P0/P1 status update (2026-09-21, EXP-013 through EXP-017)

This file predates a full engine build that already happened on the
`claude/connect-check-kg0k4t` branch (this file's own git history vs that
branch's diverged before this queue existed) — stating that once here
rather than silently resurrecting stale P0 items:

- ENGINE-CYCLE-001/ENGINE-ATTACK-001/ENGINE-REGRESS-001 — DONE.
  `tools/engineering-cycle/{run_cycle.cjs,run_cycle_audio_autodj.cjs,
  cycle-lib.cjs}` + `contracts/engineering-cycle.schema.json` implement
  load→build→test→attack→regress→record→decide for two real task shapes,
  schema-validated. See `experiments/EXP-013`, `EXP-014`.
- ENGINE-MEMORY-001 — partially addressed: `experiments/EXP-*/README.md`
  is the searchable record today; no separate index exists yet.
- ENGINE-PRIORITY-001 — this repo's `PRIORITY_QUEUE.md` (not this file)
  has been the evidence-driven live queue in practice; the two queue files
  have not been reconciled into one — flagged, not fixed, out of scope for
  a RAM-pressure cycle.
- **RAM/object-lifetime probe** and **adaptive workload governor** —
  DONE. `experiments/EXP-017` (`RAM-PRESSURE-001`): found this lab's own
  heap sampling was blind to ArrayBuffer/TypedArray backing-store memory,
  fixed it, found peak backing memory is GC-catch-up-bound not
  concurrency-bound, built an adaptive concurrency governor adapted from
  production's own `resourcePressureHigh`/`yieldForMemoryPressure`,
  proved it with a deliberate-failure test (old code ignores simulated
  sustained pressure, new code holds concurrency down) and a 32-track
  sustained workload with full cancellation-matrix accounting. See
  `PRIORITY_QUEUE.md`'s own `RAM-PRESSURE-001` entry for the full summary.

## P1 — PULL FORWARD WHEN THE ENGINE IS READY (engine is ready)

- SCALE-100-001 — DONE, see `experiments/EXP-013`.
- CANCEL-OBS-001 — DONE, see `experiments/EXP-015`.
- AUTODJ-BOUNDARY-001 (decision layer) — DONE, see `experiments/EXP-016`.
- mobile startup reproduction
- cooperative scheduler/yield benchmark
- checkpoint/recovery interruption matrix (bulk-media-intake has none —
  `RESUME-001` in `PRIORITY_QUEUE.md`, deferred pending a real design)
- audio continuity under load
- mobile capability matrix
- device-local diagnostics
- Testing Deck evidence/admission gates
- benchmark/soak/stress harness (partially: `experiments/EXP-017`'s
  32-track sustained run; a materially larger run is the stated next test)

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
