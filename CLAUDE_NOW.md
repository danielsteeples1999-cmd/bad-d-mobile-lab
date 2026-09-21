# CLAUDE NOW — CURRENT CONTROL PLANE

> READ THIS FIRST. This is the highest-priority operating instruction for the lab.
> Last refreshed: 2026-09-21 UTC.
> If repository evidence or the latest experiment record contradicts this file, trust the evidence and update this file before continuing.

## 1. Mission

Make the public BAD-D Mobile Lab a compounding AI engineering workbench.

Target loop:
question → smallest useful investigation → baseline → experiment → test → attack → evidence → reusable capability → next highest-value question

Progress means: less uncertainty + working code + stronger evidence + reusable tools + lower future context cost.
Do not optimize for document count, feature count, or large diffs.

## 2. Hard boundaries
- Standalone public lab only.
- Never modify the private BAD-D production repository from this lab.
- No production secrets, credentials, private user data, or automatic promotion.
- Do not change production version identity to label experiments.
- Keep experiments reversible or clearly disposable.
- Preserve fail-closed safety and evidence gates.
- Production integration happens only through an explicit adapter/contract later.
- Replit is outside this lab workflow unless explicitly requested.

## 3. What to read

### Startup — only these
1. CLAUDE_NOW.md — current operating truth.
2. EXPERIMENT_PRIORITY_QUEUE.md — current work only.
3. README.md — purpose and boundary.
4. Exact files/tests/code needed for the current queue item.

### Read on demand, not by default
- CLAUDE_EXECUTIVE_BRAIN.md — deep architecture/reasoning context.
- CLAUDE_BUILD_ORDER.md — detailed engineering method.
- CLAUDE_TOKEN_EFFICIENCY.md — context discipline.
- GOAL_CROSSWALK.md — cross-goal leverage.
- CLAUDE_COMPLETION_STATUS_PROTOCOL.md — completion/evidence reporting.
- Historical/research documents — only when they can change the current decision.

Do not read the whole repository. Search first. Read the smallest relevant slice.

## 4. Current execution rule
Do not ask what to work on when the queue and evidence already answer it.
Choose the highest-information, highest-leverage task that is actually runnable.

Before coding:
1. inspect current git state;
2. inspect the active queue item;
3. locate the smallest controlling code/test surface;
4. check whether an existing reusable tool already solves part of the job;
5. establish or recover a baseline;
6. state competing hypotheses briefly.

Then work.

## 5. 20-minute execution budget
- 20 min active work maximum
- 8 experiments maximum
- 5 repeats per experiment maximum
- 12 sweep values maximum
- 16 concurrent jobs maximum
- 500 MB generated data maximum
- 50 MB persisted results maximum
- one controlled budget extension maximum

Stop early when the question is answered or evidence is saturated.
Also stop on repeated failure without new information, missing/invalid baseline, fixture corruption, resource pressure, safety/access boundary, production coupling, diminishing information gain, or budget exhaustion.
When stopping, preserve evidence and report exact stop reason + budget used + information gained + next highest-value experiment.

## 6. Universal experiment cycle
LOCATE → REPRODUCE → BASELINE → HYPOTHESIZE → DISCRIMINATE → BUILD → MEASURE → ATTACK → REGRESS → RECORD → ADVANCE

The smallest experiment that distinguishes competing explanations beats a large implementation.
If blocked, build a smaller deterministic reproduction instead of writing a long explanation.

## 7. Evidence gates
A file existing is not proof.
- runtime claim → runtime evidence
- performance claim → benchmark evidence
- mobile claim → real device/browser evidence where required
- audio claim → signal/listening evidence appropriate to the claim
- recovery claim → interruption/recovery evidence
- regression claim → regression test

Never loosen a tolerance merely to make a fixture pass.
For exact decoded PCM equality experiments, do not use bit-depth conversion as the default way to create representation-only WAV differences. If maxAbsDiff != 0, investigate the fixture or hypothesis instead of hiding the difference with tolerance.

## 8. Build for reuse
Preferred progression:
one-off test → probe → fixture → benchmark → failure injection → regression → machine-readable evidence → searchable memory

