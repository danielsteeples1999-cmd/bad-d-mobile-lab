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

Last updated: EXP-011.

```
PRIORITY QUEUE
==============

P0 — BLOCKING / CRITICAL
(none open)

P1 — HIGH VALUE
[ ] HASH-NEAR-001 — test audioContentHash against a real near-duplicate
    STATUS: OPEN
    WHY: UNKNOWN + real consequence if wrong — only exact-byte duplicates
         were tested (EXP-009); the hash's entire purpose (catching same
         audio content saved with a different container/bit-depth) is
         unverified. If it doesn't work, near-duplicates silently pass
         through as distinct items — a real data-quality gap, not cosmetic.
         Promoted from P2: cheapest remaining unknown with the highest
         consequence-if-wrong, per the selection rule (UNKNOWN + HIGH
         CONSEQUENCE + CHEAP TEST over SCALE-100-001's KNOWN-shape/lower-
         information incremental scale bump).
    EVIDENCE: experiments/EXP-009/README.md NEXT QUESTION #4.
    RISK: dedup silently fails for re-encoded duplicates in real usage.
    NEXT EXPERIMENT: same synthetic audio content re-saved at a different
         bit depth/header (two files, byte-different, content-identical),
         check whether audioContentHash still matches while sha256 differs.
    EXIT CONDITION: matches (works as designed) or doesn't (needs fixing).

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

[ ] SCALE-100-001 — 100-item batch, untested past 50
    STATUS: OPEN
    WHY: UNKNOWN — section 15's own P2 list names 100 items as its own
         test point; EXP-009's queue-scale test stopped at 50.
    EVIDENCE: experiments/EXP-009/README.md, queue scale table.
    NEXT ACTION: 100-item batch, same measurements as the 50-item run.
    EXIT CONDITION: passes cleanly, or reveals a scale-dependent failure.

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
```
