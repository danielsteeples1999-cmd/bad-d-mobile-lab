## EXPERIMENT ID
EXP-003 — Testing Deck autonomous pipeline: 100% failure, `ReferenceError`, root cause identified

## PROBLEM
`PROJECT_STATE.md` calls making the Testing Deck autonomous "the major active
direction": uploaded tracks should enter analysis/optimizer/evidence-capture
automatically. EXP-002 showed the *other* bulk-intake path (library import)
is memory-healthy, which raised the question of whether the reported 18–27
song crashes actually originate in the Testing Deck's autonomous pipeline
instead (`runAutoPipelineQueue`, fed by the `#testingFiles` input), since
static reading showed it lacks the `yieldForMemoryPressure` heap-cooldown
that library intake has, and does much heavier per-track work (a full
iterative optimizer with multiple `OfflineAudioContext` renders + FFT per
track).

## HYPOTHESIS
H1 (original): The Testing Deck pipeline is more crash-prone than library
intake specifically because it lacks a heap-pressure cooldown between
tracks, and this asymmetry — not a hard bug — explains the 18–27 song
failures.

## BASELINE
EXP-002: library intake, same synthetic-file methodology, same heap
constraint, 45/45 tracks succeeded with flat 10MB heap.

## CHANGE
None to the app. Same synthetic-file method as EXP-002, pointed at the
Testing Deck's file input (`#testingFiles`) instead of the library's
(`#fileLib`).

## TEST
`tools/testing_deck_stress.cjs`, same Pixel 7 emulation and
`--js-flags=--max-old-space-size=256` heap proxy as EXP-002. `#testingFiles`
has the `webkitdirectory` attribute, so Playwright requires setting a
directory path rather than a file list (`setInputFiles(resolve(wavDir))`) —
this is the same mechanism a real folder-picker bulk upload uses. 5
synthetic WAV files (~30s each) were used for this pilot; polled the
`#testingOptimizerReadout` element and `performance.memory` every 500ms.

## RESULT
**Failed — completely, immediately, deterministically.** Every one of the 5
tracks hit the same error within ~500ms of being queued:

```
AUTO PIPELINE · analysis failed: computeFingerprint is not defined
```

H1 could not even be tested: the pipeline never gets far enough to
accumulate heap pressure. It fails at the *first* real step (fingerprinting)
for every track, before decode-buffer volume or optimizer iteration count
could matter at all.

## ROOT CAUSE (confirmed by static + dynamic evidence, not guessed)
The production build's giant application script (`bad_d_meomory/BAD-D_SIGNAL_15_72_0-mobile.html`,
~line 2270–12507) is wrapped in its own top-level IIFE: `(function(){ ... })()`.
`computeFingerprint`, `runPreparationScans`, `buildDiagnosis`, and
`BADD_R1_AUDIO` are all declared *inside* that IIFE and are never attached to
`window` (confirmed live: `typeof window.computeFingerprint === 'undefined'`
after full page load).

The Testing Deck is a **separate, sibling IIFE**:
`<script id="testing-deck-script">(()=>{'use strict'; ... })()` (~line 836).
`runAutoPipelineQueue()` inside it calls a bare `computeFingerprint(item.buffer)`
(and `diagnose()` in the same script does the same for the manual "DIAGNOSE"
button — same scope, same bug, not independently re-run this session, see
NEXT QUESTION). Since neither the identifier nor a `window.`-qualified
reference exists in that scope, the lookup throws `ReferenceError` on the
very first call, for every track, with no possibility of success as currently
wired.

This is an **architectural/scoping problem**, not a memory, race, or
compatibility problem: the two subsystems were built as isolated closures and
whoever wired the Testing Deck's auto-pipeline call assumed a name that was
never exported across that boundary. Compare: the app *does* already export
several cross-boundary functions this same way when it needs to
(`window.BADD_TESTING_DECK_DJ_HANDOFF`, `window.BADD_TESTING_DECK_EXPORT`,
`window.library`), so the fix pattern already exists in the codebase — it
was simply never applied to `computeFingerprint`/`runPreparationScans`/`buildDiagnosis`.

## MEASUREMENTS (MACHINE MEASUREMENT — see `pilot_deck_5files.json`)
- 5/5 tracks failed with identical error text.
- Time to first failure: ~504ms (well within one decode).
- Heap: flat at 10MB (never had a chance to grow — nothing after the failed
  fingerprint call retains anything).
- Confirmed directly in a fresh page context:
  `typeof window.computeFingerprint` → `"undefined"`,
  `typeof window.BADD_R1_AUDIO` → `"undefined"`,
  `typeof window.runPreparationScans` → `"undefined"`,
  `typeof window.buildDiagnosis` → `"undefined"`.

## FAILURES
The feature itself: 100% failure rate, not intermittent. This is a MACHINE
MEASUREMENT, directly reproduced, not an inference from docs.

## REGRESSIONS
Cannot determine from this lab whether this is a *regression* (something
that used to work and broke) or was never wired correctly — `bad_d_meomory`
was only shallow-cloned this session, so full blame history wasn't pulled.
Marked UNKNOWN. Worth a `git log -p` / `git blame` on the production repo by
whoever has write access there.

## EVIDENCE
`pilot_deck_5files.json` (MACHINE MEASUREMENT — the stress run) plus the
inline `window.*` scope check described above (MACHINE MEASUREMENT, not
saved to a file this run — trivial to reproduce with
`tools/testing_deck_stress.cjs` or a one-line Playwright script against the
reference snapshot).

## DECISION
This is the single highest-value finding from this session. It fully
explains why the "autonomous Testing Deck" direction has made no visible
progress regardless of memory/governor tuning: **no track has ever been able
to complete the pipeline**, so no amount of cooldown/yield work on the
memory side would have mattered. Retiring the heap-pressure-asymmetry
hypothesis to the graveyard (`graveyard/EXP-000-heap-pressure-asymmetry.md`)
— not because it was unreasonable, but because it's untestable until this
bug is fixed.

**This lab cannot fix it.** `bad_d_meomory` was only granted read access
this session, and the mobile lab's own operating rules forbid modifying or
promoting the production repo from here. The fix is a one-line-per-symbol
export (`window.computeFingerprint = computeFingerprint;` etc., or bundling
the Testing Deck script inside the main IIFE / giving it explicit access) —
small, local, and directly in line with the project's own "smallest coherent
change" discipline — but it has to land in `bad_d_meomory` by someone with
push access there.

## NEXT QUESTION
1. (Cheap, same session if picked back up) Confirm the manual "DIAGNOSE"
   button (`diagnose()`, same IIFE, same bare `computeFingerprint` call) fails
   the same way — currently inferred from reading the code, not independently
   re-run.
2. Once fixed upstream: re-run EXP-002's realistic-file-size caveat against
   the *Testing Deck* path too, and revisit the heap-pressure-asymmetry
   hypothesis from the graveyard — it becomes testable again the moment
   tracks can actually get past fingerprinting.
3. `git blame`/`git log` on the production repo (not accessible read-write
   from here) to determine whether this is a regression or was never
   connected, which changes how urgently it should be treated.
