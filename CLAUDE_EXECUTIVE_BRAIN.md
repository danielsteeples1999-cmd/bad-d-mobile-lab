# CLAUDE MOBILE LAB — EXECUTIVE BRAIN

## Mission

You have been deliberately given the MOBILE SIDE of BAD-D // SIGNAL as an isolated laboratory.

Treat this repository as a protected experimental playground and backup-derived research environment. You have broad autonomous authority **inside this repository** to inspect, design, prototype, refactor, test, benchmark, document, and discard experiments.

You do NOT have authority to modify the production/source-of-truth BAD-D repository from this lab. Do not assume that access to mobile code grants access to production code. Never silently promote an experiment.

Your objective is not merely to fix today's bug. Your objective is to discover better ways for BAD-D to work on real mobile hardware while preserving intelligence, audio quality, evidence integrity, safety, and user control.

---

# 1. EXECUTIVE DECISION-MAKING

Make convenience decisions autonomously when the choice is reversible and inside this lab.

Default decision hierarchy:

1. Protect user data.
2. Protect audio integrity and playback.
3. Prevent crashes, runaway RAM, hangs and browser lockups.
4. Preserve measured intelligence.
5. Preserve evidence/provenance.
6. Preserve fail-closed safety.
7. Minimize complexity.
8. Improve speed and responsiveness.
9. Improve UX and clarity.
10. Add experimental capability.

When two approaches work, prefer the one that:
- has fewer moving parts
- is easier to measure
- is easier to revert
- uses less memory
- produces clearer evidence
- does not hide failure
- keeps future options open

Do not stop to ask for permission for every small reversible experiment. Decide, test, record, and continue.

Stop and request human direction only for:
- production promotion
- irreversible deletion
- changing security/safety boundaries
- changing established version identity
- changing creative/product intent in a way that cannot be inferred
- anything requiring credentials or permissions you do not have

---

# 2. THE BRAIN: THINK IN HYPOTHESES, NOT TASKS

Never think only:

"Fix RAM."

Think:

"What mechanism causes RAM growth?"
"What can be measured?"
"What is the smallest intervention?"
"What does it trade away?"
"Can I reproduce it?"
"Can I falsify my own hypothesis?"
"What happens after 10 minutes instead of 30 seconds?"
"What happens after interruption?"
"What happens on a weak device?"
"What happens with a large playlist?"
"What happens when the browser is backgrounded?"
"What happens when audio is playing simultaneously?"

For every meaningful change:

OBSERVE → HYPOTHESIZE → MEASURE → CHANGE → TEST → COMPARE → RECORD → KEEP/REVERT → FORM NEXT HYPOTHESIS.

Failed experiments are valuable evidence.

---

# 3. USE THE WHOLE LAB AS A SCIENTIFIC INSTRUMENT

Build instrumentation before blindly optimizing.

Track where useful:
- startup time
- first interactive time
- upload time
- decode time
- scan time
- memory before/during/after operations
- object/buffer counts where observable
- garbage-collection pressure where observable
- audio latency
- playback interruptions
- UI responsiveness
- long tasks
- worker utilization
- queue depth
- concurrency
- cooling/yield time
- checkpoint frequency
- recovery time
- failed items
- retry counts
- browser API availability
- device capability
- battery/thermal clues when available
- test confidence
- evidence completeness

Do not manufacture precision. Mark estimates as estimates.

---

# 4. MOBILE PERFORMANCE WAR ROOM

Investigate multiple possible strategies, not just one.

### Strategy A — adaptive governor
Adjust workload based on:
- file size
- duration
- cached work
- observed runtime
- recent memory pressure
- cooldown history
- device capability

### Strategy B — bounded concurrency
Run fewer heavy operations simultaneously.

### Strategy C — cooperative yielding
Break large work into smaller slices and yield to the UI.

### Strategy D — staged pipelines
Do cheap analysis first and expensive analysis only when justified.

### Strategy E — memory lifetime control
Release:
- temporary arrays
- decoded buffers
- audio objects
- intermediate results
- obsolete references

### Strategy F — checkpointing
Persist enough state to resume without repeating expensive work.

### Strategy G — cache intelligence
Cache only what is actually expensive and reusable.

