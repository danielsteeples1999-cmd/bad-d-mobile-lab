# GRID-METER-003: Does the D3 detector hold on real tracks, and how common are odd bars?

**Status:** PIPELINE VALIDATED · WAITING ON ONE HUMAN INPUT · 2026-10-03
**Builds on:** [GRID-METER-002](../GRID-METER-002/README.md). D3 caught 126/137 mis-phased downbeats at a 0.038 false-alarm rate, but on synthetic tracks only.

## Why this is the next experiment
Two unknowns now decide whether the Intelligence Grid's meter work matters in practice:
1. **Prevalence:** how often does real DJ material contain a bar the analyser mislabels?
2. **Real-track D3 performance:** recall and false alarms on music with weaker downbeat cues than the fixtures.

Neither can be measured honestly from public datasets alone. The public sets with audio (Ballroom, GTZAN, Hainsworth) were very likely part of both trackers' training data, so scores on them would be optimistic. The question is also about *BAD-D's* library.

## Method (fixed before any real track is seen)
1. `tools/grid-meter/run_real.py AUDIO_DIR OUT_DIR` analyses each track with madmom DBN `[4]` and Beat This! minimal, then applies D3 exactly as pre-registered in GRID-METER-002. No changes.
2. For each track, a listener opens [Downbeat Check](https://claude.ai/artifact/6gry5DKb99xqTB4PqQ4mLv) and loads the audio plus its `.grid.json`. The page plays the track with a click on each decoded bar line. The listener:
   - toggles **"Click is off the 1"** while the click is not on the downbeat;
   - marks **"Can't tell"** spans, which are excluded from scoring;
   - marks **"Odd bar here"** where a bar felt short or long.

   The page records which spans were actually heard.
3. `run_real.py ... --verify VDIR` scores D3:
   - A decoded downbeat inside an "off the 1" span counts as **wrong**.
   - Unheard and unsure bars are excluded.
   - A verification whose `file_sha256` does not match the audio is **rejected**.

**Success criteria:** the same as GRID-METER-002 (recall ≥ 0.90, false-alarm rate ≤ 0.05), pooled over verified bars. **Prevalence** is reported as the fraction of tracks with ≥ 1 wrong bar, and the fraction of all heard bars that are wrong.

**Known bias, stated in advance:** the listener sees the detector's flags while listening. Flagged spans may get more attention. Recall is still measured only over heard bars, and listening to the whole track is requested. This bias must be reported with the result.

## Method amendment (2026-10-03, before any real track was analysed)
GRID-METER-005 found that **C5** (Beat This! minimal downbeats, flagged by D1 or the bar-regularity rule R) matches C1's silent-error rate on synthetic fixtures. It does so at about a third of the cost, with 97 % vs 79 % usable coverage. C5 is now the lab candidate.

- `run_real.py` therefore defaults to `--config C5`. The listener hears clicks on **C5's** bar lines, and C5's flags are scored.
- `--config C1` reproduces the original D3 plan.
- The success criteria are unchanged.

**End-to-end re-validation on the same four stand-in files** (MACHINE, wrong / hits / false alarms):

| Config | sync_anticip @140 | ce1_stumble2 @128 | control_44 @128 | ce2_extend6 @174 (MP3) | Matches |
|---|---|---|---|---|---|
| C5 | 1/0/0 | 2/1/1 | 1/0/0 | 6/6/4 | GRID-METER-005 rows exactly |
| C1 | 1/0/1 | 16/15/1 | 0/0/1 | 17/17/2 | Earlier C1 validation exactly |

**Second amendment (2026-10-03, still before any real track):** GRID-METER-006 adopted C6 = C5 + rule E (the final bar line is always `unknown`). `run_real.py` now defaults to `--config C6`. End-to-end on the same stand-ins, wrong / hits / false alarms: 1/1/0 · 2/2/1 · 1/1/0 · 6/6/4.

## Pipeline validation (MACHINE, synthetic stand-ins, 2026-10-03)
Four fixtures were written to disk as real audio files: WAV, WAV, FLAC and **MP3**. They were run through `run_real.py`, with a simulated perfect listener derived from exact ground truth:

| Alias | Fixture | Pipeline (wrong / hits / false alarms) | GRID-METER-002 (same fixture) |
|---|---|---|---|
| T01 | sync_anticip @140 (FLAC) | 1 / 0 / 1 | 1 / 0 / 1 |
| T02 | ce1_stumble2 @128 (WAV) | 16 / 15 / 1 | 16 / 15 / 1 |
| T03 | control_44 @128 (WAV) | **REJECTED_HASH_MISMATCH**: verification was deliberately given a wrong hash (attack) | n/a |
| T04 | ce2_extend6 @174 (MP3) | 17 / 17 / 2 | 17 / 17 / 2 |

**Results**
- The real-track path reproduces GRID-METER-002 exactly on all three verified tracks, including the lossy MP3.
- The hash-mismatch attack was rejected.
- Track names appear only in the git-ignored `private_names.json`. Public output uses hash-ordered aliases.
- Listener page: JavaScript syntax-checked; rendered headless at 400 px (dark) and 1000 px (light). No page errors (only Google Fonts was unreachable from the sandbox). No horizontal scroll.
- Self-tests: 12/12 pass.

## What is needed from a human (the one remaining input)
10–20 tracks from Daniel's own library, ideally including some suspected to have odd bars, uploaded into a session. **The audio is never committed.** After analysis, each track's grid is handed back for a listen in Downbeat Check, and each copied result is pasted back.

## Limitations
- Listener verification is perceptual (P-class) evidence. One listener, no inter-rater check.
- A fixed 0.6 s reaction offset is subtracted from each tap. Spans are therefore approximate to about half a beat. That is fine for bar-level labels (a bar is ≥ 1.3 s at ≤ 180 BPM), but not finer.
