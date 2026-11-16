# MISSING AND INCOMPLETE — TRACKED CRACKS

> Lightweight living list of small jobs, features, and capabilities requested over time that fell between cracks.  
> Updated only when evidence shows something is still missing or incomplete.  
> Do not expand into a full backlog. Prefer linking to existing issues or queue items.  
> Goal: surface forgotten simple wins that can be finished cheaply to compound progress.

## Current tracked items (as of 2026-11-16 refresh)

### From ENGINE / Control Plane
- ENGINE-CYCLE-001: File-presence probe + basic attack stub implemented in cycle_runner.py. last_*.json written at runtime but may not be committed yet. Still needs timing/hash probe and full attack harness before broader use.
- ENGINE-ATTACK-001: Basic missing-file attack in main(). Full harness (timeout, resource, interruption, corrupted evidence) not started.
- ENGINE-MEMORY-001: Seed ledger created (engine/experiment_ledger.json). Needs query interface and auto-append on cycle end (easy win).
- LAB-001 (issue #5): Zero-context worker probe still open. Entrypoint discoverability not formally evidenced with a fresh run.

### From PAST_WORK_REVIEW / Conversion Order
- Deterministic fixture system: count + file-presence exist; no general fixture loader or golden fixtures.
- Experiment result schema: partial (CycleResult v1.0.2-probe); needs versioned, stable, machine-readable across tools.
- Benchmark runner: absent.
- Startup probe / memory lifetime probe / interruption harness: documented in maps but no executable versions.
- Regression comparator and failure injector: listed in queue but not implemented (attack stub is first step).

### From Six-Month Program / Expansion Map (Stage 1 gaps)
- Startup benchmark + first-interactive timing: not instrumented in lab.
- Memory observation / long-task observation: missing.
- Machine-readable experiment ledger: seed present; full searchable version missing.
- Browser capability report: missing.
- Audio stability probe: deferred until engine ready.

### From Production-adjacent (lab only, no production touch)
- MOBILE-UPDATE-001 (issue #6): Planned but blocked on private source access. No public-lab baseline measurement yet.
- Simple recovery / interruption evidence for lab tools themselves: not present.

## Rules for this file
- Add only items that have been requested in docs/issues and still lack executable evidence.
- Mark COMPLETE with commit/SHA when finished.
- Prefer one-line status + link over long descriptions.
- Remove or archive when the capability exists and is evidenced.
- Do not use this as a reason to avoid the live priority queue.

**Progress is still measured by reduced uncertainty + reusable executable capability, not by length of this list.**

## Quick wins available now (cheap, high leverage)
- Auto-append CycleResult to experiment_ledger.json on successful cycle end.
- Add a simple timing probe (os.stat or time.perf_counter around file open).
- Commit the runtime last_cycle.json / last_attack.json as evidence.
- Minimal query helper for the ledger (e.g. list by status or id).
