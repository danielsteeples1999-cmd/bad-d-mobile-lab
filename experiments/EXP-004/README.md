## EXPERIMENT ID
EXP-004 — Does library bulk-import survive a page reload mid-batch?

## PROBLEM
`docs/MOBILE_CRASH_SAFETY_AND_SCAN_GOVERNOR.md` (production repo) lists as a
hard, still-unverified requirement: "Refresh/reload resumes from durable
checkpoint data. Evidence survives interruption." PROJECT_STATE.md frames
"bulk upload and refresh" together as the priority crash-safety problem.
Nobody — human or agent — had tested the refresh half of that sentence
before this session. EXP-001/002/003 all tested completion, not interruption.

## HYPOTHESIS
Static reading of the current build showed `const library = [];` (top-level,
re-initialized empty every load, no rehydration call) alongside a *separate*
fingerprint cache (`cacheStore`, `let cacheStore = loadCacheStore()`) that
genuinely is loaded from a persistent JSON store. H1: a reload mid-import
wipes the in-memory library list back to empty (so the user has to re-pick
every file), but re-submitting the same files afterward is faster than a
cold run because the fingerprint cache survived — i.e., "evidence survives
interruption" is true for compute results, false for library/queue state.

## BASELINE
EXP-002 (no interruption): 45/45 tracks committed cleanly. That's the
control condition for "what a clean run looks like."

## CHANGE
One variable: a `page.reload()` injected partway through an otherwise
identical bulk-import run (EXP-002's harness family), instead of letting the
batch finish.

## TEST
`tools/reload_recovery_probe.cjs`: loaded the reference build, submitted 12
synthetic WAV files to `#fileLib`, waited 3000ms (long enough for several —
not all — tracks to finish analysis, matching a real "phone dies/refreshes
mid-bulk-upload" moment), recorded `window.library.length` and `#libStatus`,
called `page.reload()`, recorded the same again, then re-submitted the
identical 12 files and recorded whether the status text reported cache hits.

## RESULT
Confirmed the split predicted by H1, with one instrumentation caveat (below).

- Before reload: 6/12 tracks committed (`"analyzing 7/12: synth_track_007.wav"` — caught mid-batch as intended).
- After reload: `library.length === 0`. Full reset. The 6 already-analyzed tracks are gone from the UI/list.
- Re-submitting the same 12 files: all 12 recommitted, and the status text read `"analyzed 6, 6 from cache · five-scan prepared 12"` — exactly matching the 6 that had completed before the reload. The fingerprint cache is real and correctly scoped.

## MEASUREMENTS (MACHINE MEASUREMENT — see `reload_mid_batch.json`)
- `libraryLengthBeforeReload: 6`, `libraryLengthAfterReload: 0`
- `resubmit.libraryLength: 12`, `resubmit.statusText` shows `6 from cache`
- 0 console errors, 0 page errors, in either phase

## FAILURES
The library list does not survive a reload. Whether this counts as a
"failure" against the doc's requirement depends on what "evidence survives
interruption" was meant to cover — see DECISION.

## INSTRUMENTATION CAVEAT — MODEL INTERPRETATION corrected after re-check
The tool's `recoveryUiTextFound` flag came back `true`, which looked at
first like a dynamic "resume your interrupted run" banner appearing after
reload. Re-checked by dumping the actual matched text: it matched a
*static* UI label ("...CRASH RECOVERY / EVERYTHING PERSISTED...") that is
present in the DOM on a cold load too, not something that appeared because
of the interruption. This is a **flawed detector, not evidence of a
recovery flow** — recording it here rather than quietly fixing the number,
per the "don't invent evidence" rule. Whether a *real*, more specific
recovery/resume UI element exists and simply wasn't triggered by this
scenario is genuinely UNKNOWN — this test did not check for one carefully
enough to claim its absence.

## REGRESSIONS
N/A — first measurement of this path.

## EVIDENCE
`reload_mid_batch.json` (MACHINE MEASUREMENT).

## DECISION
**KEEP** the tool and finding; **flag** the caveat rather than trusting the
regex. This is real, reproducible evidence that a bare page reload during
bulk import loses the library's track list (playlist membership, ordering,
tags) even though the underlying analysis work is not wasted. That's a
narrower and more precise claim than "crash recovery doesn't work" — the
compute-evidence layer (`cacheStore`) does survive; the UI/session-state
layer (`library` array) does not. Whether that gap is acceptable is a
product decision, not this lab's to make — recording it as a finding for
whoever owns `bad_d_meomory`, not touching that repo.

## NEXT QUESTION
1. Does the *Testing Deck* side (`badd-testing-deck-v1` IndexedDB, separate
   from library's `cacheStore`) behave the same way, or does it actually
   restore queue state on reload? Not tested this session.
2. Build a targeted DOM check (not a naive keyword regex) for whatever the
   app's real crash-recovery/export UI element is — the "CRASH RECOVERY /
   EVERYTHING PERSISTED" label suggests a real one exists somewhere; find and
   exercise the actual control instead of pattern-matching body text.
3. Same test with a hard `context.close()`/process kill instead of a clean
   `reload()`, since a real mobile OOM kill doesn't get to run any
   `beforeunload`/cleanup handlers a graceful reload might.
