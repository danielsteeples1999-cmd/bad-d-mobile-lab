# MISSING AND INCOMPLETE — TRACKED CRACKS

Last updated: 2026-11-22 (Grok independent review + progress compile)
Potential: 8.7/10 (strong idle automation + evidence foundation; incremental growth from knowledge to instruments)

## Confirmed Solid (do not re-open — evidence of good)
- ENGINE-CYCLE-001 idle / do-nothing path: runs probes with zero further human input, writes last_*.json + ledger dedupe. Evidence: engine/last_cycle.json (2026-11-20 success, schema 1.0.7-resource), last_resource.json. Human weirdness (idle) copies the probes reliably after first set.
- File presence, multi-run timing (stat + open), hash, basic resource probe (RSS + disk free).
- Attack stubs: missing prerequisite, timeout.
- Ledger append + dedupe (experiment_ledger.json).
- Daily/coord automation via workflows (badd-worker-coordinator, repo-governor).
- Hard production boundary, evidence standards, progress = uncertainty reduction + reusable capability.

## Highest Next Cheap Wins (open / incomplete — fell through cracks)
1. **PR#8** (draft, Copilot) — Add bounded CPU pressure probe to idle cycle. Resource-pressure attack: short CPU burn, record wall/CPU time + iterations to last_resource.json. Highest leverage remaining crack; finish/merge to close ENGINE-ATTACK resource gap.
2. ENGINE-ATTACK-001 expansion: interruption + corrupted-evidence attacks (stubs only).
3. ENGINE-REGRESS-001 — simple baseline vs candidate comparator (not started; needed for detection of worse behavior).
4. Small hygiene PRs: #3 (Python .gitignore), #4 (README research link) — merge candidates, low risk, documented but open since Oct.
5. CLAUDE_NOW.md refresh (last 2026-09-21) — update operating truth with current engine status to reduce future context cost.
6. Ledger minor cleanup (duplicate-ish entries in experiment_ledger.json).

## Longer / Deferred / Blocked
- ENGINE-MEMORY-001 fuller searchable records (query helper exists; expand only when needed).
- ENGINE-PRIORITY-001 evidence-driven queue automation.
- P1 mobile/startup/RAM probes (require private source or device evidence; issue #6 / PR#7 scaffolds).
- Open issues #5 (worker probe), #6 (mobile next version).
- Older open PRs #1 (listener ear), #2 (Intelligence Grid research + experiments — substantial but unmerged), #7 (mobile packet) — review for merge, close, or extract useful parts if stale.

## Rules for this list
- Only items with evidence of incompleteness or explicit request that fell through over long dates.
- Prefer cheap, bounded, evidence-first additions. Close one crack per cycle.
- Idle confirmation must stay zero-input after first run — no human weirdness prevails.
- Do not over-invest; work across the board on small jobs to fast-track compounding success.

Progress = measurable reduction in uncertainty + reusable capability. Large docs or unmerged PRs are not progress. Recent growth: cycle runner matured with probes + idle confirmation (mid-Nov evidence).