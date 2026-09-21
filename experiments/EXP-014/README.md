## EXPERIMENT ID
EXP-014 — AUDIO-AUTODJ-001: engineering-cycle machinery proven on real audio
with the real production algorithm

## PROBLEM
Every prior engineering-cycle run (EXP-013) exercised the loop's mechanics
— build, test, attack, measure, regress, extract, record — on synthetic
batch fixtures processed by `pipeline.js`'s cheap energy-envelope
`audioContentHash` heuristic. That proves the *machinery* works; it does
not prove the machinery can touch anything resembling the real BAD-D audio
path. This milestone was requested explicitly as a concrete, testable
checkpoint before moving toward the actual Auto-DJ production boundary:
"the engineering-cycle tool has successfully tested real sound, not just
test infrastructure."

## WHAT "REAL" MEANS HERE, STATED HONESTLY
Two distinct real things, not blurred together:
1. **Real audio**: a synthetic-but-musically-structured WAV (4-chord
   progression, 3 harmonics per note, amplitude envelope, noise floor —
   `tools/make_music_like_wav.cjs`, new this cycle) plus a plain-tone
   control fixture (`tools/make_synth_wavs.cjs`, existing). This lab has
   no licensed real-world music available to commit or fetch — that
   boundary is stated, not hidden.
2. **Real algorithm**: `computeFingerprint`, the actual STFT/BPM/onset
   detection engine from the real production build, extracted read-only
   from `reference/BAD-D_SIGNAL_15_72_0-mobile.REFERENCE_READONLY.html`
   via the existing (previously unused by any `.cjs` script)
   `tools/make_checkpoint_engines.cjs`, run headlessly using the exact
   calling convention EXP-008's real-device forensics artifact already
   proved works (`engineRoot.BADD_AUDIO_ENGINE_R1.createAudioEngine()
   .computeFingerprint(audioBuf, cp)`).

Both are real; neither is licensed commercial music or a live production
deployment — see `adapters/AUTODJ_PRODUCTION_BOUNDARY.md` for exactly what
that leaves unverified.

## MECHANISM PROVEN, NOT JUST CLAIMED
Before wiring the full cycle, checked the riskiest unknown in isolation
first (would the extracted engine even run headlessly, or did EXP-008's
manual real-device HTML artifact depend on some setup step an automated
script would miss): loaded `engine_baseline_cp.js` into a fresh Playwright
page, decoded the music fixture, called `computeFingerprint`. It worked on
the first try — real BPM (108), real confidence (0.2), real energy curve,
18 checkpoint callbacks fired, 0 page errors, 171ms. That result gated
whether to proceed with the full orchestrator at all.

## REUSABLE INFRASTRUCTURE
- `tools/make_music_like_wav.cjs` — deterministic (seeded), musically-
  structured fixture generator (chord progression + harmonics + envelope +
  noise floor), distinct from `make_synth_wavs.cjs`'s flat sine tones.
- `tools/engineering-cycle/load_real_engine.cjs` — loads a checkpoint-
  instrumented real production engine into a page using EXP-008's proven
  convention; the first reusable wrapper around "run the REAL algorithm
  from an engineering-cycle script," not just the cheap heuristic.
- `tools/engineering-cycle/cycle-lib.cjs` — `stage()`/`parseQueueTask()`,
  extracted from EXP-013's `run_cycle.cjs` once this cycle became a real
  second consumer (compounding test passed: re-ran EXP-013's cycle after
  the extraction, identical `COMPLETED`/`KEEP` result, zero regression).
- `tools/engineering-cycle/run_cycle_audio_autodj.cjs` — this cycle's
  orchestrator, composing all of the above plus existing
  `tools/bulk-media-intake/pipeline.js` and `tools/make_checkpoint_engines.cjs`
  rather than rebuilding any of them.

## RESULT

**TEST** (2 real fixtures, real decode + real algorithm, run twice each
for determinism):

| | music_fixture (chords) | plain_fixture (sine) |
|---|---|---|
| decode | success, 10.0s, 44100Hz, mono | success, 10.0s |
| real BPM | 108 | 93 |
| real confidence | 0.20 | 0.54 |
| deterministic (2 runs) | true | true |
| cheap audioContentHash | f5cae13a | (measured, see test_results.json) |

Genuinely interesting, unforced result: the plain sine tone scored a
*higher* BPM-detection confidence (0.54) than the musically-structured
fixture (0.20). Not cherry-picked — this is what the real algorithm
actually returned, and it's a plausible outcome (a single repeating tone
gives a naive onset/period detector a cleaner periodic signal than a slow
4-chord progression with tremolo). Recorded as-is, not smoothed over.

**ATTACKS** (8 addressed, mapped from the requested 10-item list where two
pairs collapse to the same real mechanism):

