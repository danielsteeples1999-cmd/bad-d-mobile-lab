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
| [EXP-006](EXP-006/README.md) | Does bulk import block the main thread severely enough to threaten time-sensitive audio scheduling (first test of the "chopping/dropouts" category — untouched by EXP-001–005)? | **Yes, severely** — 71.5% of a 20-track import's wall-clock time (14,063ms of 19,659ms) was spent in single main-thread tasks >50ms, up to 863ms long. Confirmed this would starve the app's own 100ms dropout-evidence monitor. Whether the actual crossfade scheduler is equally vulnerable is `DONE — NOT YET VERIFIED`. | New risk mechanism found; root scheduling path not yet traced |
| [EXP-007](EXP-007/README.md) | Is the real deck scheduler (not the dropout monitor) actually vulnerable to EXP-006's blocking? What exactly is inside the 700–980ms blocks? Does a minimal fix help? | **CASE B confirmed by tracing the code**: the crossfade fires via a reactive `setTimeout`, with only an 80ms safety margin against a measured 863–982ms worst-case block. CPU-profiled the exact bottleneck: `fft`+`simpleFFTMag`+`computeFingerprint` = ~69% of import wall-clock, a single synchronous ~2584-frame STFT loop with zero yields. Built and A/B tested a minimal yield-every-32-frames fix in an isolated lab copy (production untouched): fingerprints identical (correctness proven), long-task blocking cut 96% (13,647ms→544ms), max block cut 84% (982ms→155ms), at a 9% wall-clock cost. Shipped a standalone real-device test artifact to Daniel. **Real-device run reproduced the scheduling win (94.9s→15.2s blocked) but reported a fingerprint MISMATCH** — see EXP-008. | Scheduling win reproduced on real hardware; correctness NOT validated — do not treat as KEEP yet |
| [EXP-008](EXP-008/README.md) | Forensic investigation of EXP-007's real-device mismatch: where, exactly, do baseline and experiment diverge? | Built checkpoint-instrumented engine variants and ran 8 targeted tests (decode determinism, stereo/`mixDown`, 5-file sequential batch through one shared engine, true concurrent execution, same-file-concurrent-twice, all yield frequencies 8–128). **Every test matched — could not reproduce the mismatch in this sandbox.** Real device profile recorded (Android 15, P9 Pro 5G, T8300, 4GB+4GB). Most likely remaining explanation: ARM-vs-x86 transcendental function (`Math.cos`/`Math.sin`) non-portability — `NOT YET VERIFIED`, not confirmed. Blocked on: no MP3/AAC encoder in this sandbox, so lossy/compressed decode (what Daniel almost certainly tested with) was never exercised here. Fixed a real latent harness bug regardless (name-based matching could misreport a decode failure as a content mismatch) and added tab-backgrounding detection. Shipped `DANIEL_TEST_forensics-v2.html` with per-file, per-checkpoint divergence localization for the next round. | Root cause not established; awaiting next real-device run with localized diagnostics |
| [EXP-009](EXP-009/README.md) | First vertical slice of the new Bulk Media Intake lab (`tools/bulk-media-intake/`, local-file/authorized-URL only — no platform scraping): does queue+concurrency+dedup+cancellation actually work? | Queue scale (1/10/50) clean. Concurrency sweep on a heavy workload found a real optimal range (2–4×, ~28% faster than serial, flat by 8). Duplicate detection correctly keys off content hash, not filename. Malformed/truncated input correctly rejected without crashing. **Found and fixed two real bugs via testing**: a double-`AudioContext.close()` page error, and cancelled items displaying as "pending" instead of "cancelled". | `MEASURED` — see EXP-009 for promotion-state detail |
| [graveyard/EXP-000](graveyard/EXP-000-heap-pressure-asymmetry.md) | Is the Testing Deck's missing heap-pressure cooldown (vs. library intake's `yieldForMemoryPressure`) the main crash mechanism? | Superseded — pipeline never gets far enough to hit memory pressure | Retired, worth reopening after EXP-003's bug is fixed |

## Reusable tools (see `../tools/`)

- `startup_probe.cjs` — headless mobile-emulated load, captures console/page errors, timing, heap.
- `make_synth_wavs.cjs` — generates N small valid decodable WAV files with distinct sizes (avoids dedupe collapse).
- `bulk_import_stress.cjs` — drives `#fileLib` with N files, polls `window.library.length` + real CDP-based heap (fixed in EXP-005 — `performance.memory` is unreliable in this sandbox), optional `BADD_HEAP_MB` constraint.
- `testing_deck_stress.cjs` — drives `#testingFiles` (Testing Deck autonomous pipeline) the same way, polls the optimizer readout element. **Still uses `performance.memory` — not yet fixed to CDP; treat its heap numbers as uninformative until updated.**
- `reload_recovery_probe.cjs` — imports a batch, reloads mid-batch, checks whether library state and/or the fingerprint cache survive.
- `cpu_profile_import.cjs` — CDP `Profiler`-based self-time breakdown by function during a bulk import, no source edits needed.
- `make_checkpoint_engines.cjs` — extracts the FFT/fingerprint engine and produces checkpoint-instrumented baseline/experiment/N-frequency variants for stage-by-stage correctness forensics (used by EXP-008).
- `mainthread_jank_probe.cjs` — installs a `PerformanceObserver` longtask collector, measures idle vs. during-import main-thread blocking.
- `cpu_profile_import.cjs` — CDP `Profiler`-based self-time breakdown by function during a bulk import, no source edits needed.

## Experimental lab builds (see `EXP-007/`)

- `lab-yield-patch.html` — full reference build with the minimal yield fix applied (2 real code changes + await propagation to 3 call sites). Production `bad_d_meomory` untouched.
- `DANIEL_TEST_scheduler-lab.html` — standalone real-device test artifact (sent directly in chat), extracts just the self-contained FFT engine in baseline and patched form, runs the same A/B live in the browser, includes a "play while testing" audio-glitch listening test.
