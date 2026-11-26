# MISSING AND INCOMPLETE — TRACKED CRACKS

Last updated: 2026-11-26 (Grok daily compile: re-confirmed main cycle_runner.py line-by-line, PR#9 diff/tests clean + unit-tested, last_cycle.json 2026-11-20 evidence solid, open PRs reviewed)
Potential: 9.4/10 (idle path proven zero-input; modular probes + ledger solid; CPU pressure probe ready in PR#9 with full tests covering math, preservation, errors, and idle no-input; engine compounding well. Minor: PR#9 dirty/needs rebase; hygiene PRs aged.)

## Confirmed Solid (do not re-open — evidence of good)
- ENGINE-CYCLE-001 idle / do-nothing path: main() runs probes with zero further human input, writes last_*.json + ledger dedupe. Evidence: engine/last_cycle.json (2026-11-20 success, schema 1.0.7-resource, duration ~0.0004s, presence/timing/hash/resource all ok). Human weirdness (idle) copies the probes reliably after first set. Confirmed line-by-line: get_resource_probe (getrusage RSS + statvfs disk free with fallback), multi_run_timing (stat+open avg), file_hash (sha256[:16]), attack stubs (missing/timeout), append_to_ledger (id+date dedupe).
- File presence, multi-run timing (stat + open), hash, basic resource probe (RSS + disk free). All functional and evidence-first.
- Attack stubs: missing prerequisite, timeout.
- Ledger append + dedupe — hygiene complete.
- Daily/coord automation via workflows.
- Hard production boundary, evidence standards, progress = uncertainty reduction + reusable capability.
- CLAUDE_NOW.md operating truth refreshed (idle proven, schema 1.0.7-resource, next is resource pressure).

**Pros of current cycle_runner.py + PR#9:** Clean schema, bounded, reusable, zero-input idle confirmation, modular probes (new cpu_pressure_probe is self-contained, integrates via **unpack, keeps ok/error paths), failure/blocked clear, low future context cost. Everyday growth compounds reliability. Pressure measurement is observational + active under budget. Busy-wait is deterministic and cheap for bounded evidence. Tests cover probe math, field preservation, error paths, and idle zero-input (no input() called).
**Cons:** Resource probe will include pressure on every idle run once merged (intentional for evidence; could be optional later if needed); no regression comparator yet; interruption/corrupted stubs incomplete; main() overwrites last evidence (intentional for last-run). No multi-core or memory pressure yet (not needed now). Hygiene PRs still open long-term. PR#9 needs rebase to resolve dirty state.

## Highest Next Cheap Wins (open / incomplete — fell through cracks over dates)
1. **PR#9** (draft, Copilot, opened 2026-11-24) — Bounded CPU pressure probe (2s single-process burn, record wall/CPU time + iterations into last_resource.json via extended get_resource_probe). Clean implementation matches style, keeps schema 1.0.7-resource, idle path zero-input, includes tests proving no human input. Highest leverage — rebase then merge to close ENGINE-ATTACK resource gap. (PR#8 is older parallel draft; prefer #9 / close #8 after.)
2. ENGINE-ATTACK-001 expansion: interruption + corrupted-evidence attacks (stubs only — next after pressure merge).
3. ENGINE-REGRESS-001 — simple baseline vs candidate comparator (not started; documented in queue; needed to detect worse behavior).
4. Small hygiene PRs: #3 (Python .gitignore — adds venv/pycache/etc), #4 (README research link to AI_START_HERE.md) — open since 2026-10-05 (~50+ days), low risk, trivial, merge candidates now.
5. Open issues #5 (worker probe), #6 (mobile next version) — scaffolds exist but implementation deferred (private source required for #6).

## Longer / Deferred / Blocked
- ENGINE-MEMORY-001 fuller searchable records (query helper exists; expand only when needed).
- ENGINE-PRIORITY-001 evidence-driven queue automation.
- P1 mobile/startup/RAM probes (require private source or device evidence; issue #6 / PR#7 scaffolds).
- Older open PRs #1 (listener ear), #2 (Intelligence Grid research + experiments — substantial but unmerged), #7 (mobile packet) — review for merge, close, or extract useful parts if stale.

## Rules for this list
- Only items with evidence of incompleteness or explicit request that fell through over long dates.
- Prefer cheap, bounded, evidence-first additions. Close one crack per cycle.
- Idle confirmation must stay zero-input after first run — no human weirdness prevails.
- Do not over-invest; work across the board on small jobs to fast-track compounding success.

Progress = measurable reduction in uncertainty + reusable capability. Large docs or unmerged PRs are not progress. Recent growth: cycle runner matured with probes + idle confirmation (mid-Nov evidence); CPU pressure now coded cleanly, tested, and ready in PR#9 (pending clean merge). Daily compile continues to surface cracks without over-investment. Next cycle: rebase/merge PR#9 (and close #8) then one more small crack (hygiene merge or interruption stub).
