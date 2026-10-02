"""Apply GRID-METER-002's pre-registered criteria to a grid-meter-detect JSON.

Usage: python score_detect.py detect.json [--json out.json]
"""
import json
import sys
from collections import defaultdict

RECALL_SET = {"ce1_stumble2", "ce2_extend6"}
FA_SET = {"control_44", "ce5_pickup1", "sync_anticip", "halftime_switch"}
MIN_RECALL, MAX_FA = 0.90, 0.05
DETECTORS = ("D1", "D2", "D3")


def tally(rows, fixtures_set, primary, det):
    hit = wrong = fa = correct = 0
    for r in rows:
        if r["fixture"] not in fixtures_set or "primaries" not in r:
            continue
        p = r["primaries"][primary]
        for w, f in zip(p["wrong"], p[det]):
            if w:
                wrong += 1
                hit += f
            else:
                correct += 1
                fa += f
    return hit, wrong, fa, correct


def main(path, out=None):
    d = json.load(open(path))
    rows = d["rows"]
    primaries = sorted({p for r in rows for p in r.get("primaries", {})})
    verdicts = {}
    print("| primary | detector | recall (odd-bar wrong downbeats) | false-alarm rate (steady 4/4) | verdict |")
    print("|---|---|---|---|---|")
    for p in primaries:
        for det in DETECTORS:
            h, w, _, _ = tally(rows, RECALL_SET, p, det)
            _, _, fa, c = tally(rows, FA_SET, p, det)
            rec = h / w if w else None
            far = fa / c if c else None
            ok = rec is not None and far is not None and rec >= MIN_RECALL and far <= MAX_FA
            verdicts[f"{p}/{det}"] = {"recall": rec, "hits": h, "wrong": w,
                                      "false_alarm_rate": far, "false_alarms": fa, "correct": c,
                                      "verdict": "PASS" if ok else "FAIL"}
            rs = f"{rec:.3f} ({h}/{w})" if rec is not None else "n/a (0 wrong)"
            print(f"| {p} | {det} | {rs} | {far:.3f} ({fa}/{c}) | {'PASS' if ok else 'FAIL'} |")

    print("\nPer-fixture (all tempos pooled): hits/wrong · false-alarms/correct")
    print("| fixture | primary | D1 | D2 | D3 |")
    print("|---|---|---|---|---|")
    names = []
    for r in rows:
        if r["fixture"] not in names:
            names.append(r["fixture"])
    for n in names:
        for p in primaries:
            cells = []
            for det in DETECTORS:
                h, w, fa, c = tally(rows, {n}, p, det)
                cells.append(f"{h}/{w} · {fa}/{c}")
            print(f"| {n} | {p} | " + " | ".join(cells) + " |")
    if out:
        json.dump({"criteria": {"min_recall": MIN_RECALL, "max_false_alarm": MAX_FA,
                                "recall_fixtures": sorted(RECALL_SET), "fa_fixtures": sorted(FA_SET)},
                   "verdicts": verdicts}, open(out, "w"), indent=1)


if __name__ == "__main__":
    a = sys.argv[1:]
    main(a[0], a[a.index("--json") + 1] if "--json" in a else None)
