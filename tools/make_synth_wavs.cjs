#!/usr/bin/env node
// Generates N small, valid, decodable mono WAV files (silence + a faint tone,
// so decodeAudioData succeeds and RMS/peak analysis has something non-zero to
// chew on) into an output directory. Each file has a distinct duration/size so
// the app's dedupe-by-name+size cache key does not collapse them.
//
// Usage: node tools/make_synth_wavs.cjs <outDir> <count> [baseDurationSec]

const { writeFileSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');

const outDir = process.argv[2];
const count = parseInt(process.argv[3] || '10', 10);
const baseDur = parseFloat(process.argv[4] || '1.0');

if (!outDir) {
  console.error('Usage: make_synth_wavs.cjs <outDir> <count> [baseDurationSec]');
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

function makeWav(durationSec, sampleRate, freqHz) {
  const n = Math.floor(durationSec * sampleRate);
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
    const t = i / sampleRate;
    const v = 0.2 * Math.sin(2 * Math.PI * freqHz * t);
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * bytesPerSample);
  }
  return buf;
}

const files = [];
for (let i = 0; i < count; i++) {
  const dur = baseDur + i * 0.02; // distinct duration -> distinct byte size
  const freq = 220 + (i % 12) * 30; // varied tone so spectral features aren't identical
  const buf = makeWav(dur, 44100, freq);
  const name = `synth_track_${String(i + 1).padStart(3, '0')}.wav`;
  const path = join(outDir, name);
  writeFileSync(path, buf);
  files.push({ path, name, bytes: buf.length, durationSec: dur });
}

console.log(JSON.stringify({ outDir, count: files.length, files }, null, 2));
