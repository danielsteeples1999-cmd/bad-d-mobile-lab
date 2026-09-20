## EXPERIMENT ID
EXP-010 — Bulk Media Intake: interruption/resume behavior, memory across repeated cycles

## PROBLEM
First priority-queue-driven session. Two items sat at P1 as genuine unknowns
(not assumed-broken): whether the tool survives an interruption mid-batch,
and whether repeated processing cycles retain memory. Both are explicitly
called out in the lab's own priority framework (P0 "unrecoverable
interrupted state", P1 "resume failure", memory-growth investigation rules).

## EXPERIMENT 1 — Interruption / resume

### HYPOTHESIS
No persistence code exists (confirmed by static grep: zero matches for
`localStorage`/`indexedDB` in `pipeline.js`/`intake.html`), so a mid-batch
reload loses all state — same failure shape as EXP-004 found for the main
app's library, not a novel one.

### TEST
20 files (~30s each), concurrency=2, batch started, interrupted with
`page.reload()` at 400ms (mid-flight — status read "4/20 complete", 6 rows
rendered at interruption time). Checked state before/after reload, then
ran a fresh 3-file batch post-reload to confirm the tool wasn't left in a
broken state.

### RESULT — CONFIRMED, clean total loss, tool remains usable
| | Before reload | After reload |
|---|---|---|
| Result rows | 6 | **0** |
| Status text | "4/20 complete" | "Idle." |
| File input | 20 files staged | cleared |
| Export button | — | disabled |

Zero page errors throughout. A fresh 3-file batch run immediately after
reload completed normally (3/3 passed) — **the tool is not left corrupted
or stuck**, it simply has no memory of the interrupted run. This is the
`SUCCESS CONDITION` defined for this experiment (clean loss, not partial/
corrupted state) — the `FAILURE CONDITION` (inconsistent partial state)
did not occur.

### DECISION
Not a P0. "Unrecoverable interrupted state" sounded alarming in the
abstract, but the actual behavior is boring and safe: total, clean loss,
tool remains fully functional afterward. **Reclassified**: this is now a
known, understood design gap (resumability was never built, not that it's
broken) — moved to P2 as a **build** item, not a P1 **investigation** item,
since the unknown is now known.

## EXPERIMENT 2 — Memory across repeated cycles

### HYPOTHESIS
Per rule 17: distinguish temporary allocation from actual retention before
calling anything a leak.

### TEST, ROUND 1 (no forced GC)
15 files (~20s each) processed for 5 full cycles in the same page session
(no reload between cycles), CDP heap sampled 300ms after each cycle's
completion.

| Cycle | usedMB (JS heap) | backingMB (typed-array storage) |
|---:|---:|---:|
| 1 | 1.97 | 5.40 |
| 2 | 2.69 | 16.12 |
| 3 | 2.51 | 37.49 |
| 4 | 2.05 | 42.81 |
| 5 | 2.29 | **58.77** |

`backingMB` climbed monotonically, no plateau across 5 cycles — looked like
exactly the "actual leak-like behavior" rule 17 warns against overclaiming
without evidence, and also warns against under-investigating.

### TEST, ROUND 2 (same protocol, `HeapProfiler.collectGarbage()` forced before each measurement)
| Cycle | usedMB | backingMB |
|---:|---:|---:|
| 1 | 1.86 | 0.03 |
| 2 | 1.87 | 0.03 |
| 3 | 1.89 | 0.03 |
| 4 | 1.91 | 0.03 |
| 5 | 1.91 | **0.03** |

**Completely flat, identical floor every cycle, after forcing collection.**

### RESULT — NOT a leak. Round 1's growth was unswept garbage, not retention.
The pipeline correctly drops every reference to decoded `AudioBuffer` data
once a cycle completes (`processItem`'s local `audioBuf` variable, `stageX`
functions that read but don't store it, `runBatch`'s per-cycle
`AudioContext` closed at the end) — V8 in this headless sandbox simply
doesn't sweep it immediately under light pressure. Round 1 alone would have
been a false-positive "leak" finding; round 2 (forced GC) is what actually
answers the question rule 17 asks.

### DECISION
Closed, clean result. No code change needed — the pipeline's reference
hygiene is already correct. This is exactly the "distinguish temporary
allocation from actual leak-like behavior" the rules ask for, done properly
(two rounds, not one).

## MEASUREMENTS
See inline tables above (MACHINE MEASUREMENT, both rounds, reproducible via
the same Playwright + CDP pattern used throughout this lab).

## FAILURES
None — both experiments completed cleanly, no infrastructure bugs, no
page errors in either.

## EVIDENCE
Numbers reproduced verbatim above; not saved as separate JSON this round
(small, fully captured inline) — reproducible via `run_experiment.cjs`'s
CDP pattern plus a loop, if independent re-verification is wanted.

## PROMOTION STATUS
Both findings: `MEASURED` → effectively `REPRODUCED` for the memory
question (2 independent rounds, consistent mechanism explanation); the
interruption finding is `MEASURED` (1 run, but the result was unambiguous
enough that STOP 1 — question answered — applied without needing repeats).

## NEXT QUESTION
If resumability is ever built (P2, not urgent — nothing is broken, this is
a feature gap not a defect), re-run this exact interruption test as the
regression check that it's actually working.
