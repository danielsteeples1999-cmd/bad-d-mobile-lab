## EXPERIMENT ID
EXP-008 — Forensic investigation of EXP-007's real-device fingerprint mismatch

## PROBLEM
Daniel ran `DANIEL_TEST_scheduler-lab.html` (EXP-007) on his real Android
phone. The scheduling result reproduced strongly (main-thread blocking
94,910ms → 15,176ms, −84%), but the correctness check reported **fingerprint
MISMATCH** — invalidating EXP-007's "KEEP" decision until explained. This
record is the investigation, not a fix — no root cause was established.

## DEVICE PROFILE (real-world test metadata)
- Android 15, "Optus X-Pro 2 5G" (model P9 Pro 5G), build `P9 Pro 5G_M04`
- CPU: T8300 octa-core, max 2.2GHz
- RAM: Android reports 4GB + 4GB — **recorded as distinct** (4GB physical +
  4GB memory-expansion/swap-style extension), not claimed as 8GB physical.
  This lab has no way to verify from software alone whether the extension
  behaves like real RAM for GC/allocation purposes — flagged as `UNKNOWN`,
  not assumed either way.
- Storage: 48.78GB / 128GB used
- Display: 1600×720

## PHONE RESULTS (as reported, preserved verbatim — do not discard failed runs)

| Metric | Baseline | Experiment |
|---|---:|---:|
| Import duration | 138.0s | 173.4s |
| Long tasks >50ms | 51 | 84 |
| Total main-thread blocked | 94,910ms | 15,176ms |
| Longest single block | 2,838ms | 1,532ms |
| % window blocked | 68.8% | 8.8% |
| Fingerprint output | — | **MISMATCH** |
| Errors | none | none |

Labeled correctly per instruction: **performance evidence from a
correctness-invalid experiment.** The scheduling numbers are real
measurements: something on that device produced them. They are just not yet
trustworthy as evidence that the *patch* is safe, until the mismatch is
explained.

## METHOD — checkpoint instrumentation
Built `tools/make_checkpoint_engines.cjs`: extracts the self-contained FFT
engine (same one EXP-007 used) and produces baseline/experiment/N-frequency
variants that all call an optional `(buf, onCheckpoint)` callback at four
identical points — after reading decode info, after PCM/`mixDown`, every 32
STFT frames (+ the last), and just before the final return — so two runs can
be compared stage-by-stage instead of only final-output-vs-final-output.
Verified additive-only: instrumentation on vs off produces identical
fingerprints (see tool validation in commit history).

## TESTS PERFORMED (all in this sandbox — headless Chromium, x86-64 desktop-class, NOT the real device)

| # | Test | Config | Result |
|---|---|---|---|
| 1 | Single file, various durations (20s–120s), mono | Sequential, fresh engine | MATCH |
| 2 | Single file, stereo (120s, exercises `mixDown`) | Sequential, fresh engine | MATCH |
| 3 | Decode determinism | Same file decoded twice independently, PCM stats compared | **Identical** |
| 4 | 5-file batch, mixed mono/stereo, 75–110s each | Sequential, **one shared engine instance per phase** (matches real app / EXP-007 harness exactly) | **All 5 MATCH**, including files 2–5 (rules out state leaking across files within one engine instance) |
| 5 | Two different files analyzed **concurrently** (`Promise.all`, same engine instance) | vs. sequential reference | MATCH |
| 6 | Same file analyzed **concurrently twice** (same engine instance) — the most adversarial shared-mutable-state stress test in this list | Self-consistency check | MATCH |
| 7 | Baseline and experiment engines run **concurrently on the same file** (cross-phase interleaving) | — | MATCH |
| 8 | Yield frequency: every 8 / 16 / 32 / 64 / 128 frames, and no-yield-but-async | vs. fully-synchronous reference | **All 6 configurations MATCH** |

**Every hypothesis testable without the real device came back clean.**

## HYPOTHESES STATUS

