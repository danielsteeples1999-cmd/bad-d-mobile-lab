# Priority Queue — the lab's control system

This is not a backlog. It selects what happens next. Reconstructed at the
start of every session from actual experiment records (`experiments/EXP-*`),
never from generic assumptions. See `experiments/EXP-009`, `EXP-010`, `EXP-011`
for the evidence behind every item below.

Format, states, selection rule, and integrity-check procedure follow the
executable-priority-queue convention: every item states STATUS, WHY,
EVIDENCE, RISK, NEXT EXPERIMENT/ACTION, EXIT CONDITION. `KNOWN GAP` = behavior
understood, functionality missing. `UNKNOWN` = evidence doesn't answer the
question yet. `FAILURE` = doesn't meet an established requirement.
`PROMISING — INSUFFICIENT REPLICATION` = observed once, not reproduced.
`REPRODUCED` = repeated evidence agrees.

Last updated: EXP-013. Engineering-cycle orchestrator (`tools/engineering-
cycle/run_cycle.cjs`) now exists — PRIORITIZE stage is advisory-only by
design (recommends, doesn't edit this file); every queue edit below is
still a reviewed human action, not an automated one.

```
PRIORITY QUEUE
==============

P0 — BLOCKING / CRITICAL
(none open)

P1 — HIGH VALUE
(none open — SCALE-100-001 closed in EXP-013, see DONE)

P2 — IMPORTANT
[ ] CANCEL-OBS-001 — represent never-started cancelled items in results
    STATUS: OPEN
    WHY: KNOWN GAP, promoted from DEFERRED — EXP-013's engineering-cycle
         orchestrator recommended this as the next item: SCALE-100-001
         closing leaves this as the cheaper, more contained of the two
         remaining known gaps, with no open design dependency (unlike
         RESUME-001, which needs a real persistence design first).
         Cancellation itself already works correctly (no orphaned work,
         resources clean up) — items just don't get a results row if they
         never started.
    EVIDENCE: experiments/EXP-009/cancel_test3.json — 14/20 submitted items
         absent from output after a mid-batch cancel.
    NEXT ACTION: give never-started items an explicit row/status instead of
         silent absence.
    EXIT CONDITION: submitted count always equals displayed row count,
         regardless of cancellation timing.

[ ] RESUME-001 — bulk-media-intake has no resumability
    STATUS: DEFERRED
    WHY: KNOWN GAP — EXP-010 confirmed clean total loss on reload (no
         corruption, tool remains usable), just no persistence exists.
         Not urgent: nothing unsafe today, batches just restart from zero.
    EVIDENCE: experiments/EXP-010/README.md, Experiment 1.
    NEXT ACTION: none planned — would need a real design (what persists,
         where, how resume reconciles with in-flight cancellation) before
         this is worth building; deferred until something makes it urgent.
    EXIT CONDITION: N/A while deferred.

P3 — OPTIMISATION
(none justified — no measured bottleneck to optimise against)

P4 — EXPLORATORY
[ ] AUDIO-INT-001 — processing while audio plays back
    STATUS: BLOCKED
    WHY: bulk-media-intake has no playback feature to interfere with yet
         (unlike the main app, already covered by EXP-006/EXP-007).
    POTENTIAL VALUE: low until/unless the tool gains playback.
    COST: would require building playback first — out of scope for an
         investigation session.

DONE
[x] AC-CLOSE-001 — AudioContext double-close bug (EXP-009)
    RESULT: fixed, guarded with a `finished` flag + state check.
    EVIDENCE: experiments/EXP-009/README.md, Failures.

[x] STATUS-DISPLAY-001 — cancelled items showed as "pending" (EXP-009)
    RESULT: fixed — acquisitionStatus now takes precedence over the
         truthy-string-default validationStatus for cancelled/failed items.
    EVIDENCE: experiments/EXP-009/README.md, cancellation section.

[x] QUEUE-SCALE-001, CONC-LIGHT-001, DUP-BYTE-001, MALFORMED-001 (EXP-009)
    RESULT: queue scale 1/10/50 clean; light-workload concurrency sweep
         correctly labeled inconclusive (too fast to measure); exact
         duplicate detection confirmed content-hash-based; malformed/
         truncated input correctly rejected without crashing.
    EVIDENCE: experiments/EXP-009/*.json.

[x] INTERRUPT-001 — interruption/resume behavior (EXP-010)
    RESULT: RESOLVED. Clean total loss on reload, zero corruption, tool
         fully usable immediately after. Not a P0. → became RESUME-001
         (P2, deferred) once the unknown became a known gap.
    EVIDENCE: experiments/EXP-010/README.md, Experiment 1.

[x] MEM-CYCLE-001 — memory across 5 repeated processing cycles (EXP-010)
    RESULT: RESOLVED, in two rounds. Round 1 (no forced GC) looked like
         growth (backing storage 5.4MB→58.8MB, no plateau) — would have
         been a false-positive leak finding. Round 2 (HeapProfiler.
         collectGarbage() forced before each measurement) showed a flat
         0.03MB floor every cycle. NOT a leak — unswept garbage, not
         retention. No code change needed.
    EVIDENCE: experiments/EXP-010/README.md, Experiment 2.

[x] CONC-REPRO-001 — concurrency sweep replication, 2x/4x/8x × 3 runs each (EXP-011)
    RESULT: 2x→4x REPRODUCED (consistent ranking across all 3 runs each,
         though the margin is thin — 6ms between closest pair). 4x→8x
         CONFIRMED flat (overlapping ranges, no consistent ranking). New
         finding replication alone revealed: concurrency also reduces
         run-to-run variance (2x stdev 225.7ms vs 4x/8x ~25-39ms) — not
         visible at n=1. Recommendation: default concurrency 4.
    EVIDENCE: experiments/EXP-011/*.json (9 runs).

[x] FIXTURE-GATE-001 — build + self-test the fixture acceptance gate (EXP-012)
    RESULT: Built reusable infrastructure (contracts/fixture-acceptance.schema.json,
         tools/fixture-acceptance/{validator.js, validate_pair.cjs,
         make_near_duplicate_fixture.cjs}, EXPERIMENT_PROTOCOL.md). Self-
         tested both directions before trusting it: a deliberately invalid
         fixture (two genuinely different tones mislabeled as identical)
         → correctly FIXTURE_REJECTED (CONTENT_VERIFICATION failed,
         maxAbsDiff=0.40 detected). A genuine near-duplicate (identical
         data chunk, container-level LIST/INFO chunk difference) → correctly
         FIXTURE_ACCEPTED, all 10 criteria PASS including NO_SILENT_MUTATION.
    EVIDENCE: experiments/EXP-012/{bad_result,good_result}.json.

[x] HASH-NEAR-001 — test audioContentHash against a real near-duplicate (EXP-012)
    RESULT: SUPPORTED, gated on FIXTURE-GATE-001's acceptance passing first
         (not interpreted before that). sha256 differed
         (a9509ee2… vs 8835989b…), audioContentHash matched (7f1fd44e both)
         — the hash correctly ignores a container-only difference. Narrow
         claim: container-difference case only; lossy/resampled near-
         duplicates remain untested (no MP3/AAC tooling in this sandbox,
         same gap as EXP-002/005/008).
    EVIDENCE: experiments/EXP-012/hash_near_001_pipeline_result.json.

[x] SCALE-100-001 — 100-item batch, untested past 50 (EXP-013)
    RESULT: SUPPORTED, no scale-dependent failure. 97/97 valid files
         passed, 3/3 malformed correctly rejected, msPerItem 23.37 vs.
         50-item baseline 23.76 (no regression). MALFORMED_INPUT and
         CANCELLATION attacks both SURVIVED at 100-item scale (0 page
         errors on cancellation, no orphaned resources). Built and proved
         the engineering-cycle orchestrator (tools/engineering-cycle/
         run_cycle.cjs) as this answer's mechanism — see EXP-013 for the
         full loop record, a real bug the orchestrator's own first draft
         hit and fixed (a page.evaluate()/CDP argument-size ceiling around
         ~100MB, initially misread as a scale-dependent app failure until
         bisection + a fetch()-based control test discriminated the two),
         and a deliberate-break test proving the orchestrator fails safely
         on bad input.
    EVIDENCE: experiments/EXP-013/{cycle.json,test_100item_results.json,README.md}.
```
