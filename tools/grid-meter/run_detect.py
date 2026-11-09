"""GRID-METER-002 runner: per-downbeat flags for pre-registered detectors.

Usage: python run_detect.py OUT.json
Each fixture's network activations are computed once and shared by the decoders that use them.
"""
import json
import sys
import time

import numpy as np

import detect
import fixtures

TEMPOS = [120, 128, 140, 174]
NAMES = list(fixtures.PLANS) + list(fixtures.VARIANTS)


def outputs(audio):
    import torch
    from madmom.audio.signal import Signal
    from madmom.features.downbeats import RNNDownBeatProcessor, DBNDownBeatTrackingProcessor
    from beat_this.inference import Audio2Frames
    from beat_this.model.postprocessor import Postprocessor
    g = globals()
    if "_rnn" not in g:
        g["_rnn"] = RNNDownBeatProcessor()
        g["_bt"] = Audio2Frames(checkpoint_path="final0", device="cpu")
    act = g["_rnn"](Signal(audio, sample_rate=44100, num_channels=1))
    out = DBNDownBeatTrackingProcessor(beats_per_bar=[4], fps=100)(act)
    mm = {"beats": out[:, 0].tolist(), "downbeats": out[out[:, 1] == 1, 0].tolist(),
          "act_fps": 100, "downbeat_activation": act[:, 1]}
    bl, dl = g["_bt"](audio, 44100)
    bact = torch.sigmoid(dl.float()).cpu().numpy()
    res = {"madmom_dbn_bpb4": mm}
    for kind, name in (("minimal", "beat_this_minimal"), ("dbn", "beat_this_dbn")):
        b, d = Postprocessor(type=kind, fps=50)(bl, dl)
        res[name] = {"beats": np.asarray(b).tolist(), "downbeats": np.asarray(d).tolist(),
                     "act_fps": 50, "downbeat_activation": bact}
    return res


def main(path):
    t0 = time.time()
    rows = []
    for name in NAMES:
        for bpm in TEMPOS:
            audio, truth = fixtures.render_named(name, bpm)
            gate = fixtures.accept(audio, truth)["verdict"]
            row = {"fixture": name, "bpm": bpm, "audio_sha256": truth["audio_sha256"], "fixture_gate": gate}
            if gate == "FIXTURE_ACCEPTED":
                o = outputs(audio)
                ref = o["beat_this_minimal"]
                row["primaries"] = {p: detect.run_all(o[p], ref, truth)
                                    for p in ("madmom_dbn_bpb4", "beat_this_dbn")}
            rows.append(row)
            print(name, bpm, gate, file=sys.stderr)
    json.dump({"schema": "grid-meter-detect/1.0.0", "experiment": "GRID-METER-002",
               "window_s": detect.WIN, "wall_seconds": round(time.time() - t0, 1), "rows": rows},
              open(path, "w"), indent=1)


if __name__ == "__main__":
    main(sys.argv[1])
