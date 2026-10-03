"""GRID-METER-003 runner: real tracks -> per-bar grid + warning flags + listen list.

Default configuration is C5 (Beat This! minimal + D1 or bar-regularity R; GRID-METER-005).
Use --config C1 for madmom DBN + D3 (GRID-METER-002).

Usage:
  python run_real.py AUDIO_DIR OUT_DIR                 # analyse
  python run_real.py AUDIO_DIR OUT_DIR --verify VDIR    # also score against check.html verifications

Privacy / public-repo rules:
  - Audio is never copied or written. Only SHA-256 hashes, timings and flags are stored.
  - Track names go ONLY to OUT_DIR/private_names.json (never commit it). Public output uses
    aliases T01, T02, ... ordered by file hash, so they are stable and reveal nothing.

Outputs in OUT_DIR:
  grids/<alias>.grid.json    per-track grid for check.html (downbeats, beats, flags)
  real_results.json          per-track summary (+ scores if --verify)
  listen_list.md             the bars a human should check, with timestamps
  private_names.json         alias -> filename (LOCAL ONLY)
"""
import argparse
import hashlib
import json
import os
import sys
import time

import numpy as np

import detect
import run_detect
from run_regularity import regularity_flags

EXTS = (".wav", ".mp3", ".flac", ".ogg", ".aiff", ".aif")
SR = 44100
SCHEMA_GRID = "grid-meter-grid/1.0.0"
SCHEMA_RESULTS = "grid-meter-real/1.0.0"


def load(path):
    import soundfile as sf
    import soxr
    x, sr = sf.read(path, dtype="float32", always_2d=True)
    x = x.mean(axis=1)
    if sr != SR:
        x = soxr.resample(x, sr, SR).astype(np.float32)
    return x


def spans(times, flags, beats_end):
    """Merge consecutive flagged bars into [start, end] spans (seconds)."""
    out, cur = [], None
    for j, (t, f) in enumerate(zip(times, flags)):
        end = times[j + 1] if j + 1 < len(times) else beats_end
        if f:
            cur = [t, end] if cur is None else [cur[0], end]
        elif cur is not None:
            out.append(cur)
            cur = None
    if cur is not None:
        out.append(cur)
    return [[round(a, 2), round(b, 2)] for a, b in out]


