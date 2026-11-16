# MISSING AND INCOMPLETE — TRACKED CRACKS

> Lightweight living list of small jobs, features, and capabilities requested over time that fell between cracks.  
> Updated only when evidence shows something is still missing or incomplete.  
> Do not expand into a full backlog. Prefer linking to existing issues or queue items.  
> Goal: surface forgotten simple wins that can be finished cheaply to compound progress.

## Current tracked items (as of 2026-11-16 post-hash-probe + timeout stub)

### From ENGINE / Control Plane
- ENGINE-CYCLE-001: File-presence + timing + **hash probes** + basic attack stub implemented in cycle_runner.py (schema 1.0.4-hash). **last_*.json committed as evidence** (prior). Hash + timeout attack added (6c1c42f). Still needs full multi-class attack harness and richer probes before broader use.
- ENGINE-ATTACK-001: Basic missing-file + **timeout stub** in main(). Full harness (resource, interruption, corrupted evidence, invalid fixture) not started.
- ENGINE-MEMORY-001: Seed ledger created (engine/experiment_ledger.json). **Auto-append on cycle end COMPLETE** (da22f62). **Evidence files committed. Minimal query helper added** (query_ledger.py). Still needs richer query or searchable index.
- LAB-001 (issue #5): Zero-context worker probe still open. Entrypoint discoverability not formally evidenced with a fresh run.

### From PAST_WORK_REVIEW / Conversion Order
- Deterministic fixture system: count + file-presence + timing + hash exist; no general fixture loader or golden fixtures.
- Experiment result schema: partial (CycleResult v1.0.4-hash); needs versioned, stable, machine-readable across tools.
- Benchmark runner: absent.
- Startup probe / memory lifetime probe / interruption harness: documented in maps but no executable versions.
- Regression comparator and failure injector: listed in queue but not implemented (attack stub is first step).

### From Six-Month Program / Expansion Map (Stage 1 gaps)
- Startup benchmark + first-interactive timing: timing probe exists but not full startup instrumentation in lab.
- Memory observation / long-task observation: missing.
- Machine-readable experiment ledger: seed present; full searchable version missing (query helper is first step).
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
- ~~Auto-append CycleResult to experiment_ledger.json on successful cycle end.~~ COMPLETE (da22f62)
- ~~Add a simple timing probe (os.stat or time.perf_counter around file open).~~ COMPLETE (4993fc1)
- ~~Commit the runtime last_cycle.json / last_attack.json / last_timing.json as evidence.~~ COMPLETE (40afc99 et al.)
- ~~Minimal query helper for the ledger (e.g. list by status or id).~~ COMPLETE (query_ledger.py)
- ~~Hash probe for file content integrity.~~ COMPLETE (6c1c42f — cycle_runner.py hash probe)
- Expand attack harness with one more class (e.g. invalid fixture or resource pressure).
- Richer query helper (filter by date/range, export compact summary).
