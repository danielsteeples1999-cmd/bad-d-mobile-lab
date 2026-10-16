# EXPERIMENT PRIORITY QUEUE — LIVE ONLY

> Current executable work only. Evidence outranks age and old plans.

## P0 — MOBILE-UPDATE-001 — Start the next BAD-D mobile version

Canonical task: https://github.com/danielsteeples1999-cmd/bad-d-mobile-lab/issues/6  
Work packet: [MOBILE_NEXT/README.md](MOBILE_NEXT/README.md)  
Branch: `claude/mobile-update-001-start`

**Goal:** deliver one real, user-visible mobile improvement with regression evidence. This is now the active priority because the user explicitly requested a mobile update.

### Gate 1 — baseline (must precede implementation)
- In the authorized private workspace, record exact production commit and mobile file SHA-256.
- Run cold startup five times and record browser/device/OS.
- Run one representative import; record size, duration, errors and cancel/retry behavior.
- Do not copy private production source/history into this public lab.
- If private workspace access is unavailable, mark BLOCKED; do not invent a baseline.

### Gate 2 — choose one reproducible defect
Prioritize startup/import reliability, RAM/large-file stability, touch/viewport fit, and interruption recovery. Select based on measured impact, not guesswork.

### Gate 3 — isolated implementation
- Implement one bounded fix in the authorized isolated workspace.
- Add a deterministic regression test and attack cancellation/retry/lifecycle edges.
- Record exact commit, app hash, test outputs, known unknowns and evidence provenance.
- Physical phone verification remains UNKNOWN until a real device is tested.

### Exit condition
A user-visible improvement is implemented and demonstrated on an isolated candidate; regression evidence is tied to its exact identity; existing version remains recoverable. No merge, deployment, release or production promotion without explicit human approval.

## P1 — Reusable experiment engine (defer unless directly needed by MOBILE-UPDATE-001)

- ENGINE-CYCLE-001 — repeatable machine-readable experiment lifecycle.
- ENGINE-ATTACK-001 — invalid input, missing prerequisite, interruption, timeout, resource pressure and corrupted evidence attacks.
- ENGINE-REGRESS-001 — baseline/candidate comparator with pass/fail/changed/unknown.
- ENGINE-MEMORY-001 — compact searchable experiment records.
- ENGINE-PRIORITY-001 — evidence-driven queue ordering.

Only build the minimum reusable mechanism required to run the mobile baseline and regression test reliably. Do not let framework-building delay the requested mobile update.

## P2 — parked

- SCALE-100-001, broad concurrency/scale work.
- General scheduler/governor work not needed for the first mobile defect.
- Broad UI redesign, music intelligence, transition research and architecture archaeology.

Revisit when the first mobile candidate is tested or new evidence shows a parked item blocks it.

## Queue rules
- One active P0 at a time unless two cheap experiments are genuinely independent.
- Record exact commit/hash, status, confidence, impact, unknowns, cheapest falsifiable experiment and next action.
- Runtime, performance, mobile, audio and recovery claims require their corresponding evidence.
- Never claim physical-device verification from simulation.
- No production access or promotion from this public lab.
