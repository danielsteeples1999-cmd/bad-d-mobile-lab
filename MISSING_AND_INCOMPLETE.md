# MISSING AND INCOMPLETE — TRACKED CRACKS

Last updated: 2026-11-22 (Grok independent review)
Potential: 9.0/10 (strong idle automation + evidence foundation)

## Confirmed Solid (do not re-open)
- ENGINE-CYCLE-001 idle / do-nothing path: runs probes with zero further human input, writes last_*.json + ledger dedupe. Evidence: engine/last_cycle.json (2026-11-20 success, schema 1.0.7-resource).
- File presence, multi-run timing (stat + open), hash, basic resource probe (RSS + disk free).
- Attack stubs: missing prerequisite, timeout.
- Ledger append + dedupe.
- Daily automation audits (via related workflows).

## Highest Next Cheap Wins (open / incomplete)
1. **PR#8** — Add bounded CPU pressure probe to idle cycle (draft, Copilot). Resource-pressure attack: short CPU burn, record wall/CPU time + iterations to last_resource.json. Highest leverage remaining crack.
2. ENGINE-ATTACK-001 expansion: interruption + corrupted-evidence attacks (stubs only).
3. ENGINE-REGRESS-001 — simple baseline vs candidate comparator (not started).
4. Small hygiene PRs: #3 (Python .gitignore), #4 (README research link) — merge candidates, low risk.

## Longer / Deferred
- ENGINE-MEMORY-001 fuller searchable records.
- ENGINE-PRIORITY-001 evidence-driven queue automation.
- P1 mobile/startup/RAM probes (require private source or device evidence).
- Open issues #5 (worker probe), #6 (mobile next version).
- Older open PRs #1, #2, #7 (scaffolds / research) — review for merge or close if stale.

## Rules for this list
- Only items with evidence of incompleteness or explicit request that fell through.
- Prefer cheap, bounded, evidence-first additions.
- No over-investment; close one crack per cycle when possible.
- Idle confirmation must stay zero-input after first run.

Progress = measurable reduction in uncertainty + reusable capability. Large docs or unmerged PRs are not progress.
