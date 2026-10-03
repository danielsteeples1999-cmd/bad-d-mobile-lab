"""GRID-METER-001 runner: fixtures x tempos x systems -> results JSON.

Usage: python run.py OUT.json [--systems a,b] [--plans a,b] [--tempos 120,128]
Bounded: <= 6 plans x 4 tempos x 4 systems; WAVs are never written to disk.
"""
import argparse
import json
import platform
import sys
import time

import fixtures
import evaluate
import trackers

SCHEMA = "grid-meter-results/1.0.0"
TEMPOS = [120, 128, 140, 174]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--systems", default=",".join(trackers.SYSTEMS))
    ap.add_argument("--plans", default=",".join(fixtures.PLANS))
    ap.add_argument("--tempos", default=",".join(map(str, TEMPOS)))
    a = ap.parse_args()
    systems, plans = a.systems.split(","), a.plans.split(",")
    tempos = [float(t) for t in a.tempos.split(",")]
    assert len(plans) * len(tempos) <= 24 and len(systems) <= 4, "budget guard"

    t0 = time.time()
    rows = []
    for plan_name in plans:
        for bpm in tempos:
            audio, truth = fixtures.render(fixtures.PLANS[plan_name][0], bpm)
            gate = fixtures.accept(audio, truth)
            row = {"plan": plan_name, "bpm": bpm, "audio_sha256": truth["audio_sha256"],
                   "fixture_gate": gate["verdict"], "systems": {}}
            if gate["verdict"] != "FIXTURE_ACCEPTED":
                row["fixture_gate_checks"] = gate["checks"]
                rows.append(row)
                print(f"REJECTED fixture {plan_name}@{bpm}", file=sys.stderr)
                continue
            for s in systems:
                ts = time.time()
                try:
                    out = trackers.SYSTEMS[s](audio)
                    r = evaluate.score(truth, out)
                    r["status"] = "OK"
                except Exception as e:  # recorded, never swallowed
                    r = {"status": "ERROR", "error": f"{type(e).__name__}: {e}"}
                r["seconds"] = round(time.time() - ts, 2)
                row["systems"][s] = r
                print(f"{plan_name}@{bpm} {s}: dbF={r.get('downbeat_f')} "
                      f"dev={r.get('deviation', {}).get('post4_hits')}", file=sys.stderr)
            rows.append(row)

    import madmom, beat_this, torch, numpy
    doc = {
        "schema": SCHEMA,
        "experiment": "GRID-METER-001",
        "metric_window_s": evaluate.WIN,
        "warmup_bars": evaluate.WARMUP_BARS,
        "environment": {"python": platform.python_version(), "numpy": numpy.__version__,
                        "torch": torch.__version__, "madmom": madmom.__version__,
                        "beat_this": getattr(beat_this, "__version__", "git"),
                        "beat_this_checkpoint": "final0", "machine": platform.machine()},
        "wall_seconds": round(time.time() - t0, 1),
        "rows": rows,
    }
    with open(a.out, "w") as f:
        json.dump(doc, f, indent=1)


if __name__ == "__main__":
    main()
