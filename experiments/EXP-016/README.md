## EXPERIMENT ID
EXP-016 — AUTODJ-BOUNDARY-001: first real Auto-DJ transition decision proof

## PROBLEM
`adapters/AUTODJ_PRODUCTION_BOUNDARY.md` (written in EXP-014) proposed an
unverified `planNextTransition(...)` contract and left the boundary
BLOCKED pending a maintainer decision. This cycle re-examined that
assumption by reading the actual production code instead of proposing
further from outside it.

## ANSWERING THE BOUNDARY QUESTIONS

**1. Does a pure/testable production transition decision function already
exist?** YES. `previewTimingPlan(fromDeck, toDeck, s)`
(`reference/BAD-D_SIGNAL_15_72_0-mobile.REFERENCE_READONLY.html:8344`) is
documented in the production code's own comment as calling "the exact
same estimation/decision/planning functions `startTransition` does...
applies nothing, touches no audio param, fires no logEvent" — built for a
speculative-preview feature (Milestone 13), not for this lab, but exactly
the seam needed here.

**2. Exact location, inputs, outputs, dependencies:**
- `scoreTransition(fromDeck, toDeck)` — line 6757. Pure function of two
  deck objects; reads `fingerprint`, `playRate` off each. Returns a score
  object (`bpmQuality`, `energyQuality`, `bassQuality`, `harmonicQuality`,
  `sonicBoundaryQuality`, `overall`, `rate`, `stability`, `hasBpm`, ...).
- `previewTimingPlan(fromDeck, toDeck, s)` — line 8344. Takes the score
  result plus the two decks; internally calls `estimateVocalCollisions`,
  `decideVocalCollisions`, `planVocalCollisionIntervention`,
  `decideHarmonicClash`, `planHarmonicClashIntervention`,
  `detectTransitionHazards`, `arbitrateTimingLever` — all private
  functions in the same closure, none touching DOM or `AudioContext`
  scheduling (verified by scanning the full call-chain source for
  `document.`/`window.`/`ctx.` — the only real dependency found was
  `trackElapsed()`'s read of `ctx.currentTime`, satisfied by any real
  `AudioContext`). Returns `{ arb, negativeShiftCandidate }`.
- Deck object shape actually used: `{ id, fingerprint, playRate, offset,
  startedAt, playToTime }` — `fingerprint` is the SAME real output shape
  `computeFingerprint` already produces (EXP-014 proved this; this cycle
  confirmed the full field set: `bpm, bpmAlt, confidence, energyCurve,
  bassProfile, vocalLikelihood, instrumentalLikelihood, spectralCentroid,
  danceability, tempoStability, cuePoint, key, camelot, keyConfidence,
  beatPhase, beatsPerBar, hookStart, hookEnd, hookStrength,
  dynamicContrast, silenceIntro, silenceOutro, introUsability,
  outroUsability, quietWindows, lufsEstimate, samplePeak, clippedFraction,
  duration, buildUps, drops, reverbTailEstimate, sonicFootprint,
  signalQuality` — 34 fields, all populated by the real algorithm this
  lab already extracts, no gap between "what the decision function needs"
  and "what this lab can produce").
- `TUNING` (weighting config) is loaded from `localStorage` with a
  complete `TUNING_DEFAULTS` fallback (line ~2876) — a fresh page with
  empty storage gets the real default weights, not a guess.

**3.** N/A (answer to #1 is yes).

**4. Is the proposed `planNextTransition(...)` contract appropriate?**
NO. It was a reasonable guess written without having read the code; the
real seam is two functions (`scoreTransition` then `previewTimingPlan`),
not one, and the real deck-object shape is richer than a flat
`currentDeckState`. Superseded by #2 above.

**5.** Smallest correct contract = `scoreTransition` + `previewTimingPlan`
exactly as they exist in production, called with real `computeFingerprint`
output. No new contract needed — the existing functions already are the
minimal seam.

**6–9:** No write to `bad_d_meomory` (read-only against the already-pulled
`reference/` snapshot). No fabricated algorithm — every score/decision
below came from the real production code executing on real audio.
Transition correctness is not claimed beyond what was actually exercised
(see LIMITATIONS). Boundary status updated based on real evidence, not
assumption — see RESULT.

## WHAT WAS BUILT
`tools/make_transition_debug_page.cjs` — writes the ENTIRE reference HTML
file unmodified except one inserted `window.__BADD_TRANSITION_DEBUG = {...}`
export line just before the main IIFE's closing `})();` (anchor verified
to match exactly once before writing, same discipline as
`make_checkpoint_engines.cjs`). Unlike that tool, this preserves the whole
real page/DOM rather than extracting an isolated fragment — lower risk of
a silent missing-dependency bug, at the cost of loading a bigger page.
Confirmed zero console/page errors on load (no top-level init code in the
untouched main IIFE depends on anything this approach removes).

## WHAT WAS TESTED — real track A → real decision → real track B
Two distinct real fixtures (`tools/make_music_like_wav.cjs`, seeds 1/2,
different chord voicings and BPM) → real Web Audio decode → real
`computeFingerprint` (A: 108 BPM, B: 118 BPM, full 34-field fingerprints)
→ real `scoreTransition` → real `previewTimingPlan`.

