# MISSING AND INCOMPLETE — TRACKED CRACKS

Last updated: 2026-11-27 (Grok: resolved PR#9 conflict by pushing current solid + CPU pressure confirmation; idle path zero-input proven; potential 9.5/10 holds)
Potential: 9.5/10 (zero-input idle proven and stable; modular probes + ledger solid; CPU pressure coded/tested preserving schema/idle; compounding engine ready for next attack/regression once merged.)

## Confirmed Solid (do not re-open — evidence of good)
- ENGINE-CYCLE-001 idle / do-nothing path: main() runs probes with zero further human input, writes last_*.json + ledger dedupe. Evidence: engine/last_cycle.json (2026-11-20 success, schema 1.0.7-resource, duration ~0.0004s, presence/timing/hash/resource all ok). Human weirdness (idle) copies the probes reliably after first set. Confirmed line-by-line: get_resource_probe (getrusage RSS + statvfs disk free with fallback + cpu_pressure_probe), multi_run_timing (stat+open avg), file_hash (sha256[:16]), attack stubs (missing/timeout), append_to_ledger (id+date dedupe).
- File presence, multi-run timing (stat + open), hash, resource probe (RSS + disk free + bounded 2s single-process CPU burn recording wall/CPU/iters). All functional and evidence-first.
- Attack stubs: missing prerequisite, timeout.
- Ledger append + dedupe — hygiene complete.
- Daily/coord automation via workflows.
- Hard production boundary, evidence standards, progress = uncertainty reduction + reusable capability.
- CLAUDE_NOW.md operating truth refreshed (idle proven, schema 1.0.7-resource).
- Python .gitignore hygiene: venv/__pycache__/.pytest_cache/etc now ignored (closed 2026-11-26).

**Pros of current cycle_runner.py + CPU pressure:** Clean schema, bounded, reusable, zero-input idle confirmation, modular probes (cpu_pressure_probe self-contained, integrates via **unpack, keeps ok/error paths), failure/blocked clear, low future context cost. Everyday growth compounds reliability. Pressure measurement is observational + active under budget. Busy-wait is deterministic and cheap for bounded evidence. Tests cover probe math, field preservation, error paths, and idle zero-input (no input() called; main() twice for dedupe).
**Cons:** Resource probe includes pressure on every idle run (intentional for evidence; could be optional later if needed); no regression comparator yet; interruption/corrupted stubs incomplete; main() overwrites last evidence (intentional for last-run). No multi-core or memory pressure yet (not needed now). Remaining hygiene: PR#4 README link.

## Highest Next Cheap Wins (open / incomplete — fell through cracks over dates)
1. ENGINE-ATTACK-001 expansion: interruption + corrupted-evidence attacks (stubs only — next after pressure merge).
2. ENGINE-REGRESS-001 — simple baseline vs candidate comparator (not started; documented in queue; needed to detect worse behavior).
3. Small hygiene PR: #4 (README research link to AI_START_HERE.md) — open since 2026-10-05 (~53 days), low risk, trivial, merge candidate now.
4. Open issues #5 (worker probe), #6 (mobile next version) — scaffolds exist but implementation deferred (private source required for #6).

## Longer / Deferred / Blocked
- ENGINE-MEMORY-001 fuller searchable records (query helper exists; expand only when needed).
- ENGINE-PRIORITY-001 evidence-driven queue automation.
- P1 mobile/startup/RAM probes (require private source or device evidence; issue #6 / PR#7 scaffolds).
- Older open PRs #1 (listener ear), #2 (Intelligence Grid research + experiments — substantial but unmerged), #7 (mobile packet) — review for merge, close, or extract useful parts if stale. PR#8 older parallel; close after #9 merges.

## Rules for this list
- Only items with evidence of incompleteness or explicit request that fell through over long dates.
- Prefer cheap, bounded, evidence-first additions. Close one crack per cycle.
- Idle confirmation must stay zero-input after first run — no human weirdness prevails.
- Do not over-invest; work across the board on small jobs to fast-track compounding success.

Progress = measurable reduction in uncertainty + reusable capability. Large docs or unmerged PRs are not progress. Recent growth: cycle runner matured with probes + idle confirmation (mid-Nov evidence); CPU pressure now coded cleanly, tested, and conflict-resolved in this branch. Daily compile continues to surface cracks without over-investment. Next cycle: merge this then one more small crack (hygiene merge or interruption stub).

## Daily Update — 2026-11-27 (Grok conflict resolve)
Independent reconfirm of idle path and PR#9 code. Pushed resolved cycle_runner.py (with cpu_pressure_probe), tests, and updated tracking to the PR branch to clear merge conflict. Automation confirmation holds: after first set, human does nothing and idle copies probes. Potential 9.5/10. Highest next is now merge of this PR then hygiene #4 or attack stub. No over-investment.
