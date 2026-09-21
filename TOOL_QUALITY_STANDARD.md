# TOOL QUALITY STANDARD

This document is the quality contract for reusable lab tools.

A tool is not infrastructure merely because it exists.

## 1. AUDIENCE

Every tool declares one:

- AI-ONLY
- HUMAN-ONLY
- DUAL-USE
- INFRASTRUCTURE

If both AI and human need the same capability, prefer:

**shared engine → AI interface + human interface**

Do not duplicate core logic.

## 2. TOOL CONTRACT

Every reusable tool defines:

- TOOL_ID
- PURPOSE
- AUDIENCE
- INPUTS
- OUTPUTS
- SIDE_EFFECTS
- RESOURCE_BUDGET
- FAILURE_MODES
- EVIDENCE
- TESTS
- REUSE_TARGETS
- VERSION/SCHEMA

## 3. AI TOOL REQUIREMENTS

AI-facing tools should prefer:

- CLI/API/programmatic use
- stable schemas
- structured output
- concise default output
- optional verbose diagnostics
- deterministic fixtures where possible
- explicit time/resource limits
- predictable exit/error states
- dry-run for risky operations
- idempotence where practical
- machine-readable evidence

Do not dump unnecessary information into the agent context.

The tool should answer the question the agent actually asked.

## 4. HUMAN TOOL REQUIREMENTS

Human-facing tools should prefer:

- one obvious job
- safe defaults
- readable status
- useful progress
- explicit stop/cancel
- clear failure explanation
- actionable next step
- visible evidence/result
- technical detail only when useful

The human should not need to understand the implementation.

## 5. ENGINE QUALITY

Every reusable tool should be:

- correct
- testable
- measurable
- bounded
- failure-aware
- resource-conscious
- reversible where practical
- safe under repetition
- evidence-producing

## 6. INTERFACE QUALITY

Every tool should make clear:

- what it does
- what it does not do
- what inputs it accepts
- what it produced
- whether it actually ran
- whether the result is verified
- what failed
- what to do next

Good explanations do not compensate for bad implementation.

Good implementation does not compensate for an unusable interface.

## 7. SELF-TEST

A reusable tool should have, where applicable:

1. happy path
2. invalid input
3. boundary/resource case
4. failure path
5. deterministic fixture
6. machine-readable result
7. human-readable result
8. regression coverage after real use

## 8. EVIDENCE LEVEL

Never report:

**implemented = verified**

Use the project's evidence/status protocol.

Runtime behavior needs runtime evidence.

Performance needs benchmark evidence.

Mobile behavior needs mobile/device evidence.

Audio behavior needs audio evidence.

Recovery behavior needs interruption/recovery evidence.

## 9. COMPOUNDING VALUE

Before promoting a one-off experiment into reusable infrastructure ask:

- Can another experiment call it?
- Can another AI session consume it cheaply?
- Can it produce structured evidence?
- Can it detect regressions?
- Does it reduce future token use?
- Can it support multiple BAD-D goals?
- Could an adapter connect it to production later?

If not, keep it experimental and small.

## 10. DEPENDENCY RULE

Prefer mature existing tools when they solve the problem well.

Current candidates for investigation:

- Playwright — browser/E2E automation, mobile emulation, tracing and AI-oriented automation.
- Vitest — JavaScript/TypeScript unit/integration testing and benchmark-adjacent workflows.

Verify versions and environment compatibility before adoption.

Do not add dependencies merely because they are popular.

Optimize for **capability density**, not dependency count.

## 11. TOOL QUALITY GATE

Before calling a tool reusable infrastructure:

**WORKS**
- implementation exists
- basic test passes

**PROVEN**
- behavior measured
- failure path tested
- evidence captured

**REUSABLE**
- stable interface
- documented contract
- machine-readable result
- another experiment can consume it

**TRUSTED**
- regression coverage
- repeated successful use
- known limitations
- resource behavior understood

Only label the appropriate level.

## 12. DESIGN TARGET

The laboratory should progressively become:

**an AI engineering workbench**

where each tool makes future AI-built software:

**faster + safer + more measurable + easier to understand + cheaper to validate.**
