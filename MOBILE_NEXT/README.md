# BAD-D Mobile — Next Version Work Packet

Status: **PLANNED / LAB BRANCH OPENED**  
Canonical task: [MOBILE-UPDATE-001](https://github.com/danielsteeples1999-cmd/bad-d-mobile-lab/issues/6)  
Branch: `claude/mobile-update-001-start`

## Why this exists
Start a real next mobile update, not another research-only cycle. The goal is one user-visible improvement backed by regression evidence, then a release candidate in the authorized private workspace.

## Authority boundary
- This public repository is a disposable lab.
- Do not copy the private mobile HTML, production history, private data, or credentials here.
- Do not modify the private production branch or publish a release from this lab.
- No automatic promotion. Human acceptance is required.

## Source-of-record baseline
- Repository: `danielsteeples1999-cmd/bad_d_meomory` (private)
- Current mobile source path: `BAD-D_SIGNAL_15_72_0-mobile.html`
- Known recorded app-pair MD5 from project handoff: `d20918442bb0c9d84a2360c0eea708e6` (pair-level historical value; **not** a verified mobile-only SHA-256)
- Current exact production commit and mobile-only SHA-256: **UNKNOWN in this packet**. Must be recorded from the authorized workspace before implementation.
- Never normalize or silently change the product version identity.

## Update priorities
1. **Startup and import resilience** — errors recover clearly; no stuck loading state; cancellation does not leave stale work running.
2. **Large-file / RAM stability** — bounded work, object URL and buffer lifetime, avoid duplicate copies where possible.
3. **Phone-first usability** — touch targets, viewport fit, clear state, no forced scrolling while Deck A plays; headphones-first layout.
4. **Interruption recovery** — visibility changes, screen lock/background, interrupted imports and transitions.
5. **Audio integrity** — do not alter DSP, deck, Auto-DJ or library behavior without a focused hypothesis and regression evidence.

These are priorities, not claims that any fix has already been implemented.

## First falsifiable experiment
On the authorized baseline, record:
- exact commit, file SHA-256, browser/device/OS and viewport;
- cold startup time (5 repeats);
- representative import time and file size;
- console errors and whether cancel/retry works;
- memory/crash evidence where available.

Choose the smallest user-visible defect that reproduces. If the baseline cannot be run, mark it **BLOCKED** and do not invent results.

## Definition of first usable candidate
- One visible improvement implemented on an isolated branch.
- A deterministic regression test for the bug/fix.
- Startup/import/cancel-retry checks.
- Responsive viewport check.
- Evidence report tied to exact candidate commit and file hash.
- Physical-device checks explicitly marked pending until performed on a real phone.
- No merge, deployment, release, or production promotion without explicit approval.

## Status vocabulary
Use the project's evidence labels: `CLAIMED`, `IMPLEMENTED`, `OBSERVED`, `VERIFIED`, `ACCEPTED`, `BLOCKED`, `FAILED`, `UNKNOWN`, `STALE`, `CONTRADICTORY`. Do not call a change verified merely because its file exists.

## Next action
Run the baseline measurement in the authorized private workspace, then implement the highest-impact reproducible mobile defect. This public packet deliberately does not contain production source.
