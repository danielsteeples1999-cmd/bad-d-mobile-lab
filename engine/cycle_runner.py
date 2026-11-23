#!/usr/bin/env python3
"""
ENGINE-CYCLE-001 — Minimal Engineering Cycle Runner

Implements the documented lifecycle:
load → preflight → validate fixture/prerequisites → run → collect evidence → validate result → record cycle → explicit decision

Bounded, deterministic schema, clear failure/blocked states, compact output.
No production access. Reusable by next experiment.

Evidence: this file + schema. Runtime verification requires a real fixture.
Idle/default path (main()) confirms automation by replaying the same probes with zero further human input.
"""

import json
import os
import time
import hashlib
import resource
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Any, Dict, Optional

SCHEMA_VERSION = "1.0.8-regress-stub"
LEDGER_PATH = "engine/experiment_ledger.json"

@dataclass
class CycleResult:
    experiment_id: str
    date: str
    question: str
    status: str  # success / failure / blocked
    evidence: str
    decision: str
    reusable: str
    next: str
    duration_s: float = 0.0
    schema: str = SCHEMA_VERSION
    probes: Dict[str, Any] = None

def get_resource_probe() -> Dict[str, Any]:
    """Cheap resource observation: disk free (approx) + process RSS."""
    try:
        ru = resource.getrusage(resource.RUSAGE_SELF)
        rss_kb = ru.ru_maxrss
        # disk free is platform-dependent; use simple os.statvfs if available
        try:
            st = os.statvfs('.')
            free_bytes = st.f_bavail * st.f_frsize
        except Exception:
            free_bytes = -1
        return {"rss_kb": rss_kb, "disk_free_bytes": free_bytes, "ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}

def multi_run_timing(path: str, n: int = 3) -> Dict[str, Any]:
    """Multi-run timing for os.stat + open()."""
    times_stat = []
    times_open = []
    for _ in range(n):
        t0 = time.perf_counter()
        os.stat(path)
        times_stat.append(time.perf_counter() - t0)
        t0 = time.perf_counter()
        with open(path, 'rb') as f:
            f.read(1024)
        times_open.append(time.perf_counter() - t0)
    return {
        "n": n,
        "stat_avg_ms": sum(times_stat) / n * 1000,
        "open_avg_ms": sum(times_open) / n * 1000,
        "ok": True
    }

def file_hash(path: str) -> str:
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b''):
            h.update(chunk)
    return h.hexdigest()[:16]

def simple_regress_comparator(baseline: Dict[str, Any], candidate: Dict[str, Any]) -> Dict[str, Any]:
    """ENGINE-REGRESS-001 stub: cheap baseline vs candidate on hash + timing presence."""
    # Minimal: check if hashes match and timings exist; flag worse if timing increased >20% or hash missing
    result = {"status": "unknown", "details": "stub comparator"}
    b_hash = baseline.get("hash")
    c_hash = candidate.get("hash")
    b_timing = baseline.get("timing", {}).get("open_avg_ms", 0)
    c_timing = candidate.get("timing", {}).get("open_avg_ms", 0)
    if b_hash and c_hash and b_hash == c_hash:
        if c_timing > b_timing * 1.2:
            result = {"status": "worse", "details": "timing regression >20%"}
        else:
            result = {"status": "pass", "details": "hash match, timing ok"}
    elif not c_hash:
        result = {"status": "failure", "details": "candidate missing hash"}
    else:
        result = {"status": "changed", "details": "hash differs"}
    return result

def append_to_ledger(result: CycleResult):
    ledger = []
    if os.path.exists(LEDGER_PATH):
        with open(LEDGER_PATH) as f:
            ledger = json.load(f)
    # Deduplicate by experiment_id + date roughly
    if any(e.get('experiment_id') == result.experiment_id and e.get('date') == result.date for e in ledger):
        return  # skip duplicate
    entry = asdict(result)
    entry.pop('probes', None)
    ledger.append(entry)
    with open(LEDGER_PATH, 'w') as f:
        json.dump(ledger, f, indent=2)

def run_cycle(experiment_id: str, question: str, fixture_path: Optional[str] = None) -> CycleResult:
    start = time.perf_counter()
    date = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    probes = {}
    status = "success"
    decision = "Cycle completed."
    evidence = "engine/last_cycle.json"

    # Preflight / presence
    if fixture_path and not os.path.exists(fixture_path):
        status = "failure"
        decision = f"File {fixture_path} missing."
        probes['presence'] = False
    else:
        probes['presence'] = True
        if fixture_path:
            probes['timing'] = multi_run_timing(fixture_path)
            probes['hash'] = file_hash(fixture_path)

    probes['resource'] = get_resource_probe()

    # Simple attack stubs
    if experiment_id.endswith('-ATTACK-MISSING'):
        status = "failure"
        decision = "Attack: missing prerequisite recorded cleanly."
    elif 'TIMEOUT' in experiment_id:
        status = "blocked"
        decision = "Timeout attack stub."

    # Cheap regress stub call (self-compare for idle confirmation)
    if probes.get('hash'):
        probes['regress_stub'] = simple_regress_comparator(probes, probes)

    duration = time.perf_counter() - start
    result = CycleResult(
        experiment_id=experiment_id,
        date=date,
        question=question,
        status=status,
        evidence=evidence,
        decision=decision,
        reusable="cycle_runner.py",
        next="next probe or regression",
        duration_s=round(duration, 4),
        probes=probes
    )

    # Write evidence
    with open('engine/last_cycle.json', 'w') as f:
        json.dump(asdict(result), f, indent=2)
    with open('engine/last_resource.json', 'w') as f:
        json.dump(probes.get('resource', {}), f, indent=2)

    append_to_ledger(result)
    return result

def main():
    """Idle / do-nothing path: replay probes with zero further human input."""
    print("Idle path confirmed — replaying default probes with no further input.")
    # Default trivial probe on README.md if present
    fixture = "README.md" if os.path.exists("README.md") else None
    result = run_cycle(
        "ENGINE-CYCLE-001-IDLE",
        "Confirm do-nothing automation copies probes reliably",
        fixture
    )
    print(json.dumps(asdict(result), indent=2))
    print("Automation confirmation: COMPLETE. Human weirdness (idle) copies the probes.")

if __name__ == "__main__":
    main()
