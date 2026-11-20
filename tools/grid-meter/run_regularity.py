"""GRID-METER-005: bar-length regularity check R on Beat This! minimal downbeats.

Usage: python run_regularity.py OUT.json
Recomputes C2 (Beat This! minimal + D1) and C5 (C2 + R) on the GRID-METER-004 fixtures.
Uses 1 torch thread so cost is comparable with GRID-METER-004.
"""
import json
import sys
import time
from collections import Counter

import numpy as np

import detect
import fixtures

TEMPOS = [120, 128, 140, 174]
NAMES = list(fixtures.PLANS) + list(fixtures.VARIANTS)


def regularity_flags(beats, downbeats):
    """Pre-registered rule R: flag downbeat i if its bar or the previous bar has a non-modal beat count."""
    beats, dbs = np.asarray(beats), np.asarray(downbeats)
    if len(dbs) < 2:
        return [False] * len(dbs)
    lens = [int(np.sum((beats >= dbs[i] - 1e-6) & (beats < dbs[i + 1] - 1e-6))) for i in range(len(dbs) - 1)]
    mode = Counter(lens).most_common(1)[0][0]
    flags = []
    for i in range(len(dbs)):
        own = i < len(lens) and lens[i] != mode
        prev = i > 0 and lens[i - 1] != mode
        flags.append(bool(own or prev))
    return flags


def main(path):
    import torch
    from beat_this.inference import Audio2Frames
    from beat_this.model.postprocessor import Postprocessor
    torch.set_num_threads(1)
    net = Audio2Frames(checkpoint_path="final0", device="cpu")
    t0 = time.time()
    rows = []
    for name in NAMES:
        for bpm in TEMPOS:
            audio, truth = fixtures.render_named(name, bpm)
            row = {"fixture": name, "bpm": bpm, "audio_sha256": truth["audio_sha256"],
                   "fixture_gate": fixtures.accept(audio, truth)["verdict"],
                   "audio_minutes": round(len(audio) / fixtures.SR / 60, 4)}
            if row["fixture_gate"] == "FIXTURE_ACCEPTED":
                t = time.process_time()
                bl, dl = net(audio, 44100)
                act = torch.sigmoid(dl.float()).cpu().numpy()
                b, d = Postprocessor(type="minimal", fps=50)(bl, dl)
                cost_net = time.process_time() - t
                prim = {"beats": np.asarray(b).tolist(), "downbeats": np.asarray(d).tolist(),
                        "act_fps": 50, "downbeat_activation": act}
                t = time.process_time()
                fl = detect.run_all(prim, prim, truth)
                r = regularity_flags(prim["beats"], prim["downbeats"])
                cost_checks = time.process_time() - t
                tdb = np.asarray(truth["downbeats"])
                row["n_true_downbeats"] = len(tdb)
                row["configs"] = {}
                for cid, flags in (("C2", fl["D1"]), ("C5", [a or b for a, b in zip(fl["D1"], r)])):
                    good = [x for x, w, f in zip(prim["downbeats"], fl["wrong"], flags) if not w and not f]
                    cov = sum(1 for td in tdb if good and np.min(np.abs(np.asarray(good) - td)) <= detect.WIN)
                    row["configs"][cid] = {"wrong": fl["wrong"], "flag": flags, "true_covered_unflagged": int(cov),
                                           "cpu_s": round(cost_net + cost_checks, 3)}
                row["flag_R"] = r
                row["cpu_s_checks"] = round(cost_checks, 4)
            rows.append(row)
            print(name, bpm, row["fixture_gate"], file=sys.stderr)
    json.dump({"schema": "grid-meter-configs/1.0.0", "experiment": "GRID-METER-005",
               "configs": {"C2": {"primary": "beat_this_minimal", "flag_rule": "D1", "networks": ["beat_this_net"]},
                           "C5": {"primary": "beat_this_minimal", "flag_rule": "D1 or R", "networks": ["beat_this_net"]}},
               "torch_threads": 1, "wall_seconds": round(time.time() - t0, 1), "rows": rows}, open(path, "w"), indent=1)


if __name__ == "__main__":
    main(sys.argv[1])
