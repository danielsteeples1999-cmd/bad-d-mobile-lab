# GAPS AND STATUS TRACKER — 2026-11-13

**Purpose**: Compact living list of missing/incomplete items, stalled small jobs that fell through cracks, potential ratings, and recommended low-investment next steps. Updated by AI sessions; keep it short so it does not become another long document.

## Current bottleneck
Main branch is still knowledge-system heavy. Executable instrumentation (P0 engine items) has not landed. Several safe, tiny PRs and documented probes remain open since October.

## Potential ratings (existing good work)
- GRID-METER / Intelligence Grid research + experiments (open PR #2): **8/10**. Strong synthetic evidence, documented failures, reusable direction. Needs merge decision + real-track listening + mobile constraints.
- Control-plane docs (CLAUDE_NOW, queue, completion protocol, past-work review): **7/10**. High leverage for autonomous AIs; diminishing returns until tools exist. CLAUDE_NOW last refreshed Sep 21.
- Mobile-next packet (issue #6 / PR #7): **9/10 process correctness**. Correctly refuses to pretend public lab is the next app. Blocked on authorized private source.

## Stalled / missing / incomplete (long-dated requests that slipped)
| ID / Item | Status | Age | Potential | Pros if done | Cons / cost | Recommended action |
|-----------|--------|-----|-----------|--------------|-------------|--------------------|
| PR #3 Python .gitignore | OPEN | Oct 5 | 6/10 hygiene | Prevents accidental commits | Near-zero | Merge or close |
| PR #4 README entrypoint link | OPEN | Oct 5 | 5/10 | Slightly better discoverability | Near-zero | Merge |
| Issue #5 LAB-001 zero-context probe | OPEN | Oct 6 | 7/10 | Evidence of entrypoint efficiency | Needs a worker run | Run once and record |
| Issue #6 / PR #7 Mobile next version | OPEN / PLANNED | Oct 16 | 9/10 | Real user-visible progress | Requires private workspace | Keep blocked; do cheapest baseline when access available |
| ENGINE-CYCLE-001 runner | NOT STARTED | Queue P0 | 9/10 | Enables all later experiments | Small stub is enough | Minimal cycle.json recorder |
| ENGINE-MEMORY / status ledger | NOT STARTED | Queue P0 | 8/10 | Future sessions read less | Start with one file | Compact records |
| Attack harness + regression comparator | NOT STARTED | Queue P0 | 8/10 | Fail-closed evidence | Can be stubs | After cycle runner |
| Startup / memory / recovery probes | Documented only | Past-work list | 8/10 | Directly useful for mobile | Need fixtures | Convert one at a time |
| Queue maintenance & control-plane freshness | Stale | Ongoing | 7/10 | Keeps AI focused | Low | This file + CLAUDE_NOW refresh |
| Idle / confirmation-does-nothing rule | Missing | New | 7/10 | Prevents speculative work when human is idle | None | Added below |

## Idle / automation confirmation rule (copy human when human does nothing)
If the human has made no new requests, commits, or explicit “go” since the last cycle, the next AI session must:
1. Confirm status only (read this file + queue + latest experiment record).
2. Do nothing speculative.
3. Copy the “do nothing” behavior — no new features, no large docs, no reordering without new evidence.
4. Report only: current bottleneck, any newly available evidence, and the single highest-value next action *if* the human later says go.

This prevents human-weirdness drift and keeps automation confirmation cheap.

## Recommended low-investment cross-board actions (this cycle)
1. Refresh CLAUDE_NOW.md date and add one-paragraph bottleneck.
2. Land this tracker.
3. Merge or explicitly close the two tiny safe PRs.
4. Next session (when human says go): implement a 20-line ENGINE-CYCLE stub that can record one existing experiment.

## Evidence / proof standard reminder
File existence ≠ verification. This tracker is documentation. Runtime claims still need runtime evidence. No production access from this public lab.

Last updated: 2026-11-13 by automated status pass.