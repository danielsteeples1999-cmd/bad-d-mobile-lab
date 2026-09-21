## EXPERIMENT ID
EXP-015 — CANCEL-OBS-001: never-started cancelled items now get a results row

## PROBLEM
EXP-009's `cancel_test3.json` found that a mid-batch cancel left 14/20
submitted items absent from the results output entirely (not shown as
"cancelled" — just missing). Cancellation itself worked correctly (no
orphaned work, resources cleaned up), the gap was purely in observability:
an item that never started never appeared in results at all.

## ROOT CAUSE
`tools/bulk-media-intake/pipeline.js`'s `runBatch()` only ever writes to
`results[idx]` and calls `onItemDone(idx, ...)` from inside
`launchNext()`'s `.finally()` callback (line ~244, pre-fix). An item whose
index was never dequeued before `cancel()` fired (because the launch loop
stops advancing once the `AbortController` signal is aborted) never runs
through `launchNext()` at all — so it never gets a `results[idx]` entry
and `onItemDone` never fires for it. `intake.html` only ever renders a
table row from `onItemDone` (`onItemDone: (idx, r) => renderRow(idx, r)`),
so that item's row is silently never created. This is a different bug
from `STATUS-DISPLAY-001` (EXP-009), which fixed the *display precedence*
for items that DID start and were cancelled mid-flight — this gap is
about items that never started at all.

## FIX
`tools/bulk-media-intake/pipeline.js`: added `makeNeverStartedResult(item,
experimentId)`, matching `processItem`'s real result schema
(`acquisitionStatus: 'cancelled'`, `validationStatus: 'cancelled'`, an
explicit `neverStarted: true` marker to distinguish this case from an
item that started and was cancelled mid-flight via `processItem`'s own
`signal.aborted` handling). Wired into `maybeFinish()`: when finishing
because of an abort, backfill `results[idx]` and fire `onItemDone(idx,
...)` for every index from `nextIndex` to `items.length - 1` — the exact
range that was silently skipped before.

## REPRODUCTION (bug confirmed real before calling it fixed)
Matched EXP-009's original `cancel_test3.json` conditions exactly (20
files, 50s duration each, concurrency=2, `cancelAfterMs=20`) via
`tools/bulk-media-intake/regression_cancel_obs.cjs` run against the
pre-fix `pipeline.js` (saved from git HEAD before this session's changes):

**Pre-fix**: `summaryRowCount: 6` of `fileCount: 20` — 14 items silently
absent, `checks.rowCountOk: false`. Same bug class as EXP-009's original
finding (exact count varies run to run with timing, as expected — the
original was 14/20 absent, this repro caught 14/20 absent too, same
number). See `pre_fix_repro_result.json`.

**Post-fix**: `summaryRowCount: 20` of `fileCount: 20`, all items
accounted for (`passedCount + cancelledCount + failedCount + warningCount
=== fileCount`), `checks.rowCountOk: true`. See `regression_result.json`.

## VERIFIED CORRECTNESS, NOT JUST COUNTS
Row counts matching isn't sufficient on its own — also confirmed the
*content* is right by calling `runBatch` directly (bypassing the DOM) and
inspecting full result objects: items that actually completed have
`neverStarted: false` and real decoded data (`hash.sha256` present);
items backfilled by the fix have `neverStarted: true`, `acquisitionStatus:
'cancelled'`, and no decoded data — the two cases are cleanly
distinguishable, not conflated.

## REGRESSION (existing evidence-backed cycles re-verified against the fix)
- **EXP-013** (`run_cycle.cjs`, 100-item batch + CANCELLATION attack):
  re-ran end to end — still `STOP_REASON: COMPLETED`, `DECISION: KEEP`,
  CANCELLATION attack still `SURVIVED`. Its own evidence text now reads
  "97 items had a result at cancellation time" (previously would have
  undercounted to just the completed subset) — a visible improvement in
  the existing cycle's own evidence, not just a non-regression.
- **EXP-014** (`run_cycle_audio_autodj.cjs`, real audio + real algorithm):
  re-ran end to end — still `STOP_REASON: COMPLETED`, `DECISION: KEEP`,
  unaffected (doesn't exercise cancellation, confirms the fix didn't touch
  unrelated code paths).

## REUSABLE INFRASTRUCTURE LEFT BEHIND
`tools/bulk-media-intake/regression_cancel_obs.cjs` — a standalone,
self-validated regression test (proven to both FAIL against the old code
and PASS against the fix, not just written and assumed correct) that any
future change to `runBatch`'s cancellation path can be checked against
directly: `node tools/bulk-media-intake/regression_cancel_obs.cjs
[fileCount] [concurrency] [cancelAfterMs]`, exits 0/1.

## RESULT
`SUPPORTED` — the fix closes the exact gap `CANCEL-OBS-001` named: every
submitted item now produces a results row regardless of cancellation
timing, verified both by row count and by content correctness, both
before/after comparison and against two independent pre-existing
evidence-backed cycles.

## FAILURES
None in the fix itself. Noted for the record: the first reproduction
attempt used light 2-second fixtures and a 50ms cancel window, which
completed the whole batch before cancellation could bite (0 items
cancelled) — had to match EXP-009's original heavier-file parameters
(50s duration, concurrency=2, cancelAfterMs=20) to reliably reproduce the
bug. Kept as a documented lesson in `regression_cancel_obs.cjs`'s own
comments rather than silently corrected.

## EVIDENCE
`pre_fix_repro_result.json` (bug reproduced against pre-fix code),
`regression_result.json` (fix verified against identical parameters),
direct `runBatch` inspection output (inline above, not saved as a
separate file — read from this README).

## PROMOTION STATUS
`tools/bulk-media-intake/regression_cancel_obs.cjs`: `CANDIDATE` — self-
validated in both directions (fails on old code, passes on fixed code);
not yet `ADAPTER-READY` since nothing else has run it yet beyond this
session.

CANCEL-OBS-001: `DONE`.

## DECISION
KEEP. `PRIORITY_QUEUE.md` updated: `CANCEL-OBS-001` → DONE.

## NEXT QUESTION
Per the current sequence (`CANCEL-OBS-001 → AUTODJ-BOUNDARY-001 → real
transition test → attack it → evidence → regression`):
`AUTODJ-BOUNDARY-001` remains `BLOCKED` on a maintainer decision (see
`adapters/AUTODJ_PRODUCTION_BOUNDARY.md`) — not resolvable by more lab
code. `RESUME-001` (P2, DEFERRED) is the only other open item, still
correctly deferred pending a real persistence design.
