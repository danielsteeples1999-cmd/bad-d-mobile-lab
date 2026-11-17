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
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Any, Dict, Optional

SCHEMA_VERSION = "1.0.6-open"
LEDGER_PATH = "engine/experiment_ledger.json"

@dataclass
class CycleResult:
    experiment_id: str
    question: str
    status: str  # success | failure | blocked | timeout | unknown
    started_at: str
    finished_at: str
    duration_s: float
    evidence: Dict[str, Any]
    decision: str
    next_action: str
    limitations: list
    budget_used: Dict[str, Any]

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def append_to_ledger(result: CycleResult) -> None:
    """Cheap auto-append for ENGINE-MEMORY-001. Creates ledger if missing. Dedupes by experiment_id to avoid identical repeats."""
    entry = {
        "experiment_id": result.experiment_id,
        "date": result.started_at[:10],
        "question": result.question,
        "status": result.status,
        "evidence": "engine/last_*.json",
        "decision": result.decision,
        "reusable": "cycle_runner.py",
        "next": result.next_action,
        "duration_s": result.duration_s,
    }
    ledger = []
    if os.path.exists(LEDGER_PATH):
        try:
            with open(LEDGER_PATH, "r") as f:
                ledger = json.load(f)
        except Exception:
            ledger = []
    # Simple dedupe: skip if exact experiment_id already present
    if any(e.get("experiment_id") == result.experiment_id for e in ledger):
        return  # already recorded; idle re-runs do not pile duplicates
    ledger.append(entry)
    with open(LEDGER_PATH, "w") as f:
        json.dump(ledger, f, indent=2)

def compute_hash(path: str) -> Optional[str]:
    """SHA-256 of file content. Returns None on missing/error."""
    try:
        h = hashlib.sha256()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
        return h.hexdigest()
    except Exception:
        return None

