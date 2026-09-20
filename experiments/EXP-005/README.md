## EXPERIMENT ID
EXP-005 — Heavier bulk-import run, AND: the heap instrument was never actually measuring anything

## PROBLEM
EXP-002 flagged an open caveat: 45 synthetic ~55s mono tone files might be
too light to meaningfully exercise memory behavior compared to real 3–5
minute stereo tracks. The plan was to close that gap with heavier files
(50 tracks, 75s each, ~318MB of synthetic input) under the same 256MB
constrained-heap proxy used in EXP-002, and see if `yieldForMemoryPressure`'s
cooldown finally triggers or heap finally shows a growth trend.

## HYPOTHESIS
H1: A heavier batch (50 × 75s vs. 45 × 55s) will show the same flat-heap,
no-crash result as EXP-002, OR will finally show heap growth / a cooldown
trigger that EXP-002's lighter files never reached.

## BASELINE
EXP-002: 45 × ~55s tracks, heap reported flat at 10.0MB the entire run.

## CHANGE
Batch size 45→50, per-file duration 55s→75s (total synthetic input
~210MB→~318MB), otherwise identical harness (`bulk_import_stress.cjs`,
`BADD_HEAP_MB=256`).

## TEST
Ran the heavier batch. Result looked identical to EXP-002: 50/50 committed,
zero errors, heap reported flat at exactly **10.00MB** across every single
sample from track 1 to track 50 (see `library_50tracks_75s_256mb.json`).

That exact, unmoving "10.00" across two different batches of different
composition was suspicious enough to distrust rather than report as a clean
result — a real flat memory profile under real GC activity would be expected
to show at least minor fluctuation, not a bit-for-bit identical reading
sample after sample. Per the session's own instruction ("when a result looks
good, try to falsify it"), I stopped and checked the instrument instead of
writing this up as a second confirmation of EXP-002.

## INSTRUMENT VALIDATION (the actual finding)
Ran a minimal, isolated sanity check independent of the app entirely:

```js
// in a fresh page, no app loaded:
const before = performance.memory.usedJSHeapSize;
window.__blob = new Float64Array(20*1024*1024); // 20M float64 = 160MB
for (let i=0;i<window.__blob.length;i++) window.__blob[i]=Math.random(); // force real commit
const after = performance.memory.usedJSHeapSize;
```

**Result: `before` and `after` were identical — 10.00MB both times** — after
deliberately allocating and filling a real 160MB typed array. Tested three
configurations to rule out my own scripts as the cause:
1. With `--js-flags=--max-old-space-size=256` (the flag EXP-002/005 used) — frozen at 10.00MB.
2. Without that flag at all — frozen at 10.00MB.
3. Served over local HTTP with `Cross-Origin-Opener-Policy: same-origin` +
   `Cross-Origin-Embedder-Policy: require-corp` (`window.crossOriginIsolated`
   confirmed `true`, which is Chrome's usual precondition for high-resolution
   `performance.memory`) — still frozen at 10.00MB.

**Conclusion: `performance.memory.usedJSHeapSize` does not reflect real heap
state in this Playwright/Chromium 141 headless environment, under any
configuration tested.** It is not a precision/rounding issue (a 160MB
allocation should move even a heavily-bucketed reading) — it appears to
return a fixed/stubbed value regardless of actual memory pressure.

## MEASUREMENTS (MACHINE MEASUREMENT)
- Isolated sanity check: `before: "10.00"`, `after 160MB alloc: "10.00"` — identical in all 3 configurations.
- `library_50tracks_75s_256mb.json`: 50/50 tracks committed, 0 errors, heap reading flat at "10" throughout — now known to be uninformative, not evidence of anything.

## FAILURES
The measurement instrument, not the app. This is a tooling failure in this
lab, not a finding about BAD-D.

## REGRESSIONS
**Retracting the memory-specific conclusions of EXP-002 and EXP-005.** The
non-memory findings of both remain valid and are unaffected by this bug:
- EXP-002/EXP-005: 45/45 and 50/50 tracks committed respectively, zero
  console/page errors, no crash — these are DOM/JS-error observations, not
  dependent on `performance.memory`, and stand as-is.
- **Invalid, retracted:** any claim that heap "stayed flat" or that
  `yieldForMemoryPressure`'s cooldown "never triggered because pressure
  never rose." Both were read off a broken instrument. Whether real memory
  pressure occurred during these runs is now **UNKNOWN**, not "no."

