"""Per-bar meter-error detectors (GRID-METER-002). Pre-registered; no tunable thresholds.

Each detector returns one boolean flag per decoded downbeat of a primary decoder.
"""
import numpy as np

WIN = 0.07


def _act_at(act, fps, t):
    i = int(round(t * fps))
    return float(np.max(act[max(0, i - 2): i + 3])) if len(act) else 0.0


def d1_inbar_contrast(primary):
    """Flag a decoded bar if another decoded beat inside it has higher downbeat activation."""
    beats = np.asarray(primary["beats"])
    dbs = np.asarray(primary["downbeats"])
    act, fps = primary["downbeat_activation"], primary["act_fps"]
    flags = []
    for j, d in enumerate(dbs):
        end = dbs[j + 1] if j + 1 < len(dbs) else (beats[-1] + 1e-3 if len(beats) else d)
        inner = beats[(beats > d + WIN / 2) & (beats < end - WIN / 2)]
        a0 = _act_at(act, fps, d)
        flags.append(bool(any(_act_at(act, fps, b) > a0 for b in inner)))
    return flags


def d2_disagreement(primary, reference):
    """Flag if the reference system has no downbeat within 70 ms of the decoded downbeat."""
    ref = np.asarray(reference["downbeats"])
    return [bool(len(ref) == 0 or np.min(np.abs(ref - d)) > WIN) for d in primary["downbeats"]]


def label_wrong(primary, truth):
    tdb = np.asarray(truth["downbeats"])
    return [bool(np.min(np.abs(tdb - d)) > WIN) for d in primary["downbeats"]]


def run_all(primary, reference, truth):
    f1 = d1_inbar_contrast(primary)
    f2 = d2_disagreement(primary, reference)
    return {
        "wrong": label_wrong(primary, truth),
        "D1": f1,
        "D2": f2,
        "D3": [a or b for a, b in zip(f1, f2)],
    }
