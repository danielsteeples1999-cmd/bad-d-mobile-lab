#!/usr/bin/env python3
"""
ENGINE-CYCLE-001 — Minimal Engineering Cycle Runner

Implements the documented lifecycle:
load → preflight → validate fixture/prerequisites → run → collect evidence → validate result → record cycle → explicit decision

Bounded, deterministic schema, clear failure/blocked states, compact output.
No production access. Reusable by next experiment.

Evidence: this file + schema. Runtime verification requires a real fixture.
"""

import json
import os
import time
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Any, Dict, Optional

SCHEMA_VERSION = "1.0.2-probe"
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
    """Cheap auto-append for ENGINE-MEMORY-001. Creates ledger if missing."""
    entry = {
        "experiment_id": result.experiment_id,
        "date": result.started_at[:10],
        "question": result.question,
        "status": result.status,
        "evidence": "engine/last_cycle.json or last_attack.json",
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
    ledger.append(entry)
    with open(LEDGER_PATH, "w") as f:
        json.dump(ledger, f, indent=2)

def run_cycle(
    experiment_id: str,
    question: str,
    fixture: Optional[Dict] = None,
    max_seconds: int = 20,
    max_repeats: int = 5,
) -> CycleResult:
    start = time.time()
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
        # Example: validate that fixture has required keys and record a timing
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
    # Write evidence
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

if __name__ == "__main__":
    main()
