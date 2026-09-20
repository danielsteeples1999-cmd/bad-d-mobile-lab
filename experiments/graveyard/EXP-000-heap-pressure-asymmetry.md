# Graveyard: heap-pressure-asymmetry hypothesis

**Original claim:** the Testing Deck autonomous pipeline crashes more than
library intake because `runAutoPipelineQueue` lacks the heap-ratio-based
`yieldForMemoryPressure` cooldown that `processLibraryQueue` has, combined
with heavier per-track work (full iterative optimizer + multiple
`OfflineAudioContext` renders + FFT).

**Why it was reasonable:** confirmed by static reading — the asymmetry in
cooldown logic is real and still true as code. It's a legitimate difference
between the two paths and not itself wrong.

**Why it's retired, not disproven:** EXP-003 found the Testing Deck pipeline
fails on the *first* call for *every* track (`ReferenceError:
computeFingerprint is not defined`) before decode, before analysis, before
any optimizer work — i.e., before heap pressure could ever become a factor.
The hypothesis is currently untestable, not false. Heap behavior under
sustained Testing Deck load remains genuinely UNKNOWN.

**Reopen when:** the `computeFingerprint`/`runPreparationScans`/
`buildDiagnosis` scope-export bug (EXP-003) is fixed upstream in
`bad_d_meomory` and tracks can actually reach the optimizer stage. At that
point, rerun `tools/testing_deck_stress.cjs` with a batch large enough to
approach the 256MB proxy ceiling and see whether the missing cooldown
actually manifests as heap growth or a crash, the way it does *not* for
library intake (EXP-002).
