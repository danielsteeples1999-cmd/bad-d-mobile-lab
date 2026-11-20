"""Score a tracker output against exact fixture truth (GRID-METER-001).

Metric window is the MIREX-standard 70 ms; it is fixed in advance and never tuned.
"""
import numpy as np
import mir_eval

WIN = 0.07
WARMUP_BARS = 2  # first 2 true downbeats excluded from pre-deviation stats (tracker warm-up)


def _hits(ref, est, win=WIN):
    est = np.asarray(est)
    if len(est) == 0:
        return np.zeros(len(ref), dtype=bool)
    return np.array([np.min(np.abs(est - r)) <= win for r in ref])


def _auc(pos, neg):
    """P(score of a correct downbeat > score of a wrong one); 0.5 = uninformative."""
    if len(pos) == 0 or len(neg) == 0:
        return None
    pos, neg = np.asarray(pos)[:, None], np.asarray(neg)[None, :]
    return float(((pos > neg).sum() + 0.5 * (pos == neg).sum()) / (pos.size * neg.size))


def score(truth, out):
    tb, tdb = np.array(truth["beats"]), np.array(truth["downbeats"])
    eb, edb = np.array(out["beats"]), np.array(out["downbeats"])
    res = {
        "beat_f": round(float(mir_eval.beat.f_measure(tb, eb, WIN)), 4) if len(eb) else 0.0,
        "downbeat_f": round(float(mir_eval.beat.f_measure(tdb, edb, WIN)), 4) if len(edb) else 0.0,
        "n_est_beats": int(len(eb)),
        "n_est_downbeats": int(len(edb)),
    }
    if len(eb) > 2:
        res["tempo_ratio_est_over_true"] = round(float(np.median(np.diff(eb)) / (60.0 / truth["bpm"])), 3)

    # Estimated bar lengths in TRUE beats: count true beats between consecutive est downbeats.
    if len(edb) > 1:
        idx = np.array([int(np.argmin(np.abs(tb - t))) for t in edb])
        est_len = np.diff(idx)
        vals, cnt = np.unique(est_len, return_counts=True)
        res["est_bar_length_histogram"] = {int(v): int(c) for v, c in zip(vals, cnt)}

    hit = _hits(tdb, edb)
    res["downbeat_recall_after_warmup"] = round(float(hit[WARMUP_BARS:].mean()), 4)

    # Direction-neutral phase-error measure. Added after the smoke run showed that
    # offline (Viterbi) decoders can put the mis-phased span BEFORE the deviation,
    # so a forward-only "after the odd bar" metric would miss it.
    runs, start = [], None
    h = hit[WARMUP_BARS:]
    for i, v in enumerate(list(h) + [True]):
        if not v and start is None:
            start = i
        elif v and start is not None:
            runs.append((start + WARMUP_BARS, i - start))
            start = None
    longest = max(runs, key=lambda r: r[1]) if runs else None
    res["missed_downbeat_runs"] = [{"from_downbeat": a, "length": n} for a, n in runs]
    res["longest_missed_run"] = longest[1] if longest else 0
    if longest and longest[1] > 0:
        a, n = longest
        lo, hi = tdb[a], (tdb[a + n] if a + n < len(tdb) else tb[-1] + 1e-3)
        tb_run = tb[(tb >= lo) & (tb < hi)]
        res["beat_recall_in_longest_missed_run"] = round(float(_hits(tb_run, eb).mean()), 4)

    # Phase of estimated downbeats: position-in-bar of the nearest true beat (1 = correct).
    pos = np.array(truth["beat_positions"])
    if len(edb):
        near = np.array([int(np.argmin(np.abs(tb - t))) for t in edb])
        on_beat = np.abs(tb[near] - edb) <= WIN
        ph = pos[near][on_beat]
        vals, cnt = np.unique(ph, return_counts=True)
        res["est_downbeat_phase_histogram"] = {int(v): int(c) for v, c in zip(vals, cnt)}

    # Deviation analysis: first true downbeat AFTER the first non-default bar (excluding pickups).
    default = truth["default_bar_beats"]
    dev_bars = [b for b in truth["bars"] if b["kind"] == "deviation"]
    if dev_bars:
        dev = dev_bars[0]
        d = int(np.searchsorted(tdb, dev["start"] + 1e-6))  # index of next downbeat after deviation start
        pre = hit[WARMUP_BARS:d - 1]
        post4 = hit[d:d + 4]
        reacq = None
        for k in range(0, len(hit) - d - 3):
            if hit[d + k:d + k + 4].all():
                reacq = k
                break
        res["deviation"] = {
            "bar_index": dev["index"], "beats": dev["beats"], "default_beats": default,
            "pre4_hits": int(hit[max(WARMUP_BARS, d - 5):d - 1].sum()),
            "pre_recall": round(float(pre.mean()), 4) if len(pre) else None,
            "post4_hits": int(post4.sum()),
            "post_recall": round(float(hit[d:].mean()), 4),
            "bars_to_reacquire": reacq,
            "n_deviation_bars_total": len(dev_bars),
        }
        # Are the BEATS still right after the deviation? (separates phase error from beat failure)
        tb_post = tb[(tb >= tdb[d]) & (tb < tdb[min(d + 4, len(tdb) - 1)])]
        res["deviation"]["post4_beat_recall"] = round(float(_hits(tb_post, eb).mean()), 4) if len(tb_post) else None

    # Confidence: model downbeat activation at each estimated downbeat.
    act, fps = out["downbeat_activation"], out["act_fps"]
    if len(edb):
        conf = np.array([float(np.max(act[max(0, int(round(t * fps)) - 2): int(round(t * fps)) + 3]))
                         for t in edb])
        correct = _hits(edb, tdb)  # est downbeat within 70 ms of a true downbeat
        res["confidence"] = {
            "median_correct": round(float(np.median(conf[correct])), 4) if correct.any() else None,
            "median_wrong": round(float(np.median(conf[~correct])), 4) if (~correct).any() else None,
            "n_correct": int(correct.sum()), "n_wrong": int((~correct).sum()),
            "auc_correct_vs_wrong": (None if _auc(conf[correct], conf[~correct]) is None
                                     else round(_auc(conf[correct], conf[~correct]), 4)),
        }
    return res
