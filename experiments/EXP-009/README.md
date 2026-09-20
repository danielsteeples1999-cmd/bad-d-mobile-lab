## EXPERIMENT ID
EXP-009 — Bulk Media Intake Lab: first vertical slice (local-file/authorized-input only)

## PROBLEM
The lab's scope expanded to include a standalone Bulk Media Intake tool
(`tools/bulk-media-intake/`). Per the master prompt's own "FIRST MISSION"
instruction: *"begin with a safe local-file / authorised-input ingestion
benchmark before attempting any source-specific acquisition integration."*
This record is that first vertical slice — real pipeline, real measurements,
no platform-specific acquisition (see SECURITY.md for why YouTube-style
bulk downloading is explicitly out of scope, not just deferred).

## SCOPE DECISION (stated plainly, not buried)
Built: local-file input, authorized-direct-URL input (plain `fetch`,
subject to ordinary browser CORS — not a bypass mechanism), queue,
metadata, acquisition, SHA-256 identity/hashing, decode validation via Web
Audio, quality checks (silence/clipping/duration), a documented-but-not-yet-
applied normalisation stage, a cheap audio-content hash for near-duplicate
detection, and a `MediaResult` package matching `contracts/media-result.schema.json`.

Not built: acquisition from YouTube or any platform whose ToS prohibits
third-party downloading. This isn't a "next sprint" item — it's excluded on
purpose. See `SECURITY.md`.

## HYPOTHESIS
H1: A bounded-concurrency queue with real per-item measurement can process
a batch of files correctly (duplicates detected by content not filename,
malformed input rejected without crashing, cancellation actually stops
work and releases resources) — and concurrency has a measurable optimal
range rather than "more is always better."

## BASELINE
None existed before this session. `tools/make_synth_wavs.cjs` (existing lab
tool) supplied synthetic WAV fixtures — no real audio content, no MP3/AAC
(same tooling gap noted in EXP-008: no audio encoder available in this
sandbox).

## TOOL
- `tools/bulk-media-intake/pipeline.js` — stage functions (metadata, acquire,
  hashBytes, decodeValidate, qualityCheck, normalise, audioContentHash,
  package) + `runBatch()`, a bounded-concurrency queue runner with real
  `AbortController`-based cancellation.
- `tools/bulk-media-intake/intake.html` — standalone runnable UI (upload or
  paste authorized URLs, set concurrency, run, export `MediaResult[]` JSON).
- `tools/bulk-media-intake/run_experiment.cjs` — Playwright-driven measurement
  harness (wall-clock, CDP `Runtime.getHeapUsage` per EXP-005's lesson about
  `performance.memory` being unreliable in this sandbox, pass/fail/cancelled
  counts).

## EXPERIMENTS RUN

### 1. Queue scale (1, 10, 50 items, concurrency=4, light files ~12s each)
| Files | Duration | Passed | Failed |
|---:|---:|---:|---:|
| 1 | 183ms | 1 | 0 |
| 10 | 379ms | 10 | 0 |
| 50 | 1,188ms | 50 | 0 |

No failures at any scale. Heap sampling (500ms interval) mostly missed —
**batches this fast complete faster than the sampling interval**, a real
instrumentation limitation, not a "memory is free" finding — flagged
honestly rather than reported as a clean number.

### 2. Concurrency sweep — light workload first (20 files, ~12s each) — INCONCLUSIVE, correctly labeled as such
| Concurrency | Duration | Heap samples |
|---:|---:|---:|
| 1 | 603ms | 1 |
| 2 | 492ms | 0 |
| 4 | 475ms | 0 |
| 8 | 482ms | 0 |
| 16 | 492ms | 0 |

Flat beyond concurrency=2, and heap sampling failed almost entirely — the
workload was too light to produce real signal either way. Re-run with a
heavier workload below rather than reporting this as "concurrency doesn't
matter."

### 3. Concurrency sweep — heavy workload (20 files, ~50s each, 85MB total), heap sampling tightened to 150ms
| Concurrency | Duration | Max heap (CDP) | Heap samples |
|---:|---:|---:|---:|
| 1 | 2,185ms | 3.8MB | 14 |
| 2 | 1,582ms | 3.2MB | 10 |
| 4 | 1,504ms | 3.6MB | 10 |
| 8 | 1,510ms | 4.0MB | 10 |
| 16 | 1,578ms | 2.9MB | 10 |

**Real signal this time:** concurrency=1→2 gives a genuine 28% speedup;
2→4 is marginal (~5%); 4→8 is flat; 16 is *slightly worse* than 8 (likely
scheduling/context-switch overhead on this sandbox's CPU, not a real
degradation mechanism worth over-interpreting from one run). Heap stays low
and flat throughout (2.9–4.0MB) regardless of concurrency — no memory
pressure signal at this scale. **SAFE/OPTIMAL range for this workload
shape: concurrency 2–4. DEGRADATION POINT: not clearly reached by 16 on
this hardware — would need heavier files or a weaker CPU to find it.**

