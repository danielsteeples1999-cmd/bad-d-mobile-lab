# CLAUDE BUILD ORDER — DEEP REFERENCE

> Do not read this file at startup. Read CLAUDE_NOW.md first.

## 1. Enter cheaply

Read only:

1. CLAUDE_NOW.md
2. EXPERIMENT_PRIORITY_QUEUE.md
3. README.md
4. exact files needed for the active experiment

Search before reading. Prefer current code/tests/evidence over history.

## 2. Work in this order

**LOCATE → REPRODUCE → BASELINE → HYPOTHESIZE → DISCRIMINATE → BUILD → MEASURE → ATTACK → REGRESS → EXTRACT → RECORD → ADVANCE**

The goal is not merely to fix the current problem. Leave behind a reusable capability when the work reveals repeated machinery.

## 3. Choose leverage

Prefer mechanisms that affect several goals.

Examples:
- scheduler → import + UI + audio + RAM + long runs
- memory instrumentation → RAM + scope + audio + crash diagnosis
- checkpoint/recovery → import + Testing Deck + lifecycle
- benchmark/evidence → almost every future experiment
- failure injection → almost every subsystem

## 4. Build tools only when earned

A reusable tool should have:

- clear purpose
- stable input/output
- structured result
- bounded resource use
- failure states
- evidence
- tests
- reuse target
- version/schema

Preferred progression:

**experiment → probe → fixture → benchmark → attack → regression → evidence → searchable memory**

Do not build speculative frameworks or duplicate mature tooling.

## 5. Validate aggressively

Before asking Daniel to test:

**static/syntax → focused test → benchmark → edge/failure attack → regression → evidence**

If the environment cannot prove a claim, mark it unverified and ask for the smallest human/device action required.

## 6. Context economy

Do not spend context on:

- duplicated summaries
- giant historical plans
- irrelevant research
- cosmetic refactors
- speculative abstractions
- repeated manual explanations

Use direct search and focused reads for simple questions.

Use subagents only for genuinely parallel, isolated or independently verifiable work.

Use external tools/MCP/browser automation only when they materially improve the current task.

## 7. Tool quality

Prefer one core engine with separate AI and human interfaces where the same capability is useful to both.

AI-facing output should be compact, structured and machine-readable.

Human-facing output should be obvious, safe and actionable.

## 8. Failure is data

A failed experiment is useful when it narrows the hypothesis space.

Record:
- what failed
- exact conditions
- what was ruled out
- remaining uncertainty
- next discriminating experiment

Do not repeat a failed test without a changed hypothesis or new evidence.

## 9. Production boundary

This lab is isolated.

Never:
- modify production
- expose secrets/private data
- auto-promote results
- weaken evidence gates
- treat lab success as production verification

Future integration requires an explicit adapter/contract.

## 10. Completion

Use CLAUDE_COMPLETION_STATUS_PROTOCOL.md when a formal session report is needed.

Normal cycle output should remain compact:

**BUILT / TESTED / EVIDENCE / LIMITATIONS / REUSABLE CAPABILITY / QUEUE CHANGE / NEXT ACTION / HUMAN TEST**

The current queue and evidence outrank this document.
