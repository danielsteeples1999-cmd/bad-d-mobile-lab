# CLAUDE BUILD ORDER — COMPOUNDING AI ENGINEERING LAB

## Purpose

This lab is not merely a place to reproduce BAD-D mobile bugs.

It is a **compounding engineering system for AI-built software**.

Every useful experiment should leave behind something reusable: a probe, benchmark, fixture, diagnostic, failure injector, contract, adapter boundary, regression test, search index, evidence schema, or reasoning shortcut.

The target is:

**problem → measurement → tool → evidence → reusable capability → better next build**

Optimize for:

**useful engineering per token + evidence per test minute + reusable capability per experiment + reduced future rediscovery**

---

# 1. START SMALL — READ ONLY WHAT MATTERS

At session start read:

1. `README.md`
2. `CLAUDE_BUILD_ORDER.md`
3. `EXPERIMENT_PRIORITY_QUEUE.md`
4. `GOAL_CROSSWALK.md`
5. `CLAUDE_EXECUTIVE_BRAIN.md` only as targeted context
6. the exact code/test artifact needed for the current experiment

Do not read the whole repository by default.

Search first. Read only relevant sections.

History and research are secondary to current code, tests, failures and measurements.

---

# 2. THE COMPOUNDING RULE

Before building any tool ask:

**What survives after this experiment?**

Prefer:

**one-off experiment**
→ reusable probe  
→ reusable fixture  
→ benchmark  
→ regression test  
→ AI diagnostic capability

over:

**one-off experiment → throwaway result**

A tool is high-value when a future AI can reuse it without rebuilding the same machinery.

---

# 3. BUILD THE AI ENGINEERING TOOLBOX

Prioritize reusable infrastructure such as:

- codebase scout
- dependency/impact mapper
- experiment generator
- benchmark runner
- regression comparator
- memory/RAM probe
- startup timeline probe
- long-task/UI responsiveness probe
- audio continuity probe
- queue/scheduler probe
- storage-health probe
- checkpoint/recovery tester
- browser capability matrix
- failure-injection engine
- device/workload profiles
- evidence validator
- experiment report generator
- experiment search/index
- old-code archaeology tool
- adapter/contract validator

Do not create empty folders or speculative frameworks just to look complete.

Build each capability when a real experiment needs it.

---

# 4. AI CODEBASE SCOUT

When practical, create tooling that lets an AI answer cheaply:

- where is this behavior implemented?
- what calls it?
- what depends on it?
- what tests cover it?
- what measurements exist?
- what previous experiments touched it?
- what is dangerous to change?
- what remains unknown?

Output compact machine-readable investigation data.

The goal is to prevent future agents from reading thousands of irrelevant lines.

---

# 5. CHANGE IMPACT BEFORE PATCHING

Before meaningful changes, identify:

**change → affected code → affected systems → affected tests → performance effects → audio risks → evidence/promotion risks**

Use this to choose the smallest safe change.

Do not claim an impact map is complete when it is inferred rather than measured.

---

# 6. UNIVERSAL EXPERIMENT LOOP

For every substantive experiment:

### LOCATE
Find the smallest controlling surface.

### REPRODUCE
Make the failure or behavior deterministic if possible.

### BASELINE
Measure before changing anything.

### HYPOTHESIZE
Create 2–4 plausible mechanisms.

### DISCRIMINATE
Run the cheapest test that separates them.

### BUILD
Implement the smallest useful experiment.

### MEASURE
Capture comparable before/after data.

### ATTACK
Try to break the result.

### REGRESS
Check adjacent behavior.

### EXTRACT
Turn reusable instrumentation into a reusable capability.

### RECORD
Store compact evidence.

### ADVANCE
Choose the next highest-information experiment.

Do not stop at “looks better.”

---

# 7. THE TOOL SHOULD IMPROVE THE NEXT TOOL

For every new utility ask:

1. Can another experiment call it?
2. Can another AI session understand its output automatically?
3. Can it produce machine-readable evidence?
4. Can it detect regressions?
5. Can it reduce future token usage?
6. Can it be adapted into BAD-D later?
7. What is the smallest reusable interface?

If the answer is mostly no, keep the implementation smaller.

---

# 8. UNIVERSAL BENCHMARK LANGUAGE

Avoid every experiment inventing its own measurements.

Where appropriate standardize:

- timestamp
- duration
- workload
- input size
- concurrency
- memory observations
- long-task observations
- throughput
- latency
- errors
- interruptions
- recovery
- audio continuity
- environment/capability data
- baseline
- candidate
- delta
- evidence level