### 4. Duplicate detection + malformed input (4-file mixed batch)
| File | Result |
|---|---|
| `original.wav` | passed, `sha256: beeba6b6…` |
| `exact-duplicate-different-name.wav` (byte-identical, different filename) | passed, **same** `sha256: beeba6b6…` |
| `truncated.wav` (30-byte fragment) | failed — decode-failed, correctly rejected |
| `garbage.wav` (5KB random bytes, `.wav` extension) | failed — decode-failed, correctly rejected |

**Confirmed: identity is by content hash, not filename** (H1's duplicate-
detection requirement holds). Both malformed files correctly rejected, no
pipeline crash, no hang. **Side finding:** Chromium surfaces "Unable to
decode audio data" as a `pageerror`-visible event even when the application
correctly catches the rejection — a monitoring gotcha (don't treat this as
an unhandled crash) rather than an application bug; documented, not
"fixed" since there's nothing wrong to fix.

### 5. Cancellation (3 runs, same 20-file/50s-each batch, concurrency=2)
- **First attempt** (cancel requested at 800ms): batch had already finished
  14/20 items by then — nothing meaningfully in-flight to cancel. Revealed
  a real bug instead: cancelled/never-started items displayed as `pending`
  in the UI because `r.validationStatus || r.acquisitionStatus` picks the
  truthy string `'pending'` (validationStatus's default value) before ever
  reaching `acquisitionStatus: 'cancelled'`. **Fixed** in `intake.html`
  (acquisitionStatus now takes precedence when it's `cancelled`/`failed`).
- **Second attempt**, same timing, post-fix: same outcome (all items
  launched before cancel landed) — confirms the fix didn't break the normal
  path, but didn't exercise the cancelled path either. Preserved as
  evidence that the *first* attempt's finding was real, not a fluke.
- **Third attempt** (cancel requested at 20ms, well before any item could
  complete): **4/20 passed** (already in flight when cancel was requested),
  **2/20 correctly show `status: cancelled`** (mid-flight, correctly
  aborted and reported), **14/20 never started** (no row at all — cancelled
  before acquisition, silently absent rather than explicitly listed).

## SECOND-ORDER FINDING (not fixed this session, recorded as a real gap)
Items cancelled *before* they ever start don't appear in the results table
at all — a user watching a cancelled run sees fewer rows than files
submitted, with no explicit "14 never attempted" line. Functionally
correct (nothing was silently lost — cancellation is real, no orphaned
work continues) but a real UX/observability gap worth closing before this
tool is CANDIDATE-state.

## FAILURES
Two real bugs found and fixed via testing, not by inspection:
1. Double-`AudioContext.close()` causing a page error on every run (fixed:
   guard flag).
2. Cancelled-item status displayed as "pending" instead of "cancelled"
   (fixed: acquisitionStatus precedence).

## REGRESSIONS
N/A — first version of this tool.

## EVIDENCE
All JSON result files in this folder (MACHINE MEASUREMENT): `queue_*.json`,
`conc_*.json` (light workload, inconclusive), `concH_*.json` (heavy
workload, real signal), `dup_malformed.json`, `cancel_test*.json` (1/2
pre-fix, 3 post-fix demonstrating the corrected behavior).

## PROMOTION STATUS
`MEASURED` — has real numbers from multiple runs, core behaviors (queue,
concurrency, duplicate detection, malformed-input rejection, cancellation)
demonstrated working, two real bugs found and fixed. Not yet `REPRODUCED`
(each scenario has only been run 1–3 times, not repeated for statistical
confidence) and not `CANDIDATE` (the never-started-items observability gap
is an open, acknowledged failure mode). Never touched `bad_d_meomory` —
fully standalone, no adapter exists yet, none should.

## DECISION
**KEEP** — real tool, real bugs found and fixed, real measurements,
correctly scoped away from anything ToS/legally questionable.
**INVESTIGATE further** before considering this CANDIDATE: the
never-started-item observability gap, and getting `REPRODUCED`-level
confidence on the concurrency-sweep numbers (currently n=1 per data point).

## NEXT QUESTION
1. Make never-started-but-cancelled items appear explicitly in results
   (cheap, same session if picked back up).
2. Repeat the concurrency sweep 3+ times per data point to know whether the
   2→4 "marginal improvement" and 8→16 "slight regression" are real trends
   or single-run noise.
3. Real audio content (once an encoder is available in some environment) —
   every fixture here is a synthetic sine tone, same limitation flagged in
   EXP-002/005/008.
4. The `audioContentHash` near-duplicate detector was implemented but never
   tested against an actual near-duplicate (same audio, different
   container/bit-depth) — only exact byte-duplicates were tested this
   session.
