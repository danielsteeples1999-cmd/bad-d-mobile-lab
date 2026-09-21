# Auto-DJ production boundary

Written as part of EXP-014 (AUDIO-AUTODJ-001), per this session's explicit
instruction: do not fake production validation. State exactly what this
public lab can and cannot verify, and what would be needed to close the
gap, without touching `bad_d_meomory` or claiming access this lab doesn't
have.

**UPDATE (EXP-016):** item 1 below (transition-decision correctness) is
no longer BLOCKED. Reading the actual production code (not proposing from
outside it) found `previewTimingPlan`/`scoreTransition` already exist as
exactly the pure decision seam this document originally guessed at with
`planNextTransition(...)` — and they're reachable from this public lab
with zero production-side change. EXP-016 ran a real end-to-end decision
(real audio → real fingerprints → real score → real arbitrated plan),
attacked it, and confirmed determinism. See `experiments/EXP-016/README.md`
for full evidence. Items 2–4 below are unchanged and remain genuinely
blocked — this update only resolves item 1.

## What EXP-014 actually proved (CAN be measured locally, today)
- Real decode of real (if synthetic) audio via Web Audio `decodeAudioData`.
- The REAL production fingerprint algorithm (`computeFingerprint` — actual
  STFT/BPM/onset detection, not `pipeline.js`'s cheap energy-envelope
  heuristic), extracted read-only from `reference/` via the existing
  `tools/make_checkpoint_engines.cjs`, run headlessly, producing real BPM/
  confidence/energy-curve output, proven deterministic across repeated runs.
- Real RMS/peak/clipping/duration/sample-rate/channel measurement.
- Fail-closed behavior on missing/malformed/empty/interrupted input.
- Evidence-tamper detection (a flipped byte in a results file is caught by
  a straightforward re-hash).

This is genuinely "touched real sound with the real algorithm," not test
infrastructure. It is NOT production validation — see below.

## What is BLOCKED — cannot be verified from this public repo today

1. ~~**Live transition scheduling/decision correctness.**~~ **RESOLVED by
   EXP-016** — the *decision* half of this (what `startTransition` would
   decide, via `scoreTransition`/`previewTimingPlan`) is now proven
   reachable and exercised with real audio, real fingerprints, attacks,
   and a determinism check. What remains genuinely unresolved is the
   *scheduling/playback* half: `startTransition()`/`armBeatSnappedTransition()`
   (main IIFE, lines 8371/9075 — confirmed directly this cycle, not
   carried forward from an earlier unverified note) also perform the
   actual `AudioContext` graph changes and `setTimeout` scheduling once
   the decision is made; EXP-006/007 measured main-thread blocking risk
   around that scheduler, not whether the live automation it drives
   (EQ moves, crossfade curve, vocal-collision mitigation) executes
   correctly against a real playing buffer. That remains untested from
   this lab, same reasoning as before: it's entangled with live playback
   state a headless harness doesn't construct.

2. **Real-device audio-output correctness.**
   EXP-007/008's own history is the direct evidence for this: a scheduling
   win measured in this sandbox did *not* reproduce cleanly on Daniel's
   real device (a fingerprint MISMATCH that remains unresolved). Headless
   Chromium in this lab cannot stand in for real hardware DAC/output
   behavior. Any claim about real playback fidelity requires real-device
   testing, which is manual and ad hoc today, not part of this lab's
   automated engineering-cycle loop.

3. **Currentness of the reference snapshot.**
   `reference/BAD-D_SIGNAL_15_72_0-mobile.REFERENCE_READONLY.html` is a
   frozen pull from `bad_d_meomory` commit `8faf0b44…`, dated 2026-09-20
   (see `reference/README.md`). Nothing in this lab re-verifies that the
   live production app still matches this snapshot. A result here is a
   claim about *that commit*, not about "production" in the present tense.

4. **Write access / shipping a fix.**
   This lab only ever has read access to `bad_d_meomory`. Nothing
   produced here can be pushed back; any adoption of a lab finding into
   production is a separate, human-driven action outside this repo's scope.

## The seam that actually unblocked #1 (superseding the `planNextTransition` guess below)

The `planNextTransition(...)` contract originally proposed here was a
guess made without reading the production code, and turned out to be
structurally wrong (single fingerprint pair instead of full deck objects;
one function instead of two). The real, already-existing seam:

```
scoreTransition(fromDeck, toDeck) -> ScoreResult
previewTimingPlan(fromDeck, toDeck, ScoreResult) -> { arb, negativeShiftCandidate }
```

where `fromDeck`/`toDeck` are `{ id, fingerprint, playRate, offset,
startedAt, playToTime }` and `fingerprint` is exactly `computeFingerprint`'s
real output (EXP-014's already-proven extraction). No new contract needed
— see `experiments/EXP-016/README.md` for the exact location, full
dependency scan, and a real end-to-end call. `tools/make_transition_debug_page.cjs`
is the extraction tool (whole-page, one inserted export line, read-only
against `reference/`).

Original guess kept below for the record, not because it's still accurate:

```
planNextTransition(
  currentDeckState: { positionSec, trackDurationSec, bpm, ... },
  incomingTrackFingerprint: FingerprintResult,
  config: TransitionConfig
) -> TransitionPlan { triggerAtSec, crossfadeDurationSec, beatSnapOffsetMs, ... }
```

**Status: RESOLVED for the decision layer (EXP-016).** No maintainer
decision was actually required — the function already existed and needed
no production-side change to reach.

## Non-goals of this document
Not a request for `bad_d_meomory` write access. Not a claim that any of
the above has been attempted and failed — items 1–4 have not been
attempted, precisely because they are outside what this public repo can
reach. Not a plan to build a mock/simulated scheduler and call it
equivalent — that would be exactly the "fake it" outcome this session was
told explicitly not to produce.
