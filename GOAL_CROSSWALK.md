# GOAL CROSSWALK — WHY THE ORDER MATTERS

The lab should attack mechanisms that correlate with multiple BAD-D goals.

| Core mechanism | Immediate target | Other goals affected |
|---|---|---|
| Cooperative scheduler | bulk import blocking | RAM, audio continuity, startup, responsiveness, battery, Testing Deck |
| Memory lifetime control | RAM/chopping | scope, audio, long runs, crash resistance, large playlists |
| Adaptive governor | runaway workload | RAM, UI, audio, thermal pressure, throughput |
| Checkpoint/recovery | interrupted runs | Testing Deck, evidence, long scans, mobile lifecycle |
| Capability detection | startup failures | mobile compatibility, fallback UX, reliability |
| Evidence schema | trustworthy results | Testing Deck, regression, tuning, promotion gates |
| Benchmark harness | slow manual testing | every future experiment, token efficiency |
| Failure injection | unknown recovery behavior | storage, lifecycle, evidence integrity, crash handling |
| Audio regression harness | performance changes | audio quality, playback stability, optimization safety |
| Adapter contract | future integration | BAD-D promotion, standalone tools, architecture flexibility |

## Cross-goal rule

Prefer a mechanism that improves several goals **without hiding tradeoffs**.

Do not claim correlation as proof of improvement. Measure each affected outcome.

## Product architecture direction

The eventual system should separate:

**BUILD / EXPERIMENT**
- expensive
- evidence-rich
- exploratory
- allowed to fail

from

**PLAY / GO**
- predictable
- low-latency
- safe
- fail-closed
- minimal cognitive load

The lab exists to make BUILD smarter while protecting the future PLAY path.
