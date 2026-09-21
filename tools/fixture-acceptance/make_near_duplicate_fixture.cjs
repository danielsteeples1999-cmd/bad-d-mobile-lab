#!/usr/bin/env node
// Generates fixture pairs for HASH-NEAR-001 / the fixture-acceptance
// validator's own self-test. Two modes:
//
//   good  -- a genuine "content-identical, byte-different" pair: identical
//            PCM 'data' chunk, but file B has an extra LIST/INFO chunk
//            inserted (a realistic container-level difference -- e.g. what
//            a different encoder/tag editor would add -- that must NOT
//            affect decoded audio content). Byte-different, decode-identical.
//
//   bad   -- a deliberately INVALID fixture claiming the same relationship,
//            for testing that the acceptance gate actually rejects it: two
//            files with genuinely different audio content (different tone
//            frequency), mislabeled as if they were a near-duplicate pair.
//            This exists to prove the validator works, not to test the app.
//
// Usage: node make_near_duplicate_fixture.cjs <good|bad> <outDir>

const { writeFileSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');

function makeWavDataChunk(durationSec, freqHz, sampleRate) {
  const n = Math.floor(durationSec * sampleRate);
  const buf = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const v = 0.2 * Math.sin(2 * Math.PI * freqHz * t);
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), i * 2);
  }
  return buf;
}

function wrapWav(dataChunk, sampleRate, extraChunk) {
  // extraChunk: optional {id: 4-byte string, payload: Buffer} inserted after fmt, before data
  const fmtChunk = Buffer.alloc(16);
  fmtChunk.writeUInt16LE(1, 0);         // PCM
  fmtChunk.writeUInt16LE(1, 2);         // mono
  fmtChunk.writeUInt32LE(sampleRate, 4);
  fmtChunk.writeUInt32LE(sampleRate * 2, 8);
  fmtChunk.writeUInt16LE(2, 12);        // block align
  fmtChunk.writeUInt16LE(16, 14);       // bits per sample

  const parts = [];
  parts.push(Buffer.from('WAVE'));
  parts.push(Buffer.from('fmt '));
  const fmtSize = Buffer.alloc(4); fmtSize.writeUInt32LE(fmtChunk.length, 0);
  parts.push(fmtSize, fmtChunk);

  if (extraChunk) {
    parts.push(Buffer.from(extraChunk.id));
    const extraSize = Buffer.alloc(4); extraSize.writeUInt32LE(extraChunk.payload.length, 0);
    parts.push(extraSize, extraChunk.payload);
    // WAV chunks must be word-aligned; pad with a zero byte if odd length
    if (extraChunk.payload.length % 2 === 1) parts.push(Buffer.from([0]));
  }

  parts.push(Buffer.from('data'));
  const dataSize = Buffer.alloc(4); dataSize.writeUInt32LE(dataChunk.length, 0);
  parts.push(dataSize, dataChunk);

  const body = Buffer.concat(parts);
  const riffSize = Buffer.alloc(4); riffSize.writeUInt32LE(body.length, 0);
  return Buffer.concat([Buffer.from('RIFF'), riffSize, body]);
}

const mode = process.argv[2];
const outDir = process.argv[3];
if (!mode || !outDir || !['good', 'bad'].includes(mode)) {
  console.error('Usage: make_near_duplicate_fixture.cjs <good|bad> <outDir>');
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const sampleRate = 44100;
const manifest = { mode, sampleRate, generatedAt: new Date().toISOString() };

if (mode === 'good') {
  const dataChunk = makeWavDataChunk(8, 330, sampleRate); // same content for both
  const fileA = wrapWav(dataChunk, sampleRate, null);
  const fileB = wrapWav(dataChunk, sampleRate, {
    id: 'LIST',
    payload: Buffer.concat([Buffer.from('INFO'), Buffer.from('ICMTThis is a re-saved copy with different container metadata\0')]),
  });
  writeFileSync(join(outDir, 'near_dup_A_plain.wav'), fileA);
  writeFileSync(join(outDir, 'near_dup_B_with_list_chunk.wav'), fileB);
  manifest.files = {
    'near_dup_A_plain.wav': { role: 'baseline WAV, no extra chunks', byteLength: fileA.length },
    'near_dup_B_with_list_chunk.wav': { role: 'same data chunk + inserted LIST/INFO chunk (simulates a re-save by different software)', byteLength: fileB.length },
  };
  manifest.claim = 'content-identical (identical data chunk), byte-different (different container/size)';
  manifest.generationMethod = 'Same synthetic 330Hz sine tone data chunk written into two WAV containers; B has an additional LIST/INFO chunk inserted between fmt and data. See make_near_duplicate_fixture.cjs mode=good.';
} else {
  const dataA = makeWavDataChunk(8, 330, sampleRate);
  const dataB = makeWavDataChunk(8, 550, sampleRate); // genuinely DIFFERENT content
  const fileA = wrapWav(dataA, sampleRate, null);
  const fileB = wrapWav(dataB, sampleRate, null);
  writeFileSync(join(outDir, 'bad_near_dup_A.wav'), fileA);
  writeFileSync(join(outDir, 'bad_near_dup_B.wav'), fileB);
  manifest.files = {
    'bad_near_dup_A.wav': { role: '330Hz tone', byteLength: fileA.length },
    'bad_near_dup_B.wav': { role: '550Hz tone -- GENUINELY DIFFERENT CONTENT, mislabeled as a near-duplicate on purpose', byteLength: fileB.length },
  };
  manifest.claim = 'FALSELY claims content-identical -- this fixture is intentionally invalid, used only to test that the acceptance gate rejects it';
  manifest.generationMethod = 'Two different-frequency synthetic sine tones (330Hz, 550Hz), deliberately mismatched, to test validator rejection. See make_near_duplicate_fixture.cjs mode=bad.';
}

writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify(manifest, null, 2));
