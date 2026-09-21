## EXPERIMENT ID
EXP-013 — Engineering-cycle automation (DISCOVER→...→PRIORITIZE loop) built,
self-tested, and used to answer SCALE-100-001

## PROBLEM
Two separate questions, deliberately answered together rather than in
sequence: (1) can the lab's own development process — discover an unknown,
design an experiment, gate its fixtures, build it, test it, attack it,
measure it, check for regression, extract reusable infrastructure, and
recommend what's next — run as one machine-readable, schema-versioned loop
with minimal human intervention; and (2) SCALE-100-001 itself, the last
OPEN P1 unknown: does bulk-media-intake handle a 100-item batch cleanly at
2x the previously-tested max of 50.

`tools/engineering-cycle/run_cycle.cjs` answers (1) by actually running the
loop for (2) as its real test case, not a synthetic example.

## PART 1 — REUSABLE INFRASTRUCTURE
- `contracts/engineering-cycle.schema.json` — machine-readable,
  schema-versioned record of one DISCOVER→...→PRIORITIZE cycle. Separate
  from and complementary to this README: another AI session can parse
  `cycle.json` without inferring structure from prose.
- `tools/lab-harness/session.cjs` — shared Playwright+CDP session helper,
  extracted after finding 8 tools hand-rolling the same boilerplate.
  Carries forward the EXP-005 (CDP heap over `performance.memory`) and
  EXP-008 (secure-context-for-`crypto.subtle`) lessons in one place instead
  of each new tool re-discovering them. Migrated
  `tools/fixture-acceptance/validate_pair.cjs` onto it as the real second
  consumer; re-ran its full self-test (bad fixture → REJECTED, good fixture
  → ACCEPTED) after migration with identical results — zero regression,
  proof this is genuinely reusable infrastructure, not a one-off.
