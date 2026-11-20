"""Compact markdown summary of a grid-meter-results JSON. Usage: python summarize.py results.json"""
import json
import sys
from collections import defaultdict


def main(path):
    d = json.load(open(path))
    systems = sorted({s for r in d["rows"] for s in r["systems"]})
    print("| plan | bpm | " + " | ".join(systems) + " |")
    print("|---|---|" + "---|" * len(systems))
    agg = defaultdict(list)
    for r in d["rows"]:
        cells = []
        for s in systems:
            v = r["systems"].get(s, {})
            if v.get("status") != "OK":
                cells.append(v.get("status", "-"))
                continue
            conf = v.get("confidence", {})
            auc = conf.get("auc_correct_vs_wrong")
            cell = f"dbF {v['downbeat_f']:.2f} · miss-run {v['longest_missed_run']}"
            if v["longest_missed_run"]:
                cell += f" (beats {v.get('beat_recall_in_longest_missed_run', 0):.2f})"
            if auc is not None:
                cell += f" · AUC {auc:.2f}"
            cells.append(cell)
            agg[(r["plan"], s)].append(v)
        print(f"| {r['plan']} | {int(r['bpm'])} | " + " | ".join(cells) + " |")

    print("\n| plan | system | mean dbF | max miss-run | beat F (mean) | wrong-downbeat median act | correct median act | bar-length hist (summed) |")
    print("|---|---|---|---|---|---|---|---|")
    for (plan, s), vs in sorted(agg.items()):
        hist = defaultdict(int)
        for v in vs:
            for k, c in v.get("est_bar_length_histogram", {}).items():
                hist[int(k)] += c
        wr = [v["confidence"]["median_wrong"] for v in vs if v.get("confidence", {}).get("median_wrong") is not None]
        co = [v["confidence"]["median_correct"] for v in vs if v.get("confidence", {}).get("median_correct") is not None]
        print(f"| {plan} | {s} | {sum(v['downbeat_f'] for v in vs) / len(vs):.3f} | "
              f"{max(v['longest_missed_run'] for v in vs)} | {sum(v['beat_f'] for v in vs) / len(vs):.3f} | "
              f"{(sum(wr) / len(wr)) if wr else float('nan'):.2f} | {(sum(co) / len(co)) if co else float('nan'):.2f} | "
              f"{dict(sorted(hist.items()))} |")


if __name__ == "__main__":
    main(sys.argv[1])
