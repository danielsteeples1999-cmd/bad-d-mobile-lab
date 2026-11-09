# Micro builder: 12 hours of work

This is the whole brief. Read it top to bottom, then work through the blocks in order.

---

## Rules (read first, follow always)

1. **Don't touch the app.**
   - Never edit the BAD-D app files, never merge, never release, never change permissions or secrets.
   - You write documents, sheets, scripts in your own folder, and results.
2. **One job at a time.**
   - Each job gets its own branch named `micro/<JOB-ID>` and its own results file at `micro/results/<JOB-ID>.md`.
   - Commit and push when the job is done.
3. **Nothing private in public.**
   - This repo is public.
   - No songs, stems, set lists with personal data, keys or tokens.
   - Daniel's song names stay out unless he says otherwise.
4. **Show, don't claim.**
   - Every result says how you know: a command, a file or a screenshot.
   - "Not possible", "not tested" and "needs a phone" are valid answers. Say them plainly.
5. **Stop and ask** if a job needs a decision only Daniel can make. Mark the job **BLOCKED**, say what you need, and move to the next job. Never guess on his behalf.
6. **Log every hour.**
   - Append one line to `micro/LOG.md`: time, job, status (DONE / BLOCKED / PARTIAL), file.
   - That log is the proof of the 12 hours.
7. **Time box.**
   - Each job has a time.
   - If it runs 50 % over, stop, mark it PARTIAL with what's left, and move on.
8. **Finished early?** Pull the next job from the **Backlog** at the bottom. Never invent work outside this file.

Where things live:
- The main app is the PROTO V29 test copy in `danielsteeples1999-cmd/bad_d_meomory`, on branch `claude/prototype-all-001`, at `test-copies/prototype-all/`. Read it, never edit it.
- The test tools are on the branches named in each job.

---

## The 12-hour plan

Times are working minutes. Each block is about 2 hours.

### Block 1, hours 0–2: facts and housekeeping
| ID | Job | Min | Done when |
|---|---|---|---|
| ISS-01 | Label every open GitHub issue in `bad_d_meomory` as real app test / process / duplicate. Close nothing. | 40 | A table of issue → label → one-line reason |
| ISS-02 | List the issues that are filed tests nobody ever ran, oldest first | 20 | A sorted list with links |
| ISS-03 | Map every branch: what's on it, merged or not, last commit date. Delete nothing. | 20 | A table |
| FACTS-01 | One-page BAD-D fact sheet using only measured numbers (chaos 158/166, master gate 6/7, voice detector 0.27 → 0.60) | 30 | Every number links to the results file that proves it |
| LOG | Hourly log lines | 10 | `micro/LOG.md` updated |

### Block 2, hours 2–4: the app explained
| ID | Job | Min | Done when |
|---|---|---|---|
| FACTS-02 | Plain-English changelog, V1 → V29, from the commit history | 35 | One line per version, no jargon |
| FACTS-03 | Rebrand version map: every old build → its new number. Renumber nothing silently. | 20 | A table covering every build |
| FACTS-04 | Feature list: shipped on main / in prototype only / planned | 25 | Each item names the build it's in |
| HELP-01 | Button glossary: every button, what it does, where it lives (start from `docs/UX_BUTTON_PLAN.md`) | 30 | One line per button |
| LOG | | 10 | |

### Block 3, hours 4–6: checks (run, don't fix)
| ID | Job | Min | Done when |
|---|---|---|---|
| CHK-01 | Run the regression (`tools/regression/run.cjs`), the chaos test (`claude/chaos-001`), the master gate (`claude/master-gate-001`) and the vocal lab (`claude/vocal-lab-001`) on V29 | 50 | One results table with pass/fail for each, plus the raw output files |
| CHK-02 | File size and load time for every prototype build V10 → V29 (headless Chromium, Pixel 7 profile) | 30 | A trend table that flags any build more than 10 % bigger or slower than the one before |
| CHK-03 | Accessibility pass on V29: text contrast, buttons ≥ 44 px, readable at 390 px wide | 30 | A list of failures, each with a screenshot |
| LOG | | 10 | |

### Block 4, hours 6–8: wording and help
| ID | Job | Min | Done when |
|---|---|---|---|
| WORD-01 | Gather every message the app can show (status lines, alerts, panel text) | 35 | A full list with where each one appears |
| WORD-02 | Rewrite each one as "what happened / what to do now" | 40 | A before/after table for the main builder to apply later |
| WORD-03 | Flag messages that blame the user or show internal names (detector IDs, job codes) | 15 | A list of offenders |
| HELP-02 | FAQ, 15 questions, including "Why did my phone show Aw, Snap?" and "Does my music leave my phone?" | 20 | Every answer checked against the app's actual behaviour |
| LOG | | 10 | |

