# BAD-D Mobile Lab — Architecture

This is a **public** experimental repository. It is not BAD-D production
(`bad_d_meomory`, private) and never contains production source, credentials,
or private data. See `SECURITY.md`.

## Purpose

A laboratory of standalone, mobile-first tools that investigate hard
engineering problems (memory, audio timing, concurrency, ingestion,
recovery) with real measurements, independent of whether BAD-D ever
connects to any of it. Evidence and reusable components should be able to
reach BAD-D later through explicit adapters — the lab never talks to BAD-D
internals directly.

## Layout

```
README.md, ARCHITECTURE.md (this file), SECURITY.md, PROMOTION_GATE.md,
  EXPERIMENT_PROTOCOL.md, PRIORITY_QUEUE.md
experiments/     — EXP-NNN records: OBSERVE -> HYPOTHESIZE -> MEASURE -> ... -> DOCUMENT
tools/           — two kinds of thing, both real, kept distinct:
  *.cjs            standalone Playwright-driven diagnostic scripts against a
                    reference BAD-D build snapshot (existing, EXP-001..008)
  <name>/           self-contained sub-lab tools with their own runnable
                    artifact + pipeline module (e.g. bulk-media-intake/,
                    fixture-acceptance/)
reference/       — read-only BAD-D build snapshot used by the *.cjs diagnostics
contracts/       — JSON schemas for cross-tool result formats
adapters/        — documented, currently-unimplemented seams toward BAD-D
```

`PRIORITY_QUEUE.md` is the live control system — what to work on next,
reconstructed from real experiment evidence, not a static backlog.
`EXPERIMENT_PROTOCOL.md` holds cross-cutting methodology rules (currently:
the Fixture Acceptance Gate, `tools/fixture-acceptance/` — no experiment
interprets its primary result until its fixtures prove they represent the
condition claimed).

`benchmarks/`, `results/`, and per-topic sub-labs beyond `bulk-media-intake`
(ram-governor, audio-lab, timing-lab, crash-recovery, browser-lifecycle,
scope-performance, startup-diagnostics) are **planned, not yet built** —
listed here so the intended shape is visible, not scaffolded as empty
directories. Each gets built the same way `bulk-media-intake` was: smallest
working vertical slice first, real measurements before more surface area.

## Promotion states

```
EXPERIMENTAL -> MEASURED -> REPRODUCED -> CANDIDATE -> ADAPTER-READY -> HUMAN ACCEPTED
```

Never `EXPERIMENTAL -> PRODUCTION` silently. See `PROMOTION_GATE.md`.

## Why a tool lives here and not in BAD-D

Every tool must be independently useful and independently runnable, with a
narrow `INPUT -> EXECUTE -> MEASURE -> RESULT` interface, even if BAD-D
never imports anything from this repo.
