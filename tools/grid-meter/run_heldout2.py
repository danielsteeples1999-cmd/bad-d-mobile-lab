"""GRID-METER-008: C1, C6 and C7 (= C6 + track-level rule T) on held-out set 2.

Usage: python run_heldout2.py OUT.json
"""
import json
import sys
import time

import numpy as np

import detect
import fixtures
from run_configs import stages
from run_heldout import c6_flags

K_CLUSTERS = 3  # pre-registered


def flagged_clusters(flags):
    """Separate runs of consecutive flags, excluding the final-bar rule-E flag."""
    n, prev = 0, False
    for x in flags[:-1]:
        if x and not prev:
            n += 1
        prev = x
    return n


def track_rule(flags, k=K_CLUSTERS):
    """Rule T: >= k separate flagged clusters -> every downbeat ambiguous."""
    return [True] * len(flags) if flagged_clusters(flags) >= k else list(flags)


def main(path):
    t0 = time.time()
    rows = []
    for name, (_, _, klass, _) in fixtures.HELDOUT2.items():
        for bpm in fixtures.HELDOUT2_TEMPOS:
            audio, truth = fixtures.render_named(name, bpm)
            row = {"fixture": name, "class": klass, "bpm": bpm, "audio_sha256": truth["audio_sha256"],
                   "fixture_gate": fixtures.accept(audio, truth)["verdict"],
                   "audio_minutes": round(len(audio) / fixtures.SR / 60, 4)}
            if row["fixture_gate"] == "FIXTURE_ACCEPTED":
                out, cost = stages(audio)
                tdb = np.asarray(truth["downbeats"])
                row["n_true_downbeats"] = len(tdb)
                c1 = detect.run_all(out["madmom_dbn_bpb4"], out["beat_this_minimal"], truth)
                w6, f6 = c6_flags(out["beat_this_minimal"], truth)
                f7 = track_rule(f6)
                row["c6_clusters"] = flagged_clusters(f6)
                row["configs"] = {}
                for cid, prim, wrong, flags, cpu in (
                        ("C1", out["madmom_dbn_bpb4"], c1["wrong"], c1["D3"],
                         cost["madmom_rnn"] + cost["madmom_dbn"] + cost["beat_this_net"]),
                        ("C6", out["beat_this_minimal"], w6, f6, cost["beat_this_net"]),
                        ("C7", out["beat_this_minimal"], w6, f7, cost["beat_this_net"])):
                    good = [x for x, w, f in zip(prim["downbeats"], wrong, flags) if not w and not f]
                    cov = sum(1 for td in tdb if good and np.min(np.abs(np.asarray(good) - td)) <= detect.WIN)
                    row["configs"][cid] = {"wrong": wrong, "flag": flags, "true_covered_unflagged": int(cov),
                                           "cpu_s": round(cpu, 3)}
            rows.append(row)
            print(name, bpm, row["fixture_gate"], file=sys.stderr)
    json.dump({"schema": "grid-meter-configs/1.0.0", "experiment": "GRID-METER-008", "k_clusters": K_CLUSTERS,
               "configs": {"C1": {"primary": "madmom_dbn_bpb4", "flag_rule": "D3", "networks": ["madmom_rnn", "beat_this_net"]},
                           "C6": {"primary": "beat_this_minimal", "flag_rule": "D1 or R or E", "networks": ["beat_this_net"]},
                           "C7": {"primary": "beat_this_minimal", "flag_rule": "C6 then track rule T (>=3 clusters)",
                                  "networks": ["beat_this_net"]}},
               "torch_threads": 1, "wall_seconds": round(time.time() - t0, 1), "rows": rows}, open(path, "w"), indent=1)


if __name__ == "__main__":
    main(sys.argv[1])
