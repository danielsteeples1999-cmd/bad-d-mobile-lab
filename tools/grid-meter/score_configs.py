"""Apply GRID-METER-004's pre-registered decision rule. Usage: python score_configs.py configs.json [--json out.json]"""
import json
import sys

DECISION = {"control_44", "ce1_stumble2", "ce2_extend6", "ce5_pickup1", "sync_anticip", "halftime_switch"}
SILENT_MARGIN, MAX_FA, MAX_COST_RATIO = 0.005, 0.05, 0.6


def pool(rows, cid, names):
    dec = wrong_silent = correct = fa = true_n = covered = 0
    cpu = mins = 0.0
    for r in rows:
        if r["fixture"] not in names or "configs" not in r:
            continue
        c = r["configs"][cid]
        dec += len(c["wrong"])
        wrong_silent += sum(1 for w, f in zip(c["wrong"], c["flag"]) if w and not f)
        correct += sum(1 for w in c["wrong"] if not w)
        fa += sum(1 for w, f in zip(c["wrong"], c["flag"]) if not w and f)
        true_n += r["n_true_downbeats"]
        covered += c["true_covered_unflagged"]
        cpu += c["cpu_s"]
        mins += r["audio_minutes"]
    return {"decoded": dec, "silent_errors": wrong_silent, "silent_error_rate": wrong_silent / dec if dec else None,
            "false_alarms": fa, "correct": correct, "false_alarm_rate": fa / correct if correct else None,
            "trustworthy_coverage": covered / true_n if true_n else None, "cpu_s_per_audio_min": cpu / mins if mins else None}


def main(path, out=None):
    d = json.load(open(path))
    rows, cids = d["rows"], list(d["configs"])
    res = {c: pool(rows, c, DECISION) for c in cids}
    base = res["C1"]
    print("Decision set (24 fixtures): control, ce1, ce2, pickup, sync_anticip, halftime_switch\n")
    print("| config | networks | silent error rate | false-alarm rate | trustworthy coverage | CPU s / audio min (1 thread) | verdict vs C1 |")
    print("|---|---|---|---|---|---|---|")
    for c in cids:
        r = res[c]
        if c == "C1":
            v = "baseline"
        else:
            ok = (r["silent_error_rate"] <= base["silent_error_rate"] + SILENT_MARGIN and r["false_alarm_rate"] <= MAX_FA
                  and r["cpu_s_per_audio_min"] <= MAX_COST_RATIO * base["cpu_s_per_audio_min"])
            v = "RECOMMENDED" if ok else "not recommended"
        r["verdict"] = v
        print(f"| {c} | {len(d['configs'][c]['networks'])} | {r['silent_error_rate']:.4f} ({r['silent_errors']}/{r['decoded']}) | "
              f"{r['false_alarm_rate']:.4f} ({r['false_alarms']}/{r['correct']}) | {r['trustworthy_coverage']:.4f} | "
              f"{r['cpu_s_per_audio_min']:.2f} | {v} |")
    print("\nReported only (not in decision):\n")
    print("| fixture | config | silent error rate | false-alarm rate | trustworthy coverage |")
    print("|---|---|---|---|---|")
    for n in ("heyya_pattern", "waltz_34"):
        for c in cids:
            r = pool(rows, c, {n})
            print(f"| {n} | {c} | {r['silent_error_rate']:.4f} ({r['silent_errors']}/{r['decoded']}) | "
                  f"{r['false_alarm_rate']:.4f} | {r['trustworthy_coverage']:.4f} |")
    if out:
        json.dump({"decision_set": sorted(DECISION), "rule": {"silent_margin": SILENT_MARGIN, "max_fa": MAX_FA,
                   "max_cost_ratio": MAX_COST_RATIO}, "results": res}, open(out, "w"), indent=1)


if __name__ == "__main__":
    a = sys.argv[1:]
    main(a[0], a[a.index("--json") + 1] if "--json" in a else None)