**Real decision produced**: the production algorithm detected an
in-progress "buildup" (severity 100) that the crossfade would otherwise
cut off, and decided to extend the effective transition duration to 9.9s
to let it resolve (`arb.buildupNote`: "crossfade would have cut off a
build-up in progress (severity 100) — extended to 9.9s to let it
resolve"). This is a specific, interpretable, non-generic real production
decision — not a fallback path. See `transition_decision_result.json`.

## ATTACKED
| Attack | Result | Detail |
|---|---|---|
| MISSING_CAPABILITY (toDeck fingerprint is `null`) | FAILED | throws `Cannot read properties of null (reading 'bpm')` |
| MALFORMED_INPUT (empty fingerprint `{}`) | SURVIVED | `hasBpm:false`, `bpmTrust:0`, still returns a valid score |
| DUPLICATE_EXECUTION (deck transitions into itself) | SURVIVED | valid, sensible score (`overall` higher than A→B, as expected) |
| INCOMPATIBLE_INPUT (BPM 60 vs 200) | SURVIVED | `bpmQuality` drops to 0.4, still a valid score |
| UNEXPECTED_ORDERING (`toDeck` is `undefined`) | FAILED | throws `Cannot read properties of undefined (reading 'fingerprint')` |

"FAILED" here means the real production function throws synchronously on
that input, not that this lab's harness broke — recorded as a genuine
production-code finding: `scoreTransition` doesn't null/undefined-guard a
deck whose analysis never completed or whose reference is missing. Not
fixed (production code, read-only); not claimed to matter in practice
without knowing whether production ever calls it in that state — recorded
as an open question, not a bug report.

## REGRESSION
`scoreTransition` + `previewTimingPlan` called twice on byte-identical
real input (same two fingerprints, same deck state) produced byte-
identical JSON output both times. `SURVIVED` — the decision chain is
deterministic, a prerequisite for any of the above to be trustworthy.

## EVIDENCE CLASSIFICATION
**PROVEN**: a real production transition decision (score + arbitrated
plan) can be exercised end to end from this public lab, using real audio,
the real fingerprint algorithm, and the real decision functions, with zero
production-side change and zero fabricated logic — the "real track A →
real production decision → real track B → measurable result" loop this
milestone asked for.

**NOT PROVEN / still genuinely UNKNOWN**: whether this decision, once
made, produces correct or good-sounding real-time playback — this cycle
never touches `startTransition`'s actual scheduling/`AudioContext`
automation, only the pure decision layer feeding it. Whether production
ever calls `scoreTransition` with the null/undefined shapes that FAILED
above (i.e., whether the two throwing attacks describe a reachable
production state or an impossible one) is UNKNOWN from this lab alone.

**Still BLOCKED, unchanged from EXP-014's original list**: real-device
audio-output correctness (EXP-007/008's unresolved mismatch is the
standing evidence this matters), reference-snapshot currentness, and
anything requiring write access — none of that changed this cycle.

## LIMITATIONS
Both real fixtures were `tools/make_music_like_wav.cjs` synthetic
chord-progression tracks, not licensed real-world music (same limitation
as EXP-014, stated for the same reason: this lab has none to commit). The
"buildup" detection producing a real decision is itself dependent on
`computeFingerprint`'s `buildUps`/`drops` detection being reasonably
accurate on synthetic input — not independently verified against a
known-ground-truth buildup in this cycle.

## REUSABLE CAPABILITY
`tools/make_transition_debug_page.cjs` — generalizes the
"expose-a-private-IIFE-function-for-testing" pattern
`make_checkpoint_engines.cjs` established, to a whole-page/multi-function
extraction rather than a single self-contained IIFE. First real second
data point for whether that broader pattern holds; `USED_ONCE` so far.

## PROMOTION STATUS
`tools/make_transition_debug_page.cjs`: `CANDIDATE`, `USED_ONCE`.

AUTODJ-BOUNDARY-001: boundary answered with evidence — the decision-layer
question is `DONE`; the real-device/production-currentness questions
remain the same open, separately-tracked unknowns EXP-014 already named.

## DECISION
KEEP. `adapters/AUTODJ_PRODUCTION_BOUNDARY.md` updated to reflect that
item 1 (transition-decision correctness, at the decision-logic layer) is
no longer BLOCKED — it required no maintainer decision or production-side
change, only reading the code. `PRIORITY_QUEUE.md` updated.

## NEXT QUESTION
The real next boundary is item 2 from the original doc: real-device
output correctness, which EXP-007/008 already found doesn't reproduce
cleanly from this sandbox. That is not resolvable by more lab code either
— it needs actual real-device testing (manual, as it was before), not a
new extraction tool. A smaller, immediately actionable next step: run
`previewTimingPlan` across a wider matrix of real fingerprint pairs
(harmonic clash cases, vocal-collision cases, not just the one buildup
case this cycle happened to hit) to see how much of the real decision
surface a synthetic-fixture lab can actually exercise meaningfully.
