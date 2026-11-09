# GRID-METER-005 pre-registration (committed before the check was run)

**Question:** Can a near-zero-cost bar-regularity check bring the single-network configuration C2 (Beat This! minimal + D1, GRID-METER-004) to the safety of C1 (madmom DBN + D3), while keeping C2's lower cost?

**Background (GRID-METER-004):**
- C1: silent error rate 0.0286, 16.38 CPU-s per audio-minute.
- C2: silent error rate 0.0485, false-alarm rate 0.000, trustworthy coverage 0.991, 5.49 CPU-s per audio-minute.
- C2's silent errors cluster in the odd-bar fixtures.

## New check R: bar-length regularity (no model, no parameters)
1. For C2's decoded downbeats, let L_i = the number of C2's own decoded beats in [downbeat_i, downbeat_{i+1}).
2. Let M = the most common L_i in the track.
3. Flag downbeat i if L_i ≠ M, or if L_{i−1} ≠ M (the bar before it is irregular).
4. The last downbeat has no L_i; it is flagged only through L_{i−1}.

**Rationale:** an extra or missing downbeat makes a short or long bar on one side of it. A genuine odd bar will also be flagged. That is accepted as fail-closed behaviour and counts as a false alarm if the downbeat is correct.

## Configuration under test
**C5** = C2's downbeats with flag = D1 ∨ R. One network (Beat This!). R itself costs no network time.

## Fixtures, metrics, decision
- **Fixtures:** the same 32 fixtures and decision set as GRID-METER-004 (control_44, ce1_stumble2, ce2_extend6, ce5_pickup1, sync_anticip, halftime_switch). heyya_pattern and waltz_34 are reported only.
- **Metrics:** identical to GRID-METER-004 (silent error rate, false-alarm rate, trustworthy coverage, CPU s per audio-minute at 1 thread).
- **Regression check:** recomputed C2 must reproduce GRID-METER-004's C2 counts exactly (40 silent / 824 decoded, 0 false alarms) before C5 is interpreted.

**Decision rule (unchanged from GRID-METER-004).** C5 is **recommended over C1** if all three hold:
1. silent error rate ≤ 0.0286 + 0.005 = 0.0336;
2. false-alarm rate ≤ 0.05;
3. cost ≤ 0.6 × 16.38 = 9.83 CPU-s per audio-minute.

No thresholds or rule details are changed after the results are seen.