One benchmark harness should support many experiments.

---

# 9. FAILURE INJECTION IS A FIRST-CLASS TOOL

The lab should deliberately test:

- storage failure
- quota pressure
- interrupted imports
- corrupted checkpoints
- missing browser capabilities
- memory pressure
- slow workloads
- worker failure
- timeout
- background suspension
- visibility changes
- audio interruption
- malformed input
- partial input
- unexpected exceptions

The question is not only:

**Can it work?**

Also:

**How does it fail? Does it recover safely? Does it preserve evidence?**

---

# 10. DEVICE REALITY

Separate:

**synthetic correctness → workload realism → physical device verification**

Create repeatable workload profiles where useful:

- fast desktop
- modern phone
- mid-range phone
- low-memory phone
- long-running
- storage pressured
- backgrounded
- thermally constrained

Do not pretend simulation equals physical-device evidence.

---

# 11. AI SELF-VALIDATION

After an implementation, prefer an automated chain:

**change → static check → functional test → benchmark → failure injection → regression → evidence**

The AI should be able to attack its own implementation before asking Daniel to test it.

Human testing is reserved for things the environment cannot establish.

---

# 12. EVIDENCE IS MACHINE-READABLE

Every meaningful experiment should leave structured evidence containing, where applicable:

- hypothesis
- baseline
- variables
- environment
- procedure
- result
- failures
- regressions
- confidence/evidence level
- limitations
- reusable artifacts
- next question

Never turn “file created” into “verified.”

---

# 13. EXPERIMENT MEMORY

Do not make future AI rediscover old work.

Store experiments so an agent can search:

- what was tested?
- what failed?
- under what conditions?
- what was ruled out?
- what mechanism was implicated?
- what tool was created?
- what remains unresolved?
- what should be tested next?

Failed work is knowledge.

---

# 14. OLD CODE ARCHAEOLOGY

When historical code is relevant:

1. identify the original problem
2. identify its constraints
3. isolate the mechanism
4. remove obsolete coupling
5. reproduce it independently
6. compare it with the current mechanism
7. retain only evidence-backed value

Do not copy old architecture wholesale.

---

# 15. CROSS-GOAL LEVERAGE

For every major experiment answer:

1. What immediate problem does this address?
2. What other goals benefit?
3. What reusable capability does it create?
4. What future BAD-D integration could use it?
5. What could it damage?
6. What evidence would justify integration?

Prefer mechanisms with broad leverage.

Examples:

**scheduler**
→ import + UI + audio + RAM + battery + Testing Deck

**memory lifetime instrumentation**
→ RAM + scope + audio + long-run stability + crash diagnosis

**checkpoint engine**
→ import + Testing Deck + recovery + background lifecycle

**benchmark/evidence engine**
→ every future experiment

**failure injection**
→ every future subsystem

---

# 16. TOKEN ECONOMY

Do not spend model context on:

- giant summaries
- duplicated documentation
- irrelevant research
- speculative abstractions
- cosmetic refactors
- explaining what the agent could test itself

Spend tokens on:

**locating → reasoning → coding → testing → breaking → measuring → extracting reusable capability**

If a repeated manual action can become a tool, consider automating it.

If a research question can be answered by a five-minute local experiment, run the experiment.

---

# 17. SESSION BUDGET

A normal session should roughly follow:

- locate/baseline
- implement smallest experiment
- test
- attack
- extract reusable value
- record
- advance

If blocked, build the smallest reproducible substitute.

Do not spend the whole session explaining why the ideal environment is unavailable.

---

# 18. HUMAN INTERACTION BUDGET

Ask Daniel only when:

- physical-device evidence is required
- credentials/permissions are required
- an irreversible decision is required
- creative intent is genuinely ambiguous
- production integration is being considered

When asking for a test, give **one exact action**.

Otherwise continue autonomously.

---

# 19. PRODUCTION BOUNDARY

This public lab is isolated.

Never:

- modify production BAD-D from this workflow
- expose secrets
- copy private user data
- auto-promote experiments
- weaken evidence gates
- silently alter production version identity
- treat lab success as production verification

Future integration happens through explicit adapters/contracts.

**Standalone now. Integratable later.**

---

# 20. DEFINITION OF HIGH-VALUE PROGRESS

High-value progress means:

**less uncertainty  
+ better measured behavior  
+ reusable tooling  
+ stronger self-validation  
+ lower future token cost  
+ clearer integration boundaries**

A large diff is not progress.

A large document is not progress.

A feature count is not progress.

**A capability that makes the next AI build faster, safer, more measurable and more intelligent is progress.**
