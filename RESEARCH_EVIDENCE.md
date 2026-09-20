# MOBILE LAB — RESEARCH EVIDENCE AND FIELD NOTES

## Why this file exists

Claude should not invent mobile/audio engineering rules from intuition when established platform evidence exists.

Use this as a starting evidence library. Re-check current browser compatibility and documentation before production decisions.

---

# 1. AUDIO THREAD IS DIFFERENT FROM NORMAL JAVASCRIPT WORK

MDN documents AudioWorklet as a way to run custom audio processing in a separate Web Audio rendering context/thread, rather than putting the processing directly on the main thread. AudioWorklet is broadly available across modern browsers.

Implication for experiments:

- keep real-time audio work isolated from UI-heavy work where appropriate
- measure whether moving work changes glitches, latency, CPU, and memory
- do not assume AudioWorklet automatically makes an algorithm faster
- test the complete audio graph

Source:
https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet

---

# 2. REAL-TIME AUDIO HAS A DEADLINE

Web.dev's Web Audio profiling guidance describes audio glitches arising when render work exceeds the available render budget, and also describes garbage collection as a possible source of blocking.

Practical laboratory rule:

Avoid allocating large temporary objects repeatedly inside real-time processing.

Investigate:

- array reuse
- preallocation
- typed-array lifetime
- object creation frequency
- garbage-collection pressure
- render workload
- graph complexity

Source:
https://web.dev/articles/profiling-web-audio-apps-in-chrome

This does NOT mean "never allocate." It means measure allocation behavior where timing matters.

---

# 3. UNDERRUNS ARE AN AUDIO FAILURE SIGNAL

MDN's AudioPlaybackStats documentation describes an underrun as a gap where buffered audio cannot be supplied to the output device quickly enough, producing audible glitches such as clicks, pops, or dropouts.

Implication:

A performance test should not report success solely because scan completion became faster.

Also check:

- underruns
- playback continuity
- latency
- user-visible audio glitches

Source:
https://developer.mozilla.org/en-US/docs/Web/API/AudioPlaybackStats

---

# 4. BUFFER SIZE IS A TRADEOFF

The same MDN guidance notes that larger buffers can help avoid underruns but increase latency.

Therefore:

DO NOT optimize for "largest buffer."

Search for the acceptable region:

STABILITY ↔ LATENCY

Measure both.

Source:
https://developer.mozilla.org/en-US/docs/Web/API/AudioPlaybackStats

---

# 5. FULL-LENGTH TRACK LOADING DESERVES SPECIAL ATTENTION

MDN's Web Audio best practices distinguishes full-length track handling from short sample-like audio and notes that HTMLMediaElement is commonly used for full-length tracks while decoded AudioBuffers are useful for shorter samples.

For BAD-D:

Do not automatically decode every full-length track into memory merely because analysis can consume an AudioBuffer.

Benchmark alternative architectures.

Source:
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices

---

# 6. MOBILE PERFORMANCE VARIES

MDN explicitly notes that Web Audio performance can vary greatly between devices, from high-end desktop hardware to low-end mobile phones.

Therefore:

A benchmark on one phone is not a universal truth.

Record:

- browser
- device class
- workload
- configuration
- result

Source:
https://developer.mozilla.org/en-US/docs/Web/API/AudioPlaybackStats

---

# 7. CHROME ANDROID SUPPORTS REMOTE PERFORMANCE INVESTIGATION

Chrome's Android developer documentation describes remote debugging from desktop Chrome DevTools and points to User Timing and Resource Timing APIs for application performance analysis.

Use this as a research method when a desktop is available.

Source:
https://developer.chrome.com/docs/android/overview

Useful measurements include:

- startup marks
- scan marks
- decode marks
- long operations
- resource timing
- memory investigations

---

# 8. MEMORY PROBLEMS ARE OFTEN LIFETIME PROBLEMS

Chrome DevTools documentation identifies memory leaks, memory bloat, frequent garbage collection, detached DOM trees, and retained JavaScript references as important classes of memory problems.

Laboratory implication:

Do not merely ask "how much RAM?"

Ask:

"Which object survives longer than it should?"

Source:
https://developer.chrome.com/docs/devtools/memory-problems

---

# 9. PAGE LIFECYCLE MATTERS ON MOBILE

Chrome documents that modern operating systems may suspend or discard pages when resources are constrained, and describes the Page Lifecycle API as a mechanism for safely handling lifecycle interventions.

BAD-D should treat backgrounding and interruption as expected environmental events, not impossible edge cases.

Source:
https://developer.chrome.com/docs/web-platform/page-lifecycle-api

---

# 10. WEB AUDIO GRAPH INSPECTION EXISTS

Chrome DevTools has a WebAudio panel for inspecting Web Audio API metrics.

Use it during desktop-connected mobile investigations where available.

Source:
https://developer.chrome.com/docs/devtools/webaudio

