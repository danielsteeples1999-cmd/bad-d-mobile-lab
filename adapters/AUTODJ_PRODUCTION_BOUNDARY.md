# Auto-DJ production boundary — BLOCKED/UNVERIFIED

Written as part of EXP-014 (AUDIO-AUTODJ-001), per this session's explicit
instruction: do not fake production validation. State exactly what this
public lab can and cannot verify, and what would be needed to close the
gap, without touching `bad_d_meomory` or claiming access this lab doesn't
have.

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

1. **Live transition scheduling/decision correctness.**
   `startTransition()`/`armBeatSnappedTransition()` (production build,
   main IIFE, ~lines 8371/9075 per prior sessions' forensic notes) decide
   *when* and *how* to crossfade during an actual live set — using
   playback position, deck state, and the fingerprint together. EXP-006/
   007 measured *main-thread blocking risk* around that scheduler (long
   tasks vs. its ~80ms continuity reserve), not whether its transition
   *decisions* are correct. No test in this lab exercises that decision
   logic end to end, because it is entangled with live playback state
   (`AudioContext` scheduling, deck UI state) that only exists inside a
   running, user-driven session of the full app — not something this
   lab's headless harness constructs today.

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

## The smallest adapter/contract that would unblock #1

Not claimed to exist — this is a proposal, explicitly UNVERIFIED, for what
would let this lab test real transition-decision correctness without
needing live playback or device access:

```
planNextTransition(
  currentDeckState: { positionSec, trackDurationSec, bpm, ... },
  incomingTrackFingerprint: FingerprintResult,  // the exact shape EXP-014
                                                  // already proves this lab
                                                  // can produce from real audio
  config: TransitionConfig
) -> TransitionPlan { triggerAtSec, crossfadeDurationSec, beatSnapOffsetMs, ... }
```

If the production scheduler's *decision* logic were exposed as one pure
function like this — no `AudioContext`, no DOM, no side effects, just
state in and a plan out — this lab could unit/property-test it directly
against real fingerprints (now provably obtainable per EXP-014) without
needing playback or a real device at all. Today, `startTransition`/
`armBeatSnappedTransition` mix that decision with the scheduling side
effects (`setTimeout`, actual `AudioContext` graph changes), which is
exactly what makes it untestable from here in isolation.

**Status: BLOCKED/UNVERIFIED.** Whether such a function exists, could be
cleanly extracted, or is worth building is a maintainer decision on the
production side — not something this lab can resolve by writing more code
here.

## Non-goals of this document
Not a request for `bad_d_meomory` write access. Not a claim that any of
the above has been attempted and failed — items 1–4 have not been
attempted, precisely because they are outside what this public repo can
reach. Not a plan to build a mock/simulated scheduler and call it
equivalent — that would be exactly the "fake it" outcome this session was
told explicitly not to produce.
