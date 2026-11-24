# MISSING AND INCOMPLETE — TRACKED CRACKS

Last updated: 2026-11-24 (Grok full line-by-line review of engine/cycle_runner.py + live last_*.json evidence + open PRs/issues + queue)
Potential: 8.9/10 (idle path solid with 2026-11-20 evidence; modular probes reusable; one clear next attack ready; compounding engine maturing without over-investment)

## Confirmed Solid (do not re-open — evidence of good)
- ENGINE-CYCLE-001 idle / do-nothing path: main() runs probes with zero further human input, writes last_*.json + ledger dedupe. Evidence: engine/last_cycle.json (2026-11-20 success, schema 1.0.7-resource, duration ~0.0004s, presence/timing/hash/resource all ok). Human weirdness (idle) copies the probes reliably after first set. Confirmed line-by-line: get_resource_probe (getrusage RSS + statvfs disk free with fallback), multi_run_timing (stat+open avg), file_hash (sha256[:16]), attack stubs (missing/timeout), append_to_ledger (id+date dedupe).
- File presence, multi-run timing (stat + open), hash, resource probe (RSS, disk free, and a bounded two-second single-process CPU burn). The burn records wall time, process CPU time, and iterations in last_resource.json; it is not a system-wide pressure or recovery test.
- Attack stubs: missing prerequisite, timeout.
- Ledger append + dedupe — hygiene complete.
- Daily/coord automation via workflows.
- Hard production boundary, evidence standards, progress = uncertainty reduction + reusable capability.

**Pros of current cycle_runner.py:** Clean schema, bounded, reusable, zero-input idle confirmation, modular probes, failure/blocked clear, low future context cost. Everyday growth compounds reliability.
**Cons:** No regression comparator; interruption/corrupted stubs incomplete; main() overwrites last evidence (intentional for last-run).

## Highest Next Cheap Wins (open / incomplete — fell through cracks over dates)
1. ENGINE-ATTACK-001 expansion: interruption + corrupted-evidence attacks (stubs only).
2. ENGINE-REGRESS-001 — simple baseline vs candidate comparator (not started; documented in queue; needed to detect worse behavior).
3. Small hygiene PRs: #3 (Python .gitignore), #4 (README research link) — open since 2026-10-05, low risk, merge candidates.
4. CLAUDE_NOW.md refresh (last 2026-09-21) — update operating truth with current engine status (idle proven, schema 1.0.7-resource) to reduce future context cost.
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

Progress = measurable reduction in uncertainty + reusable capability. Large docs or unmerged PRs are not progress. Recent growth: cycle runner matured with probes + idle confirmation (mid-Nov evidence). Daily compile continues to surface cracks without over-investment. Next cycle: interruption stub or another small crack.