def verified_wrong(downbeats, verification):
    """Map a check.html verification onto decoded downbeats.

    verification["wrong_spans"]: [[t0, t1], ...] where the listener heard the click OFF the "1".
    A decoded downbeat is 'wrong' if it lies inside any wrong span.
    Bars inside "unsure_spans" are excluded from scoring (returned as None).
    If "listened_spans" is present, bars the listener never heard are also excluded:
    recall is only meaningful over audio that was actually checked.
    """
    ws = verification.get("wrong_spans", [])
    us = verification.get("unsure_spans", [])
    ls = verification.get("listened_spans")
    lab = []
    for d in downbeats:
        if any(a <= d <= b for a, b in us) or (ls is not None and not any(a <= d <= b for a, b in ls)):
            lab.append(None)
        else:
            lab.append(any(a <= d <= b for a, b in ws))
    return lab


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio_dir")
    ap.add_argument("out_dir")
    ap.add_argument("--verify", help="directory of <alias>.verify.json files from check.html")
    ap.add_argument("--config", choices=("C5", "C1"), default="C5",
                    help="C5 (default, GRID-METER-005 candidate) or C1 (madmom DBN + D3, GRID-METER-002)")
    ap.add_argument("--max-tracks", type=int, default=40, help="budget guard")
    a = ap.parse_args()

    files = sorted(f for f in os.listdir(a.audio_dir) if f.lower().endswith(EXTS))
    hashed = []
    for f in files:
        with open(os.path.join(a.audio_dir, f), "rb") as fh:
            hashed.append((hashlib.sha256(fh.read()).hexdigest(), f))
    hashed.sort()
    hashed = hashed[: a.max_tracks]
    os.makedirs(os.path.join(a.out_dir, "grids"), exist_ok=True)

    t0 = time.time()
    names, tracks = {}, []
    for i, (h, f) in enumerate(hashed, 1):
        alias = f"T{i:02d}"
        names[alias] = f
        rec = {"alias": alias, "file_sha256": h}
        try:
            audio = load(os.path.join(a.audio_dir, f))
            ts = time.time()
            o = run_detect.outputs(audio)
            rec["analysis_seconds"] = round(time.time() - ts, 1)
        except Exception as e:  # recorded, never swallowed
            rec["status"] = f"ERROR {type(e).__name__}: {e}"
            tracks.append(rec)
            print(alias, rec["status"], file=sys.stderr)
            continue
        if a.config == "C5":  # GRID-METER-005 candidate: one network + model-free regularity check
            prim = o["beat_this_minimal"]
            f1 = detect.d1_inbar_contrast(prim)
            fr = regularity_flags(prim["beats"], prim["downbeats"])
            flags = [x or y for x, y in zip(f1, fr)]
            parts = {"flags_D1": f1, "flags_R": fr}
        else:  # C1: GRID-METER-002 candidate, madmom DBN + D3
            prim, ref = o["madmom_dbn_bpb4"], o["beat_this_minimal"]
            f1 = detect.d1_inbar_contrast(prim)
            f2 = detect.d2_disagreement(prim, ref)
            flags = [x or y for x, y in zip(f1, f2)]
            parts = {"flags_D1": f1, "flags_D2": f2}
        dbs = prim["downbeats"]
        end = (prim["beats"][-1] if prim["beats"] else 0) + 1e-3
        ibi = float(np.median(np.diff(prim["beats"]))) if len(prim["beats"]) > 2 else None
        rec.update({
            "status": "OK",
            "config": a.config,
            "duration_s": round(len(audio) / SR, 2),
            "bpm_estimate": round(60 / ibi, 2) if ibi else None,
            "n_bars": len(dbs),
            "n_flagged": int(sum(flags)),
            "flagged_fraction": round(sum(flags) / len(dbs), 4) if dbs else None,
            "flagged_spans": spans(dbs, flags, end),
        })
        grid = {"schema": SCHEMA_GRID, "alias": alias, "file_sha256": h, "config": a.config,
                "beats": [round(x, 4) for x in prim["beats"]],
                "downbeats": [round(x, 4) for x in dbs],
                "flags": flags, **parts,
                "flagged_spans": rec["flagged_spans"]}
        json.dump(grid, open(os.path.join(a.out_dir, "grids", f"{alias}.grid.json"), "w"))

        if a.verify:
            vp = os.path.join(a.verify, f"{alias}.verify.json")
            if os.path.exists(vp):
                v = json.load(open(vp))
                if v.get("file_sha256") != h:
                    rec["verify"] = {"status": "REJECTED_HASH_MISMATCH"}
                else:
                    lab = verified_wrong(dbs, v)
                    pairs = [(w, fl) for w, fl in zip(lab, flags) if w is not None]
                    wrong = sum(1 for w, _ in pairs if w)
                    hits = sum(1 for w, fl in pairs if w and fl)
                    corr = sum(1 for w, _ in pairs if not w)
                    fa = sum(1 for w, fl in pairs if not w and fl)
                    rec["verify"] = {"status": "OK", "wrong": wrong, "hits": hits,
                                     "correct": corr, "false_alarms": fa,
                                     "excluded_unsure_or_unheard": sum(1 for w in lab if w is None),
                                     "odd_bars_reported": len(v.get("odd_bars", []))}
        tracks.append(rec)
        print(alias, rec.get("n_bars"), "bars,", rec.get("n_flagged"), "flagged", file=sys.stderr)

    doc = {"schema": SCHEMA_RESULTS, "experiment": "GRID-METER-003", "config": a.config,
           "wall_seconds": round(time.time() - t0, 1), "tracks": tracks}
    ver = [t["verify"] for t in tracks if t.get("verify", {}).get("status") == "OK"]
    if ver:
        W, Hh = sum(v["wrong"] for v in ver), sum(v["hits"] for v in ver)
        C, F = sum(v["correct"] for v in ver), sum(v["false_alarms"] for v in ver)
        doc["pooled"] = {"tracks_verified": len(ver), "wrong": W, "hits": Hh, "correct": C, "false_alarms": F,
                         "recall": round(Hh / W, 4) if W else None,
                         "false_alarm_rate": round(F / C, 4) if C else None,
                         "tracks_with_any_wrong_bar": sum(1 for v in ver if v["wrong"] > 0),
                         "tracks_with_reported_odd_bars": sum(1 for v in ver if v["odd_bars_reported"] > 0)}
    json.dump(doc, open(os.path.join(a.out_dir, "real_results.json"), "w"), indent=1)
    json.dump(names, open(os.path.join(a.out_dir, "private_names.json"), "w"), indent=1)

    with open(os.path.join(a.out_dir, "listen_list.md"), "w") as fh:
        fh.write(f"# Listen list ({a.config} flags)\n\nCheck these spans first in check.html. Times are mm:ss.\n\n")
        for t in tracks:
            if t.get("status") != "OK":
                fh.write(f"- **{t['alias']}**: {t['status']}\n")
                continue
            sp = ", ".join(f"{int(x // 60)}:{x % 60:04.1f}–{int(y // 60)}:{y % 60:04.1f}"
                           for x, y in t["flagged_spans"]) or "none flagged"
            fh.write(f"- **{t['alias']}** ({t['n_bars']} bars, ~{t['bpm_estimate']} BPM): {sp}\n")


if __name__ == "__main__":
    main()
