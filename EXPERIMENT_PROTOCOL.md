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

### Secondary fixture rule
If a fixture passes acceptance but the experiment's result is unexpected,
do not modify the fixture to make the result look cleaner. Preserve it.
Investigate whether the hypothesis was wrong, the implementation behaves
differently than expected, the fixture boundary was misunderstood, or an
unintended variable exists.
