# GRID-METER-006: Mark the final bar line "unknown"

**Status:** MEASURED (machine evidence, synthetic fixtures; scored on stored GRID-METER-005 data) · 2026-10-03

**Files:**
- Pre-registration: [PREREGISTRATION.md](PREREGISTRATION.md). Committed in `256ada3` before scoring.
- Verdicts: [verdicts.json](verdicts.json).
- Cycle record: [cycle.json](cycle.json).

## Problem
18 of C5's 23 remaining silent errors were the final decoded downbeat of a track: a bar line placed after the music had ended. That bar has no following downbeat, so its length cannot be measured. Pass 02 §F says such a value must be `unknown`, not `confident`.

## Change
Rule **E** always flags the last decoded downbeat. **C6** = C5 + E. E needs no model and costs nothing.

## Result
Decision set: 24 fixtures.

| Config | Silent error rate | False-alarm rate | Trustworthy coverage | CPU s / audio-min |
|---|---|---|---|---|
| C1 (two networks, GRID-METER-004) | 0.0286 (23/804) | 0.0474 | 0.791 | 16.38 |
| C5 (GRID-METER-005) | 0.0279 (23/824) | 0.0256 | 0.966 | 5.84 |
| **C6 = C5 + E** | **0.0061 (5/824)** | **0.0256** (unchanged) | **0.966** (unchanged) | 5.84 |

**Pre-registered verdict: C6 is recommended over C1 and adopted over C5.**
- The silent error rate fell from 2.8 % to 0.6 % (Wilson 95 %: 0.003–0.014).
- False alarms and coverage did not move: on every decision fixture, the final downbeat was already either wrong or flagged.

**End-to-end check (`run_real.py`, default now `--config C6`, same stand-in files):**
- Wrong / hits / false alarms: sync 1/1/0 · ce1 2/2/1 · control 1/1/0 · ce2 (MP3) 6/6/4.
- So E catches the trailing bar line on three of the four files with no new false alarms.

## What is left (MACHINE)
- **5 silent errors**, all next to the odd bar in `ce1`/`ce2` (bar indices 16–17).
- **One** at the very first downbeat of `ce5_pickup1` @174 BPM.

## Limitations
- The synthetic fixtures end with a ~2 s decay tail, which invites a trailing bar line. Real tracks with long outros may produce fewer trailing errors, so E's real-world benefit is **UNKNOWN**.
- Its cost is one flagged bar per track, at the end, where mixing out normally happens anyway.
- Synthetic fixtures only.

## Decision
**KEEP: C6 is the lab candidate.** That is Beat This! minimal downbeats, flagged if D1, R or E fires.
- `run_real.py` defaults to C6.
- GRID-METER-003 (real tracks) will verify C6.
- Lab-only, as before.