### Strategy H — progressive fidelity
Start with a lightweight analysis and deepen it when confidence or user intent warrants it.

### Strategy I — thermal/cooldown awareness
Detect sustained pressure and deliberately slow work before the browser/device collapses.

### Strategy J — failure isolation
One broken track must not poison the entire playlist.

Test combinations, not just isolated techniques.

---

# 5. AUDIO IS SACRED

Never make a performance improvement that quietly damages audio quality.

Investigate:
- decode/release timing
- AudioBuffer lifetime
- playback scheduling
- analyser usage
- resampling
- sample-rate assumptions
- latency
- clipping
- limiter interaction
- Web Audio node lifetime
- unnecessary duplication
- waveform/spectrum memory
- visualization overhead
- simultaneous playback + analysis
- backgrounding behavior

A faster app with worse sound is not automatically an improvement.

---

# 6. STARTUP RELIABILITY

Attack startup from every angle.

Look for:
- undefined globals
- order-of-execution bugs
- race conditions
- eager initialization
- unnecessary model loading
- desktop APIs leaking into mobile
- unavailable browser APIs
- stale localStorage assumptions
- IndexedDB failures
- malformed persisted state
- broken recovery state
- import-time work happening before UI readiness

Consider:
- lazy initialization
- staged startup
- capability detection
- safe defaults
- startup watchdogs
- recovery reset paths
- diagnostic breadcrumbs

The app should reach a usable state before doing expensive optional work.

---

# 7. MOBILE API COMPATIBILITY

Audit aggressively for desktop assumptions.

Pay particular attention to:
- Web MIDI
- getDisplayMedia
- folder/file-picker assumptions
- filesystem APIs
- desktop keyboard shortcuts
- pointer/mouse assumptions
- hover-only UI
- large drag/drop workflows
- desktop-only model/download paths
- unsupported browser APIs

Do not merely delete functionality.

Ask:
"What is the mobile equivalent?"
"What can be deferred?"
"What can be represented as a status?"
"What can become a touch-first control?"
"What should remain desktop-only?"

---

# 8. TESTING DECK

Treat Testing Deck as an evidence machine.

Investigate:
- admission gates
- upload mirror
- test lifecycle
- checkpoints
- interruption recovery
- evidence persistence
- best measured ceiling
- candidate promotion
- human testing state
- auto-testing state
- human + auto verification

Never confuse:
NOT TESTED
AUTO TESTED
HUMAN TESTED
HUMAN + AUTO VERIFIED

Automation must never invent human evidence.

---

# 9. EVIDENCE ENGINE

Every important conclusion should have a trail.

Possible evidence:
- raw measurement
- timestamp
- test configuration
- browser/device context
- input identity
- algorithm/version
- result
- uncertainty
- failure state
- human observation
- comparison baseline

Preserve provenance.

Do not let an attractive score erase the evidence underneath it.

---

# 10. NEVER COLLAPSE MUSIC INTELLIGENCE INTO ONE SCORE

BAD-D has many independent dimensions.

Explore separately:
- BPM/tempo confidence
- beat stability
- downbeat confidence
- key confidence
- mode
- phrase boundaries
- section boundaries
- energy trajectory
- spectral balance
- loudness/dynamics
- vocal likelihood
- instrumental likelihood
- transition compatibility
- clash risk
- style continuity
- genre bleed
- journey coherence

A single score can be useful as a convenience summary, but it must never replace component evidence.

---

# 11. STYLE INTELLIGENCE

Experiment with:

- genre identity
- flavor
- blend
- tone
- role safety
- human weirdness
- journey context
- controlled genre bleeding
- style neighbours
- morphs
- alternate energy curves
- reference comparisons
- candidate preset stacks
- deliberate wrongness
- anti-generic drift

Explore strange combinations deliberately.

Examples:
- country → industrial
- folk → dark trap
- metal → mechanical hip-hop
- acoustic → electronic
- phonk → something structurally incompatible
- gothic → country
- orchestral → street percussion
- beautiful vocal → ugly backing
- sterile production → absurd lyric
- precise rhythm → deliberately wrong texture

The goal is not randomness.

The goal is **controlled surprise**.

---

# 12. CREATIVE SEARCH METHODS

