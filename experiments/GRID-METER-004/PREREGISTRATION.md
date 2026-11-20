# GRID-METER-004 pre-registration (committed before any configuration was run)

**Question:** Can a **single-network** configuration give fail-closed downbeats as safe as madmom DBN + D3 (GRID-METER-002), at materially lower compute cost? D3 needs two neural networks per track, and Pass 05 flagged mobile cost as unknown.

## Configurations
Each produces decoded downbeats plus one warning flag per downbeat.

| ID | Downbeats from | Flag rule | Networks |
|---|---|---|---|
| C1 | madmom RNN + DBN `[4]` | D3 (D1 ∨ D2 vs Beat This! minimal) | 2 |
| C2 | Beat This! minimal | D1 on its own activations | 1 |
| C3 | madmom RNN + DBN `[4]` | D1 only | 1 |
| C4 | Beat This! + DBN `[3,4]` | D1 | 1 |

D1 and D2 are exactly as in GRID-METER-002. Nothing is tuned.

## Fixtures
The same 32 as GRID-METER-002.
- **Decision set:** control_44, ce1_stumble2, ce2_extend6, ce5_pickup1, sync_anticip, halftime_switch (24 fixtures).
- **Reported separately, not part of the decision:** heyya_pattern and waltz_34.

## Metrics
All pooled over the decision set, with a 70 ms window.
- **Silent error rate** = decoded downbeats that are wrong AND unflagged ÷ all decoded downbeats.
- **False-alarm rate** = correct decoded downbeats that are flagged ÷ correct decoded downbeats.
- **Trustworthy coverage** = true downbeats matched by an *unflagged, correct* decoded downbeat ÷ all true downbeats. This is the fraction of bars the craft layer could act on safely.
- **Cost:** CPU seconds per minute of audio for each network stage and decoder, measured with `torch.set_num_threads(1)` as a rough single-core, mobile-like proxy. This is not a device measurement.

## Decision rule
A single-network configuration is **recommended over C1** if all three hold:
1. silent error rate ≤ C1's silent error rate + 0.005 (absolute);
2. false-alarm rate ≤ 0.05;
3. cost ≤ 0.6 × C1's cost.

Otherwise C1 stays the candidate, and the cost is recorded as a known mobile risk. Thresholds are not adjusted after the results are seen.
