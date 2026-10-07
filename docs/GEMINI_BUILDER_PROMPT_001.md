You are Gemini Builder working as the UI/interaction engineer for BAD-D Listener Ear Intelligence Lab 001.

REPOSITORY:
danielsteeples1999-cmd/bad-d-mobile-lab
BRANCH:
listener-ear-tuning-lab-001

Build a polished mobile-first prototype called “BAD-D Listener Ear Intelligence”.

MISSION:
BAD-D must learn how an individual listener actually experiences audio on their real playback systems. Do NOT build a generic EQ preset app. Build an evidence-driven personal listener calibration system.

CORE FLOW:
1. Ask “What are you listening on?” FIRST.
2. Capture device, connection, environment, reference volume/EQ notes and optional latency.
3. Run short controlled A/B tests.
4. Randomize A/B presentation where practical to reduce position bias.
5. Ask what changed and whether the listener can tell.
6. Provide explicit CANNOT TELL / SAME / BOTH USEFUL outcomes.
7. Record confidence.
8. Build separate contextual profiles for headphones, earbuds, monitors, phone, car and other systems.
9. Distinguish stable listener preference from one-track reaction.
10. Recommend only bounded, reversible changes with an explanation and evidence count.
11. Never claim the listener prefers something unless the evidence supports it.
12. Never infer hearing loss, medical status or health conditions.
13. Never automatically change BAD-D production.
14. Keep this Lab isolated.

MODEL DOMAINS:
bass, low-mid, mid, presence, treble, vocal presence, transient attack, dynamics, loudness, stereo width, depth/space, ambience, distortion tolerance, timing/latency.

EVIDENCE MODEL:
Each observation needs context + variable + response + confidence + timestamp.
Track sample count, consistency, recency and context match.
Contradictions must be visible rather than silently averaged.
CANNOT TELL is valid data.
Weak evidence must remain weak.

UX:
- Extremely clear mobile controls.
- Large “A”, “B”, “CANNOT TELL” buttons.
- Show what is being tested before each trial.
- Show “why BAD-D is asking this”.
- Live listener profile dashboard.
- Context switcher.
- Evidence strength indicators without fake precision.
- Undo/delete individual observation.
- Local-first persistence with IndexedDB where possible.
- Export/import JSON.
- No network required for calibration.
- Show a prominent LOCAL ONLY / LAB ONLY state.

RESOURCE SAFETY:
Bound event history.
Deduplicate repeated technical events.
Keep distilled listener knowledge longer than raw session telemetry.
Provide cleanup/retention controls.
Avoid unbounded arrays, audio buffers, object URLs, timers or event listeners.
Never retain audio blobs unless explicitly required.

DELIVERABLES:
- working mobile UI
- listener calibration workflow
- contextual profile
- evidence ledger
- recommendation simulator
- local persistence
- export/import
- cleanup/resource governor
- test/reset mode
- README explaining how to test
- clear separation between measured data, subjective preference and simulated recommendation
- no production BAD-D imports or writes

IMPORTANT:
Do not merely describe the architecture. Implement it in the repository.
Run the app/build/tests you can run.
Report exact files changed, tests run, failures, and what remains unverified.
Do not claim DONE without evidence.
