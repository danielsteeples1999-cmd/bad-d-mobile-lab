#!/usr/bin/env node
// Generates a synthetic WAV that is structurally closer to music than
// make_synth_wavs.cjs's flat sine tones: several harmonics at musical-ish
// amplitude ratios, a slow amplitude envelope (fade in, sustain, fade out),
// and a low-level noise floor. Still fully synthetic -- this lab has no
// licensed real-world music available to commit or fetch -- but it is real
// decodable PCM with real spectral/dynamic structure for a real algorithm
// (computeFingerprint's STFT) to have something non-trivial to chew on,
// honestly labeled as such rather than presented as "real music."
//
// Usage: node tools/make_music_like_wav.cjs <outPath> [durationSec] [seed]

const { writeFileSync, mkdirSync } = require('node:fs');
const { dirname } = require('node:path');

const outPath = process.argv[2];
const durationSec = parseFloat(process.argv[3] || '10');
const seed = parseInt(process.argv[4] || '1', 10);

if (!outPath) {
  console.error('Usage: make_music_like_wav.cjs <outPath> [durationSec] [seed]');
  process.exit(2);
}
mkdirSync(dirname(outPath), { recursive: true });

// Deterministic PRNG (mulberry32) so the same seed always produces the same
// file -- needed for the determinism/regression check to be meaningful.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sampleRate = 44100;
const n = Math.floor(durationSec * sampleRate);
const rng = mulberry32(seed);

// A simple I-V-vi-IV-ish chord progression in root-position triads (Hz),
// changing every ~2s, so the spectral content actually shifts over time
// instead of being one static chord for the whole file.
const chords = [
  [220.00, 277.18, 329.63], // A3 C#4 E4 (A major)
  [164.81, 207.65, 246.94], // E3 G#3 B3 (E major)
  [185.00, 220.00, 277.18], // F#3 A3 C#4 (F#m)
  [174.61, 220.00, 261.63], // F3 A3 C4 (D major, 2nd inv-ish)
];
const chordDurSec = 2.0;

const samples = new Float64Array(n);
for (let i = 0; i < n; i++) {
  const t = i / sampleRate;
  const chordIdx = Math.min(chords.length - 1, Math.floor(t / chordDurSec));
  const chord = chords[chordIdx];

  // Envelope: 0.3s fade-in, sustain, 0.5s fade-out at the very end.
  let env = 1;
  if (t < 0.3) env = t / 0.3;
  else if (t > durationSec - 0.5) env = Math.max(0, (durationSec - t) / 0.5);

  let v = 0;
  for (const f of chord) {
    // fundamental + a couple of harmonics at decreasing amplitude, each
    // with a slow independent tremolo so the mix isn't perfectly static
    v += 0.14 * Math.sin(2 * Math.PI * f * t + 0.3 * Math.sin(2 * Math.PI * 0.7 * t));
    v += 0.05 * Math.sin(2 * Math.PI * f * 2 * t);
    v += 0.02 * Math.sin(2 * Math.PI * f * 3 * t);
  }
  // low-level noise floor (real music is never perfectly silent between notes)
  v += (rng() * 2 - 1) * 0.01;

  samples[i] = v * env;
}

// Find actual peak and normalise to a safe -3dBFS ceiling so nothing clips.
let peak = 0;
for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(samples[i]));
const targetPeak = Math.pow(10, -3 / 20);
const gain = peak > 0 ? targetPeak / peak : 1;

const bytesPerSample = 2;
const dataSize = n * bytesPerSample;
const buf = Buffer.alloc(44 + dataSize);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + dataSize, 4);
buf.write('WAVE', 8);
buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); // PCM
buf.writeUInt16LE(1, 22); // mono
buf.writeUInt32LE(sampleRate, 24);
buf.writeUInt32LE(sampleRate * bytesPerSample, 28);
buf.writeUInt16LE(bytesPerSample, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(dataSize, 40);
for (let i = 0; i < n; i++) {
  const v = Math.max(-1, Math.min(1, samples[i] * gain));
  buf.writeInt16LE(Math.round(v * 32767), 44 + i * bytesPerSample);
}

writeFileSync(outPath, buf);
console.log(JSON.stringify({ outPath, durationSec, seed, sampleRate, bytes: buf.length, chords: chords.length, peakBeforeNormalise: +peak.toFixed(4) }, null, 2));