Use radically different exploration modes.

### Mutation
Change one variable.

### Crossover
Combine two successful architectures.

### Inversion
Reverse the assumption.

### Constraint
Make the system work under a severe limitation.

### Removal
Delete a major component.

### Exaggeration
Push one characteristic until failure.

### Minimalism
Find the smallest sufficient system.

### Adversarial
Try to break your own solution.

### Counterfactual
Ask what would happen if a supposedly essential component disappeared.

### Evolution
Keep winners, mutate them, test descendants.

### Randomized exploration
Use controlled randomness where the search space is too large.

### Grid search
Systematically test combinations.

### Bayesian-style narrowing
Spend experiments where uncertainty is greatest.

### Human-in-the-loop
Generate candidates, then use human preference as evidence.

### Anti-pattern hunting
Search specifically for recurring bad architecture.

### Historical archaeology
Study old versions and discarded ideas for useful mechanisms.

### Future-back reasoning
Imagine what a mature BAD-D would need, then identify the smallest foundation that enables it now.

---

# 13. BUILD A MEMORY OF FAILURE

Do not repeatedly rediscover the same problems.

Create records for:
- bug
- reproduction
- cause
- attempted fixes
- failed fixes
- successful fixes
- regression
- device/browser
- evidence
- lesson

A failed experiment should make the next experiment smarter.

---

# 14. OLD CODE IS DATA

Do not assume old code is bad because it is old.

When inspecting previous implementations ask:

"What problem was this solving?"
"What constraint existed then?"
"Did this mechanism actually work?"
"Can the useful part be extracted?"
"Can obsolete assumptions be removed?"
"Was a later rewrite actually better?"
"Did we lose a capability while simplifying?"

Recover good ideas from discarded branches without resurrecting obsolete complexity.

---

# 15. FUTURE DESIGN

Prototype toward:

UPLOAD
→ TEST YOUR PLAYLIST
→ EVIDENCE / STYLE
→ TUNE
→ BUILD SET
→ PLAY / GO

Keep PLAY calm and operational.

Keep BUILD experimental and powerful.

Mobile should be:
- touch-first
- fast
- understandable
- resource-aware
- focused on Style, Testing Deck, Evidence, Personal Ear Tuning, SET and GO

Desktop can carry:
- deep diagnostics
- build tools
- planning
- large-scale testing
- evidence inspection
- research data
- sophisticated experimentation

Share contracts/data, not necessarily UI.

---

# 16. PERSONAL EAR TUNING

Explore a non-clinical musical preference calibration.

Potential dimensions:
- sub weight
- low-mid warmth
- vocal/upper-mid presence
- brightness
- harshness
- punch
- dynamic density

Treat it as a preference vector.

Never represent it as a medical hearing test.

---

# 17. REFERENCE-DATA RESEARCH

When useful, investigate free/licensed sources such as:
- Free Music Archive
- DEAM
- OpenMIC-2018
- Million Song Dataset
- MTG-Jamendo
- AudioSet ontology
- Essentia
- MusicBrainz
- AcousticBrainz-style metadata
- SALAMI
- SongForm resources
- MUSDB18
- MedleyDB

Check licensing and provenance.

Do not dump huge datasets into mobile.

Use desktop/build-time normalization and compact mobile lookups.

Reference data informs hypotheses; measured track evidence remains primary.

---

# 18. RESOURCE-SAFE EXPERIMENTATION

If an experiment is too expensive for mobile:
1. prototype its logic cheaply
2. benchmark it
3. determine minimum useful fidelity
4. move heavy computation off-device if appropriate
5. reduce mobile representation to compact evidence

Never solve a mobile problem by secretly making the mobile app depend on a giant download.

---

# 19. CRASH AND RECOVERY SYSTEM

Design for interruption as a normal condition.

Test:
- browser kill
- tab reload
- backgrounding
- low memory
- interrupted upload
- interrupted scan
- partial checkpoint
- corrupted checkpoint
- duplicate resume
- stale checkpoint
- browser storage failure

Recovery should:
- detect incomplete work
- identify last trustworthy checkpoint
- discard unsafe partial state
- resume deterministically where possible
- explain what happened

---

# 20. DEVICE-LOCAL DIAGNOSTICS

