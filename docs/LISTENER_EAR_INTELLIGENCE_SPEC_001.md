# BAD-D Listener Ear Intelligence — Build Specification 001

## Mission
Tune BAD-D to the individual listener's actual hearing/playback context using measured evidence, not generic assumptions.

## Architecture
1. Listener Context Layer — device, connection, environment, volume/reference, known EQ/DSP, latency.
2. Calibration Layer — controlled A/B/C tests; one variable at a time; randomized presentation where practical; confidence and CANNOT TELL.
3. Ear Preference Model — frequency/tonality, vocal presence, bass texture, transient sharpness, dynamics, stereo width, ambience, distortion tolerance, loudness tolerance.
4. Contextual Model — preferences may change by headphones vs car vs phone, genre, listening level, and DJ/performance use.
5. Evidence Engine — repeated observations, sample count, consistency, recency, context match, confidence; never promote weak evidence.
6. Recommendation Engine — proposes bounded adjustments with reason + evidence; user can accept/reject/undo.
7. Safety Governor — hard caps on gain/EQ changes, headroom protection, no clipping, no silent production promotion.
8. Personal Memory — local-first IndexedDB; compact profiles, raw-event retention limits, export/import, purge controls.
9. Learning Loop — every session becomes useful: observe → test → record → distill → retain useful signal → expire technical noise.
10. Human Authority — user can override every recommendation; the system must say CANNOT TELL when evidence is insufficient.

## Test protocol
- Ask listening device before judging.
- Establish reference material and normal listening level.
- Run short controlled comparisons.
- Record exact variable changed.
- Record response and confidence.
- Repeat across contexts before generalizing.
- Separate measured acoustic facts from subjective preference.
- Never infer hearing ability or medical status.

## First intelligent behaviours
- Detect contradictory preferences instead of averaging them blindly.
- Maintain separate profiles per playback context.
- Identify stable preferences versus track-specific reactions.
- Find the smallest change that produces a repeatable positive response.
- Detect when a preference may be caused by playback chain rather than the mix.
- Explain every recommendation in plain language.
- Track CANNOT TELL as useful evidence.
- Prevent profile contamination from poor-quality tests.

## Production boundary
This remains LAB ONLY until:
- browser/mobile tests pass;
- persistence/recovery tests pass;
- memory/resource tests pass;
- recommendation explanations are auditable;
- no unsafe audio changes occur;
- explicit human acceptance occurs.
