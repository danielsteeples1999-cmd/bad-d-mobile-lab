# BAD-D // Mobile Lab

Public, isolated engineering laboratory for mobile experimentation around BAD-D // SIGNAL.

This repository exists so an agent can **build, measure, break, learn and iterate** without touching the production BAD-D source of truth.

## Compounding AI-build principle

This lab is also a **toolbox for AI software engineering**.

The goal is not to build isolated demos for individual bugs. When an experiment creates useful instrumentation, benchmarking, diagnostics, failure injection, regression checks, evidence tooling, codebase discovery, or adapter contracts, that capability should become reusable infrastructure for future AI work.

**Every experiment should make the next experiment cheaper, faster, safer, or more intelligent.**

Think:

**problem → measurement → tool → evidence → reusable capability → better next build**

The lab therefore optimizes for compounding capability, not repository size or feature count.

## The operating idea

**Current code → reproduce → instrument → experiment → measure → compare → record → next experiment**

The lab is deliberately structured to minimize wasted agent context.

### Start here

1. [CLAUDE_BUILD_ORDER.md](CLAUDE_BUILD_ORDER.md) — what to read and how to spend engineering effort.
2. [EXPERIMENT_PRIORITY_QUEUE.md](EXPERIMENT_PRIORITY_QUEUE.md) — current highest-value work.
3. [CLAUDE_EXECUTIVE_BRAIN.md](CLAUDE_EXECUTIVE_BRAIN.md) — compressed project reasoning and long-range intent.
4. [CLAUDE_TOKEN_EFFICIENCY.md](CLAUDE_TOKEN_EFFICIENCY.md) — context/token discipline.
5. [GOAL_CROSSWALK.md](GOAL_CROSSWALK.md) — how individual experiments connect to multiple BAD-D goals.
6. [CLAUDE_COMPLETION_STATUS_PROTOCOL.md](CLAUDE_COMPLETION_STATUS_PROTOCOL.md) — evidence-based completion reporting.

## Critical boundary

This is **not** the BAD-D production repository.

- Do not modify or overwrite production from here.
- Do not assume production access.
- Do not put secrets, credentials, private user data or production-only information here.
- Do not change production version identity to label experiments.
- Do not automatically promote experiments.
- Preserve fail-closed behavior and evidence gates.
- Experiments must remain reversible or clearly disposable.

## What Claude should optimize for

Not repository size.

Not documentation volume.

Not feature count.

Optimize for:

**useful engineering per token + useful evidence per test minute + reusable knowledge per experiment**

When a small experiment can answer a large architectural question, do it first.

## Main research areas

- startup reliability
- RAM pressure and object lifetime
- bulk-import scheduling
- adaptive workload governors
- cooperative yielding
- persistent scope-buffer strategies
- audio continuity under load
- checkpoint/recovery
- browser/mobile capability detection
- device-local diagnostics
- Testing Deck evidence integrity
- regression/soak/failure-injection testing
- music-analysis evidence
- transition and journey experiments
- future adapter contracts

## Standalone-tool principle

Tools should be independently runnable and measurable.

Later they may connect to BAD-D through a small adapter/contract rather than sharing production internals.

**Standalone now. Integratable later.**

## Evidence rule

A file existing is not verification.

Runtime claims require runtime evidence.
Performance claims require benchmark evidence.
Mobile claims require mobile/device evidence.
Audio claims require audio evidence.
Recovery claims require interruption/recovery evidence.

Use the completion protocol.

## Workflow

**Observe → reproduce → hypothesize → discriminate → change → test → compare → record → keep/revert → advance.**

Failed experiments are useful if they make the next decision smarter.

## Long-term architecture

Keep the experimental BUILD side powerful.

Keep the eventual PLAY / SET / GO path predictable, low-latency, evidence-backed and fail-closed.

The lab exists to make the future system smarter without making the live DJ experience more fragile.
