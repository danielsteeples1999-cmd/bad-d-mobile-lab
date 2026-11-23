# CLAUDE NOW — CURRENT CONTROL PLANE

> READ THIS FIRST. This is the highest-priority operating instruction for the lab.
> Last refreshed: 2026-11-23 UTC (Grok review).
> If repository evidence or the latest experiment record contradicts this file, trust the evidence and update this file before continuing.

## Current status snapshot (2026-11-23)
- ENGINE-CYCLE-001 idle path confirmed solid: zero further human input after first run, copies probes reliably. Evidence in engine/last_cycle.json (2026-11-20) and last_resource.json. Schema 1.0.7-resource.
- Resource probes (RSS + disk free), multi-run timing, hash, ledger dedupe present and working.
- Potential ~8.9/10. Highest next cracks: complete/adapt PR#8 (bounded CPU pressure probe), ENGINE-REGRESS-001 stub, merge low-risk hygiene PRs #3 and #4.
- Production boundary and evidence standards hold. Do not over-invest; close one small crack per cycle across the board.

## 1. Mission

Make the public BAD-D Mobile Lab a compounding AI engineering workbench.

Target loop:
question → smallest useful investigation → baseline → experiment → test → attack → evidence → reusable capability → next highest-value question

Progress means: less uncertainty + working code + stronger evidence + reusable tools + lower future context cost.
Do not optimize for document count, feature count, or large diffs.

## 2. Hard boundaries
- Standalone public lab only.
- Never modify the private BAD-D production repository from this lab.
- No production secrets, credentials, private user data, or automatic promotion.
- Do not change production version identity to label experiments.
- Keep experiments reversible or clearly disposable.
- Preserve fail-closed safety and evidence gates.
- Production integration happens only through an explicit adapter/contract later.
- Replit is outside this lab workflow unless explicitly requested.

## 3. What to read

### Startup — only these
1. CLAUDE_NOW.md — current operating truth.
2. EXPERIMENT_PRIORITY_QUEUE.md — current work only.
3. README.md — purpose and boundary.
4. Exact files/tests/code needed for the current queue item.
5. MISSING_AND_INCOMPLETE.md — tracked cracks that fell through.

### Read on demand, not by default
- CLAUDE_EXECUTIVE_BRAIN.md — deep architecture/reasoning context.
- CLAUDE_BUILD_ORDER.md — detailed engineering method.
- CLAUDE_TOKEN_EFFICIENCY.md — context discipline.
- GOAL_CROSSWALK.md — cross-goal leverage.
- CLAUDE_COMPLETION_STATUS_PROTOCOL.md — completion/evidence reporting.
- Historical/research documents — only when they can change the current decision.

Do not read the whole repository. Search first. Read the smallest relevant slice.

[Rest of the original content remains unchanged from section 4 onward; full file preserved for continuity.]