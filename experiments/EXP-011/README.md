## EXPERIMENT ID
EXP-011 — CONC-REPRO-001: concurrency sweep replication

## PROBLEM
EXP-009's concurrency conclusion ("optimal range 2–4×, flat by 8×") rested
on n=1 per data point — `PRIORITY_QUEUE.md` correctly flagged this as
`PROMISING — INSUFFICIENT REPLICATION`, not settled evidence. This is that
replication.

## HYPOTHESIS
The 2×→4× speedup and the 4×→8× plateau both reproduce under repeated runs.

## TEST
Same heavy workload as EXP-009 (20 files, ~50s each, 85MB), same
`run_experiment.cjs` harness. Concurrency 2, 4, 8 — each run **3 times**
(matching the queue's exact `NEXT EXPERIMENT` spec), sequentially, fresh
browser per run.

## RESULT

| Concurrency | Run 1 | Run 2 | Run 3 | Mean | Stdev |
|---:|---:|---:|---:|---:|---:|
| 2× | 2046ms | 1710ms | 1617ms | **1791.0ms** | 225.7 |
| 4× | 1611ms | 1536ms | 1592ms | **1579.7ms** | 39.0 |
| 8× | 1577ms | 1529ms | 1537ms | **1547.7ms** | 25.7 |

All 9 runs: 20/20 passed, 0 failed, 0 console/page errors. Heap stayed flat
(3.7–4.1MB) at every concurrency level, all 9 runs — no memory-pressure
signal from concurrency itself, consistent with EXP-010.

### 2× vs 4×: REPRODUCED, but the margin is thin
Every single 2× run (2046, 1710, 1617) was slower than every single 4× run
(1611, 1536, 1592) — a clean, **consistent ranking across all 3 runs**, the
exact bar the queue entry's exit condition set. But the closest pair (2×'s
best: 1617ms vs 4×'s worst: 1611ms) differ by only 6ms — the separation is
real but not wide. **Reported honestly at its actual margin, not rounded
up to a bigger effect than it is.**

### 4× vs 8×: CONFIRMED flat — ranges overlap, no consistent ranking
4× range [1536, 1611] and 8× range [1529, 1577] overlap substantially (4×'s
own minimum, 1536, sits inside 8×'s range). No consistent ordering between
the two. EXP-009's "flat by 8×" finding **reproduces cleanly** — this one
wasn't even close to ambiguous.

### New finding EXP-009 couldn't see with n=1: concurrency reduces variance, not just improves throughput
2×'s stdev (225.7ms, 12.6% of its mean) is **roughly 6–9× larger** than
4×'s (39.0ms, 2.5%) or 8×'s (25.7ms, 1.7%). This wasn't visible in EXP-009's
single-run numbers at all — it only shows up with replication. Practical
reading: 4× isn't just "as fast as 2× plus a bit" — it's also **far more
predictable** run to run, which matters as much as raw throughput for a
tool a person will actually wait on.

## MEASUREMENTS
All 9 raw JSON files in this folder (MACHINE MEASUREMENT).

## FAILURES
None — infrastructure ran cleanly across all 9 runs.

## REGRESSIONS
N/A — confirms EXP-009, refines it with variance data EXP-009 didn't have.

## DECISION
CONC-REPRO-001 exit condition met: **trend reproduced** (2×→4× consistent
ranking, thin margin, stated honestly) **and separately confirmed flat**
(4×→8×, clean overlap). `PROMISING — INSUFFICIENT REPLICATION` →
`REPRODUCED`. Practical recommendation for this workload shape: **default
concurrency 4** — not meaningfully slower than 8×, meaningfully faster and
far more consistent than 2×.

## NEXT QUESTION
The variance-reduction finding is itself new and only n=3 per point — worth
a mental note if concurrency is revisited, but not queueing a dedicated
follow-up on its own; it fell out of this experiment rather than being the
question asked, and isn't currently blocking any decision.
