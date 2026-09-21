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

## Promotion rule
Nothing in this repository is a production change until separately reviewed against the main BAD-D repository and deliberately promoted.

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

## Current state (2026-09-21)

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full intended shape,
[`SECURITY.md`](SECURITY.md) for what never gets committed here, and
[`PROMOTION_GATE.md`](PROMOTION_GATE.md) for how a tool moves from
experimental to (eventually, human-accepted) usable by BAD-D.

- `reference/` — read-only snapshot of the production mobile build
  (`bad_d_meomory` @ `8faf0b44c`), pulled in solely so this lab has something
  concrete to instrument. Never edited in place.
- `tools/*.cjs` — reusable diagnostic harnesses (Playwright-based) against
  that reference build: startup smoke test, synthetic-WAV generator,
  bulk-import stress tests, CPU profiling, checkpoint-based correctness
  forensics, and (`tools/engineering-cycle/`) a schema-versioned
  DISCOVER→...→PRIORITIZE cycle runner.
- `tools/bulk-media-intake/` — standalone media ingestion lab tool (queue,
  hashing/dedup, decode validation, cancellation), scoped to local files and
  authorized direct URLs only — see its own `SECURITY.md` note on why
  platform-specific downloading (e.g. YouTube) is intentionally out of scope.
- `tools/lab-harness/`, `tools/fixture-acceptance/` — shared Playwright/CDP
  session helper and the fixture-acceptance gate (content-identical-pair
  claims must pass this before an experiment interprets them).
- `contracts/` — JSON schemas for cross-tool result formats
  (`media-result.schema.json`, `fixture-acceptance.schema.json`,
  `engineering-cycle.schema.json`).
- `adapters/` — explicit BLOCKED/UNVERIFIED boundary docs for what this lab
  cannot verify without production-side access or real-device testing.
- `experiments/` — the permanent experiment log. Start at
  [`experiments/README.md`](experiments/README.md).

**Headline finding so far:** the Testing Deck's autonomous pipeline
(`#testingFiles` → `runAutoPipelineQueue`) fails on every track with
`ReferenceError: computeFingerprint is not defined` — a scope-export bug
between two sibling IIFEs in the production build, not a memory or
crash-hardening problem. See
[`experiments/EXP-003`](experiments/EXP-003/README.md) for the full
root-cause writeup and evidence. This cannot be fixed from this lab (no
write access to `bad_d_meomory`); it needs to be handed to whoever owns that
repo.

## Definition of progress

A large diff is not progress.

A large document is not progress.

A feature count is not progress.

**Progress is a measurable reduction in uncertainty plus reusable capability.**

The lab should leave the next AI with less to read and more it can actually do.
>>>>>>> origin/main
