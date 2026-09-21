## EXPERIMENT ID
EXP-012 — Fixture Acceptance Gate (reusable infrastructure) + gated HASH-NEAR-001

## PROBLEM
HASH-NEAR-001 asks whether `audioContentHash` correctly matches content-
identical, byte-different files. That question is only answerable if the
"near-duplicate" fixture genuinely IS content-identical and byte-different
— a claim that was never independently verified for any fixture in this
lab before now. This record builds the general mechanism first, proves the
mechanism itself works, then uses it to answer HASH-NEAR-001 — in that
order, not the reverse.

## PART 1 — REUSABLE INFRASTRUCTURE
- `contracts/fixture-acceptance.schema.json` — the acceptance report contract.
- `tools/fixture-acceptance/validator.js` — browser-loadable core
  (`validateContentIdenticalPair`, `reverifyNoMutation`), Web Crypto +
  Web Audio, not tied to HASH-NEAR-001 specifically.
- `tools/fixture-acceptance/validate_pair.cjs` — Playwright CLI wrapper.
  Also performs the `NO_SILENT_MUTATION` re-check (re-hashes both files
  immediately after the primary pass, compares to the baseline fingerprint
  taken moments earlier).
- `tools/fixture-acceptance/make_near_duplicate_fixture.cjs` — generates
  both a genuine `good` fixture pair and a deliberately invalid `bad` one,
  for the validator's own self-test.
- `EXPERIMENT_PROTOCOL.md` — the durable rule: no experiment interprets its
  primary result until its fixtures clear this gate. `FIXTURE_REJECTED`
  means the experiment is invalid, not that the system under test failed.

## PART 2 — VALIDATOR SELF-TEST (required before trusting it on anything real)

### Bad fixture (deliberately invalid, used only to test rejection)
Two WAV files, genuinely different content (330Hz vs. 550Hz sine tones),
mislabeled as if they were a near-duplicate pair.

**Result: `FIXTURE_REJECTED`.** `CONTENT_VERIFICATION` correctly failed —
`maxAbsDiff=0.3999694883823395 at sample index 1`. Every other criterion
(IDENTITY, BASELINE_FINGERPRINT, BYTE_REPRESENTATION_VERIFICATION,
VALIDITY, UNINTENDED_DIFFERENCES) still ran and passed correctly — only the
one criterion that should fail, failed. See `bad_result.json`.

### Good fixture (genuine near-duplicate)
Two WAV files sharing an **identical `data` chunk** (same 330Hz tone), with
file B carrying an inserted `LIST`/`INFO` container chunk (simulating a
re-save by different software) — a real container-level difference that
must not affect decoded content.

**Result: `FIXTURE_ACCEPTED`.** All 10 criteria PASS, including
`CONTENT_VERIFICATION` ("decoded PCM bit-exact identical across 352,800
samples", `maxAbsDiff: 0`), `BYTE_REPRESENTATION_VERIFICATION` (distinct
SHA-256: `a9509ee2…` vs `8835989b…`), and `NO_SILENT_MUTATION` (re-hash
immediately after matched the baseline for both files). See
`good_result.json`.

**Validator self-test passed both directions** — it discriminates, not
just runs.

## PART 3 — HASH-NEAR-001, gated interpretation

Fixture acceptance status for this pair: **`FIXTURE_ACCEPTED`** (Part 2,
`good_result.json`). Only now is the primary question licensed to be
interpreted.

Ran the ACCEPTED fixture pair through the real `bulk-media-intake` pipeline
(`window.BADD_BULK_INTAKE.runBatch`, unmodified):

| File | sha256 | audioContentHash |
|---|---|---|
| `near_dup_A_plain.wav` | `a9509ee2…` | `7f1fd44e` |
| `near_dup_B_with_list_chunk.wav` | `8835989b…` | `7f1fd44e` |

**`sha256` differs. `audioContentHash` is identical.** Both files passed
validation (duration 8.0s, 44100Hz, mono — matching for both, as expected).

## RESULT
`SUPPORTED` — `audioContentHash` correctly catches this near-duplicate
case: same audio content, different container, matching hash. Not overclaimed
as "robust near-duplicate detection" in general — EXP-009 already
documented this hash as a cheap heuristic, untested against resampling,
pitch shift, or lossy re-encoding artifacts. This experiment closes exactly
one specific, previously-unverified claim: container-only differences don't
break it. Lossy/compressed near-duplicates remain untested (same MP3/AAC
tooling gap noted since EXP-002/005/008).

## FAILURES
None in this session's own infrastructure. The validator's rejection of
the bad fixture was the intended, successful outcome of that sub-test, not
a failure.

## SECONDARY FIXTURE RULE — applied
The result was the expected one (hash matched), so no temptation to modify
the fixture arose. Recorded here anyway per the protocol, so the discipline
is visible even when it wasn't needed this time.

## EVIDENCE
`bad_result.json`, `good_result.json` (validator self-test, both
directions, MACHINE MEASUREMENT), `bad_fixture_manifest.json`/
`good_fixture_manifest.json` (generation provenance), `hash_near_001_pipeline_result.json`
(the gated experiment's actual output).

## PROMOTION STATUS
Fixture-acceptance infrastructure: `CANDIDATE` — self-tested in both
directions, reusable, documented; not yet `ADAPTER-READY`/`HUMAN ACCEPTED`
since no other experiment has used it yet. HASH-NEAR-001: `MEASURED`,
single fixture pair — the claim is narrow (container-difference case only)
and doesn't need replication the way a timing measurement would; a
different near-duplicate *kind* (bit-depth, resampling) would be a new
experiment, not a repeat of this one.

## DECISION
KEEP both the infrastructure and the HASH-NEAR-001 result. `PRIORITY_QUEUE.md`
updated: `HASH-NEAR-001` → DONE.

## NEXT QUESTION
Extend `validator.js` with a tolerance-based relationship (bit-depth /
resampling near-duplicates, where decoded samples won't be bit-exact but
should be close) the next time a near-duplicate claim of that shape is
needed — don't build it speculatively now.