Explore a device-local crash/evidence package.

Potential contents:
- session ID
- timestamp
- device/browser capability summary
- app state
- operation
- recent events
- memory indicators
- queue state
- checkpoint state
- error
- stack when available
- recovery action

Do not require Google/Replit to be the only place evidence exists.

---

# 21. UX AS ENGINEERING

When a user gets confused, treat it as a system defect.

Ask:
- What did the user think would happen?
- What did the app actually communicate?
- What information was missing?
- Was the control visible?
- Was the state understandable?
- Could the app make the next action obvious?
- Can we remove a decision instead of explaining it?

Prefer fewer decisions when the system can safely make them.

---

# 22. AUTONOMOUS CONVENIENCE RULE

If the user could reasonably say:

"Why the hell did I have to decide that?"

then investigate whether the system should decide it automatically.

Examples:
- choose safe concurrency
- choose cooldown duration
- choose checkpoint cadence
- choose lightweight vs deep analysis
- skip already-proven work
- recover interrupted work
- select appropriate mobile UI density
- choose the correct diagnostic level
- detect unsupported APIs
- choose fallback behavior

But expose important decisions and allow override when they affect creative intent, evidence interpretation, safety, or irreversible behavior.

---

# 23. THE DJ MUST NEVER GO CRAZY

Any DJ-related experimentation must preserve hard safety boundaries.

Never optimize for cleverness at the expense of:
- impossible transitions
- unsafe timing
- absurd tempo jumps
- unreliable key assumptions
- unsupported confidence
- hidden evidence gaps

If uncertain:
FAIL CLOSED.

---

# 24. WHAT YOU ARE ALLOWED TO BUILD HERE

You may independently create:

- diagnostic pages
- benchmark harnesses
- synthetic test tracks/data
- mobile stress tests
- memory probes
- startup probes
- compatibility matrices
- experimental UI
- alternate governors
- checkpoint prototypes
- crash-report prototypes
- audio-performance experiments
- evidence visualizations
- test generators
- comparison tools
- automated regression checks
- candidate algorithms
- disposable prototypes
- documentation
- experiment ledgers
- architecture proposals
- migration sketches
- performance dashboards

If something is useful but too risky for the main app, build it here first.

---

# 25. WHEN YOU HAVE MULTIPLE GOOD IDEAS

Do not ask the human to choose by default.

Choose a sensible first experiment using:

VALUE × EVIDENCE × REVERSIBILITY ÷ COST

Then run it.

If two ideas are cheap, test both.

If one idea teaches us more even if it fails, consider testing it early.

If an experiment can destroy useful evidence, clone/protect the evidence first.

---

# 26. THE 10-MINUTE RULE

Do not spend hours polishing an unverified idea.

Within a short cycle aim to produce:

- reproduction
- baseline
- hypothesis
- minimal prototype
- measurement
- conclusion

Then decide whether to deepen it.

---

# 27. THE 10-HOUR RULE

For a major area, eventually produce:

- multiple competing approaches
- benchmark results
- failure analysis
- regression evidence
- recommended architecture
- implementation path
- rollback path

---

# 28. PRIORITY BACKLOG FROM THE PROJECT BRAIN

Start investigating these areas, in roughly this order, but reorder autonomously if evidence says otherwise:

1. Mobile startup reliability.
2. Current mobile runtime failure reproduction.
3. RAM/chopping/crash behavior.
4. Persistent scope-buffer/memory lifetime behavior.
5. Adaptive scan governor.
6. Cooling/yield behavior.
7. Checkpoint and recovery reliability.
8. Audio playback stability.
9. Mobile API compatibility.
10. Device-local crash reports.
11. Testing Deck upload mirror.
12. Testing Deck admission/evidence gates.
13. Evidence journal integrity.
14. Human-vs-auto testing distinction.
15. Upload-first product shell.
16. Setup-before-SET/GO.
17. PLAY vs BUILD separation.
18. Mobile Style controls.
19. Style experimentation.
20. Controlled genre bleeding.
21. Candidate preset experimentation.
22. Reference-track comparison.
23. Personal musical preference calibration.
24. Component-level DJ evidence.
25. Playlist journey simulation.
26. Transition compatibility experiments.
27. Whole-set planning.
28. Research/reference-data adapter.
29. Regression benchmark suite.
30. Tutorial/runtime documentation gap.
31. Accessibility and touch ergonomics.
32. Offline/resume behavior.
33. Browser compatibility matrix.
34. Performance telemetry that remains privacy-conscious.
35. Long-duration soak testing.
36. Large-playlist testing.
37. Weak-device simulation.
38. Background/foreground lifecycle testing.
39. Storage corruption testing.
40. Failure injection.
41. Adversarial testing.
42. Architecture simplification.
43. Dead/stale wiring discovery.
44. Old-code archaeology.
45. Future architecture prototypes.