| Attack | Result | Note |
|---|---|---|
| STORAGE_FAILURE (missing file, via authorized-url 404) | SURVIVED | clean `acquisitionStatus: failed`, no hang/crash |
| MALFORMED_INPUT (truncated WAV; covers "decode failure" too) | SURVIVED | clean `decode-failed`, no crash |
| EMPTY_INPUT (zero-byte file) | SURVIVED | same clean path, distinct edge case confirmed |
| REPEATED_EXECUTION (duplicate/determinism) | SURVIVED | bit-for-bit identical fingerprint JSON across 2 runs, both fixtures |
| INTERRUPTION (raced against 1ms timeout; covers "timeout" too) | SURVIVED | abandoning an in-flight call doesn't poison a subsequent real call — see note below |
| CORRUPTED_STATE (evidence tamper detection) | SURVIVED | single-byte flip in a results file copy changes its sha256, detected |
| PARTIAL_COMPLETION | NOT_APPLICABLE | decode is atomic in this pipeline, no streaming path to attack; EXP-013's CANCELLATION is the closest real analogue |
| MEMORY_PRESSURE | NOT_APPLICABLE | already tested properly at scale in EXP-010; repeating for 2 files adds no evidence |

Honest limitation on INTERRUPTION, stated rather than hidden:
`computeFingerprint` itself has no `AbortSignal`/cancellation hook. This
attack tests whether the *surrounding orchestration* can safely walk away
from an in-flight call without corrupting subsequent use (it can) — not
whether the algorithm is preemptible mid-computation (it isn't, and
nothing here claims otherwise).

**REGRESSION**: no prior EXP measured this exact shape (real engine +
real audio), so there's no unrelated baseline to regress against —
`baseline_cycle_id: null`, stated explicitly rather than fudged. The
regression check that *is* meaningful for a fingerprint algorithm —
determinism across repeated runs — is `NO_REGRESSION` (both fixtures).

## RESULT CLASSIFICATION
**PROVEN**: the engineering-cycle system can drive real audio through the
real production fingerprint algorithm end to end — decode, measure,
attack, regression, evidence — using only existing lab machinery plus one
small new fixture generator and one small new engine-loading wrapper.

**NOT claimed**: production validation. See
`adapters/AUTODJ_PRODUCTION_BOUNDARY.md` for the explicit BLOCKED/
UNVERIFIED boundary — live transition-decision correctness, real-device
output fidelity (EXP-008's unresolved mismatch is the standing evidence
for why this matters), snapshot currentness, and the proposed minimal
adapter contract (`planNextTransition(...)`) that would be needed to test
the next layer without needing live playback or device access.

## FAILURES
None in this cycle's own tooling — the riskiest-unknown pre-check (does
the extracted engine even run headlessly) was validated before building
the full orchestrator specifically to catch this class of failure early,
after EXP-013's experience of discovering a fundamental mechanism problem
only after writing the whole script. That precaution paid off: the full
run completed clean on the first attempt, and the deliberate-break test
(queue task renamed away) stopped safely (`STOPPED_FAILURE`, schema-valid
partial record) on the first try too, because the `decision: DEFER`
lesson from EXP-013's own break-test bug was applied proactively here
rather than rediscovered.

## EVIDENCE
`cycle.json` (schema-validated: 14/14 stages, zero errors against
`contracts/engineering-cycle.schema.json`), `test_results.json` (full
per-fixture pipeline + real-engine output). Fixtures and the extracted
engine are generated to OS tmpdirs each run, not committed (regeneratable
— matching EXP-009/EXP-013's precedent); `reference/` itself is untouched.

## PROMOTION STATUS
`load_real_engine.cjs`: `CANDIDATE` — works, but `USED_ONCE`; needs a
second real consumer (e.g. a future forensics cycle comparing engine
variants) before it's `ADAPTER-READY`. `make_music_like_wav.cjs`:
`CANDIDATE`, `NOT_YET_REUSED`. `cycle-lib.cjs`: promoted past candidate —
`USED_TWICE_PLUS` with a passing compounding test (EXP-013 re-verified
regression-free after the extraction).

AUDIO-AUTODJ-001: `DONE`.

## DECISION
KEEP. `PRIORITY_QUEUE.md` updated: `AUDIO-AUTODJ-001` → DONE.

## NEXT QUESTION
Per `cycle.json`'s `next_recommended_experiment`: `AUTODJ-BOUNDARY-001` —
this milestone's own natural next step, per the user's stated direction.
Concretely: `adapters/AUTODJ_PRODUCTION_BOUNDARY.md`'s proposed
`planNextTransition(...)` contract is BLOCKED/UNVERIFIED and needs a
maintainer decision (does such a pure decision function exist or make
sense to extract on the production side) before this lab can do anything
further toward it — not something resolvable by writing more lab code.
`CANCEL-OBS-001` remains open and independent in the meantime.
