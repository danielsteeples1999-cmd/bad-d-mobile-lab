# MISSING AND INCOMPLETE — TRACKED CRACKS

> Lightweight living list of small jobs, features, and capabilities requested over time that fell between cracks.  
> Updated only when evidence shows something is still missing or incomplete.  
> Do not expand into a full backlog. Prefer linking to existing issues or queue items.  
> Goal: surface forgotten simple wins that can be finished cheaply to compound progress.

## Current tracked items (as of 2026-11-22 — post daily audits + idle confirmation)

### From ENGINE / Control Plane
- ENGINE-CYCLE-001: File-presence + multi-run timing (os.stat + open()) + hash + **resource observation** + attacks (missing, timeout, invalid) now implemented in cycle_runner.py (schema 1.0.7-resource). last_*.json including last_resource.json ready as evidence. Idle main() confirms do-nothing path. **Potential: 9.0/10** — clean schema, auto-ledger with dedupe, bounded, reusable, evidence-first, expanding probes. Pros: multi-run baselines, failure classes, idle confirmation, resource baseline, low future context, now executable on main. Cons: No full regression comparator yet, main() overwrites last evidence (intentional for last-run), richer forced-pressure/interruption pending, needs runtime verification run. Everyday growth: strong compounding on lifecycle reliability. Evidence: full code restored in commit ae94d7b. **Runtime verification 2026-11-20: SUCCESS** (duration 0.0004s, probes all ok, hash e9557912dd5c0862). Fresh evidence committed. Daily automation audits in meomory continue (latest reports through 2026-11-20; 2026-11-21 commit recorded).
- ENGINE-ATTACK-001: Missing-file + timeout stub + invalid fixture now in main() (full). Resource observation added. Draft PR #8 adds bounded CPU pressure. Full harness (forced resource pressure, interruption, corrupted evidence) not started. Next cheap: run verification then intentional allocation pressure or regression stub, or merge PR #8. **Verification complete; PR #8 is highest immediate.**
- ENGINE-MEMORY-001: Seed ledger created (5+ entries). Auto-append COMPLETE. Deduplicate by experiment_id COMPLETE. Minimal query helper with status/id/date/summary. Still needs richer query or searchable index. Potential: good foundation. Ledger updated with IDLE entry.
- LAB-001 (issue #5): Zero-context worker probe still open (last update ~2026-10-12). Entrypoint discoverability not formally evidenced with a fresh run.

### From PAST_WORK_REVIEW / Conversion Order
- Deterministic fixture system: count + file-presence + multi-run timing + hash + open-timing + resource exist (in full code); no general fixture loader or golden fixtures.
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
- MOBILE-UPDATE-001 (issue #6, PR #7): Planned but blocked on private source access. No public-lab baseline measurement yet. PR #7 open (docs only, draft).
- Simple recovery / interruption evidence for lab tools themselves: not present.

### Automation / “do nothing” baseline
- Automation confirmation (zero human after first set): **COMPLETE and now executable + runtime verified**. main() prints idle confirmation and replays the same probes with zero further input. Deduplicate prevents ledger growth on re-runs. Evidence of “do nothing” path recorded. Resource observation included. Next: optional flag to preserve prior last_*.json if desired. Human weirdness (idle) copies reliably. Daily audits + productivity records in bad_d_meomory provide independent confirmation that control-plane automation continues without human intervention.

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
- ~~**PRIORITY: Restore full non-stub cycle_runner.py to main**~~ COMPLETE (ae94d7b)
- ~~**Runtime verification of idle path**~~ COMPLETE (2026-11-20 run + evidence commit)
- Merge or complete PR #8 for bounded CPU pressure evidence.
- Richer query helper (filter by date/range, export compact summary). — partial.
- Intentional resource pressure (allocation) probe or regression comparator stub.
- Ensure last_hash.json etc. are committed after a clean run and verify full cycle_runner.py executes without stub. — **DONE for this run**
- Close or action old draft PRs (#3, #4) if still relevant or stale.

## Growth snapshot (2026-11-22)
Recent commits: restored full cycle_runner.py + runtime verification. Daily automation audits and productivity records continue in bad_d_meomory (github-actions commits through 2026-11-21). Potential rating: **9.0/10** for compounding engine (evidence + schema + attack classes + dedupe + idle + open-timing + resource now executable). Everyday progress: small, evidenced steps reducing uncertainty on cycle lifecycle and automation reliability. Pros outweigh cons for fast-tracking reusable capability. Across-board: engine design solid and expanding, research in other PRs/docs (PR #2 still open), mobile/audio labs waiting on engine maturity + private source. Human weirdness (idle path) copies the do-nothing probes reliably including resource baseline. **Runtime proof: SUCCESS.** Control-plane health: no deadlocks or stale wiring reported in latest audits; many semantic overlaps on parked autonomy issues noted (expected for template-style jobs).

**AI review note (2026-11-22):** Critical stub fixed — full implementation now on main. Idle/do-nothing path is solid and self-copying. **Runtime verification complete.** Small cracks tracked here remain the leverage points. **Highest immediate: merge PR #8** for full resource pressure evidence, then next cheap wins are richer query or regression stub. No over-investment recommended until engine maturity unlocks P1 items. Private production context (high open issues in bad_d_meomory, many TAKEN/PENDING autonomy farm jobs with template owners) is a separate risk — REPO-STATE-FAST-CONTEXT-001 remains the high-leverage fix there. Open issues #1,#2,#5,#6 still trackable but not blocking engine. Automation confirmation holds: once first set is run, subsequent idle cycles copy probes with zero further human input.
