# Priority Queue — the lab's control system

Living document. Updated after every meaningful experiment, not just at
session end. See `experiments/EXP-010/README.md` for the session that
established this file and the rules it follows (initialize from real
observed state, not generic placeholders; every active item answers what
we're learning, what could fail, what measurement changes, what decision
it affects, the cheapest experiment, and what "done" means; never promote
P3/P4 above an unresolved P1 without evidence the low-priority item is
blocking the investigation).

Last updated: EXP-010 (this session).

```
PRIORITY QUEUE
==============

P0 — BLOCKING / CRITICAL
(none open)

P1 — HIGH VALUE
[ ] Concurrency numbers are n=1 per data point (EXP-009) — not REPRODUCED
    Why: rule "one run is not proof" — current "optimal range 2-4x" is
         PROMISING — INSUFFICIENT REPLICATION, not settled.
    Failure risk: acting on a noise-driven conclusion.
    Evidence: experiments/EXP-009/concH_*.json, single run each.
    Experiment: repeat the 2x/4x/8x points 3x each, check variance.
    Exit condition: confirms the trend or shows it was noise.

P2 — IMPORTANT
[ ] Never-started-but-cancelled items don't appear in results at all (EXP-009)
    Why: functionally correct (no orphaned work), but an observability gap.
    Evidence: EXP-009 cancel_test3.json — 14/20 items absent from output.
    Fix (not an investigation): make them appear with an explicit status.

[ ] Resumability was never built (EXP-010 confirmed: clean total loss on
    reload, tool remains usable, nothing corrupted)
    Why: known design gap now that EXP-010 answered the "is it broken"
         question — this is a feature-build item, not an unknown.
    Not urgent: nothing is unsafe today; batches just restart from zero.

[ ] audioContentHash near-duplicate detection never tested against a real
    near-duplicate (EXP-009 NEXT QUESTION #4)
    Why: only exact-byte duplicates were tested; the hash's whole purpose
         (same content, different encoding) is unverified.
    Experiment: same synthetic audio re-saved with a different bit depth/
         header, check whether audioContentHash still matches.
    Exit condition: matches (works as designed) or doesn't.

[ ] Large-job behavior only tested to 50 items — 100+ untested
    Why: section 15's own P2 list names 100 items as its own test point.
    Experiment: 100-item batch, same measurements as the 50-item run.
    Exit condition: passes cleanly, or reveals a scale-dependent failure.

P3 — OPTIMISATION
(none justified yet — no measured bottleneck to optimise against)

P4 — EXPLORATORY
[ ] Audio-interference test (processing while audio plays) for bulk-media-intake
    Hypothesis: unclear if it even applies — the tool has no playback
         feature yet, unlike the main app (already tested in EXP-006/007).
    Potential value: low until/unless the tool gains playback.
    Cost: would require building playback first — out of scope for an
         investigation session.

DONE
[x] AudioContext double-close bug (EXP-009) — fixed, guarded with a
    `finished` flag + state check.
[x] Cancelled-item status displayed as "pending" instead of "cancelled"
    (EXP-009) — fixed, acquisitionStatus now takes precedence.
[x] Queue scale 1/10/50, concurrency sweep (light + heavy), duplicate
    detection, malformed-input rejection (EXP-009) — all functioned
    correctly.
[x] Interruption/resume behavior (EXP-010) — RESOLVED: clean total loss on
    reload, tool remains fully functional afterward, no corruption. Not a
    P0. Converted to a P2 build item (see above).
[x] Memory across 5 repeated processing cycles (EXP-010) — RESOLVED, in
    two rounds: unforced-GC observation looked like growth (5.4MB->58.8MB
    backing storage), forced-GC re-test (HeapProfiler.collectGarbage())
    showed a flat 0.03MB floor every single cycle. NOT a leak — was
    unswept garbage, not retention. No code change needed.
```