## EVIDENCE
Inline sanity-check output above (MACHINE MEASUREMENT, reproducible with the
one-liner shown — not saved to a tool file this session, trivial to turn
into one). `library_50tracks_75s_256mb.json` (MACHINE MEASUREMENT, valid for
error/completion claims only, invalid for heap claims — see correction note
inside `experiments/EXP-002/README.md` too, added retroactively).

## WHY `performance.memory` IS FROZEN (root cause, not just a sandbox quirk)
Web search (see Sources) surfaced that this is documented, intentional
Chrome behavior, not something specific to this sandbox: `performance.memory`
is deliberately quantized and infrequently updated (commonly cited as on the
order of tens of minutes between refreshes, `--enable-precise-memory-info`
notwithstanding — that flag is deprecated/removed in modern Chrome) as an
anti-fingerprinting measure. This is a MODEL INTERPRETATION backed by a
secondary source, not something this lab independently verified against
Chromium's own source/release notes — flagged as such, not as settled fact.

**Why this matters beyond my own tooling:** the production build's own
`yieldForMemoryPressure()` (in `bad_d_meomory/BAD-D_SIGNAL_15_72_0-mobile.html`)
makes its cooldown decision by reading exactly this same API —
`performance?.memory`, `pm.usedJSHeapSize/pm.jsHeapSizeLimit` — from inside
the page. If real mobile Chrome quantizes/staleness-throttles this the same
way, **the app's own adaptive governor may be reacting to a memory reading
that's minutes out of date**, not the live pressure building during a bulk
import that might only take a few minutes total. That would make the
ratio-based cooldown branch functionally closer to a no-op in practice than
"adaptive" — it would still fall back to its unconditional every-8th-file
yield, just not the pressure-sensitive part. **This is a new hypothesis,
not a verified finding** — needs testing on real mobile Chrome, not this
sandbox, since the exact quantization behavior could differ by Chrome
version/platform.

## RE-RUN WITH A VALIDATED INSTRUMENT
Fixed `tools/bulk_import_stress.cjs` to read heap via CDP
`Runtime.getHeapUsage()` instead of `performance.memory` (validated in the
sanity check above: `backingStorageSize` moved 0 → ~160MB correctly for the
same test that left `performance.memory` frozen). Re-ran the identical
50-track × 75s batch under the same 256MB heap-flag proxy:

- `backingStorageMB` (where decoded `AudioBuffer`/typed-array data lives)
  ranged **8.83MB–82.7MB** across the run, ending at **35.7MB** with all 50
  tracks committed — fluctuating, not growing monotonically with library
  size (e.g. 35.0MB at 8 tracks, 63.8MB at 24 tracks, 35.7MB at 50 tracks).
- `heapUsedMB` (JS object heap) ranged **3MB–31.5MB**, ending at 12.2MB —
  same bounded, non-monotonic pattern.
- 0 console errors, 0 page errors, 50/50 tracks committed, no crash.
- See `library_50tracks_75s_256mb_CDP.json` for the full sample series.

**This now IS credible evidence** (validated instrument, real numbers, real
fluctuation) that library intake's per-track buffer release is genuinely
working at this scale/duration — the original EXP-002 conclusion holds, but
now on solid ground instead of a frozen "10.00" that any change would have
looked identical to.

## DECISION
**KEEP** the CDP-based fix in `tools/bulk_import_stress.cjs` — it's now the
correct way to measure heap in this lab, and the old `performance.memory`
reads in EXP-001/EXP-002/EXP-004 should be treated as uninformative for
memory-specific claims (their error/completion/cache-hit findings are
unaffected and stand). **INVESTIGATE** the governor-staleness hypothesis
next — it's new, plausible, unverified, and potentially explains the
reported 18–27-song crashes better than anything tested so far (a governor
that can't see pressure building in real time until it's too late fits a
"survives to ~N then dies" pattern better than "leaks from track 1").

## NEXT QUESTION
Does the SAME quantization/staleness apply to `performance.memory` on real
mobile Chrome (not just this sandboxed headless build)? If yes,
`yieldForMemoryPressure`'s ratio-based branch is close to dead code in
practice on a bulk import that completes in a few minutes, and the fix
would need a different signal (CDP isn't available to a real production
page — that requires either accepting the staleness, using
`measureUserAgentSpecificMemory()` if available or per-track byte-budget
accounting that doesn't depend on browser-reported heap at all).

## Sources
- [performance.memory · WebPlatform Docs](https://webplatform.github.io/docs/apis/timing/properties/memory/)
- [Performance: memory property — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory)
- [Chromium bug 233630 — totalJSHeapSize/usedJSHeapSize inconsistency](https://groups.google.com/a/chromium.org/g/chromium-bugs/c/NIaDTOvKKzM)
