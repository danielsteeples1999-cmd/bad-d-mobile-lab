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
| [EXP-002](EXP-002/README.md) | Does the library bulk-import path (`#fileLib` → `processLibraryQueue`) survive a batch well past the reported 18–27 track crash point, under a constrained heap proxy? | 45/45 committed, flat heap, no crash | Passed — but see caveats on synthetic-file realism |
| [EXP-003](EXP-003/README.md) | Does the Testing Deck autonomous pipeline (`#testingFiles` → `runAutoPipelineQueue`) process tracks correctly? | **No — 100% of tracks fail immediately** with `ReferenceError: computeFingerprint is not defined` | Confirmed broken; root cause identified |
| [graveyard/EXP-000](graveyard/EXP-000-heap-pressure-asymmetry.md) | Is the Testing Deck's missing heap-pressure cooldown (vs. library intake's `yieldForMemoryPressure`) the main crash mechanism? | Superseded — pipeline never gets far enough to hit memory pressure | Retired, worth reopening after EXP-003's bug is fixed |

## Reusable tools (see `../tools/`)

- `startup_probe.cjs` — headless mobile-emulated load, captures console/page errors, timing, heap.
- `make_synth_wavs.cjs` — generates N small valid decodable WAV files with distinct sizes (avoids dedupe collapse).
- `bulk_import_stress.cjs` — drives `#fileLib` with N files, polls `window.library.length` + heap, optional `BADD_HEAP_MB` constraint.
- `testing_deck_stress.cjs` — drives `#testingFiles` (Testing Deck autonomous pipeline) the same way, polls the optimizer readout element.
