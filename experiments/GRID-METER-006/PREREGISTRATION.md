# GRID-METER-006 pre-registration (committed before scoring)

**Observation (GRID-METER-005, descriptive):** 18 of C5's 23 silent errors on the decision set are the **final** decoded downbeat of a track. The tracker places a bar line after the music has ended.

**Rule change E ("unmeasurable final bar"):** always flag the last decoded downbeat of a track. Its bar has no following downbeat, so its length cannot be measured. Under Pass 02 §F its status should be `unknown`, not `confident`.

**Configuration C6** = C5 with flag = D1 ∨ R ∨ E. E needs no audio or model. It is scored directly on the stored per-downbeat results in `experiments/GRID-METER-005/regularity_results.json`; no network is re-run.

**Decision rule.** The same thresholds as GRID-METER-004/005, against C1 (silent error rate 0.0286, cost 16.38):
- **recommended over C1** if silent error rate ≤ 0.0336, false-alarm rate ≤ 0.05 and cost ≤ 9.83 CPU-s per audio-minute;
- **adopted over C5** only if it is also recommended over C1 **and** its false-alarm rate rises by no more than 0.02 absolute over C5 (0.0256 → ≤ 0.0456).

**Known in advance:** synthetic fixtures end with a ~2 s decay tail. E may matter less on real tracks with outros. This is recorded as a limitation, not a reason to change the rule.
