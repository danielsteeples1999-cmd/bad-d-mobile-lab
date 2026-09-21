# Experiment Protocol

## Fixture Acceptance Gate

A fixture is not accepted merely because it exists, loads, or produces a
result. It must first prove it represents the condition the experiment
claims to test.

**Rule:** before an experiment interprets its primary result (PASS/FAIL/
SUPPORTED/UNSUPPORTED/REGRESSION/IMPROVEMENT), any fixture whose *claimed
relationship* to another fixture matters (e.g. "these two are the same
content, different bytes") must pass through
[`tools/fixture-acceptance/`](tools/fixture-acceptance/) first.

A rejected fixture means **"EXPERIMENT INVALID — FIXTURE REJECTED,"** never
"the system under test failed." Keep those two outcomes visibly separate —
see `experiments/EXP-012` for a worked example.

### What the gate checks
IDENTITY, INTENDED_CONDITION, CONTROLLED_DIFFERENCE, UNINTENDED_DIFFERENCES,
VALIDITY, CONTENT_VERIFICATION, BYTE_REPRESENTATION_VERIFICATION,
BASELINE_FINGERPRINT, REPEATABILITY, NO_SILENT_MUTATION. Output matches
[`contracts/fixture-acceptance.schema.json`](contracts/fixture-acceptance.schema.json).
Status is exactly one of `FIXTURE_ACCEPTED`, `FIXTURE_REJECTED`,
`FIXTURE_ACCEPTANCE_UNKNOWN`.

### Using it
```
node tools/fixture-acceptance/validate_pair.cjs <fileA> <fileB> <outJson> \
  --id=<fixture_set_id> --version=<v> --intended="<what this claims>" \
  --method="<exact generation method>" --tool=<generator script>
```
Exits 0 on `FIXTURE_ACCEPTED`, non-zero otherwise. Don't proceed to
interpret the downstream experiment on a non-zero exit.

V1 supports one relationship shape: a **content-identical, byte-different
pair** (e.g. same audio, different container/metadata). Extend
`tools/fixture-acceptance/validator.js` with a sibling function for other
relationship shapes as they come up — don't fork a new one-off checker per
experiment.

### Self-test requirement
Before trusting the validator for a real experiment, prove it actually
discriminates: run it against a deliberately bad fixture (confirm
`FIXTURE_REJECTED`) and a genuinely good one (confirm `FIXTURE_ACCEPTED`).
`tools/fixture-acceptance/make_near_duplicate_fixture.cjs` generates both
kinds (`good`/`bad` modes) for exactly this purpose.

### Critical audio fixture rule
**Do not assume a bit-depth change preserves decoded audio identity.**
Converting e.g. 24-bit PCM to 16-bit re-quantizes every sample — decoded
output will differ from the original by real, non-zero amounts, not just
container bytes. A fixture claiming "content-identical" must never rest on
that assumption; it must independently prove decoded-sample equality
(`CONTENT_VERIFICATION`, `maxAbsDiff` at or below the experiment's declared
tolerance — `0` unless a tolerance is explicitly justified and stated).
If a bit-depth (or any lossy) change turns out to produce non-zero
`maxAbsDiff`, that fixture is `FIXTURE_REJECTED` for a same-content claim —
don't loosen the tolerance to make it pass. Recreate it as a genuinely
harmless representation difference instead (container/header/metadata that
doesn't touch the `data` chunk's bytes — e.g. an inserted `LIST`/`INFO`
chunk, differing chunk order, padding), the way `good_fixture_manifest.json`
in `experiments/EXP-012` does. Reserve lossy/bit-depth comparisons for a
fixture set that honestly declares itself a *tolerance-based* near-duplicate
claim, not a same-content one.

### Secondary fixture rule
If a fixture passes acceptance but the experiment's result is unexpected,
do not modify the fixture to make the result look cleaner. Preserve it.
Investigate whether the hypothesis was wrong, the implementation behaves
differently than expected, the fixture boundary was misunderstood, or an
unintended variable exists.

## Real-file delivery in Playwright tests
Never embed real file content (base64 or otherwise) in a `page.evaluate()`
argument in this lab. `page.evaluate()`/CDP argument payloads have a hard
ceiling around 100MB in this sandbox — EXP-013 bisected it precisely:
68 items (~104MB of base64) succeeded, 71 items (~108MB) failed instantly
with `page.evaluate: Target page, context or browser has been closed` and
zero `pageerror`/console signal. That failure shape (a tight few-MB
boundary, instant failure, no error signal) looks exactly like a genuine
app-level scale failure if you don't isolate it — EXP-013's first working
hypothesis was wrong for exactly that reason, until bisection plus a
`fetch()`-based control test (serve fixtures over local HTTP, have the
page `fetch()` them itself after `page.goto()` to that server) proved the
same batch completes cleanly once file content isn't forced through an
evaluate() argument.

Use one of these instead, in order of preference:
- `page.locator(...).setInputFiles(paths)` against a real
  `<input type=file>` — sends file paths over CDP, not content
  (`tools/bulk-media-intake/run_experiment.cjs`'s `runOnce()` does this;
  reuse it rather than rebuilding file delivery for a new tool).
- Same-origin `fetch()` from inside the page, after navigating to a local
  HTTP server that serves the fixture directory.
