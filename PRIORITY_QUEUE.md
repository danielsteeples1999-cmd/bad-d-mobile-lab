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

Last updated: EXP-012. Fixture-acceptance gate now mandatory for any
experiment whose fixtures make a *relationship* claim (content-identical,
known-different, etc.) — see `EXPERIMENT_PROTOCOL.md`.

```
PRIORITY QUEUE
==============

P0 — BLOCKING / CRITICAL
(none open)

P1 — HIGH VALUE
[ ] SCALE-100-001 — 100-item batch, untested past 50
    STATUS: OPEN
    WHY: UNKNOWN — only remaining open item once HASH-NEAR-001 closed.
         Section 15's own P2 list names 100 items as its own test point;
         EXP-009's queue-scale test stopped at 50.
    EVIDENCE: experiments/EXP-009/README.md, queue scale table.
    RISK: low-consequence relative to HASH-NEAR-001 (no sign of scale-
         dependent failure at 50, memory/concurrency already confirmed
         flat at larger heavy-workload batches in EXP-010/011) — promoted
         to P1 only because it's the last OPEN unknown, not because it's
         high-consequence. CANCEL-OBS-001/RESUME-001 remain DEFERRED
         (known gaps, not unknowns) per the selection rule.
    NEXT EXPERIMENT: 100-item batch, same measurements as the 50-item run.
    EXIT CONDITION: passes cleanly, or reveals a scale-dependent failure.

P2 — IMPORTANT
[ ] CANCEL-OBS-001 — represent never-started cancelled items in results
    STATUS: DEFERRED
    WHY: KNOWN GAP, not an unknown — cancellation itself works correctly
         (no orphaned work, resources clean up), items just don't get a
         results row if they never started.
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
```
