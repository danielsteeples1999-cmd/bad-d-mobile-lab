# Claude Lab — Completion & Status Protocol

The lab must distinguish **what exists** from **what has actually been verified**.

Every session report must classify every meaningful item as exactly one of:

- **DONE — VERIFIED**: implemented and tested with concrete evidence. State what was tested, where, and the result.
- **DONE — NOT YET VERIFIED**: implementation/documentation exists, but runtime/device evidence is still missing.
- **IN PROGRESS**: partially implemented or actively being investigated.
- **BLOCKED**: cannot proceed without a missing permission, credential, fixture, device capability, or other explicit dependency.
- **REVERTED**: experiment was tried and removed; preserve the lesson.
- **DEFERRED**: intentionally not pursued yet, with reason.
- **NOT STARTED**: identified but no meaningful work performed.

## Mandatory evidence rule

Never call something "done" merely because:
- a file was created
- code was written
- syntax looks correct
- a plan was documented
- a test was designed
- an agent believes it should work

"VERIFIED" requires an actual check appropriate to the claim:
- runtime behavior for runtime claims
- benchmark data for performance claims
- device/browser test for mobile compatibility claims
- audio comparison/listening or signal evidence for audio-quality claims
- recovery/failure injection for recovery claims
- regression test for regression claims

If the required environment is unavailable, mark **DONE — NOT YET VERIFIED**, not verified.

## Every session must finish with this exact structure

### 1. EXECUTIVE STATE
- Current lab purpose
- Current bottleneck
- Current maturity stage
- What materially changed this session

### 2. STATUS LEDGER
For each item:
- ID
- status from the list above
- exact artifact/commit
- evidence
- remaining uncertainty
- next action

### 3. VERIFIED
Only items with concrete evidence.

### 4. NOT YET VERIFIED
Everything implemented or claimed but lacking the required evidence.

### 5. WHAT I ACTUALLY TESTED
Include:
- fixture/input
- browser/device/runtime
- command or procedure
- expected result
- observed result
- failures
- regressions

### 6. WHAT I DID NOT TEST
Be explicit. This section is mandatory.

### 7. NEXT EXPERIMENT
Choose the single highest-information next experiment unless two cheap experiments should be run together.
State:
- question
- competing hypotheses
- measurement
- pass/fail condition
- why this is next

### 8. USER TEST TIP
Give Daniel exactly one practical thing to do on the phone when a human/device check is needed. Make it short and executable.

### 9. STOP / CONTINUE
Say whether the current line of investigation should continue, branch, revert, or wait for device evidence. Explain why.

## Anti-overclaim rule

A polished report is not evidence. If no runtime/device experiment happened, say so plainly.

Prefer:
"Implemented the probe. Not verified on a real Android device."

Never:
"Fixed mobile memory."

unless the evidence actually demonstrates the fix.

## Session completion rule

A session is not "complete" just because files were changed. It is complete only when the report clearly separates:
1. work performed,
2. evidence obtained,
3. claims still unverified,
4. the next experiment,
5. the one thing the human should test.

The purpose is to make every handoff unambiguous.
