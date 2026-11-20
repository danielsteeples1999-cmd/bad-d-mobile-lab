"""Build check.html from check.template.html, embedding the demo grid.

The demo grid is madmom DBN's real output on the synthetic fixture ce1_stumble2 @ 128 BPM
(GRID-METER-001/002), with D3 flags. Usage: python build_check.py DEMO_GRID.json
"""
import json
import sys

g = json.load(open(sys.argv[1]))
demo = {"schema": g["schema"], "alias": "DEMO", "beats": g["beats"], "downbeats": g["downbeats"],
        "flags_D3": g["flags_D3"]}
html = open("check.template.html").read().replace("__DEMO__", json.dumps(demo))
open("check.html", "w").write(html)
print("check.html", len(html), "bytes")
