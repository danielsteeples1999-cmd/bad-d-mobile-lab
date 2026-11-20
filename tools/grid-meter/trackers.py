"""Tracker adapters for GRID-METER-001.

Each adapter takes a mono float32 44.1 kHz array and returns
  {"beats": [...], "downbeats": [...], "act_fps": int,
   "downbeat_activation": np.ndarray (per-frame probability 0..1)}
so evaluation code never depends on a specific library.
"""
import numpy as np

_cache = {}


def _madmom_act(audio):
    from madmom.features.downbeats import RNNDownBeatProcessor
    from madmom.audio.signal import Signal
    if "rnn" not in _cache:
        _cache["rnn"] = RNNDownBeatProcessor()
    sig = Signal(audio, sample_rate=44100, num_channels=1)
    return _cache["rnn"](sig)  # (frames, 2): [beat(non-downbeat), downbeat] at 100 fps


def madmom_dbn(beats_per_bar):
    def run(audio):
        from madmom.features.downbeats import DBNDownBeatTrackingProcessor
        act = _madmom_act(audio)
        dbn = DBNDownBeatTrackingProcessor(beats_per_bar=beats_per_bar, fps=100)
        out = dbn(act)
        beats = out[:, 0].tolist()
        downbeats = out[out[:, 1] == 1, 0].tolist()
        return {"beats": beats, "downbeats": downbeats, "act_fps": 100,
                "downbeat_activation": act[:, 1]}
    return run


def beat_this(dbn):
    def run(audio):
        import torch
        from beat_this.inference import Audio2Frames
        from beat_this.model.postprocessor import Postprocessor
        key = "bt"
        if key not in _cache:
            _cache[key] = Audio2Frames(checkpoint_path="final0", device="cpu")
        beat_logits, db_logits = _cache[key](audio, 44100)
        post = Postprocessor(type="dbn" if dbn else "minimal", fps=50)
        beats, downbeats = post(beat_logits, db_logits)
        act = torch.sigmoid(db_logits.float()).cpu().numpy()
        return {"beats": np.asarray(beats).tolist(), "downbeats": np.asarray(downbeats).tolist(),
                "act_fps": 50, "downbeat_activation": act}
    return run


SYSTEMS = {
    "madmom_dbn_bpb4": madmom_dbn([4]),
    "madmom_dbn_bpb234": madmom_dbn([2, 3, 4]),
    "beat_this_minimal": beat_this(dbn=False),
    "beat_this_dbn": beat_this(dbn=True),
}
