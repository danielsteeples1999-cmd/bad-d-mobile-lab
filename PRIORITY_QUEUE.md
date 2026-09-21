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

Last updated: EXP-016. Engineering-cycle orchestrators exist for two real
task shapes (`tools/engineering-cycle/run_cycle.cjs` for batch/scale,
`run_cycle_audio_autodj.cjs` for real-audio/real-algorithm), sharing
`cycle-lib.cjs`; direct bug-fix and boundary-investigation tasks
(CANCEL-OBS-001, AUTODJ-BOUNDARY-001) used existing tooling plus one
focused new script each instead of a new orchestrator. PRIORITIZE is
advisory-only by design (recommends, doesn't edit this file); every queue
edit below is still a reviewed human action, not an automated one.

```
PRIORITY QUEUE
==============

P0 — BLOCKING / CRITICAL
(none open)

P1 — HIGH VALUE
[ ] AUTODJ-PLAYBACK-001 — real-device/live-playback correctness of the transition scheduler
    STATUS: BLOCKED
    WHY: UNKNOWN, not resolvable by more lab code — EXP-016 resolved the
         DECISION half of AUTODJ-BOUNDARY-001 (scoreTransition/
         previewTimingPlan, real evidence, no maintainer decision needed).
         What's left is startTransition's actual AudioContext scheduling/
         automation once a decision is made, and real-device output
         fidelity — EXP-007/008 already found a sandbox scheduling win
         didn't reproduce cleanly on Daniel's real device (unresolved
         fingerprint mismatch). A headless lab harness doesn't construct
         live playback state; this needs real-device testing (manual, as
         before) or a maintainer-defined seam, not another extraction tool.
    EVIDENCE: adapters/AUTODJ_PRODUCTION_BOUNDARY.md (items 2-4, unchanged
         since EXP-014); experiments/EXP-007,EXP-008 (the original
         sandbox-vs-real-device mismatch).
    RISK: genuinely blocked on real-device access this lab doesn't have.
    NEXT EXPERIMENT: N/A while blocked.
    EXIT CONDITION: real-device testing closes EXP-008's original mismatch,
         or a maintainer provides another testable seam.

P2 — IMPORTANT
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

[x] AUDIO-AUTODJ-001 — prove the engineering-cycle system on real audio, not just infrastructure fixtures (EXP-014)
    RESULT: PROVEN. Real decode + the REAL production computeFingerprint
         algorithm (extracted read-only from reference/, not pipeline.js's
         cheap heuristic) ran end to end on 2 real fixtures (a deterministic
         musically-structured WAV + a plain-tone control), producing real
         BPM/confidence/energy-curve output, deterministic across 2 runs
         each. Riskiest unknown (does the extracted engine even run
         headlessly) checked in isolation before building the full
         orchestrator — worked first try. 6 real attacks SURVIVED
         (STORAGE_FAILURE, MALFORMED_INPUT, EMPTY_INPUT, REPEATED_EXECUTION,
         INTERRUPTION, CORRUPTED_STATE), 2 honestly marked NOT_APPLICABLE
         with reasoning (PARTIAL_COMPLETION, MEMORY_PRESSURE — already
         covered properly in EXP-010). Deliberate-break test stopped safely
         on the first try (the EXP-013 decision:null lesson was applied
         proactively). Explicitly NOT claimed: production validation — see
         adapters/AUTODJ_PRODUCTION_BOUNDARY.md for the BLOCKED/UNVERIFIED
         boundary and a proposed (unverified, maintainer-decision-gated)
         minimal adapter contract for testing the next layer.
    EVIDENCE: experiments/EXP-014/{cycle.json,test_results.json,README.md},
         adapters/AUTODJ_PRODUCTION_BOUNDARY.md.

[x] CANCEL-OBS-001 — represent never-started cancelled items in results (EXP-015)
    RESULT: SUPPORTED. Root cause: runBatch() only wrote results[idx] and
         fired onItemDone from inside launchNext()'s .finally() -- an item
         never dequeued before cancel() fired never got either, so
         intake.html (which only renders rows from onItemDone) silently
         never created its row. Fixed: maybeFinish() now backfills a
         results[idx] entry (acquisitionStatus:'cancelled',
         neverStarted:true) and fires onItemDone for every index from
         nextIndex to items.length-1 on abort. Reproduced the original bug
         against pre-fix pipeline.js first (matching EXP-009's exact
         cancel_test3.json parameters: 20 files/50s each, concurrency=2,
         cancelAfterMs=20) -- 14/20 absent, confirmed real -- then verified
         the fix closes it (20/20 rows, correctly split
         passed/cancelled/neverStarted). Re-ran EXP-013 and EXP-014 end to
         end against the fix: both still COMPLETED/KEEP, zero regression;
         EXP-013's own CANCELLATION attack evidence improved from an
         undercount to the full 97/97 accounted for.
    EVIDENCE: experiments/EXP-015/{README.md,pre_fix_repro_result.json,regression_result.json},
         tools/bulk-media-intake/regression_cancel_obs.cjs (new, self-
         validated reusable regression test — fails on old code, passes on
         fixed code).

[x] AUTODJ-BOUNDARY-001 — define/unblock the real Auto-DJ production boundary (EXP-016)
    RESULT: RESOLVED for the decision layer. Code archaeology found
         previewTimingPlan/scoreTransition (reference/...html:8344/6757)
         already exist as a pure decision seam, documented in the
         production code's OWN comment as calling "the exact same
         estimation/decision/planning functions startTransition does...
         applies nothing, touches no audio param, fires no logEvent" — no
         maintainer decision was actually needed. Built
         tools/make_transition_debug_page.cjs (whole-page extraction, one
         verified-unique inserted export line, read-only against
         reference/) and ran a real end-to-end decision: 2 real fixtures
         -> real decode -> real computeFingerprint (108 BPM / 118 BPM,
         full 34-field fingerprints) -> real scoreTransition -> real
         previewTimingPlan, which detected an in-progress "buildup" and
         extended the crossfade to 9.9s to let it resolve. Attacked with
         5 cases: MALFORMED_INPUT/DUPLICATE_EXECUTION/INCOMPATIBLE_INPUT
         SURVIVED (valid scores); MISSING_CAPABILITY/UNEXPECTED_ORDERING
         FAILED (production code throws on a null-fingerprint or
         undefined toDeck -- a real finding, not a lab bug, recorded not
         fixed). REPEATED_EXECUTION regression check: SURVIVED
         (byte-identical output across 2 calls on identical input).
         The original planNextTransition(...) contract proposed in
         EXP-014 was superseded -- structurally wrong guess, corrected
         with the real function signatures. Real-device/live-playback
         correctness remains a SEPARATE, still-genuinely-blocked question
         -> AUTODJ-PLAYBACK-001.
    EVIDENCE: experiments/EXP-016/{README.md,transition_decision_result.json,attack_regression_result.json},
         adapters/AUTODJ_PRODUCTION_BOUNDARY.md (updated).
```
