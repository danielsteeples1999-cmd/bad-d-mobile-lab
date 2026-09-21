# CLAUDE BUILD ORDER — INFORMATION-FIRST EXECUTION

## Purpose

This file exists to prevent Claude from wasting context/tokens rediscovering project intent, reading irrelevant material, or polishing low-value work.

The lab is an **engineering experiment engine**, not a documentation exercise.

The goal is maximum useful engineering per token, per test minute, and per human interaction.

---

# 1. READ ORDER — DO NOT READ THE ENTIRE REPOSITORY BY DEFAULT

At session start, read only:

1. `CLAUDE_EXECUTIVE_BRAIN.md`
2. `CLAUDE_BUILD_ORDER.md`
3. `EXPERIMENT_PRIORITY_QUEUE.md`
4. the specific artifact(s) named by the current priority item
5. `CLAUDE_COMPLETION_STATUS_PROTOCOL.md` only when reporting status

Do NOT automatically read every research document, historical plan, or expansion map.

Use targeted retrieval.

If a document is not relevant to the current experiment, do not spend context on it.

---

# 2. INSIDE-FIRST RULE

The highest-value information is normally inside the current implementation and its measured behavior.

Search in this order:

**CURRENT CODE → CURRENT TEST → CURRENT FAILURE → MEASUREMENT → HISTORY → EXTERNAL RESEARCH**

External research is used to answer a concrete unknown, not to create reading work.

Historical documents are used when:
- a mechanism was removed
- a regression suggests an older implementation
- a design decision needs recovery
- an old experiment may contain a useful mechanism

Do not read history merely because it exists.

---

# 3. PREVALENCE / PRIORITY MODEL

Prioritize work by:

**Impact × Frequency × Cross-system leverage × Evidence value × Reversibility ÷ Cost**

Give extra weight to problems that affect several goals simultaneously.

Examples of high-leverage work:

- RAM lifetime control can improve importing, scope rendering, audio stability, long runs, crash resistance, and mobile responsiveness.
- cooperative scheduling can improve bulk import, UI responsiveness, startup, battery pressure, and recovery.
- checkpoint architecture can improve long scans, crashes, backgrounding, storage recovery, and Testing Deck reliability.
- capability detection can improve startup, mobile compatibility, fallback behavior, and user clarity.
- standardized evidence can improve Testing Deck, tuning, regression testing, and future production integration.

Do not spend a full experiment on a cosmetic issue while a shared mechanism is failing.

---

# 4. TOKEN-EFFICIENT ENGINEERING LOOP

For each priority item:

### A. LOCATE
Find the smallest set of files/functions that control the behavior.

### B. BASELINE
Run or construct the cheapest meaningful reproduction.

### C. HYPOTHESES
Write 2–4 competing mechanisms.

### D. DISCRIMINATE
Choose the cheapest test that tells the hypotheses apart.

### E. PATCH
Change the smallest meaningful surface.

### F. MEASURE
Capture before/after metrics.

### G. ADVERSARIAL CHECK
Try to break the improvement.

### H. DECIDE
Keep, revert, branch, or defer.

### I. RECORD
Write a compact experiment result.

### J. ADVANCE
Immediately select the next highest-information experiment.

Do not stop after "it looks better."

---

# 5. BATCH WORK WHEN SAFE

If several experiments share:
- the same fixture
- the same instrumentation
- the same harness
- the same browser page
- the same measurement

build the harness once and run multiple cheap variants.

Prefer:

**ONE HARNESS → MANY CONTROLLED EXPERIMENTS**

over:

**MANY DUPLICATE HARNESS BUILDS**

Do not batch experiments when doing so makes causality unclear.

---

# 6. BUILD REUSABLE INSTRUMENTS BEFORE REPEATED MANUAL WORK

If Claude performs the same manual inspection twice, consider turning it into a script/probe.

High-value reusable probes include:

- startup timeline probe
- long-task probe
- memory-pressure probe
- allocation/lifetime probe
- audio continuity probe
- queue/concurrency probe
- checkpoint/recovery probe
- browser capability probe
- storage-health probe
- evidence validator
- regression comparator
- experiment report generator

The tool should save future tokens, not merely add code.

---

# 7. SYNTHETIC FIRST, REAL SECOND

When a mechanism can be tested with deterministic synthetic input:

1. use synthetic input to validate correctness cheaply
2. use compact real-world fixtures to validate realism
3. use long/hostile fixtures only after the mechanism survives basic tests

Do not begin every experiment with a huge real playlist.

---

# 8. MEASURE THE REAL FAILURE, NOT A PROXY

If the complaint is:
- RAM → measure memory pressure/lifetime, not just execution time
- chopping → measure continuity/underrun/long-task behavior
- startup → measure time-to-ready and failure points
- import → measure throughput AND UI responsiveness AND memory
- recovery → interrupt it and resume
- audio quality → compare audio, not only CPU
- evidence → validate provenance and state transitions

Never substitute an easy metric for the actual failure without saying so.

---

# 9. CHANGE ONE MECHANISM AT A TIME — UNLESS THE EXPERIMENT IS ABOUT INTERACTION

Single-variable A/B is the default.

Combination testing is justified when:
- mechanisms are explicitly complementary
- their interaction is the research question
- testing them separately would be misleading

Label combination experiments accordingly.

---

# 10. FAILED WORK IS OUTPUT

A failed experiment should produce:

- what failed
- where
- under what conditions
- likely mechanism
- what was ruled out
- what remains unknown
- what should happen next

Never make Claude rediscover a failed approach.

---

# 11. OLD CODE ARCHAEOLOGY

When an old implementation looks useful:

1. identify the problem it solved
2. identify constraints at the time
3. isolate the useful mechanism
4. remove obsolete coupling
5. reproduce the behavior in the lab
6. compare against the current mechanism

Do not copy old architecture wholesale.

---

# 12. DO NOT BUILD DOCUMENTATION INSTEAD OF EXPERIMENTS

Documentation is useful when it:
- prevents rediscovery
- defines a contract
- records evidence
- enables the next experiment

Documentation is low-value when it merely restates another document.

Prefer a 30-line tested probe over a 300-line plan describing a probe.

---

# 13. SESSION BUDGET

Default internal budget for a normal task:

- 5–10 minutes: locate and baseline
- 10–30 minutes: build/test the smallest experiment
- 5–10 minutes: adversarial/regression check
- 2–5 minutes: record result and next question

If blocked by environment, build the smallest reproducible substitute rather than spending the session explaining the blockage.

---

# 14. DEEP REASONING WITHOUT DEEP READING

Use the existing project brain as compressed context.

When deeper reasoning is needed, expand only the relevant branch:

**problem → mechanism → competing hypotheses → discriminating test → evidence → architectural consequence**

Do not expand unrelated project history.

---

# 15. CROSS-GOAL LEVERAGE

Every major experiment should answer:

1. What immediate bug does this address?
2. Which other BAD-D goals does it support?
3. What future integration does it enable?
4. What could it accidentally damage?

Prefer mechanisms that improve multiple layers without hiding tradeoffs.

---

# 16. HUMAN INTERACTION BUDGET

Ask Daniel only when:
- a real device observation is required
- an irreversible choice is required
- creative intent is ambiguous
- credentials/permissions are required
- production promotion is being considered

Otherwise decide, test, and continue.

When a human test is needed, request **one exact action**, not a questionnaire.

---

# 17. OUTPUT CONTRACT

Every meaningful experiment leaves:

- compact result
- evidence level
- files changed
- tests run
- known regression status
- next experiment

Do not produce a giant narrative unless the result itself requires it.

---

# 18. DEFINITION OF HIGH-VALUE PROGRESS

High-value progress means:

**less uncertainty + better measured behavior + reusable instrumentation + lower future token cost**

A large diff is not progress.

A large document is not progress.

A feature count is not progress.

A smaller uncertainty set is progress.
