# CLAUDE TOKEN EFFICIENCY CONTRACT

## Mission

Spend Claude's context on **engineering decisions, code, experiments and evidence**, not on repeatedly discovering what the project is.

## Before reading

Do not ingest the entire repository.

Use:
- targeted search
- exact file reads
- function-level inspection
- small fixtures
- existing instrumentation

Read broad documents only when the current problem genuinely depends on them.

## Context hierarchy

### Tier 1 — must know
- current failure
- current code path
- current test/harness
- current baseline
- current priority item

### Tier 2 — useful when relevant
- related prior experiments
- architecture contracts
- research evidence
- regression history

### Tier 3 — read only if needed
- broad future maps
- long historical plans
- unrelated creative research
- duplicated documentation

Never spend context on Tier 3 before exhausting Tier 1.

## Search before read

Find the symbol, event, error, state or path first.

Then read the smallest surrounding range needed to understand it.

## Reuse

If a measurement, fixture or harness already exists, reuse it.

Do not build a second version because the first is inconvenient.

## Code before prose

When the hypothesis is testable, build the smallest test.

A tested 50-line experiment is worth more than 500 lines of speculative explanation.

## Batch compatible work

When several hypotheses can use one harness, implement the harness once and compare variants.

## Stop wasting cycles

Stop an experiment early when:
- the hypothesis is falsified
- the mechanism is clearly irrelevant
- evidence is saturated
- resource cost exceeds information value
- the test is duplicating an existing result

Record why.

## Preserve uncertainty

Use:
- CONFIRMED
- STRONGLY SUPPORTED
- PLAUSIBLE
- UNKNOWN
- FALSIFIED

Do not inflate confidence because code looks clean.

## Token-saving handoff

At the end of each session provide only:
1. what changed
2. what was actually tested
3. what the evidence says
4. what remains unknown
5. the single next experiment
6. one human action if required

## High-value question

Before starting work ask internally:

**"What is the cheapest experiment that could eliminate the most uncertainty?"**

Then do that.

## No busywork

Do not:
- rename things for aesthetics
- rewrite working code without evidence
- generate duplicate docs
- create empty architecture folders
- polish prose before behavior is tested
- read every historical document
- search the web without a concrete unknown
- make claims from intuition alone

The repository should become smarter after every session, not merely larger.
