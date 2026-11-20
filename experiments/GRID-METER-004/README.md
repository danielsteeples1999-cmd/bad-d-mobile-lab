# GRID-METER-004: Can one network give fail-closed downbeats as safely as two?

**Status:** MEASURED (machine evidence, synthetic fixtures, CPU-time proxy for mobile) · 2026-10-03

**Files:**
- Pre-registration: [PREREGISTRATION.md](PREREGISTRATION.md). Committed in `f3fa43d` before any configuration was run.
- Raw: [configs_results.json](configs_results.json).
- Verdicts: [verdicts.json](verdicts.json).
- Tables: [summary.md](summary.md).
- Cycle record: [cycle.json](cycle.json).

## Problem
The GRID-METER-002 candidate is madmom DBN + D3, which needs two neural networks per track. Pass 05 named mobile cost as an unknown risk. If one network were as safe, the grid would be cheaper to ship.

## Configurations

| ID | Networks | Downbeats from | Flag rule |
|---|---|---|---|
| C1 | 2 | madmom DBN | D3 |
| C2 | 1 | Beat This! minimal | D1 |
| C3 | 1 | madmom DBN | D1 |
| C4 | 1 | Beat This! + DBN | D1 |

## Result
Decision set: 24 fixtures. CPU measured single-threaded.

| Config | Networks | Silent error rate | False-alarm rate | Trustworthy coverage | CPU s per audio-minute | Verdict vs C1 |
|---|---|---|---|---|---|---|
| **C1** | 2 | **0.029** (23/804) | 0.047 | 0.791 | 16.4 | baseline |
| C2 | 1 | 0.049 (40/824) | **0.000** | **0.991** | **5.5** | not recommended (silent errors) |
| C3 | 1 | 0.086 (69/804) | 0.046 | 0.792 | 10.9 | not recommended |
| C4 | 1 | 0.065 (54/833) | 0.003 | 0.977 | 5.9 | not recommended |

**Pre-registered verdict: no single-network configuration is recommended. C1 remains the candidate.**

**Per-stage cost** (MACHINE: CPU seconds per minute of audio, one thread, x86 container)

| Stage | CPU s / audio min |
|---|---|
| madmom RNN | 8.8 |
| madmom DBN decode | 2.0 |
| Beat This! network | 5.4 |
| Beat This! minimal post-processing | ~0 |
| Beat This! DBN post-processing | 0.4 |

## What the numbers mean (INTERPRETATION of MACHINE data)

**1. The configurations fail in opposite directions**
- **C1 is cautious.** It has the fewest silent errors, but it withholds trust from about 21 % of bars. Its flags fire on whole mis-phased halves of a track, plus some false alarms.
- **C2 is permissive.** It almost never withholds trust (99 % coverage, zero false alarms). But nearly 5 % of its downbeats are wrong without warning, concentrated in the odd-bar fixtures (23 of its 40 silent errors).
- For fail-closed DJ automation, a silent error is the worse failure. The pre-registered rule reflects that, so C1 stays.

**2. The difference is real but modest** (Wilson 95 %)
- C1 silent error rate: 0.019–0.043.
- C2 silent error rate: 0.036–0.065.
- The intervals overlap slightly. On this data C2 is very likely, but not certainly, worse.

**3. Cost**
- C1 costs about 3× C2. The madmom RNN alone (8.8 s per audio minute) costs more than the whole of C2.
- A 5-minute track is ~82 CPU-seconds for C1 vs ~27 s for C2 on one container core. Phone cores are typically slower, but **device cost is UNKNOWN**: this is not a device measurement.

**4. Hardest cases are bad for everyone** (reported, not in decision)
- `heyya_pattern`: C1 silent error 0.19; C2 0.45.
- `waltz_34`: C1 0.04 but 0.09 coverage; C2 0.48.

## Limitations
- Synthetic fixtures only.
- CPU time on an x86 container core is a proxy. Mobile execution, memory, ONNX/WebAssembly ports and model quantisation were not tested.
- Silent-error counts are small (23 vs 40), so the comparison may change on real music.

## Decision
- **KEEP C1** (madmom DBN + D3) as the candidate per-bar status rule.
- **Record:** two-network cost (~16 CPU-s per audio-minute) is a measured mobile risk.
- **Record the trade-off:** C2 gives 3× cheaper analysis and near-total coverage, at roughly 1.7× the silent-error rate.

## Next question
- **GRID-METER-005 (candidate):** a cheaper *second opinion* for C2. For example, a lightweight meter-consistency check: bar-length regularity of C2's own downbeats against its beat grid, with no second network. Could it catch C2's silent errors at near-zero cost? It must be pre-registered before running.
- **GRID-METER-003** (real tracks) still outranks it: real-track error rates may change which configuration matters.
