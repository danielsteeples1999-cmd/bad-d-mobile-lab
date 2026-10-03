"""Deterministic metrical fixtures with exact ground truth (GRID-METER-001).

Every fixture is synthesised from a *bar plan*: a list of bar lengths in beats.
Ground truth (beat times, beat position in bar, downbeats, bar lengths) is
exact by construction, so trackers can be scored without tolerance tuning.

Musical content is deliberately DJ-like, and every downbeat cue a fair tracker
could use is present:
  - four-on-the-floor kick (every beat, so the kick alone carries NO bar info)
  - clap on even beats, closed hat on the off-beat 8ths
  - bass + pad chord that change on every downbeat (harmonic rhythm = 1 bar)
  - crash cymbal on phrase starts (every 8 bars) and on the bar after any
    non-default-length bar (the "drop" re-entry)
No copyrighted audio. Same arguments -> bit-identical output.
"""
import json
import hashlib
import numpy as np

SR = 44100
SCHEMA = "grid-meter-fixture/1.0.0"

# Am F C G (MIDI roots) - a typical 4-chord loop, one chord per bar.
CHORD_ROOTS = [57, 53, 48, 55]
CHORD_QUALITY = {57: "min", 53: "maj", 48: "maj", 55: "maj"}

PLANS = {
    # name: (bar plan, phrase-reset bars, description)
    "control_44": ([4] * 33, "33 bars of 4/4 (known-good control)"),
    "ce1_stumble2": ([4] * 16 + [2] + [4] * 16, "16x4/4, one 2-beat bar, 16x4/4"),
    "ce2_extend6": ([4] * 16 + [6] + [4] * 16, "16x4/4, one 6-beat bar, 16x4/4"),
    "ce5_pickup1": ([1] + [4] * 32, "1-beat anacrusis then 32x4/4"),
    "heyya_pattern": ([4, 4, 4, 2, 4, 4] * 5, "repeating 4,4,4,2,4,4 phrase (22 beats)"),
    "waltz_34": ([3] * 40, "40 bars of 3/4 (meter capability control)"),
}
DEFAULT_BEATS = {"waltz_34": 3}

# Variant fixtures (GRID-METER-002): constant 4/4 meter, so any meter-error flag
# raised on them is a FALSE ALARM. name: (plan, variant, description)
VARIANTS = {
    "sync_anticip": ([4] * 33, "anticipate",
                     "33x4/4; every 2nd bar's chord arrives an 8th note EARLY (syncopation, not meter change)"),
    "halftime_switch": ([4] * 33, "halftime",
                        "33x4/4; bars 9-24 switch drums to half-time (kick on 1, clap on 3 only)"),
}


# Held-out fixtures (GRID-METER-007): never seen while C5/C6 were designed.
HELDOUT = {
    "ho_weak_control": ([4] * 33, "weakcue", "33x4/4, harmony every 2 bars, single crash (weak downbeat cue)"),
    "ho_weak_odd3": ([4] * 12 + [3] + [4] * 20, "weakcue", "weak cue; one 3-beat bar after 12 bars"),
    "ho_odd5": ([4] * 20 + [5] + [4] * 12, None, "one 5-beat bar after 20 bars"),
    "ho_two_odd": ([4] * 8 + [2] + [4] * 12 + [6] + [4] * 12, None, "a 2-beat bar after 8 bars and a 6-beat bar 12 bars later"),
}
HELDOUT_TEMPOS = [124, 132, 150, 170]

# Second held-out set (GRID-METER-008): never seen while the track-level rule was chosen.
# "simple" = steady meter or a single odd bar; "complex" = several or repeating odd bars.
HELDOUT2 = {
    "h2_weak_steady": ([4] * 33, "weakcue", "simple", "33x4/4, weak downbeat cue"),
    "h2_weak_odd2": ([4] * 16 + [2] + [4] * 16, "weakcue", "simple", "weak cue; one 2-beat bar"),
    "h2_odd7": ([4] * 10 + [7] + [4] * 20, None, "simple", "one 7-beat bar after 10 bars"),
    "h2_three_odd": ([4] * 6 + [2] + [4] * 8 + [3] + [4] * 8 + [6] + [4] * 6, None, "complex",
                     "2-, 3- and 6-beat bars in one track"),
    "h2_repeat_odd3": ([4, 4, 4, 3] * 8, None, "complex", "repeating 4,4,4,3 phrase"),
}
HELDOUT2_TEMPOS = [118, 136, 156, 176]


def render_named(name, bpm, seed=1):
    if name in PLANS:
        return render(PLANS[name][0], bpm, seed)
    if name in HELDOUT:
        plan, variant, _ = HELDOUT[name]
        return render(plan, bpm, seed, variant=variant)
    if name in HELDOUT2:
        plan, variant, _, _ = HELDOUT2[name]
        return render(plan, bpm, seed, variant=variant)
    plan, variant, _ = VARIANTS[name]
    return render(plan, bpm, seed, variant=variant)


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12.0)