A reusable tool should have stable purpose/interface, structured result, bounded resources, failure states, evidence, tests, reuse target, and version/schema identifier.
Do not build speculative frameworks.

## 9. AI-tool efficiency
Prefer direct search/test execution for simple work.
Use subagents only when work is genuinely parallel, isolated, or independently verifiable. Do not spawn agents just to search a few files or perform sequential edits.
Use hooks/automation when they reduce repeated verification.
Use browser automation only when browser/device behavior is actually the question.
Use MCP/external services only when they materially improve the current experiment.
Keep tool output compact and machine-readable.
Temporary scratch files should be deleted unless they become reusable infrastructure.

## 10. Use Claude Code's capabilities intelligently

When the environment provides them, use the native capabilities instead of rebuilding them inside the lab:

- **Plan mode** for large/ambiguous changes before execution.
- **Subagents** for genuinely parallel, isolated or independently verifiable work; avoid delegation for simple sequential work.
- **Hooks** for repeatable checks such as tests, linting, evidence validation or cleanup.
- **MCP/connectors** when an external system materially improves the current experiment.
- **Checkpoints/version control** before risky multi-step changes so experiments remain reversible.
- **Background tasks** for long-running processes when they do not block the main investigation.
- **Sandboxing/contained execution** where available for safer autonomous experimentation.
- **Evals** for reusable tools: build realistic tasks, run them repeatedly, measure success, then improve the tool rather than merely changing prompts.

Do not add a lab feature just because Claude Code already has the capability. Use the native capability first; build a repository capability only when it creates durable project-specific value.

## 10. Self-validation
Before declaring success, run the strongest cheap validation available:
static/syntax check → focused test → benchmark → failure/edge attack → regression check → evidence record

Attack the implementation yourself before asking Daniel to test it.
Human testing is for evidence the local environment cannot establish.

## 11. Cross-goal leverage
Prefer mechanisms that answer multiple problems.
- scheduler → import + UI + audio + RAM + long-run stability
- memory instrumentation → RAM + scope + audio + crashes + soak tests
- checkpoint/recovery → import + Testing Deck + lifecycle
- benchmark/evidence engine → nearly every future experiment
- failure injection → nearly every subsystem

After each meaningful experiment ask: What reusable capability did this create, and what other question can now be answered cheaper?

## 12. Engineering memory
Do not make the next Claude rediscover old work.
Every serious experiment leaves a compact record containing, where applicable:
ID / question / hypothesis / baseline / change / test / result / evidence / failures / limitations / decision / next question / reusable artifact

Failed experiments remain searchable knowledge.
Keep the active queue short. Historical plans belong in history, not in the active brain.

## 13. Human interaction
Ask Daniel only when the next step genuinely requires physical-device evidence, credentials/permissions, an irreversible decision, ambiguous creative intent, or production integration approval.
When human testing is required, give one exact action.
Otherwise continue autonomously.

## 14. Autonomy boundary
Claude may independently inspect, search, build experiments, run tests, benchmark, inject failures, compare results, refactor lab code when justified, create reusable tools, update experiment records, and reorder the queue when evidence changes priorities.

Claude must not promote a lab result to production, silently weaken a safety/evidence gate, fabricate device/audio/runtime evidence, treat simulation as physical-device proof, or spend the entire cycle on documentation when executable work is possible.

## 15. End-of-cycle output
Return a compact status:
BUILT
TESTED
EVIDENCE
BROKEN / LIMITATIONS
REUSABLE CAPABILITY
QUEUE CHANGE
NEXT HIGHEST-VALUE ACTION
ONE HUMAN TEST — only if required

Do not write a long report unless the evidence or failure is genuinely complex.

## 16. Keep this file current
At the end of every substantive cycle:
1. update the active queue;
2. update this file only when current operating truth changed;
3. remove stale instructions rather than accumulating them;
4. record evidence/commit identifiers;
5. leave the repository easier for the next AI to enter.

The repository's current evidence outranks old instructions.

The goal is not to make Claude read more.
The goal is to make Claude need to read less while doing more.