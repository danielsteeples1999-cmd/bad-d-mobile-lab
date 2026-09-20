# BAD-D // Mobile Lab

Isolated public-facing sandbox for mobile experimentation around BAD-D // SIGNAL.

## Purpose
This repository is a disposable laboratory for mobile-only experiments, diagnostics, performance work, browser compatibility tests, and prototype fixes.

## Safety boundary
- Do NOT treat this repository as the BAD-D source of truth.
- Do NOT modify or overwrite the main `bad_d_meomory` repository from this lab.
- Do NOT change BAD-D version numbers merely to identify experiments.
- Experiments must be reversible and clearly labeled.
- Preserve fail-closed behavior and evidence gates when testing ideas that may later return to BAD-D.
- No automatic promotion from this lab into production.
- Claude/other agents may experiment here without being given permission to rewrite the main repository.

## Mobile-first targets
Priorities include:
1. Startup reliability.
2. RAM pressure and crash/chopping behavior.
3. Adaptive workload governors.
4. Persistent checkpoints and interrupted-run recovery.
5. Audio playback stability.
6. Browser/mobile API compatibility.
7. Device-local diagnostic evidence.

## Workflow
Observe -> reproduce -> instrument -> change one thing -> test -> record evidence -> compare -> keep/revert.

Every experiment should state:
- problem reproduced
- hypothesis
- change made
- device/browser context
- measured result
- regressions
- next experiment

## Promotion rule
Nothing in this repository is a production change until separately reviewed against the main BAD-D repository and deliberately promoted.