def _env(n, attack, decay_s):
    t = np.arange(n) / SR
    a = max(1, int(attack * SR))
    e = np.exp(-t / decay_s)
    e[:a] *= np.linspace(0, 1, a)
    return e


def _add(buf, start, sig):
    end = min(len(buf), start + len(sig))
    if end > start:
        buf[start:end] += sig[: end - start]


def kick():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    f = 50 + 90 * np.exp(-t / 0.03)
    return 0.9 * np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(n, 0.001, 0.09)


def clap(rng):
    n = int(0.18 * SR)
    noise = rng.standard_normal(n)
    # crude band-pass by differencing + smoothing
    noise = np.convolve(np.diff(noise, prepend=0), np.ones(4) / 4, mode="same")
    return 0.35 * noise * _env(n, 0.001, 0.05)


def hat(rng):
    n = int(0.05 * SR)
    noise = np.diff(rng.standard_normal(n + 1))
    return 0.12 * noise * _env(n, 0.0005, 0.012)


def crash(rng):
    n = int(1.6 * SR)
    noise = np.diff(rng.standard_normal(n + 1))
    return 0.22 * noise * _env(n, 0.002, 0.5)


def tone(freqs, n, decay_s, gain):
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t) / (i + 1) for i, f in enumerate(freqs))
    return gain * s * _env(n, 0.01, decay_s)


def chord_freqs(root):
    third = 3 if CHORD_QUALITY[root] == "min" else 4
    notes = [root, root + third, root + 7, root + 12]
    out = []
    for m in notes:
        f = midi_hz(m)
        out += [f, 2 * f]  # two partials per note
    return out