- `tools/engineering-cycle/run_cycle.cjs` — the orchestrator itself.
  Composes existing tools (`tools/make_synth_wavs.cjs`,
  `tools/bulk-media-intake/run_experiment.cjs`'s `runOnce`) rather than
  rebuilding them; PRIORITIZE is advisory-only by design (recommends,
  doesn't rewrite `PRIORITY_QUEUE.md` itself — see `human_interventions` in
  `cycle.json`).

## PART 2 — A REAL BUG FOUND WHILE BUILDING THE ORCHESTRATOR (kept, not
## hidden, per the "preserve failures" rule)
The orchestrator's first working draft reinvented file delivery: it base64-
encoded every fixture file and passed them all as one giant `page.evaluate()`
argument, rather than reusing `run_experiment.cjs`'s already-proven
`page.locator('#fileInput').setInputFiles()` mechanism (the same one
EXP-009's queue-scale baseline used). Running it against 100 items produced:

```
page.evaluate: Target page, context or browser has been closed
```

with zero `pageerror`/console signal — looking exactly like a genuine
scale-dependent app crash (this session's initial working hypothesis,
matching this cycle's own competing hypothesis H3). Bisection before
accepting that conclusion:

| items | ~b64 payload | result |
|---|---|---|
| 50 | ~76MB | OK |
| 65 | ~99MB | OK |
| 68 | ~104MB | OK |
| 71 | ~108MB | **instant page-closed** |
| 74, 77, 80, 90 | ~113–137MB | **instant page-closed** |

The boundary sits inside a ~4MB band (104MB OK, 108MB fails) — too tight to
be a compute/memory-pressure effect, and the failure was instantaneous, not
a slow degradation. That shape is a transport/argument-size ceiling, not an
app defect. Control test: served the same fixture files over a local HTTP
server and had the page `fetch()` them itself (same-origin, after
`page.goto()` to that server) instead of receiving them as an evaluate()
argument — 68, 77, and 97 items all completed cleanly, 0 page errors,
~1.9s for 97 items.

**Root cause confirmed, not just worked around**: `page.evaluate()`
arguments in this sandbox's Playwright/CDP transport have a hard ceiling
around 100MB. `run_experiment.cjs` was never vulnerable to this because it
never embeds file bytes in an evaluate() argument — it uses
`setInputFiles()`, which sends file paths, not content, over CDP. The fix
was to stop reinventing file delivery and reuse `run_experiment.cjs`'s
`runOnce()` directly. Recorded as a standing lesson in `EXTRACT` (see
`cycle.json`) so a future tool doesn't rediscover this the hard way:
**never embed real file content in a `page.evaluate()` argument in this
lab — use `setInputFiles()` against a real `<input type=file>`, or
same-origin `fetch()`, instead.**

## PART 3 — DELIBERATE-BREAK TEST (required before trusting the orchestrator)
Ran `run_cycle.cjs` against a copy of the repo whose `PRIORITY_QUEUE.md` no
longer contains `SCALE-100-001` (renamed to `SCALE-100-001-RENAMED`).
**Result: stopped safely** — `DISCOVER: FAILED`, `stop_reason:
STOPPED_FAILURE`, exit code 1, a schema-conformant partial `cycle.json`
written before exit (no crash, no hang, no silent exit-0).

First run of this test surfaced a real bug in the orchestrator itself:
the early-failure path left `decision: null`, which violates the schema's
own `decision` field (a required, non-nullable string enum) —
`cycle.json` would have failed validation against the very schema it's
supposed to conform to. Fixed: early DISCOVER failure now sets
`decision: 'DEFER'` (closest fit — "nothing to act on until the queue task
exists again") and appends an explicit `human_interventions` entry asking
a human to confirm whether the queue change was intentional. Re-ran the
break test after the fix: same safe `STOPPED_FAILURE` stop, now with a
fully schema-valid `cycle.json`.

## PART 4 — SCALE-100-001, the real result
With file delivery fixed, ran the actual 100-item batch (97 valid + 3
deliberately malformed: truncated, garbage bytes, empty file) via
`run_experiment.cjs`'s `runOnce(fixtureDir, 4, null)`, concurrency 4 (per
EXP-011's evidence-based recommendation).

**TEST**: 97/97 valid files passed, 3/3 malformed files correctly rejected,
no unexpected failures. `durationMs=2267`, `msPerItem=23.37` vs. the
50-item baseline's `23.76` (EXP-009) — **no regression** (ratio 0.98x,
well under the 1.5x threshold). `maxHeapMB=4.2`.

**ATTACK — MALFORMED_INPUT** (selected because it's the cheapest realistic
failure a bulk upload actually sees, and EXP-009 only tested rejection in
isolation, not mixed into a 100-item batch): **SURVIVED** — all 3 expected
failures rejected, no unexpected ones.

**ATTACK — CANCELLATION** at 2x the previously-tested scale (selected
because EXP-009 found and fixed a display bug here at 50 items — this
checks the underlying mechanism, not just the display, still cleans up
correctly at 100): cancelled 100ms into a clean 97-item run.
**SURVIVED** — 20/97 items had a result at cancellation time, `statusText`
correctly settled to "Done. 20/97 passed validation.", **0 page errors**
(no orphaned `AudioContext`/resources).

**REGRESSION**: `NO_REGRESSION` — 100-item `msPerItem` (23.37) is
statistically indistinguishable from the 50-item baseline (23.76).

## RESULT
`SCALE-100-001`: **SUPPORTED, no scale-dependent failure found** — 100-item
batches complete cleanly, per-item cost is flat vs. the 50-item baseline,
and both malformed-input rejection and mid-batch cancellation survive at
this scale. Closes the last OPEN P1 unknown.

**Engineering-cycle loop**: proven to run DISCOVER→BASELINE→REPRODUCE
(skipped, correctly-noted)→HYPOTHESIZE→DISCRIMINATE→FIXTURE_VALIDATION
(skipped, correctly-noted)→BUILD→TEST→ATTACK(x2)→MEASURE→REGRESSION→
EXTRACT→RECORD→PRIORITIZE end to end for a real queue item, producing a
schema-conformant `cycle.json` (verified against
`contracts/engineering-cycle.schema.json`, all 14 possible stages present,
zero missing/malformed required fields), and to fail safely (not silently,
not by crashing) when its input doesn't match reality.

## WHERE A HUMAN WAS STILL REQUIRED (exact, not implied)
Recorded in `cycle.json.human_interventions`, and true of this actual run:
1. **PRIORITIZE is advisory-only.** The script computed
   `next_recommended_experiment` but did not rewrite `PRIORITY_QUEUE.md` —
   this session applied that edit below, as a reviewed change, not an
   automated one.
2. **RECORD produces `cycle.json` + raw JSON evidence; this README is
   still human-written.** The orchestrator does not generate prose.
3. **The root-cause diagnosis of the base64/page.evaluate ceiling was a
   human debugging step**, not something the orchestrator itself detected
   or explained — it just crashed. The bisection, the fetch()-based control
   test, and the decision to reuse `run_experiment.cjs` instead of patching
   around the symptom were manual engineering, not automation.
4. **The deliberate-break test's fix (the `decision: null` schema bug) was
   found and fixed by a human reading the output**, not by the script
   validating itself against its own schema at runtime (it doesn't; nothing
   in this lab currently does that automatically).
5. Production integration is out of scope by construction —
   `control_mode` is always `LAB_AUTONOMOUS` here; nothing in this cycle
   touches or could touch `bad_d_meomory`.

## AUTONOMY, MEASURED NOT CLAIMED
What ran without a human in the loop, once built: BASELINE reuse, fixture
BUILD, the TEST run, both ATTACK runs, MEASURE, REGRESSION comparison,
EXTRACT, and RECORD — one `node run_cycle.cjs <repoRoot> <outDir>`
invocation covers all of that today, and did, twice (the clean run and the
break-test run). What still took a human: designing which attacks were
relevant (the script doesn't choose from the 17-type taxonomy itself — the
2 attacks here were hand-selected and hard-coded before this run, not
picked live), diagnosing the page.evaluate failure, writing this narrative,
and applying the PRIORITIZE recommendation to the queue. That is real,
counted automation of the mechanical middle of the loop — not "the loop is
autonomous," which would overclaim stages 1, 2, and the parts of 3–5 above
that were actually manual.

## FAILURES
The base64/page.evaluate ceiling (Part 2) and the `decision: null` schema
bug (Part 3) were both real defects in this session's own tooling, not in
`bulk-media-intake`. Both are kept here rather than quietly fixed and
forgotten, per the protocol's "preserve failures" rule — a future tool
embedding file content in an evaluate() argument, or a future early-exit
path leaving a required enum field null, will hit the same class of bug
without this record.

## EVIDENCE
`cycle.json` (the full machine-readable record, schema-validated),
`test_100item_results.json` (raw `runOnce()` output for the 100-item TEST
run — durations, per-file pass/fail, heap samples). The bisection and
fetch()-control-test evidence lives in this README's tables/description
above (ephemeral debug scripts in `/tmp`, not committed — the WAV fixtures
themselves are regenerated to an OS tmpdir by `run_cycle.cjs` each run, not
committed, matching EXP-009's precedent).

## PROMOTION STATUS
Engineering-cycle infrastructure (`session.cjs`, `engineering-cycle.schema.json`,
`run_cycle.cjs`): `CANDIDATE` — self-tested (deliberate break, schema
validation both before and after a real bug fix), used on one real queue
item end to end; not yet `ADAPTER-READY` since only one task shape
(a scale/attack cycle) has used it so far — a second, differently-shaped
queue item would be needed to prove the cycle record's shape generalizes,
not just this script's specific stage bodies.

SCALE-100-001: `DONE`.

## DECISION
KEEP. `PRIORITY_QUEUE.md` updated: `SCALE-100-001` → DONE.

## NEXT QUESTION
Per `cycle.json`'s `next_recommended_experiment`: `CANCEL-OBS-001` —
SCALE-100-001 closing was the last OPEN P1 unknown; of the two remaining
P2 known gaps, CANCEL-OBS-001 (give never-started cancelled items an
explicit results row) is the cheaper, more contained fix with no open
design dependency, unlike RESUME-001 which still needs a real persistence
design before it's worth building.