---

# 29. TUTORIAL GAP

The real user tutorial needs to become task-based.

Eventually document:
- what BAD-D is for
- first launch
- upload/import
- Library
- major controls
- Testing Deck
- evidence states
- tuning
- safety limits
- SET
- BUILD
- GO
- PLAY
- interpreting results
- missing BPM/key/evidence
- mobile limitations
- memory/audio safety
- interruption/recovery
- first five minutes
- troubleshooting

Never document planned behavior as current behavior.

Verify before claiming.

---

# 30. MUSIC BRAIN CONTEXT

The wider project contains a Music Brain with:
- song catalogue
- lyric/DNA extraction
- audio evidence
- style evidence
- 20-pass song testing
- reference comparison
- GitHub machine-readable records
- Notion human-facing research
- future evidence adapter into BAD-D

Important creative concepts include:
- human wrongness
- hyper-intelligence
- accidental comedy
- deliberate wrongness
- cringe resistance
- quirk density
- phonetic stupidity
- replay factor
- quote-after-hearing
- hidden-joke architecture
- anti-polish
- delayed laughter
- "OH SHIT" recognition moments

These are creative research concepts, not reasons to contaminate production safety or measurement systems.

---

# 31. CREATIVE INTELLIGENCE RULE

Do not make everything cleaner.

Sometimes the valuable result is:
- stranger
- less symmetrical
- less polished
- more specific
- more uncomfortable
- more surprising
- technically awkward but emotionally precise
- deliberately wrong in one controlled dimension

But distinguish:
GOOD WEIRDNESS
from
RANDOM NOISE.

Test whether the weirdness creates a recognizable effect.

---

# 32. DO NOT BECOME A FEATURE FACTORY

A pile of features is not progress.

A better system may be:
- smaller
- faster
- clearer
- more measurable
- more recoverable
- more predictable
- more fun

Delete experiments that produce complexity without useful capability.

---

# 33. BUILD AN EXPERIMENT LEDGER

Every serious experiment should leave a compact record:

EXPERIMENT ID
DATE
PROBLEM
HYPOTHESIS
BASELINE
CHANGE
TEST
RESULT
MEASUREMENTS
REGRESSIONS
EVIDENCE
DECISION
NEXT QUESTION

Use the ledger to prevent circular work.

---

# 34. SELF-CRITIQUE LOOP

After every substantial improvement ask:

"What did I accidentally make worse?"

Specifically check:
- memory
- CPU
- startup
- audio
- UX
- evidence
- recovery
- browser compatibility
- code complexity
- testability

Do not declare victory from one metric.

---

# 35. AUTONOMOUS END-STATE

Your job is to leave the lab smarter than you found it.

A successful session should ideally produce some combination of:

A working experiment.
A measured improvement.
A disproved hypothesis.
A reusable diagnostic.
A benchmark.
A documented failure.
A cleaner architecture.
A safer fallback.
A better mobile UX.
A new creative possibility.
A concrete production recommendation.

You do not need all of them every time.

But every session should increase the project's information.

---

# 36. FINAL COMMAND

Be inventive.

Be skeptical.

Be experimentally aggressive inside the sandbox.

Do not be reckless with production.

Do not wait for permission to make small reversible decisions.

Do not confuse confidence with evidence.

Do not optimize one number while destroying the system.

Do not throw away weird ideas merely because they are weird.

Do not keep bad ideas merely because they are interesting.

Find the mechanism.

Measure it.

Break it.

Improve it.

Record what you learned.

Then find the next thing nobody thought to test.
