# BAD-D // Mobile Lab

Isolated public-facing sandbox for mobile experimentation around BAD-D // SIGNAL.

## Purpose
This repository is a disposable laboratory for mobile-only experiments, diagnostics, performance work, browser compatibility tests, and prototype fixes.

## Safety boundary
- Do NOT treat this repository as the BAD-D source of truth.
- Do NOT modify or overwrite the main `bad_d_meomory` repository from this lab.
- Do NOT change BAD-D version numbers merely to identify experiments.
- Experiments must be reversible and clearly labeled.
- Preserve fail-closed behavior and evidence gates when testing ideas that may later return to BAD-D.
- No automatic promotion from this lab into production.
- Claude/other agents may experiment here without being given permission to rewrite the main repository.

## Mobile-first targets
Priorities include:
1. Startup reliability.
2. RAM pressure and crash/chopping behavior.
3. Adaptive workload governors.
4. Persistent checkpoints and interrupted-run recovery.
5. Audio playback stability.
6. Browser/mobile API compatibility.
7. Device-local diagnostic evidence.

## Workflow
Observe -> reproduce -> instrument -> change one thing -> test -> record evidence -> compare -> keep/revert.

Every experiment should state:
- problem reproduced
- hypothesis
- change made
- device/browser context
- measured result
- regressions
- next experiment

## Promotion rule
Nothing in this repository is a production change until separately reviewed against the main BAD-D repository and deliberately promoted.

## Current state (2026-09-20)

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
  forensics.
- `tools/bulk-media-intake/` — standalone media ingestion lab tool (queue,
  hashing/dedup, decode validation, cancellation), scoped to local files and
  authorized direct URLs only — see its own `SECURITY.md` note on why
  platform-specific downloading (e.g. YouTube) is intentionally out of scope.
- `contracts/` — JSON schemas for cross-tool result formats
  (`media-result.schema.json`).
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
