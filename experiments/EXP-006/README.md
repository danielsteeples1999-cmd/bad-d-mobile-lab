## EXPERIMENT ID
EXP-006 — Does bulk import block the main thread severely enough to threaten audio scheduling?

## PROBLEM
Every prior experiment in this lab (EXP-001–005) tested crashes, memory, and
recovery — none touched "audio chopping/dropouts," one of the core problem
categories this lab exists for and the one category with zero prior evidence
either way. `CLAUDE_MOBILE_LAB.md`/`RESEARCH_EVIDENCE.md` both flag
main-thread blocking and GC pressure as classic causes of audio glitches in
Web Audio apps. Static reading of `bad_d_meomory`'s build found several
`setInterval`-driven scheduler "tick" loops (100ms/150ms/500ms intervals)
that only fire as promptly as the main thread allows — a plausible, testable
mechanism connecting the already-known "bulk import is heavy" finding to a
brand-new question: heavy enough to threaten anything time-sensitive?

## HYPOTHESIS
H1: Bulk library import (five-scan preparation per track, JS-only, no
worker/thread offload observed in prior reads) causes measurable main-thread
"long tasks" (>50ms, the standard jank threshold), at a rate and duration
large enough to plausibly interfere with 100–500ms-interval scheduler ticks
running concurrently, INCLUDING the app's own dropout-evidence monitor
(found by exact string match: a 100ms tick tagged `'dropout candidate only'`
at `BAD-D_SIGNAL_15_72_0-mobile.html` ~line 12117).

## BASELINE
No prior main-thread timing measurement of any kind existed in this lab.
This experiment establishes it, with its own internal control (idle phase).

## CHANGE
One variable: main thread doing nothing (idle) vs. main thread running a
real bulk import (`#fileLib`, 20 tracks × 60s synthetic audio), same page,
same `PerformanceObserver`, no reload between phases.

## TEST
`tools/mainthread_jank_probe.cjs`: loaded the reference build, installed a
`PerformanceObserver({entryTypes:['longtask']})` immediately after load,
recorded a 5-second idle baseline, then submitted 20 synthetic WAV files to
`#fileLib` and kept recording until `window.library.length` stabilized.

## RESULT
Clean, decisive contrast between the two phases:

- **Idle phase (5000ms):** 0 long tasks, 0ms blocked. Confirms the
  instrument itself is quiet at rest — the import-phase numbers aren't
  measurement noise.
- **Import phase (19,659ms wall-clock for 20 tracks):** **20 long tasks
  totaling 14,063ms of main-thread blocking — 71.5% of the entire import
  window spent in single uninterrupted tasks over 50ms.** Longest single
  task: **863ms**. Nine of the twenty tasks exceeded 700ms.

## MEASUREMENTS (MACHINE MEASUREMENT — see `jank_20tracks.json`)
- `idlePhase`: count 0, totalBlockedMs 0, maxTaskMs 0 (over 5000ms)
- `importPhase`: count 20, totalBlockedMs 14063, maxTaskMs 863, durationMs 19659
- Top task durations (ms): 863, 828, 826, 809, 803, 751, 749, 742, 728, 718 — i.e. roughly one long task per track, each corresponding to that track's five-scan preparation running synchronously.
- 0 console errors, 0 page errors during the run.

## WHAT THIS DOES AND DOES NOT SHOW
**Shows:** main-thread blocking during bulk import is severe and consistent
— not a rare spike, but the dominant use of the main thread for the entire
operation (71.5% blocked). An 863ms block is roughly 50x the standard 16ms
frame budget and roughly 9x the app's own 100ms dropout-monitor tick
interval — meaning that monitor could not run at all for most of a second,
once per imported track.

**Does NOT show:** that a user actually heard a glitch, or that any specific
crossfade/transition fired late. I confirmed the 100ms-tick loop is
literally tagged as dropout-evidence monitoring (`'dropout candidate only'`
in its own event metadata) by reading its surrounding code, but I did not
trace and confirm that the *primary* crossfade-scheduling mechanism
(`.start(bStartAt, ...)` calls found elsewhere in the build) is similarly
vulnerable — that would need further static tracing or a live A/B listening
test, neither done this session. Marked `DONE — NOT YET VERIFIED` for the
"this causes audible chopping" claim specifically.

## FAILURES
None in execution. The "failure" this experiment surfaces is in the
production app's concurrency model, not in this lab's tooling.

## REGRESSIONS
N/A — first measurement of this mechanism.

## EVIDENCE
`jank_20tracks.json` (MACHINE MEASUREMENT).

## DECISION
**INVESTIGATE.** This is a real, quantified, previously-unknown risk
mechanism, distinct from EXP-001–005's crash/memory findings, and it
directly explains *why* the app might need to move five-scan preparation
off the main thread (e.g. a Web Worker) even in scenarios where memory and
crash-safety are otherwise fine — a finding EXP-002/EXP-005 could not have
surfaced since they only checked completion and heap, never timing.

## NEXT QUESTION
Trace whether the deck crossfade's actual `.start(bStartAt, ...)` scheduling
path (not the dropout monitor, not the style-journey tick) is called
reactively (vulnerable to exactly this kind of main-thread delay) or
pre-scheduled far enough ahead of `AudioContext.currentTime` to absorb an
~860ms block. This is a static-reading question answerable without a
device — natural next step before any device test, since it would tell us
whether this mechanism can *possibly* cause an audible gap at all, versus
being safely absorbed by lookahead scheduling.
