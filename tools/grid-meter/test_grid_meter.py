"""Self-tests for the GRID-METER tooling. Run: python -m pytest -q test_grid_meter.py
(or plain `python test_grid_meter.py`). No tracker models needed."""
import copy
import numpy as np

import fixtures
import evaluate


def _oracle(truth, shift_beats=0, act=1.0):
    """Fake tracker output: perfect beats; downbeats shifted by N true beats."""
    tb = np.array(truth["beats"])
    idx = [truth["beats"].index(d) + shift_beats for d in truth["downbeats"]]
    edb = [tb[i] for i in idx if 0 <= i < len(tb)]
    return {"beats": tb.tolist(), "downbeats": edb, "act_fps": 100,
            "downbeat_activation": np.full(int(tb[-1] * 100) + 200, act)}


def test_render_is_deterministic_and_truth_consistent():
    a1, t1 = fixtures.render(fixtures.PLANS["ce1_stumble2"][0], 128)
    a2, t2 = fixtures.render(fixtures.PLANS["ce1_stumble2"][0], 128)
    assert np.array_equal(a1, a2) and t1 == t2
    assert len(t1["beats"]) == sum(t1["plan"])
    assert len(t1["downbeats"]) == len(t1["plan"])
    assert [b["beats"] for b in t1["bars"]] == t1["plan"]


def test_pickup_is_not_a_downbeat():
    _, t = fixtures.render(fixtures.PLANS["ce5_pickup1"][0], 128)
    assert t["bars"][0]["kind"] == "pickup"
    assert len(t["downbeats"]) == len(t["plan"]) - 1
    assert t["beat_positions"][0] == 4  # anacrusis is beat 4 of the (absent) previous bar


def test_gate_accepts_real_fixture():
    a, t = fixtures.render(fixtures.PLANS["control_44"][0], 140)
    assert fixtures.accept(a, t)["verdict"] == "FIXTURE_ACCEPTED"


def test_gate_rejects_audio_with_extra_kick():
    """ATTACK: corrupted audio (one kick inserted mid-beat) must be rejected."""
    a, t = fixtures.render(fixtures.PLANS["control_44"][0], 140)
    bad = a.copy()
    k = fixtures.kick().astype(np.float32) * 0.8
    i = int((t["beats"][40] + 0.5 * 60 / 140) * fixtures.SR)  # half-way between beats 40 and 41
    bad[i:i + len(k)] += k
    v = fixtures.accept(bad, t)
    assert v["verdict"] == "FIXTURE_REJECTED"
    assert v["checks"]["deterministic"] is False and v["checks"]["no_spurious_kick_onsets"] is False


def test_gate_rejects_truth_with_moved_beat():
    """ATTACK: corrupted truth (one beat label moved by 30 ms) must be rejected."""
    a, t = fixtures.render(fixtures.PLANS["control_44"][0], 140)
    bad = copy.deepcopy(t)
    bad["beats"][50] += 0.030
    assert fixtures.accept(a, bad)["verdict"] == "FIXTURE_REJECTED"


def test_scorer_perfect_tracker():
    _, t = fixtures.render(fixtures.PLANS["ce1_stumble2"][0], 128)
    r = evaluate.score(t, _oracle(t))
    assert r["downbeat_f"] == 1.0 and r["longest_missed_run"] == 0
    assert r["deviation"]["post4_hits"] == 4 and r["deviation"]["bars_to_reacquire"] == 0


def test_scorer_detects_global_phase_shift():
    _, t = fixtures.render(fixtures.PLANS["control_44"][0], 128)
    r = evaluate.score(t, _oracle(t, shift_beats=2))
    assert r["downbeat_recall_after_warmup"] == 0.0
    assert r["est_downbeat_phase_histogram"] == {3: 33}  # all 33 bars shifted; the last shifted downbeat is still inside the track
    assert r["beat_f"] == 1.0  # beats right, bars wrong: the exact failure class under test


if __name__ == "__main__":
    import sys
    fails = 0
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            try:
                fn()
                print("PASS", name)
            except AssertionError as e:
                fails += 1
                print("FAIL", name, e)
    sys.exit(1 if fails else 0)
