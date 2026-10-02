# GRID-METER-002 pre-registration (committed before any detector was run)

**Question:** Can a per-bar flag catch the silently mis-phased downbeats found in GRID-METER-001, without raising false alarms when the meter is steady?

**Unit of analysis:** each downbeat produced by a *primary* decoder.
- It is **wrong** if no true downbeat lies within 70 ms of it. This is the same rule as GRID-METER-001.
- A flag on a wrong downbeat is a **hit**.
- A flag on a correct downbeat is a **false alarm**.

**Primary decoders**
- `madmom_dbn_bpb4`: the silent failure case.
- `beat_this_dbn`.

**Detectors.** All are parameter-free or use fixed values chosen now. **No threshold tuning.**

| ID | Rule |
|---|---|
| D1 "in-bar activation contrast" | Flag the decoded bar if any *other* decoded beat inside it has a higher downbeat activation (the primary network's own output, max over ±2 frames) than the decoded downbeat. |
| D2 "decoder disagreement" | Flag if the reference system `beat_this_minimal` (raw activations, no DBN) has **no** downbeat within 70 ms of the decoded downbeat. |
| D3 = D1 ∨ D2 | Flag if either fires. |

**Fixtures:** the 24 GRID-METER-001 fixtures (bit-identical, regression-checked) plus 8 new fixtures. All 8 keep a constant 4/4 meter, so any flag on a correct downbeat is a false alarm:
- `sync_anticip`: every second bar's chord arrives an 8th note early. Syncopation, not a meter change (Pass 05 F3).
- `halftime_switch`: bars 9–24 switch the drums to half-time (Pass 05 F4).

**Success criteria for a detector, per primary decoder**
1. Recall ≥ 0.90 on wrong downbeats, pooled over `ce1_stumble2` + `ce2_extend6` (all tempos).
2. False-alarm rate ≤ 0.05 on correct downbeats, pooled over `control_44` + `ce5_pickup1` + `sync_anticip` + `halftime_switch`.

Both must hold. Results on `heyya_pattern` and `waltz_34` are reported but are not part of the pass/fail decision.

**Decision rule**
- If some detector meets both criteria for madmom, it becomes the candidate `ambiguous`-status rule for L3. Promotion stays lab-only.
- If none does, record which criterion fails and by how much. Do **not** adjust thresholds to pass.