| Hypothesis | Status |
|---|---|
| A. Async state corruption between yields | Eliminated (test 8: every yield frequency matches) |
| B. Shared mutable buffers across calls | Eliminated (test 4: 5-file sequential batch through shared engine, all match; test 6: same file concurrent-twice, self-consistent) |
| C. Loop/index state surviving a yield incorrectly | Eliminated (test 8) |
| D. Closure capture of mutable loop variables | Eliminated (code review: `let i`, fresh `windowed` per iteration — no capture bug found; test 8 confirms behaviorally) |
| E. Concurrent analyses interleaving | Eliminated in this sandbox (tests 5, 6, 7) — **note: EXP-007's actual harness runs phases and files sequentially, never concurrently, so this was never expected to be the cause; tested anyway per instruction** |
| F. TypedArray/ArrayBuffer lifetime/reuse | No reuse bug found on read (each `computeFingerprint` call allocates its own `data`/`windowed`/`spec`); not exhaustively fuzzed |
| G. Input mutation (AudioBuffer/PCM modified elsewhere) | No mutation site found by reading; not directly instrumented for detection |
| H. Floating-point/operation-order effects | **Not eliminated — see below, most likely remaining cause** |
| I. Decode differences (baseline vs experiment receiving different PCM) | Eliminated for WAV in this sandbox (test 3); **MP3/AAC decode untested — see BLOCKED** |
| J. Frame-count/off-by-one/end-of-buffer | No divergence found across durations 20s–120s (various `nFrames` values, including non-round numbers); not exhaustively boundary-tested |
| K. Cancellation/race behavior | No cancellation logic exists in either engine variant; not applicable as tested |
| L. Harness comparison bug | Found and reasoned about (position-vs-name matching in EXP-007's original harness could misreport a decode failure as a content mismatch) — **fixed in EXP-008's v2 harness regardless of whether it was the actual cause**, since it's a real latent bug worth closing either way |
| M. Device/browser-specific behavior (real Android Chrome vs desktop headless Chromium) | **Not eliminated — cannot be tested without the device. Most likely remaining explanation given everything else came back clean.** |

## MOST LIKELY REMAINING EXPLANATION (not confirmed — flagged as such)
`hannWindow()` and `fft()` call `Math.cos`/`Math.sin`. These are **not
guaranteed bit-identical across CPU architectures** (ARM vs. x86-64 can use
different libm implementations with different last-bit rounding). If real
Android Chrome (ARM) produces even a 1-ULP-different value from desktop
Chromium (x86-64) for the same input, that difference propagates through
the entire STFT → analysis pipeline and could plausibly diverge into a
visibly different final fingerprint (BPM/key/spectral features) — even
though the *algorithm* baseline and experiment run is byte-identical code.
Under this theory, **baseline-on-phone and experiment-on-phone might not
even need to disagree with EACH OTHER over the algorithm at all** — the
real question would be whether the SAME device, running the SAME code
twice, is internally deterministic, which is subtly different from asking
whether the yield patch broke something.

This is `NOT YET VERIFIED` — a plausible mechanism from public knowledge of
transcendental-function non-portability, not something demonstrated on
this device. No primary source was checked for whether V8/Chromium enforce
IEEE-754-strict transcendental results across platforms — flagged as an
open research question, not answered from memory.

## BLOCKED
Could not test MP3/AAC (lossy, compressed, real-song-shaped) decode
determinism or the real `mixDown` path against *compressed* audio — this
sandbox has no MP3/AAC encoder available (`ffmpeg` here is a
Playwright-internal build compiled for screen-recording only: mjpeg/webm/vp8
only, no `libmp3lame`, no WAV demuxer even). Real songs (what Daniel
actually tested with, going by the ~138s/173s import times for what was
likely a real multi-track set) are almost certainly compressed and stereo —
this sandbox's tests only ever proved WAV/PCM correctness, mono and stereo.
**This gap is not closed and is the single most important untested
condition.**

## HARNESS FIX (independent of root cause, done regardless)
EXP-007's original artifact matched files `by name` via `.find()`. If one
phase produced fewer results than the other (e.g. one file failed to decode
under real-device memory pressure), this would silently read `undefined`
and report a generic "mismatch" indistinguishable from a real content
difference. `DANIEL_TEST_forensics-v2.html` (this record) matches **by
position** instead, explicitly flags a length mismatch as `POSITION
MISMATCH (different file counts)` distinct from a content mismatch, and
surfaces per-file MATCH/MISMATCH instead of one aggregate boolean. Also adds
a Screen Wake Lock request and a `visibilitychange` listener that logs an
explicit warning if the tab was backgrounded mid-test (Android can throttle
or suspend timers in a backgrounded tab, which — over a 130+ second test —
is a real possibility and would itself look like a bug if it happened).

Verified this new harness's mismatch-reporting path actually works (not
just its match path): deliberately monkey-patched the experiment engine to
corrupt a fingerprint value after checkpointing, ran it, confirmed the UI
correctly reported `MISMATCH`, correctly identified it as a
post-checkpoint/post-loop difference (accurate — the injected corruption
was after the last checkpoint), and displayed both full fingerprints for
comparison.

## EVIDENCE
All 8 sandbox tests above were executed and their results are reproduced
verbatim in this record (MACHINE MEASUREMENT, run this session, not saved
as separate JSON files — reproducible via `tools/make_checkpoint_engines.cjs`
plus the test patterns described). `DANIEL_TEST_forensics-v2.html` itself
was validated end-to-end (clean run: 12/12 synthetic files match; deliberate
corruption: correctly detected and localized) before sending.

## DECISION
**INVESTIGATE — cannot yet KEEP or REVERT the EXP-007 patch.** The
performance evidence stands on its own and is worth keeping as evidence,
but the patch is not validated as correctness-safe until the real mismatch
is explained. Sending Daniel the v2 forensic artifact is the next
necessary step, not a conclusion.

## NEXT QUESTION
Run `DANIEL_TEST_forensics-v2.html` on the same device with the same (or
similar) real audio files. Three possible outcomes and what each would mean:
1. **All match this time** → the original mismatch was likely the harness
   bug (name-matching + silent decode-failure skip) or a one-off
   backgrounding/throttling event — the wake-lock + visibility warning
   should catch the latter if it recurs.
2. **Mismatch recurs, with a specific checkpoint/frame localized** → real
   algorithmic or platform issue, now localized enough to reason about
   precisely (which stage, which frame index, which values).
3. **Mismatch recurs as "no per-checkpoint divergence, differs only in
   final fingerprint"** → the difference is in post-STFT calculation
   (flux/onset/BPM/key derivation), not the FFT loop itself — a different,
   narrower area to investigate next, and would somewhat weaken the
   Math.cos/sin ARM-vs-x86 theory (which should show up starting from the
   very first frame, not only in later derived calculations).