### Block 5, hours 8–10: listening kits and test songs
| ID | Job | Min | Done when |
|---|---|---|---|
| DATA-03 | Make more test songs with known answers, using the existing generators (`tools/chaos/make_fixture.cjs`, `tools/vocal_lab/make_scenes.cjs`). Add new seeds, tempos and keys. Commit the answer files, not the WAVs. | 30 | A generator command and answer files for 20 new songs |
| EAR-01 | Blind A/B listening kit design: how to make 10 loudness-matched pairs (BAD-D master vs original), labelled only A and B, with a sealed answer key. Build it with test songs only; Daniel's songs get added on his phone. | 35 | A script plus instructions, tested on 2 test songs |
| EAR-02 | Transition scoring sheet: smooth / clash / vocal fight / tempo drift, with timestamps | 15 | The sheet plus one filled example |
| HELP-03 | Quick-start guide: first set in 5 steps on V29 | 20 | Followed step by step in headless Chromium, with a screenshot for each step |
| CON-03 | Beginner glossary: BPM, key, Camelot, LUFS, EQ, stems, crossfade, cue | 10 | One plain line each |
| LOG | | 10 | |

### Block 6, hours 10–12: release readiness and field-test sheets
| ID | Job | Min | Done when |
|---|---|---|---|
| REL-01 | Rebrand release checklist: what must be true before any public build | 25 | Every item has an owner and a test |
| REL-02 | Rollback plan: put the previous build back within 5 minutes | 20 | Steps rehearsed on a copy, never on production |
| LEGAL-01 | Every outside library and font the app loads, with its licence | 25 | A table showing whether each one may be used commercially |
| LEGAL-02 | Privacy statement draft: what stays on the phone and what leaves | 20 | Each line checked against the app's network calls (record them in headless Chromium) |
| FIELD | Write the phone field-test sheets for Daniel (see "Needs a real phone" below): one page each, with steps and blanks to fill | 20 | 8 sheets ready to print or fill on a phone |
| WRAP | Final summary in `micro/SUMMARY.md`: done / partial / blocked, with links, plus the top 5 findings | 10 | Pushed |

Planned total: about 12 hours.

---

## Needs a real phone or a person: write the sheet, don't fake the result

A headless browser can't honestly do these.

The micro builder **writes the test sheet** (in FIELD, above). **Daniel runs it** on his phone.

| ID | What Daniel measures |
|---|---|
| PWR-01 | Battery % used in a 1-hour set |
| PWR-02 | Phone heat and slowdowns at 30 and 60 minutes |
| PWR-03 | Incoming call, screen lock, switching apps mid-set: keeps playing / stops / crashes |
| PWR-04 | Bluetooth speaker and headphone delay |
| OFF-01 | Airplane mode from cold start to the end of a set |
| OFF-02 | Kill the app mid-set and reopen: what came back, what was lost |
| OFF-03 | Phone storage nearly full, then import songs |
| HW-03 | USB audio interface: does sound come out, and how much delay |

---

## Backlog: pull from here if ahead of time, top first

| ID | Job | Min |
|---|---|---|
| OFF-04 | Backup/restore: can the library and song scores move to a new phone? Read the storage code and answer. | 30 |
| SET-01 | Set report template (songs, transitions, energy curve, clashes, skips), filled from a test set | 30 |
| SET-03 | 3 energy-curve shapes for good sets (warm-up, peak, cool-down) for future Auto DJ planning | 25 |
| HW-01 | Cheap DJ controllers and MIDI pads that work in a phone browser (Web MIDI), with sources | 30 |
| HW-02 | Which BAD-D controls a basic controller would need. Design only. | 20 |
| SHOT-01 | Automatic screenshots of every main V29 screen, phone and desktop | 30 |
| SHOT-02 | Store-size versions of the 5 best screenshots | 20 |
| SHOT-03 | 30-second demo video shot list: import → analyse → mix → master | 20 |
| SHOT-04 | App icon in every size needed, checked on light and dark backgrounds | 25 |
| CHK-04 | Broken links and missing files in all repo docs | 20 |
| ISS-04 | For each duplicate issue, name the original it duplicates. Close nothing. | 25 |
| PPL-01 | User interview script: 10 questions for phone DJs, plus a consent line | 20 |
| PPL-02 | Tester feedback form design. No live data collection. | 20 |
| PPL-03 | "First 5 minutes" observation checklist for a new user | 15 |
| CON-01 | 10 tutorial video ideas under 60 s: title, hook, steps | 25 |
| CON-02 | Before/after master clip plan, using only music Daniel owns the rights to | 15 |
| EAR-03 | Reference track list: 20 per genre Daniel plays. Names only, no audio. | 20 |
| LEGAL-03 | Rebrand name check: is each candidate already used by a music app or trademark? Sources linked. | 30 |
| MKT-01 | Feature table: BAD-D vs BandLab, djay, rekordbox, each cell sourced. **Check with the marketing queue first** so you don't duplicate it. | 30 |
| MKT-02 | Pricing scan of 10 DJ and mastering apps, dated and sourced. Same check first. | 25 |
| REL-03 | Support inbox plan: where bug reports go and who replies | 15 |
| WORD-04 | Read every panel title and label aloud: flag any word a first-time DJ wouldn't know | 25 |
| CHK-05 | Run CHK-01 again on the newest build if the main builder pushed one today, and diff it against this morning's results | 30 |

The backlog adds about 9 more hours, so the micro builder won't run out.

---

## Blocked until Daniel answers (skip these, note them in SUMMARY)

- Closing duplicate issues: needs his YES.
- Anything that uses his real songs or stems: those are on his device only.
- Posting anything publicly: social media, store listings, a tester form going live.
