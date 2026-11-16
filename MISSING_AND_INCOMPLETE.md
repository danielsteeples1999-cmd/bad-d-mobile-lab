# MISSING AND INCOMPLETE — TRACKED CRACKS

> Lightweight living list of small jobs, features, and capabilities requested over time that fell between cracks.  
> Updated only when evidence shows something is still missing or incomplete.  
> Do not expand into a full backlog. Prefer linking to existing issues or queue items.  
> Goal: surface forgotten simple wins that can be finished cheaply to compound progress.

## Current tracked items (as of 2026-11-17 cheap wins: dedupe + multi-run + idle/preserve + invalid attack)

### From ENGINE / Control Plane
- ENGINE-CYCLE-001: File-presence + timing (now multi-run) + hash probes + attacks (missing, timeout, invalid) in cycle_runner.py (schema 1.0.5-dedupe-idle). Evidence files exist. Ledger auto-append with dedupe. Idle/do-nothing mode preserves existing evidence unless --force. Potential: high — clean schema, auto-ledger, bounded, now safer for repeated runs. Pros: evidence-first, reusable, non-destructive by default. Cons: full multi-class harness and regression still open.
- ENGINE-ATTACK-001: Missing-file + timeout stub + **invalid fixture** added. Full harness (resource, interruption, corrupted evidence) not started. Next cheap: resource pressure or open() timing.
- ENGINE-MEMORY-001: Seed ledger created. Auto-append COMPLETE. **Dedupe on experiment_id+status COMPLETE**. Minimal query helper with status/id/date/summary. Still needs richer query or searchable index. Potential: good foundation.
- LAB-001 (issue #5): Zero-context worker probe still open. Entrypoint discoverability not formally evidenced with a fresh run.

### From PAST_WORK_REVIEW / Conversion Order
- Deterministic fixture system: count + file-presence + timing + hash exist; no general fixture loader or golden fixtures.
- Experiment result schema: partial (CycleResult v1.0.5); needs versioned, stable, machine-readable across tools.
- Benchmark runner: absent.
- Startup probe / memory lifetime probe / interruption harness: documented in maps but no executable versions.
- Regression comparator and failure injector: listed in queue but not implemented (attack stubs are first steps).

### From Six-Month Program / Expansion Map (Stage 1 gaps)
- Startup benchmark + first-interactive timing: timing probe exists but not full startup instrumentation in lab.
- Memory observation / long-task observation: missing.
- Machine-readable experiment ledger: seed present; full searchable version missing (query helper is first step).
- Browser capability report: missing.
- Audio stability probe: deferred until engine ready.

### From Production-adjacent (lab only, no production touch)
- MOBILE-UPDATE-001 (issue #6): Planned but blocked on private source access. No public-lab baseline measurement yet.
- Simple recovery / interruption evidence for lab tools themselves: not present.

### Automation / “do nothing” baseline
- Automation confirmation (zero human after first set): cycle_runner can run probes with no further input once fixtures are defined. Idle mode (no args or --idle) runs the default set and **does not overwrite existing evidence** unless --force or env BADD_FORCE_EVIDENCE=1. This copies the “do nothing / leave prior results alone” path. Evidence of “do nothing” is recorded.

## Rules for this file
- Add only items that have been requested in docs/issues and still lack executable evidence.
- Mark COMPLETE with commit/SHA when finished.
- Prefer one-line status + link over long descriptions.
- Remove or archive when the capability exists and is evidenced.
- Do not use this as a reason to avoid the live priority queue.

**Progress is still measured by reduced uncertainty + reusable executable capability, not by length of this list.**

## Quick wins available now (cheap, high leverage)
- ~~Auto-append CycleResult to experiment_ledger.json on successful cycle end.~~ COMPLETE
- ~~Add a simple timing probe.~~ COMPLETE
- ~~Commit the runtime last_*.json as evidence.~~ COMPLETE (prior)
- ~~Minimal query helper for the ledger.~~ COMPLETE
- ~~Hash probe for file content integrity.~~ COMPLETE
- ~~Dedupe ledger appends.~~ COMPLETE (this cycle)
- ~~Multi-run timing baseline.~~ COMPLETE (this cycle)
- ~~Idle/preserve mode so repeated runs do not clobber evidence.~~ COMPLETE (this cycle)
- ~~Invalid fixture attack stub.~~ COMPLETE (this cycle)
- Expand attack harness with one more class (e.g. resource pressure).
- Richer query helper (filter by date/range, export compact summary). — partial.
- Ensure last_hash.json / last_timeout.json / last_invalid.json are committed after a clean run (run the script once).
- Regression comparator next.

## Growth snapshot (2026-11-17)
Recent: dedupe, multi-run timing, idle/preserve evidence, invalid attack stub. Potential rating: 8.5/10 for compounding engine (evidence + schema + non-destructive automation stronger; full harness and regression still gap). Everyday progress: small, evidenced steps reducing uncertainty on cycle lifecycle and safe re-runs.
