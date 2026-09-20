# Experiment log

Every substantial experiment gets a folder `EXP-NNN` containing a `README.md`
(the permanent record, in the format below) plus raw JSON evidence from the
diagnostic tools in `../tools/`. Falsified or superseded hypotheses move to
`graveyard/` instead of being deleted, so they aren't re-investigated blind.

## Record format

```
EXPERIMENT ID
PROBLEM
HYPOTHESIS
BASELINE
CHANGE
TEST
RESULT
MEASUREMENTS
FAILURES
REGRESSIONS
EVIDENCE
DECISION
NEXT QUESTION
```

## Evidence kind, always labeled

- **MACHINE MEASUREMENT** — captured by a tool, reproducible, in the JSON.
- **MODEL INTERPRETATION** — my reading of what a measurement implies.
- **HUMAN OBSERVATION** — a person watched/heard something (none yet; this lab
  has no human tester in the loop this session).
- **UNKNOWN** — genuinely not established. Valid, not a placeholder to fill in later.

## Index

| ID | Question | Result | Status |
|---|---|---|---|
| [EXP-001](EXP-001/README.md) | Does the mobile build start cleanly (no ReferenceError/syntax failure) under headless mobile emulation? | Clean start, no errors | Confirmed |
| [EXP-002](EXP-002/README.md) | Does the library bulk-import path (`#fileLib` → `processLibraryQueue`) survive a batch well past the reported 18–27 track crash point, under a constrained heap proxy? | 45/45 committed, no crash. Heap-flat claim **retracted** — see EXP-005 | Completion confirmed; memory claim corrected |
| [EXP-003](EXP-003/README.md) | Does the Testing Deck autonomous pipeline (`#testingFiles` → `runAutoPipelineQueue`) process tracks correctly? | **No — 100% of tracks fail immediately** with `ReferenceError: computeFingerprint is not defined`. Manual DIAGNOSE button independently confirmed to hit the same bug. | Confirmed broken; root cause identified |
| [EXP-004](EXP-004/README.md) | Does the library bulk-import path survive a page reload mid-batch ("refresh" crash-safety requirement)? | **No** — `library.length` resets to 0; fingerprint cache (`cacheStore`) does survive and avoids re-analysis on resubmit | Confirmed: compute evidence survives, session/UI state does not |
| [EXP-005](EXP-005/README.md) | Does a heavier batch (50×75s) finally show real heap growth/cooldown — **and is `performance.memory` even trustworthy as an instrument?** | `performance.memory` found **frozen** (160MB test alloc didn't move it) — a documented Chrome anti-fingerprinting behavior, not a sandbox bug. Re-run with validated CDP `Runtime.getHeapUsage()`: real, bounded, non-monotonic memory (8.8–82.7MB), no crash. **New hypothesis raised:** the app's own `yieldForMemoryPressure` governor reads this same frozen-prone API. | Instrument fixed; new production hypothesis open |
| [graveyard/EXP-000](graveyard/EXP-000-heap-pressure-asymmetry.md) | Is the Testing Deck's missing heap-pressure cooldown (vs. library intake's `yieldForMemoryPressure`) the main crash mechanism? | Superseded — pipeline never gets far enough to hit memory pressure | Retired, worth reopening after EXP-003's bug is fixed |

## Reusable tools (see `../tools/`)

- `startup_probe.cjs` — headless mobile-emulated load, captures console/page errors, timing, heap.
- `make_synth_wavs.cjs` — generates N small valid decodable WAV files with distinct sizes (avoids dedupe collapse).
- `bulk_import_stress.cjs` — drives `#fileLib` with N files, polls `window.library.length` + real CDP-based heap (fixed in EXP-005 — `performance.memory` is unreliable in this sandbox), optional `BADD_HEAP_MB` constraint.
- `testing_deck_stress.cjs` — drives `#testingFiles` (Testing Deck autonomous pipeline) the same way, polls the optimizer readout element. **Still uses `performance.memory` — not yet fixed to CDP; treat its heap numbers as uninformative until updated.**
- `reload_recovery_probe.cjs` — imports a batch, reloads mid-batch, checks whether library state and/or the fingerprint cache survive.
