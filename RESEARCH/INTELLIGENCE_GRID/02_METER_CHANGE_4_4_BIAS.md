# Research Pass 02 — Meter Change and 4/4 Bias

Do not code.

Investigate why audio systems commonly settle on 4/4 and how that can hide meaningful local structure.

Research:
- automatic time-signature detection
- meter tracking
- beat/downbeat tracking
- mixed and changing meter
- additive/asymmetric meter
- polymeter/polyrhythm
- syncopation
- tuplets
- pickup bars
- truncated/extended bars
- half-time/double-time ambiguity
- tempo ambiguity
- phrase-level displacement

Find real papers, datasets, algorithms, open-source implementations, evaluation methods, and failure cases.

For every method classify:
- reliable automatic use
- useful but uncertain
- research-only
- human confirmation required

The system must be allowed to output "unknown/ambiguous" instead of forcing a meter.

Deliver concrete counterexamples where a 4/4 grid gives the wrong structural interpretation.
Save the evidence and report in this folder.
