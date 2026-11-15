# MISSING AND INCOMPLETE — TRACKED CRACKS

> Lightweight living list of small jobs, features, and capabilities requested over time that fell between cracks.  
> Updated only when evidence shows something is still missing or incomplete.  
> Do not expand into a full backlog. Prefer linking to existing issues or queue items.  
> Goal: surface forgotten simple wins that can be finished cheaply to compound progress.

## Current tracked items (as of 2026-11-15)

### From ENGINE / Control Plane
- ENGINE-CYCLE-001: Trivial fixture proven (44ccbc4). Still needs a non-trivial real probe (e.g. startup timing or file-hash check) before calling the lifecycle production-ready for other experiments.
- ENGINE-ATTACK-001: Not started. No attack harness exists.
- ENGINE-MEMORY-001: No searchable experiment ledger. Future sessions still must re-read docs.
- LAB-001 (issue #5): Zero-context worker probe still open. Entrypoint discoverability not formally evidenced.

### From PAST_WORK_REVIEW / Conversion Order
- Deterministic fixture system: only trivial count exists; no general fixture loader or golden fixtures.
- Experiment result schema: partial (CycleResult); needs versioned, stable, machine-readable across tools.
- Benchmark runner: absent.
- Startup probe / memory lifetime probe / interruption harness: documented in maps but no executable versions.
- Regression comparator and failure injector: listed in queue but not implemented.

### From Six-Month Program / Expansion Map (Stage 1 gaps)
- Startup benchmark + first-interactive timing: not instrumented in lab.
- Memory observation / long-task observation: missing.
- Machine-readable experiment ledger: missing (overlaps ENGINE-MEMORY).
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
