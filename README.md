# BAD-D // Mobile Lab

**Public, standalone AI engineering laboratory.**

This repository exists to let an AI **build, measure, break, learn and iterate** without touching the private BAD-D production source of truth.

## 🚦 Claude entrypoint

**Start with [CLAUDE_NOW.md](CLAUDE_NOW.md).**

It is the compact current control plane. It tells Claude:
- what matters now
- what not to read
- what it may do autonomously
- execution budgets and stop rules
- evidence requirements
- how to self-test
- when to ask Daniel
- how to keep the repository's instructions current

Then read **[EXPERIMENT_PRIORITY_QUEUE.md](EXPERIMENT_PRIORITY_QUEUE.md)**.

Do **not** begin by reading the whole repository.

## Current operating model

**question → baseline → experiment → test → attack → evidence → reusable capability → next question**

The lab is deliberately being built as a **compounding AI engineering workbench**, not a pile of one-off experiments.

Every useful experiment should make future work:
- faster
- cheaper in context
- easier to verify
- safer
- more reusable
- more informative

## Hard boundary

This is **not** the BAD-D production repository.

- Never modify or overwrite production from this lab.
- Never place production secrets, credentials or private user data here.
- Never auto-promote an experiment.
- Never weaken evidence or fail-closed gates.
- Never change production version identity to label an experiment.
- Future integration must use an explicit adapter/contract.

**Standalone now. Integratable later.**

## Evidence standard

A file existing is not verification.

Runtime claims need runtime evidence.  
Performance claims need benchmark evidence.  
Mobile claims need appropriate browser/device evidence.  
Audio claims need appropriate signal/listening evidence.  
Recovery claims need interruption/recovery evidence.

When exact decoded PCM equality is the hypothesis, do not create the fixture through bit-depth conversion and then hide differences with tolerance. Investigate the fixture when the measured samples disagree.

## What the lab is building

The long-term toolbox includes:
- experiment runner
- deterministic fixtures
- benchmark/comparison tools
- startup and capability probes
- memory/resource instrumentation
- failure injection
- regression detection
- evidence validation
- searchable experiment memory
- adapter/contract validation

Build these only when a real experiment needs them.

## Deep reference — read on demand

- [CLAUDE_EXECUTIVE_BRAIN.md](CLAUDE_EXECUTIVE_BRAIN.md) — architecture and long-range reasoning
- [CLAUDE_BUILD_ORDER.md](CLAUDE_BUILD_ORDER.md) — detailed build method
- [CLAUDE_TOKEN_EFFICIENCY.md](CLAUDE_TOKEN_EFFICIENCY.md) — context/token discipline
- [GOAL_CROSSWALK.md](GOAL_CROSSWALK.md) — cross-goal leverage
- [CLAUDE_COMPLETION_STATUS_PROTOCOL.md](CLAUDE_COMPLETION_STATUS_PROTOCOL.md) — completion/evidence reporting

Historical/research documents are reference material, not startup instructions.

## Definition of progress

A large diff is not progress.

A large document is not progress.

A feature count is not progress.

**Progress is a measurable reduction in uncertainty plus reusable capability.**

The lab should leave the next AI with less to read and more it can actually do.
