// Loads a checkpoint-instrumented real production audio engine (as produced
// by tools/make_checkpoint_engines.cjs) into an already-open Playwright page,
// using the exact calling convention EXP-008's real-device forensics
// artifact (experiments/EXP-008/DANIEL_TEST_forensics-v2.html) proved works:
// a root object the engine's IIFE writes BADD_AUDIO_ENGINE_R1 onto, then
// `root.BADD_AUDIO_ENGINE_R1.createAudioEngine()` for an engine instance
// whose `computeFingerprint(audioBuf, onCheckpoint)` is the REAL production
// algorithm, not pipeline.js's cheap energy-envelope heuristic.
//
// Usage:
//   const rootVar = await loadRealEngine(page, engineJs);
//   // in page.evaluate(): const engine = window[rootVar].BADD_AUDIO_ENGINE_R1.createAudioEngine();

async function loadRealEngine(page, engineJs, rootVarName = '__BADD_LAB_BASELINE_ROOT') {
  await page.evaluate((v) => { window[v] = {}; }, rootVarName);
  await page.addScriptTag({ content: engineJs });
  return rootVarName;
}

module.exports = { loadRealEngine };
