# MISSING AND INCOMPLETE — TRACKED CRACKS

> Lightweight living list of small jobs, features, and capabilities requested over time that fell between cracks.  
> Updated only when evidence shows something is still missing or incomplete.  
> Do not expand into a full backlog. Prefer linking to existing issues or queue items.  
> Goal: surface forgotten simple wins that can be finished cheaply to compound progress.

## Current tracked items (as of 2026-11-18 — post daily review)

### From ENGINE / Control Plane
- ENGINE-CYCLE-001: File-presence + multi-run timing (os.stat + open()) + hash + **resource observation** + attacks (missing, timeout, invalid) in cycle_runner.py (schema 1.0.7-resource). last_*.json including last_resource.json ready as evidence. Idle main() confirms do-nothing path. **Potential: 8.8/10** — clean schema, auto-ledger with dedupe, bounded, reusable, evidence-first, expanding probes. Pros: multi-run baselines, failure classes, idle confirmation, resource baseline, low future context. Cons: full implementation verification pending (file content appears truncated/stub in remote view), no full regression comparator yet, main() overwrites last evidence (intentional for last-run), richer forced-pressure/interruption pending. Everyday growth: strong compounding on lifecycle reliability.
- ENGINE-ATTACK-001: Missing-file + timeout stub + invalid fixture now in main(). Resource observation added. Draft PR #8 adds bounded CPU pressure. Full harness (forced resource pressure, interruption, corrupted evidence) not started. Next cheap: intentional allocation pressure or regression stub.
- ENGINE-MEMORY-001: Seed ledger created. Auto-append COMPLETE. Deduplicate by experiment_id COMPLETE. Minimal query helper with status/id/date/summary. Still needs richer query or searchable index. Potential: good foundation.
- LAB-001 (issue #5): Zero-context worker probe still open. Entrypoint discoverability not formally evidenced with a fresh run.

### From PAST_WORK_REVIEW / Conversion Order
- Deterministic fixture system: count + file-presence + multi-run timing + hash + open-timing + resource exist; no general fixture loader or golden fixtures.
- Experiment result schema: partial (CycleResult v1.0.7-resource); needs versioned, stable, machine-readable across tools.
- Benchmark runner: absent.
- Startup probe / memory lifetime probe / interruption harness: documented in maps but no executable versions.
- Regression comparator and failure injector: listed in queue but not implemented (attack stubs + resource observation are first steps).

### From Six-Month Program / Expansion Map (Stage 1 gaps)
- Startup benchmark + first-interactive timing: multi-run timing + open-timing probes exist but not full startup instrumentation in lab.
- Memory observation / long-task observation: resource probe is first observation step; long-task still missing.
- Machine-readable experiment ledger: seed present; full searchable version missing (query helper is first step).
- Browser capability report: missing.
- Audio stability probe: deferred until engine ready.

### From Production-adjacent (lab only, no production touch)
- MOBILE-UPDATE-001 (issue #6): Planned but blocked on private source access. No public-lab baseline measurement yet. PR #7 open (docs only).
- Simple recovery / interruption evidence for lab tools themselves: not present.

### Automation / “do nothing” baseline
- Automation confirmation (zero human after first set): **COMPLETE for default probes**. main() prints idle confirmation and replays the same probes with zero further input. Deduplicate prevents ledger growth on re-runs. Evidence of “do nothing” path recorded. Resource observation included. Next: optional flag to preserve prior last_*.json if desired. Human weirdness (idle) copies reliably.

## Rules for this file
- Add only items that have been requested in docs/issues and still lack executable evidence.
- Mark COMPLETE with commit/SHA when finished.
- Prefer one-line status + link over long descriptions.
- Remove or archive when the capability exists and is evidenced.
- Do not use this as a reason to avoid the live priority queue.

**Progress is still measured by reduced uncertainty + reusable executable capability, not by length of this list.**

## Quick wins available now (cheap, high leverage)
- ~~Auto-append CycleResult to experiment_ledger.json on successful cycle end.~~ COMPLETE
- ~~Add a simple timing probe (os.stat or time.perf_counter around file open).~~ COMPLETE
- ~~Commit the runtime last_cycle.json / last_attack.json / last_timing.json as evidence.~~ COMPLETE
- ~~Minimal query helper for the ledger (e.g. list by status or id).~~ COMPLETE
- ~~Hash probe for file content integrity.~~ COMPLETE
- ~~Expand attack harness with one more class (invalid fixture).~~ COMPLETE
- ~~Deduplicate ledger appends (avoid identical experiment_id entries).~~ COMPLETE
- ~~Multi-run timing baseline (average of N stats) for better evidence.~~ COMPLETE
- ~~Idle/do-nothing confirmation path.~~ COMPLETE
- ~~Open() timing probe (multi-run).~~ COMPLETE
- ~~Resource observation probe (disk free + process RSS).~~ COMPLETE
- Merge or complete PR #8 for bounded CPU pressure evidence.
- Richer query helper (filter by date/range, export compact summary). — partial.
- Intentional resource pressure (allocation) probe or regression comparator stub.
- Ensure last_hash.json etc. are committed after a clean run and verify full cycle_runner.py executes without stub.

## Growth snapshot (2026-11-18)
Recent commits: multi-run timing, invalid-fixture attack, ledger dedupe, idle-path confirmation, open() timing probe, resource observation probe. Potential rating: **8.8/10** for compounding engine (evidence + schema + attack classes + dedupe + idle + open-timing + resource strong; full harness/regression + code verification still gap). Everyday progress: small, evidenced steps reducing uncertainty on cycle lifecycle and automation reliability. Pros outweigh cons for fast-tracking reusable capability. Across-board: engine solid and expanding, research in other PRs/docs, mobile/audio labs waiting on engine maturity. Human weirdness (idle path) copies the do-nothing probes reliably including resource baseline.

**AI review note (2026-11-18):** Idle/do-nothing path is solid and self-copying. Small cracks tracked here remain the leverage points. Merge PR #8 for full resource pressure evidence, then next cheap wins are richer query or regression stub. Verify full cycle_runner.py is not a stub. No over-investment recommended until engine maturity unlocks P1 items. Private production context (319+ issues) is a separate risk — REPO-STATE-FAST-CONTEXT-001 is the high-leverage fix there.