---

# 11. OUTPUT LATENCY IS MEASURABLE WHERE SUPPORTED

The Web Audio ecosystem exposes AudioContext output latency information in supported browsers. It can help reason about the delay between generated audio and hardware output.

Do not treat one latency property as the whole latency story.

Measure:

- app scheduling
- buffer behavior
- output latency
- user-perceived response

Source:
https://web.dev/articles/audio-output-latency

---

# 12. RESEARCH METHOD

For every technical claim:

1. Identify the mechanism.
2. Find primary documentation where possible.
3. Build a small reproduction.
4. Measure before changing it.
5. Change one meaningful variable.
6. Repeat.
7. Record device/browser/workload.
8. Keep uncertainty visible.

A web article is evidence about a technique, not proof that it is correct for BAD-D.

---

# 13. SEARCH PATTERNS FOR FUTURE RESEARCH

When a problem appears, search in this order:

1. Browser/platform specification.
2. MDN / browser vendor documentation.
3. Chrome/Firefox/WebKit issue trackers and implementation notes.
4. Established engineering articles.
5. Open-source implementations.
6. Academic papers when the algorithmic question warrants them.
7. Community reports only as clues to reproduce, not as final truth.

---

# 14. EXPERIMENT DESIGN TRICKS

## A/B one variable

A and B must differ in one important mechanism.

## Canary test

Use a small subset before a full run.

## Soak test

Run long enough for leaks and drift to appear.

## Failure injection

Break the environment intentionally.

## Boundary test

Push the system toward its limit.

## Recovery test

Interrupt at the worst possible time.

## Differential test

Run old and new mechanisms against identical inputs.

## Metamorphic test

Change an input in a way that should preserve a known relationship, then check whether the output changes appropriately.

## Golden fixture

Keep a small stable dataset whose expected evidence is versioned.

## Synthetic fixture

Generate controlled signals where the correct answer is known.

## Real-world fixture

Keep messy real audio to prevent overfitting to perfect synthetic data.

---

# 15. AUDIO-SPECIFIC TEST SET

Build a compact test library containing:

- silence
- near-silence
- sine tones
- impulses
- white/pink-like noise
- steady click
- clean drum loop
- changing tempo
- changing meter
- mono
- stereo
- low sample rate
- high sample rate
- long track
- short track
- clipped audio
- quiet audio
- dense mix
- sparse mix
- vocal-heavy
- instrumental-heavy
- problematic/corrupt input where safely reproducible

Synthetic signals tell you whether a mechanism behaves correctly.

Real songs tell you whether the mechanism survives reality.

You need both.

---

# 16. DO NOT OVERFIT THE TEST DEVICE

A fix that works only on one phone may be a device-specific optimization.

Use at least conceptual device classes:

- strong modern phone
- ordinary phone
- weak/older phone
- constrained-memory scenario

If physical devices are unavailable, simulate workload constraints rather than pretending the simulation equals hardware.

---

# 17. RESEARCH QUESTIONS CLAUDE SHOULD KEEP ASKING

- Is this CPU-bound?
- Is this memory-bound?
- Is this allocation-bound?
- Is this I/O-bound?
- Is this UI scheduling?
- Is this audio render deadline pressure?
- Is this browser lifecycle behavior?
- Is this storage latency?
- Is this a race?
- Is this stale state?
- Is this an API compatibility issue?
- Is the measurement itself wrong?
- Is the optimization trading one failure for another?

---

# 18. EVIDENCE QUALITY LADDER

LEVEL 0 — intuition

LEVEL 1 — reproduced once

LEVEL 2 — repeated reproduction

LEVEL 3 — controlled A/B evidence

LEVEL 4 — multiple workloads

LEVEL 5 — multiple device/browser classes

LEVEL 6 — long-duration / adversarial testing

LEVEL 7 — human confirmation where required

Never represent Level 0 as Level 7.

---

# 19. WHAT "DONE" SHOULD MEAN

A bug is not truly understood when:

"the error disappeared."

Better evidence is:

- original reproduction documented
- mechanism identified or narrowed
- baseline captured
- intervention isolated
- regression checked
- relevant workloads tested
- recovery tested
- audio checked
- result recorded
- remaining uncertainty documented

---

# 20. RESEARCH DISCIPLINE

Use external research to generate hypotheses.

Use the lab to determine whether the hypothesis applies to BAD-D.

That separation prevents cargo-cult engineering.

---

# 21. SOURCES TO REVISIT

Primary references currently consulted:

- MDN AudioWorklet
- MDN AudioWorkletProcessor
- MDN Web Audio API best practices
- MDN AudioPlaybackStats
- Chrome Android developer documentation
- Chrome DevTools memory documentation
- Chrome Page Lifecycle documentation
- Chrome DevTools WebAudio documentation
- web.dev Web Audio profiling
- web.dev audio output latency

Research date: 2026-09-20.

