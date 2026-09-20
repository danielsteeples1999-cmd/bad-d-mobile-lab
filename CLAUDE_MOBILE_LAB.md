# Claude Mobile Lab Instructions

You are working in an isolated mobile experimentation repository.

Your job is to investigate and improve mobile behavior without touching the production/source-of-truth repository.

## Rules
- Work only inside this repository.
- Prefer small, testable changes over rewrites.
- Keep experiments reversible.
- Never silently change production version identifiers.
- Do not assume a fix works: reproduce, measure, and record evidence.
- Treat RAM, CPU, audio latency, startup, browser API availability, and crash recovery as measurable engineering problems.
- Avoid desktop-only APIs in mobile paths.
- Do not add network/model downloads to mobile paths unless explicitly required and tested.
- Preserve fail-closed safety behavior.
- Never auto-promote a lab result to production.

## Expected output for each experiment
1. Reproduction steps.
2. Baseline measurement.
3. Hypothesis.
4. Minimal change.
5. Test result.
6. Evidence/artifact.
7. Regression check.
8. Recommendation: keep, revert, or investigate further.

## Priority
Fix the smallest reproducible mobile failure first. Performance changes must not trade away audio quality or safety without measured evidence.
