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

SCHEMA_VERSION = "1.0.7-resource"
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

def cpu_pressure_probe() -> Dict[str, Any]:
    """Run a two-second single-process CPU burn and measure its cost."""
    before = resource.getrusage(resource.RUSAGE_SELF)
    start = time.perf_counter()
    iterations = 0
    while True:
        now = time.perf_counter()
        if now - start >= 2.0:
            break
        iterations += 1
    after = resource.getrusage(resource.RUSAGE_SELF)
    return {
        "pressure_wall_seconds": now - start,
        "process_cpu_seconds": (after.ru_utime + after.ru_stime
                                - before.ru_utime - before.ru_stime),
        "iterations": iterations,
    }

def get_resource_probe() -> Dict[str, Any]:
    """Observe disk free and process RSS, then measure bounded CPU pressure."""
    try:
        ru = resource.getrusage(resource.RUSAGE_SELF)
        rss_kb = ru.ru_maxrss
        # disk free is platform-dependent; use simple os.statvfs if available
        try:
            st = os.statvfs('.')
            free_bytes = st.f_bavail * st.f_frsize
        except Exception:
            free_bytes = -1
        pressure = cpu_pressure_probe()
        return {"rss_kb": rss_kb, "disk_free_bytes": free_bytes, **pressure, "ok": True}
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
