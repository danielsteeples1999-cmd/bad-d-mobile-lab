#!/usr/bin/env node
// Forensic tool: extracts the self-contained FFT/fingerprint engine from a
// BAD-D build and produces THREE instrumented variants for correctness
// forensics, all sharing identical checkpoint hooks (decode/pcm/frame/final)
// so their output can be compared stage-by-stage:
//   - <outDir>/engine_baseline_cp.js   -- unmodified algorithm, checkpoints only
//   - <outDir>/engine_experiment_cp.js -- yield-every-32-frames + checkpoints
//   - <outDir>/engine_freq_N.js        -- yield-every-N-frames variant, for N in freqList
//
// computeFingerprint gains an optional 2nd param (buf, onCheckpoint) -- when
// provided, it's called with {stage, ...} at each of 4 points: after decode
// info is read, after PCM/mixDown, every 32 STFT frames (+ the last frame),
// and just before the final return. This is additive-only: verified in
// EXP-007/EXP-008 that instrumentation on vs off produces identical output.
//
// Usage: node tools/make_checkpoint_engines.cjs [sourceHtml] [outDir] [freqList]
//   sourceHtml default: reference/BAD-D_SIGNAL_15_72_0-mobile.REFERENCE_READONLY.html
//   outDir default: /tmp/badd-checkpoint-engines
//   freqList default: 32 (comma-separated, e.g. "8,16,32,64,128")

const { readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const { resolve } = require('node:path');

const sourceHtml = process.argv[2] || 'reference/BAD-D_SIGNAL_15_72_0-mobile.REFERENCE_READONLY.html';
const outDir = process.argv[3] || '/tmp/badd-checkpoint-engines';
const freqList = (process.argv[4] || '32').split(',').map(s => parseInt(s.trim(), 10));

mkdirSync(outDir, { recursive: true });

const html = readFileSync(resolve(sourceHtml), 'utf8');
const lines = html.split('\n');
const startIdx = lines.findIndex(l => l.includes('<script id="badd-audio-engine-r1-inline">'));
if (startIdx === -1) throw new Error('r1-inline engine script tag not found in ' + sourceHtml);
let endIdx = -1;
for (let i = startIdx + 1; i < lines.length; i++) {
  if (lines[i].trim() === '</script>') { endIdx = i; break; }
}
if (endIdx === -1) throw new Error('closing </script> for engine block not found');
const raw = lines.slice(startIdx + 1, endIdx).join('\n');

if (!raw.includes('function computeFingerprint(buf){')) {
  throw new Error('Extraction sanity check failed: computeFingerprint signature not found as expected. The source file structure may have changed -- update this tool\'s assumptions before trusting its output.');
}

function instrument(src, { yieldEveryN }) {
  let s = src;

  const oldSig = '    function computeFingerprint(buf){';
  if (s.split(oldSig).length - 1 !== 1) throw new Error('computeFingerprint signature not found exactly once');
  const newSig = '    async function computeFingerprint(buf, __cp){\n' +
    '      const __hash = (arr,stride)=>{ let h=0; stride=stride||1; for(let k=0;k<arr.length;k+=stride){ h = (h*31 + (arr[k]|0 || Math.round((arr[k]||0)*1e6))) % 2147483647; } return h; };\n' +
    '      if(__cp) __cp({stage:"decode", numberOfChannels:buf.numberOfChannels, sampleRate:buf.sampleRate, length:buf.length});';
  s = s.replace(oldSig, newSig);

  const oldData = '    const data = buf.numberOfChannels>1\n      ? mixDown(buf) : buf.getChannelData(0);\n    const sr = buf.sampleRate;';
  if (s.split(oldData).length - 1 !== 1) throw new Error('PCM data assignment not found exactly once');
  s = s.replace(oldData, oldData + '\n    if(__cp) __cp({stage:"pcm", length:data.length, hash:__hash(data,97), first5:[data[0],data[1],data[2],data[3],data[4]]});');

  const oldLoop = '    for(let i=0;i<nFrames;i++){\n      const start = i*hop;\n      const windowed = new Float64Array(fftSize);\n      for(let j=0;j<fftSize;j++) windowed[j] = (data[start+j]||0) * window[j];\n      spec[i] = simpleFFTMag(windowed);\n      frameTimes[i] = start/sr;\n    }';
  if (s.split(oldLoop).length - 1 !== 1) throw new Error('STFT loop not found exactly once');
  const yieldLine = yieldEveryN ? `      if(i>0 && i%${yieldEveryN}===0) await new Promise(r=>setTimeout(r,0));\n` : '';
  const newLoop = '    for(let i=0;i<nFrames;i++){\n      const start = i*hop;\n      const windowed = new Float64Array(fftSize);\n      for(let j=0;j<fftSize;j++) windowed[j] = (data[start+j]||0) * window[j];\n      spec[i] = simpleFFTMag(windowed);\n      frameTimes[i] = start/sr;\n      if(__cp && (i%32===0 || i===nFrames-1)) __cp({stage:"frame", i, hash:__hash(spec[i]), first3:[spec[i][0],spec[i][1],spec[i][2]]});\n' + yieldLine + '    }';
  s = s.replace(oldLoop, newLoop);

  const oldReturn = '    return { fingerprint, energy, spectro: heatFrames, spectroVisual: visualFrames, spectroMeta: { binHz, sr }, bands, onsets };';
  if (s.split(oldReturn).length - 1 !== 1) throw new Error('computeFingerprint final return not found exactly once');
  s = s.replace(oldReturn, '    if(__cp) __cp({stage:"final", fingerprint: JSON.parse(JSON.stringify(fingerprint))});\n' + oldReturn);

  return s;
}

function withRoot(src, rootVarName) {
  return src.replace('})(globalThis);', `})(window.${rootVarName});`);
}

writeFileSync(`${outDir}/engine_baseline_cp.js`, withRoot(instrument(raw, { yieldEveryN: null }), '__BADD_LAB_BASELINE_ROOT'));
writeFileSync(`${outDir}/engine_experiment_cp.js`, withRoot(instrument(raw, { yieldEveryN: 32 }), '__BADD_LAB_EXPERIMENT_ROOT'));
for (const n of freqList) {
  if (n === 32) continue; // already written as engine_experiment_cp.js
  writeFileSync(`${outDir}/engine_freq_${n}.js`, withRoot(instrument(raw, { yieldEveryN: n }), `__BADD_LAB_FREQ_${n}_ROOT`));
}

console.log('Wrote checkpoint-instrumented engines to', outDir);
console.log('- engine_baseline_cp.js (no yield, checkpoints only)');
console.log('- engine_experiment_cp.js (yield every 32 frames, checkpoints)');
for (const n of freqList) if (n !== 32) console.log(`- engine_freq_${n}.js (yield every ${n} frames, checkpoints)`);