def run_cycle(
    experiment_id: str,
    question: str,
    fixture: Optional[Dict] = None,
    max_seconds: int = 20,
    max_repeats: int = 5,
) -> CycleResult:
    start = time.time()
    start_perf = time.perf_counter()
    started_at = now_iso()
    evidence = {"fixture_present": fixture is not None, "schema": SCHEMA_VERSION}
    status = "blocked"
    decision = "No fixture provided; cycle skeleton only."
    next_action = "Supply a deterministic fixture and re-run."
    limitations = ["skeleton only — no real measurement yet"]
    budget = {"max_seconds": max_seconds, "elapsed": 0.0, "repeats": 0}

    # Preflight / validate
    if not experiment_id or not question:
        status = "failure"
        decision = "Missing required identifiers."
        evidence["error"] = "experiment_id and question required"
    elif fixture is None:
        # Intentionally blocked until a real fixture exists
        status = "blocked"
        evidence["reason"] = "no fixture"
    else:
        # Real minimal fixture: measure something deterministic
        required = fixture.get("required_keys", [])
        missing = [k for k in required if k not in fixture]
        if missing:
            status = "failure"
            decision = f"Fixture missing keys: {missing}"
            evidence["missing_keys"] = missing
        else:
            probe_type = fixture.get("probe", "count")
            if probe_type == "file_presence":
                # Non-trivial real probe: check file existence (lab-safe)
                path = fixture.get("path", "README.md")
                exists = os.path.exists(path)
                evidence["file_exists"] = exists
                evidence["checked_path"] = path
                if exists:
                    status = "success"
                    decision = f"File presence probe passed for {path}."
                    next_action = "Add attack case (missing file) or expand to hash check."
                    limitations = ["simple os.path check — not timing or memory yet"]
                else:
                    status = "failure"
                    decision = f"File {path} missing."
            elif probe_type == "timing":
                # Multi-run timing baseline (average of N stats) for better evidence
                path = fixture.get("path", "README.md")
                n_runs = fixture.get("runs", 3)
                times_ms = []
                try:
                    for _ in range(n_runs):
                        t0 = time.perf_counter()
                        st = os.stat(path)
                        elapsed_ms = (time.perf_counter() - t0) * 1000
                        times_ms.append(elapsed_ms)
                    avg_ms = sum(times_ms) / len(times_ms) if times_ms else 0
                    evidence["stat_ms_avg"] = round(avg_ms, 3)
                    evidence["stat_ms_min"] = round(min(times_ms), 3) if times_ms else None
                    evidence["stat_ms_max"] = round(max(times_ms), 3) if times_ms else None
                    evidence["runs"] = n_runs
                    evidence["size_bytes"] = st.st_size
                    evidence["checked_path"] = path
                    status = "success"
                    decision = f"Timing probe (avg of {n_runs}) completed for {path} in {avg_ms:.3f}ms."
                    next_action = "Use as multi-run baseline for regression."
                    limitations = ["os.stat only — not full open() or startup"]
                except Exception as e:
                    status = "failure"
                    decision = f"Timing probe failed: {e}"
                    evidence["error"] = str(e)
            elif probe_type == "open_timing":
                # Cheap open() timing baseline (multi-run) — next high-leverage after os.stat
                path = fixture.get("path", "README.md")
                n_runs = fixture.get("runs", 3)
                times_ms = []
                try:
                    for _ in range(n_runs):
                        t0 = time.perf_counter()
                        with open(path, "rb") as f:
                            _ = f.read(1)  # minimal read to force open
                        elapsed_ms = (time.perf_counter() - t0) * 1000
                        times_ms.append(elapsed_ms)
                    avg_ms = sum(times_ms) / len(times_ms) if times_ms else 0
                    evidence["open_ms_avg"] = round(avg_ms, 3)
                    evidence["open_ms_min"] = round(min(times_ms), 3) if times_ms else None
                    evidence["open_ms_max"] = round(max(times_ms), 3) if times_ms else None
                    evidence["runs"] = n_runs
                    evidence["checked_path"] = path
                    status = "success"
                    decision = f"Open-timing probe (avg of {n_runs}) completed for {path} in {avg_ms:.3f}ms."
                    next_action = "Use as open() baseline for regression or expand to full read."
                    limitations = ["open + 1-byte read only — not full content or startup"]
                except Exception as e:
                    status = "failure"
                    decision = f"Open-timing probe failed: {e}"
                    evidence["error"] = str(e)
            elif probe_type == "resource_pressure":
                seconds = fixture.get("seconds", 2)
                if (isinstance(seconds, bool) or not isinstance(seconds, (int, float))
                        or not 0 < seconds <= 3):
                    status = "failure"
                    decision = "Resource pressure duration must be greater than 0 and at most 3 seconds."
                    evidence["error"] = decision
                else:
                    probe_start = time.perf_counter()
                    cpu_start = time.process_time()
                    iterations = 0
                    while True:
                        current = time.perf_counter()
                        if current - start_perf >= max_seconds:
                            status = "timeout"
                            decision = "Exceeded budget during resource pressure probe."
                            break
                        if current - probe_start >= seconds:
                            status = "success"
                            decision = "Bounded CPU pressure probe completed."
                            break
                        iterations += 1
                    evidence["requested_seconds"] = seconds
                    evidence["pressure_wall_seconds"] = round(current - probe_start, 3)
                    evidence["process_cpu_seconds"] = round(time.process_time() - cpu_start, 3)
                    evidence["iterations"] = iterations
                    next_action = "Compare resource pressure evidence across runs."
                    limitations = ["single-process CPU burn only — no system-wide resource or recovery measurement"]
            elif probe_type == "hash":
                # Content integrity probe: SHA-256 of file
                path = fixture.get("path", "README.md")
                expected = fixture.get("expected_hash")
                actual = compute_hash(path)
                evidence["checked_path"] = path
                evidence["actual_hash"] = actual
                if actual is None:
                    status = "failure"
                    decision = f"Hash probe failed: cannot read {path}"
                    evidence["error"] = "file missing or unreadable"
                elif expected and actual != expected:
                    status = "failure"
                    decision = f"Hash mismatch for {path}"
                    evidence["expected_hash"] = expected
                else:
                    status = "success"
                    decision = f"Hash probe passed for {path}: {actual[:16]}..."
                    next_action = "Use as baseline for regression or expand attack (wrong hash)."
                    limitations = ["single file SHA-256 — not directory or multi-file"]
            else:
                # Original trivial count
                items = fixture.get("items", [])
                count = 0
                for _ in items:
                    count += 1
                    if time.time() - start > max_seconds:
                        status = "timeout"
                        decision = "Exceeded budget during measurement."
                        break
                else:
                    status = "success"
                    decision = f"Cycle completed with {count} items measured."
                    next_action = "Add attack or regression check on this result."
                    evidence["measured_count"] = count
                    evidence["note"] = "real trivial measurement performed"
                    limitations = ["trivial fixture — proves lifecycle only"]

    elapsed = time.time() - start
    budget["elapsed"] = round(elapsed, 3)
    if elapsed > max_seconds and status != "timeout":
        status = "timeout"
        decision = "Exceeded budget."

    result = CycleResult(
        experiment_id=experiment_id,
        question=question,
        status=status,
        started_at=started_at,
        finished_at=now_iso(),
        duration_s=round(elapsed, 3),
        evidence=evidence,
        decision=decision,
        next_action=next_action,
        limitations=limitations,
        budget_used=budget,
    )
    # Auto-append for memory (ENGINE-MEMORY-001 cheap win)
    try:
        append_to_ledger(result)
    except Exception as e:
        result.limitations.append(f"ledger append failed: {e}")
    return result

