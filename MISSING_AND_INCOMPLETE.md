# MISSING AND INCOMPLETE — TRACKED CRACKS

Last updated: 2026-11-23 evening (Grok independent re-review of code lines + live evidence + small contributions)
Potential: 8.9/10 (idle automation proven solid with live evidence from 2026-11-20; probes mature and reusable; regression stub now present; ready for next bounded attack)

## Confirmed Solid (do not re-open — evidence of good)
- ENGINE-CYCLE-001 idle / do-nothing path: main() runs probes with zero further human input, writes last_*.json + ledger dedupe. Evidence: engine/last_cycle.json (2026-11-20 success, schema 1.0.7-resource), last_resource.json. Human weirdness (idle) copies the probes reliably after first set. Confirmed by reading current cycle_runner.py line-by-line.
- File presence, multi-run timing (stat + open), hash, basic resource probe (RSS + disk free). All present and functional.
- Attack stubs: missing prerequisite, timeout.
- Ledger append + dedupe (experiment_ledger.json) — recent hygiene cleanup of duplicates completed.
- Daily/coord automation via workflows.
- Hard production boundary, evidence standards, progress = uncertainty reduction + reusable capability.
- Minimal ENGINE-REGRESS-001 stub (simple hash + timing comparator) added and called in idle path (schema bump to 1.0.8-regress-stub on branch).

## Highest Next Cheap Wins (open / incomplete — fell through cracks)
1. **PR#8** (draft, Copilot, opened 2026-11-17) — Add bounded CPU pressure probe to idle cycle. Resource-pressure attack: short CPU burn, record wall/CPU time + iterations to last_resource.json. Highest leverage remaining crack; finish/adapt to current main style and merge to close ENGINE-ATTACK resource gap. Still open/draft.
2. ENGINE-ATTACK-001 expansion: interruption + corrupted-evidence attacks (stubs only).
3. Expand ENGINE-REGRESS-001 beyond stub (baseline storage, real candidate runs).
4. Small hygiene PRs: #3 (Python .gitignore), #4 (README research link) — merge candidates, low risk, documented but open since Oct 5. CLAUDE_NOW.md now refreshed (was Sept 2026).
5. Open issues #5 (worker probe), #6 (mobile next version) — scaffolds exist but implementation deferred.

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

Progress = measurable reduction in uncertainty + reusable capability. Large docs or unmerged PRs are not progress. Recent growth: cycle runner matured with probes + idle confirmation (mid-Nov evidence) + regression stub + CLAUDE_NOW refresh. Daily compile continues to surface cracks without over-investment.
