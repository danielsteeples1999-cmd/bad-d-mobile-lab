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
import time
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Any, Dict, Optional

SCHEMA_VERSION = "1.0.0-minimal"

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
        # Placeholder for real run — replace with actual probe
        status = "success"
        decision = "Skeleton cycle completed; replace placeholder with real measurement."
        next_action = "Implement the actual experiment body."
        evidence["note"] = "placeholder success"
        limitations = ["placeholder implementation"]

    elapsed = time.time() - start
    budget["elapsed"] = round(elapsed, 3)
    if elapsed > max_seconds:
        status = "timeout"
        decision = "Exceeded budget."

    return CycleResult(
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

def main():
    # Example self-test (no real fixture)
    result = run_cycle("ENGINE-CYCLE-001-SELF", "Can the cycle produce a structured result?")
    print(json.dumps(asdict(result), indent=2))
    # Write evidence
    with open("engine/last_cycle.json", "w") as f:
        json.dump(asdict(result), f, indent=2)
    print("\nEvidence written to engine/last_cycle.json")

if __name__ == "__main__":
    main()