def main():
    print("Running default idle probes (automation confirmation: do-nothing path).")
    # File-presence probe (non-trivial real measurement)
    file_fixture = {
        "required_keys": ["probe", "path"],
        "probe": "file_presence",
        "path": "README.md",
        "description": "check lab entrypoint exists"
    }
    result = run_cycle(
        "ENGINE-CYCLE-001-FILEPROBE",
        "Can the cycle complete a real file-presence probe with evidence?",
        fixture=file_fixture
    )
    print(json.dumps(asdict(result), indent=2))
    with open("engine/last_cycle.json", "w") as f:
        json.dump(asdict(result), f, indent=2)
    print("\nEvidence written to engine/last_cycle.json")

    # Basic attack stub example (missing file)
    attack_fixture = {
        "required_keys": ["probe", "path"],
        "probe": "file_presence",
        "path": "nonexistent-file.txt",
        "description": "attack: missing file should fail cleanly"
    }
    attack_result = run_cycle(
        "ENGINE-CYCLE-001-ATTACK-MISSING",
        "Does the cycle record clean failure on missing prerequisite?",
        fixture=attack_fixture
    )
    print("\nAttack result:")
    print(json.dumps(asdict(attack_result), indent=2))
    with open("engine/last_attack.json", "w") as f:
        json.dump(asdict(attack_result), f, indent=2)

    # Cheap timing probe (now multi-run)
    timing_fixture = {
        "required_keys": ["probe", "path"],
        "probe": "timing",
        "path": "README.md",
        "runs": 3,
        "description": "measure os.stat timing avg of 3"
    }
    timing_result = run_cycle(
        "ENGINE-CYCLE-001-TIMING",
        "Can the cycle complete a real multi-run timing probe with evidence?",
        fixture=timing_fixture
    )
    print("\nTiming result:")
    print(json.dumps(asdict(timing_result), indent=2))
    with open("engine/last_timing.json", "w") as f:
        json.dump(asdict(timing_result), f, indent=2)

    # Open() timing probe (new cheap win)
    open_fixture = {
        "required_keys": ["probe", "path"],
        "probe": "open_timing",
        "path": "README.md",
        "runs": 3,
        "description": "measure open()+1byte timing avg of 3"
    }
    open_result = run_cycle(
        "ENGINE-CYCLE-001-OPEN-TIMING",
        "Can the cycle complete a real multi-run open() timing probe with evidence?",
        fixture=open_fixture
    )
    print("\nOpen-timing result:")
    print(json.dumps(asdict(open_result), indent=2))
    with open("engine/last_open_timing.json", "w") as f:
        json.dump(asdict(open_result), f, indent=2)

    # Hash probe (content integrity)
    hash_fixture = {
        "required_keys": ["probe", "path"],
        "probe": "hash",
        "path": "README.md",
        "description": "SHA-256 content integrity check"
    }
    hash_result = run_cycle(
        "ENGINE-CYCLE-001-HASH",
        "Can the cycle complete a real hash probe with evidence?",
        fixture=hash_fixture
    )
    print("\nHash result:")
    print(json.dumps(asdict(hash_result), indent=2))
    with open("engine/last_hash.json", "w") as f:
        json.dump(asdict(hash_result), f, indent=2)
    print("Evidence written to engine/last_hash.json")

    # Timeout attack stub (force short budget)
    timeout_fixture = {
        "required_keys": ["probe", "items"],
        "probe": "count",
        "items": list(range(1000000)),  # large enough to potentially timeout if budget low
        "description": "attack: force timeout via large work + low budget"
    }
    timeout_result = run_cycle(
        "ENGINE-CYCLE-001-ATTACK-TIMEOUT",
        "Does the cycle record clean timeout under budget pressure?",
        fixture=timeout_fixture,
        max_seconds=0.001  # extremely tight to force timeout path
    )
    print("\nTimeout attack result:")
    print(json.dumps(asdict(timeout_result), indent=2))
    with open("engine/last_timeout.json", "w") as f:
        json.dump(asdict(timeout_result), f, indent=2)

    # Invalid fixture attack (missing required key)
    invalid_fixture = {
        "required_keys": ["probe", "path"],
        "probe": "file_presence",
        # path intentionally omitted
        "description": "attack: invalid fixture missing required key"
    }
    invalid_result = run_cycle(
        "ENGINE-CYCLE-001-ATTACK-INVALID",
        "Does the cycle record clean failure on invalid fixture?",
        fixture=invalid_fixture
    )
    print("\nInvalid fixture attack result:")
    print(json.dumps(asdict(invalid_result), indent=2))
    with open("engine/last_invalid.json", "w") as f:
        json.dump(asdict(invalid_result), f, indent=2)

    # Bounded resource pressure attack (single-process CPU burn)
    resource_fixture = {
        "required_keys": ["probe", "seconds"],
        "probe": "resource_pressure",
        "seconds": 2,
        "description": "attack: bounded CPU pressure"
    }
    resource_result = run_cycle(
        "ENGINE-CYCLE-001-ATTACK-RESOURCE",
        "Can the cycle record evidence under bounded CPU pressure?",
        fixture=resource_fixture
    )
    print("\nResource pressure attack result:")
    print(json.dumps(asdict(resource_result), indent=2))
    with open("engine/last_resource.json", "w") as f:
        json.dump(asdict(resource_result), f, indent=2)

if __name__ == "__main__":
    main()
