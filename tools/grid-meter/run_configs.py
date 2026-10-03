"""GRID-METER-004 runner: fail-closed downbeat configurations, safety metrics and per-stage CPU cost.

Usage: python run_configs.py OUT.json
Costs are measured single-threaded (torch.set_num_threads(1)) as a rough mobile proxy, not device evidence.
"""
import json
import sys
import time

import numpy as np

import detect
import fixtures

TEMPOS = [120, 128, 140, 174]
NAMES = list(fixtures.PLANS) + list(fixtures.VARIANTS)
CONFIGS = {  # id: (primary decoder, flag rule, networks used)
    "C1": ("madmom_dbn_bpb4", "D3", ("madmom_rnn", "beat_this_net")),
    "C2": ("beat_this_minimal", "D1", ("beat_this_net",)),
    "C3": ("madmom_dbn_bpb4", "D1", ("madmom_rnn",)),
    "C4": ("beat_this_dbn", "D1", ("beat_this_net",)),
}


def stages(audio):
    """Run every network/decoder once, timing each with process CPU time."""
    import torch
    from madmom.audio.signal import Signal
    from madmom.features.downbeats import RNNDownBeatProcessor, DBNDownBeatTrackingProcessor
    from beat_this.inference import Audio2Frames
    from beat_this.model.postprocessor import Postprocessor
    torch.set_num_threads(1)
    g = globals()
    if "_rnn" not in g:
        g["_rnn"] = RNNDownBeatProcessor()
        g["_bt"] = Audio2Frames(checkpoint_path="final0", device="cpu")
    cost, out = {}, {}

    t = time.process_time()
    act = g["_rnn"](Signal(audio, sample_rate=44100, num_channels=1))
    cost["madmom_rnn"] = time.process_time() - t
    t = time.process_time()
    o = DBNDownBeatTrackingProcessor(beats_per_bar=[4], fps=100)(act)
    cost["madmom_dbn"] = time.process_time() - t
    out["madmom_dbn_bpb4"] = {"beats": o[:, 0].tolist(), "downbeats": o[o[:, 1] == 1, 0].tolist(),
                              "act_fps": 100, "downbeat_activation": act[:, 1]}

    t = time.process_time()
    bl, dl = g["_bt"](audio, 44100)
    bact = torch.sigmoid(dl.float()).cpu().numpy()
    cost["beat_this_net"] = time.process_time() - t
    for kind, name in (("minimal", "beat_this_minimal"), ("dbn", "beat_this_dbn")):
        t = time.process_time()
        b, d = Postprocessor(type=kind, fps=50)(bl, dl)
        cost[name + "_post"] = time.process_time() - t
        out[name] = {"beats": np.asarray(b).tolist(), "downbeats": np.asarray(d).tolist(),
                     "act_fps": 50, "downbeat_activation": bact}
    return out, cost


def config_cost(cid, cost):
    prim, rule, nets = CONFIGS[cid]
    c = sum(cost[n] for n in nets)
    c += cost["madmom_dbn"] if prim == "madmom_dbn_bpb4" else cost[prim + "_post"]
    if rule == "D3":
        c += cost["beat_this_minimal_post"]
    return c


def main(path):
    t0 = time.time()
    rows = []
    for name in NAMES:
        for bpm in TEMPOS:
            audio, truth = fixtures.render_named(name, bpm)
            row = {"fixture": name, "bpm": bpm, "audio_sha256": truth["audio_sha256"],
                   "fixture_gate": fixtures.accept(audio, truth)["verdict"],
                   "audio_minutes": round(len(audio) / fixtures.SR / 60, 4)}
            if row["fixture_gate"] == "FIXTURE_ACCEPTED":
                out, cost = stages(audio)
                row["stage_cpu_s"] = {k: round(v, 3) for k, v in cost.items()}
                tdb = np.asarray(truth["downbeats"])
                row["n_true_downbeats"] = len(tdb)
                row["configs"] = {}
                for cid, (prim, rule, _) in CONFIGS.items():
                    p = out[prim]
                    flags = detect.run_all(p, out["beat_this_minimal"], truth)
                    good_unflagged = [d for d, w, f in zip(p["downbeats"], flags["wrong"], flags[rule])
                                      if not w and not f]
                    covered = sum(1 for td in tdb if good_unflagged and np.min(np.abs(np.asarray(good_unflagged) - td)) <= detect.WIN)
                    row["configs"][cid] = {"wrong": flags["wrong"], "flag": flags[rule],
                                           "true_covered_unflagged": int(covered),
                                           "cpu_s": round(config_cost(cid, cost), 3)}
            rows.append(row)
            print(name, bpm, row["fixture_gate"], file=sys.stderr)
    json.dump({"schema": "grid-meter-configs/1.0.0", "experiment": "GRID-METER-004",
               "configs": {k: {"primary": v[0], "flag_rule": v[1], "networks": list(v[2])} for k, v in CONFIGS.items()},
               "torch_threads": 1, "wall_seconds": round(time.time() - t0, 1), "rows": rows},
              open(path, "w"), indent=1)


if __name__ == "__main__":
    main(sys.argv[1])