def render(plan, bpm, seed=1, variant=None):
    """Return (audio float32 mono, truth dict). Deterministic for (plan, bpm, seed, variant).

    variant=None reproduces the GRID-METER-001 fixtures bit-identically."""
    rng = np.random.default_rng(seed)
    beat_s = 60.0 / bpm
    lead_in = 1.0  # seconds of silence before first event
    total_beats = sum(plan)
    n = int((lead_in + total_beats * beat_s + 2.0) * SR)
    buf = np.zeros(n)
    K, H, C = kick(), hat(rng), crash(rng)

    default_len = max(set(plan), key=plan.count)
    beats, positions, downbeats, bars = [], [], [], []
    kick_times = []
    b = 0
    prev_len = None
    for bar_idx, length in enumerate(plan):
        t_bar = lead_in + b * beat_s
        is_pickup = bar_idx == 0 and length < default_len and len(plan) > 1
        bars.append({"index": bar_idx, "start": round(t_bar, 6), "beats": length,
                     "kind": "pickup" if is_pickup else
                             ("deviation" if length != default_len else "regular")})
        if not is_pickup:
            downbeats.append(t_bar)
            weak = variant == "weakcue"  # harmony changes every 2 bars; crash only on the first bar
            root = CHORD_ROOTS[((len(downbeats) - 1) // 2 if weak else len(downbeats) - 1) % 4]
            bar_n = int(length * beat_s * SR)
            if weak:
                if (len(downbeats) - 1) % 2 == 0:
                    span = (length + default_len) * beat_s
                    _add(buf, int(t_bar * SR), tone(chord_freqs(root), int(span * SR), span, 0.05))
            elif variant == "anticipate" and len(downbeats) % 2 == 0 and len(downbeats) > 1:
                # chord pushed an 8th note before the (unchanged) downbeat
                early = beat_s / 2
                _add(buf, int((t_bar - early) * SR),
                     tone(chord_freqs(root), int((length * beat_s + early) * SR), length * beat_s, 0.05))
            else:
                _add(buf, int(t_bar * SR), tone(chord_freqs(root), bar_n, length * beat_s, 0.05))
            phrase_start = (len(downbeats) - 1) % 8 == 0
            after_deviation = prev_len is not None and prev_len != default_len
            if (len(downbeats) == 1) if weak else (phrase_start or after_deviation):
                _add(buf, int(t_bar * SR), C)
        for k in range(length):
            t = t_bar + k * beat_s
            beats.append(t)
            # pickup beats are labelled by their position counted back from the next downbeat
            positions.append(default_len - length + k + 1 if is_pickup else k + 1)
            i = int(round(t * SR))
            half = variant == "halftime" and 8 <= len(downbeats) - 1 <= 23
            if not is_pickup and (not half or k == 0):
                _add(buf, i, K)
                kick_times.append(t)
            if not is_pickup:
                root = CHORD_ROOTS[((len(downbeats) - 1) // 2 if variant == "weakcue" else len(downbeats) - 1) % 4]
                _add(buf, i, tone([midi_hz(root - 24), midi_hz(root - 12)],
                                  int(beat_s * 0.9 * SR), beat_s * 0.35, 0.35))
            if (half and k == 2) or (not half and ((k + 1) % 2 == 0 or is_pickup)):
                _add(buf, i, clap(rng))
            _add(buf, int(round((t + beat_s / 2) * SR)), H)
        prev_len = length
        b += length

    peak = np.max(np.abs(buf))
    audio = (0.89 * buf / peak).astype(np.float32)
    truth = {
        "schema": SCHEMA,
        "sr": SR,
        "bpm": bpm,
        "seed": seed,
        "plan": plan,
        "default_bar_beats": default_len,
        "beats": [round(x, 6) for x in beats],
        "beat_positions": positions,
        "downbeats": [round(x, 6) for x in downbeats],
        "bars": bars,
        "audio_sha256": hashlib.sha256(audio.tobytes()).hexdigest(),
        "duration_s": round(n / SR, 3),
    }
    if variant is not None:
        truth["variant"] = variant
        truth["kick_times"] = [round(x, 6) for x in kick_times]
    return audio, truth


def accept(audio, truth):
    """Fixture Acceptance: verify the rendered audio actually contains the truth.

    Checks (all must pass, otherwise the fixture is REJECTED, never 'tolerated'):
      1. determinism: re-render is bit-identical
      2. every non-pickup ground-truth beat has a matched-filter kick peak within 12 ms
         (located from the signal's low-band energy, not from the truth list)
      3. no kick-like onset exists that is not a ground-truth beat
      4. no clipping
    """
    plan, bpm, seed = truth["plan"], truth["bpm"], truth["seed"]
    a2, _ = render(plan, bpm, seed, variant=truth.get("variant"))
    checks = {"deterministic": bool(np.array_equal(a2, audio))}

    # Kick detector = matched filter: cross-correlate the 150 Hz low-passed mix
    # with the kick waveform, then pick peaks > 50 % of the maximum with a 100 ms
    # refractory period (a beat is >= 344 ms even at 174 BPM).
    # History (kept so nobody repeats it): envelope-rise detectors were tried first.
    # A peak-|x| envelope fired on the kick's own decaying 50 Hz cycles (~72 ms
    # after each kick); a 10 ms-RMS linear-rise detector fired ~113 ms after some
    # kicks at 120/128 BPM from kick-tail vs 49-55 Hz bass interference beating;
    # a dB-jump detector fired on quiet tails. All were detector artefacts, not
    # fixture defects, so the detector changed - the threshold was never loosened.
    from scipy.signal import butter, sosfiltfilt, fftconvolve
    sos = butter(4, 150, btype="low", fs=SR, output="sos")
    lp = sosfiltfilt(sos, audio.astype(np.float64))
    tmpl = sosfiltfilt(sos, kick())[: int(0.08 * SR)]
    xc = fftconvolve(lp, tmpl[::-1], mode="full")[len(tmpl) - 1:]
    xc = np.maximum(xc, 0)
    hop = 44  # ~1 ms
    frames = xc[: len(xc) // hop * hop].reshape(-1, hop).max(axis=1)
    thr = 0.5 * frames.max()
    onsets = []
    i = 0
    while i < len(frames):
        if frames[i] > thr:
            j = i + int(np.argmax(frames[i:i + 100]))  # peak within the 100 ms window
            onsets.append(j)
            i = j + 100
        else:
            i += 1
    onset_t = np.array(onsets) * hop / SR
    pickup_beats = sum(1 for bar in truth["bars"] if bar["kind"] == "pickup") and truth["bars"][0]["beats"]
    kick_truth = np.array(truth["kick_times"] if "kick_times" in truth
                          else truth["beats"][pickup_beats or 0:])
    d = np.abs(onset_t[:, None] - kick_truth[None, :])
    checks["all_beats_have_kick_onset"] = bool((d.min(axis=0) <= 0.012).all())
    checks["no_spurious_kick_onsets"] = bool((d.min(axis=1) <= 0.012).all())
    checks["no_clipping"] = bool(np.max(np.abs(audio)) < 1.0)
    checks["detected_kicks"] = int(len(onset_t))
    checks["expected_kicks"] = int(len(kick_truth))
    ok = all(v for k, v in checks.items() if isinstance(v, bool))
    return {"verdict": "FIXTURE_ACCEPTED" if ok else "FIXTURE_REJECTED", "checks": checks}


def write_wav(path, audio):
    import soundfile as sf
    sf.write(path, audio, SR, subtype="FLOAT")


if __name__ == "__main__":
    import sys
    name, bpm = sys.argv[1], float(sys.argv[2])
    audio, truth = render_named(name, bpm)
    print(json.dumps(accept(audio, truth), indent=2))
