#!/usr/bin/env python3
"""Minimal query helper for experiment_ledger.json (ENGINE-MEMORY-001 cheap win)."""
import json
import sys
import os

LEDGER = "engine/experiment_ledger.json"

def main():
    if not os.path.exists(LEDGER):
        print("Ledger not found")
        return
    with open(LEDGER) as f:
        ledger = json.load(f)
    if len(sys.argv) < 2:
        print(f"{len(ledger)} entries. Usage: query_ledger.py [status|id] [value]")
        for e in ledger[-5:]:  # last 5
            print(f"{e.get('date')} {e.get('experiment_id')} {e.get('status')}")
        return
    key = sys.argv[1]
    value = sys.argv[2] if len(sys.argv) > 2 else None
    matches = []
    for e in ledger:
        if key == "status" and e.get("status") == value:
            matches.append(e)
        elif key == "id" and value in e.get("experiment_id", ""):
            matches.append(e)
        elif key == "all":
            matches.append(e)
    print(json.dumps(matches, indent=2))

if __name__ == "__main__":
    main()
