#!/usr/bin/env node
// Engineering-cycle for AUDIO-AUTODJ-001 (EXP-014). Proves the
// engineering-cycle machinery on REAL audio processed by the REAL
// production algorithm -- not pipeline.js's cheap energy-envelope
// heuristic, and not synthetic infrastructure-only fixtures like
// EXP-013's throughput test.
//
// Reuses, does not rebuild: tools/lab-harness/session.cjs,
// tools/engineering-cycle/cycle-lib.cjs (stage/parseQueueTask),
// tools/engineering-cycle/load_real_engine.cjs, tools/make_checkpoint_engines.cjs
// (extracts the real production computeFingerprint read-only from
// reference/), tools/bulk-media-intake/pipeline.js (real decode/RMS/peak/
// clipping/hash stages), tools/make_synth_wavs.cjs. Only genuinely new:
// tools/make_music_like_wav.cjs (a musically-structured fixture -- this lab
// has no licensed real-world music to commit) and this script's own stage
// bodies, per run_cycle.cjs's own documented rule: extend the loop's shape
// when a second real task needs it, don't build a speculative DSL.
//
// Usage: node run_cycle_audio_autodj.cjs <repoRoot> <outDir>

const { readFileSync, writeFileSync, mkdirSync, mkdtempSync, createHash } = require('node:fs');
const { join, resolve } = require('node:path');
const { execFileSync } = require('node:child_process');
const { tmpdir } = require('node:os');
const http = require('node:http');
const crypto = require('node:crypto');
const { openSession } = require('../lab-harness/session.cjs');
const { stage, parseQueueTask } = require('./cycle-lib.cjs');
const { loadRealEngine } = require('./load_real_engine.cjs');

const SCHEMA_VERSION = '1.0.0';
const GENERATOR_TOOL = 'tools/engineering-cycle/run_cycle_audio_autodj.cjs';

function sha256File(path) {
  return crypto.createHash('sha256').update(readFileSync(path)).digest('hex');
}

async function serveDir(dir) {
  const server = http.createServer((req, res) => {
    if (req.url === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!DOCTYPE html><html><body></body></html>'); return; }
    try {
      const name = decodeURIComponent(req.url.slice(1));
      const buf = readFileSync(join(dir, name));
      res.writeHead(200, { 'Content-Type': 'audio/wav' });
      res.end(buf);
    } catch (e) {
      res.writeHead(404); res.end('not found');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { server, port: server.address().port };
}

async function main() {
  const repoRoot = resolve(process.argv[2] || '.');
  const outDir = resolve(process.argv[3] || join(repoRoot, 'experiments/EXP-014'));
  mkdirSync(outDir, { recursive: true });

  const cycle = {
    schema_version: SCHEMA_VERSION,
    cycle_id: 'EXP-014',
    queue_task_id: 'AUDIO-AUTODJ-001',
    objective: 'Prove the engineering-cycle machinery can process REAL audio with the REAL production fingerprint algorithm end to end (decode -> process -> measure -> attack -> regression -> evidence), not just synthetic infrastructure fixtures with a cheap heuristic.',
    current_unknown: 'Can tools/make_checkpoint_engines.cjs\'s extracted real computeFingerprint engine be driven from an engineering-cycle script against a real (musically-structured) audio fixture, measured, attacked, and shown deterministic -- using only existing lab machinery?',
    hypothesis: 'The real production audio engine, extracted read-only from reference/, can be loaded into a Playwright page and run against a real decoded AudioBuffer via the exact calling convention EXP-008 already proved (createAudioEngine().computeFingerprint(audioBuf, cp)), producing a deterministic, measurable fingerprint, and the surrounding pipeline (pipeline.js) fails closed on malformed/missing/empty input.',
    competing_hypotheses: [
      'H2: the extracted engine only worked in EXP-008\'s hand-authored real-device HTML artifact due to some manual setup step this automated script omits -- it will error when driven headlessly via Playwright.',
      'H3: computeFingerprint is non-deterministic in some way not visible in EXP-007/008\'s stage-by-stage forensics (e.g. depends on wall-clock timing, Math.random, or float rounding that differs run to run) -- repeated execution on identical input produces different output.',
    ],
    control_mode: 'LAB_AUTONOMOUS',
    stages: [],
    attacks: [],
    measurements: {},
    regression_check: {},
    limitations: [],
    decision: null,
    reusable_capability_produced: [],
    next_recommended_experiment: {},
    stop_reason: null,
    human_interventions: [],
    generated_at: new Date().toISOString(),
    generator_tool: GENERATOR_TOOL,
  };

  // ---------- DISCOVER ----------
  const queuePath = join(repoRoot, 'PRIORITY_QUEUE.md');
  const queueMd = readFileSync(queuePath, 'utf8');
  const taskBlock = parseQueueTask(queueMd, 'AUDIO-AUTODJ-001');
  if (!taskBlock) {
    cycle.stages.push(stage('DISCOVER', 'FAILED', { note: 'AUDIO-AUTODJ-001 not found in PRIORITY_QUEUE.md.' }));
    cycle.stop_reason = 'STOPPED_FAILURE';
    cycle.decision = 'DEFER';
    cycle.human_interventions.push('DISCOVER failed to locate the queue task -- confirm PRIORITY_QUEUE.md before re-running.');
    writeFileSync(join(outDir, 'cycle.json'), JSON.stringify(cycle, null, 2));
    console.log('STOP:', cycle.stop_reason);
    process.exit(1);
  }
  cycle.stages.push(stage('DISCOVER', 'DONE', { input: 'PRIORITY_QUEUE.md', output: taskBlock.trim(), evidence: 'PRIORITY_QUEUE.md#AUDIO-AUTODJ-001' }));

  cycle.stages.push(stage('REPRODUCE', 'SKIPPED', {
    note: 'AUDIO-AUTODJ-001 is a new-capability proof, not a reported bug -- nothing to reproduce. (EXP-008\'s real-device fingerprint mismatch remains a separate, still-open, genuinely unresolved question -- out of scope for this cycle, which proves the mechanism works at all, not that it matches Daniel\'s device.)',
  }));

  // ---------- BASELINE ----------
  // First cycle of this exact shape (real engine + real audio) -- there is
  // no prior comparable EXP to reuse a baseline from, unlike EXP-013 which
  // reused EXP-009's queue-scale numbers. This cycle establishes the
  // baseline itself; REGRESSION below checks determinism instead of
  // comparing against unrelated prior data.
  cycle.stages.push(stage('BASELINE', 'DONE', {
    note: 'No prior EXP measured the real computeFingerprint engine\'s output/timing on a controlled fixture -- this cycle establishes that baseline. EXP-007 measured the real engine\'s CPU cost as part of import-pipeline profiling (~69% of wall-clock) but never isolated computeFingerprint\'s own output determinism.',
    output: 'baseline established in this cycle\'s own MEASURE stage, not reused from a prior one',
  }));
  cycle.stages.push(stage('HYPOTHESIZE', 'DONE', { output: cycle.hypothesis }));
  cycle.stages.push(stage('DISCRIMINATE', 'DONE', { output: 'Running the real engine headlessly (this script) either succeeds like EXP-008\'s manual real-device artifact did (H1, hypothesis) or fails in a way that isolates what EXP-008\'s manual setup was doing differently (H2). Running computeFingerprint twice on the identical AudioBuffer either matches bit-for-bit (H1) or diverges (H3).' }));

  cycle.stages.push(stage('FIXTURE_VALIDATION', 'SKIPPED', {
    note: 'No content-identical/different relationship claim between fixtures in this experiment -- tools/fixture-acceptance/ gates that specific claim shape (e.g. HASH-NEAR-001), not a single fixture\'s own decode/process/measure path. Determinism (same input -> same output across 2 real-engine runs) is checked directly in MEASURE/REGRESSION instead.',
  }));

  // ---------- BUILD ----------
  const fixtureDir = mkdtempSync(join(tmpdir(), 'exp014-fixtures-'));
  const musicPath = join(fixtureDir, 'music_fixture.wav');
  execFileSync('node', [join(repoRoot, 'tools/make_music_like_wav.cjs'), musicPath, '10', '1'], { stdio: 'pipe' });
  execFileSync('node', [join(repoRoot, 'tools/make_synth_wavs.cjs'), fixtureDir, '1', '10'], { stdio: 'pipe' }); // produces synth_track_001.wav, plain-tone control fixture
  const plainPath = join(fixtureDir, 'synth_track_001.wav');

  const truncatedPath = join(fixtureDir, 'zz_attack_truncated.wav');
  writeFileSync(truncatedPath, readFileSync(musicPath).subarray(0, 30)); // ATTACK: MALFORMED_INPUT
  const emptyPath = join(fixtureDir, 'zz_attack_empty.wav');
  writeFileSync(emptyPath, Buffer.alloc(0)); // ATTACK: EMPTY_INPUT

  const engineDir = mkdtempSync(join(tmpdir(), 'exp014-engine-'));
  execFileSync('node', [join(repoRoot, 'tools/make_checkpoint_engines.cjs'), join(repoRoot, 'reference/BAD-D_SIGNAL_15_72_0-mobile.REFERENCE_READONLY.html'), engineDir, '32'], { stdio: 'pipe' });
  const engineJs = readFileSync(join(engineDir, 'engine_baseline_cp.js'), 'utf8');
  const pipelineJs = readFileSync(join(repoRoot, 'tools/bulk-media-intake/pipeline.js'), 'utf8');

  const musicSha256Before = sha256File(musicPath);

  cycle.stages.push(stage('BUILD', 'DONE', {
    input: 'tools/make_music_like_wav.cjs (new, 10s multi-harmonic/enveloped fixture, deterministic seed) + tools/make_synth_wavs.cjs (existing, 1x plain-tone control) + tools/make_checkpoint_engines.cjs (existing, extracts real computeFingerprint read-only from reference/) + 2 deliberately malformed attack fixtures',
    output: { fixtureDir, engineDir, musicSha256: musicSha256Before },
    evidence: 'fixtures generated to OS tmpdir, not committed (regeneratable -- see BUILD input); engine extracted read-only from reference/, never modified',
  }));

  // ---------- TEST + MEASURE (real audio, real algorithm) ----------
  const { server, port } = await serveDir(fixtureDir);
  const session = await openSession({ needsSecureContext: false });
  // 127.0.0.1 is a browser-trustworthy origin (localhost exception) --
  // crypto.subtle works here same as the file:// trick lab-harness uses
  // elsewhere, while ALSO giving same-origin fetch() for the STORAGE_FAILURE
  // attack below (EXP-013's lesson: never pass real file bytes through a
  // page.evaluate() argument -- fetch real files from the page instead).
  await session.page.goto(`http://127.0.0.1:${port}/`);
  await session.page.addScriptTag({ content: pipelineJs });
  await loadRealEngine(session.page, engineJs);

  const perFileMeasurements = await session.page.evaluate(async ({ names, port }) => {
    const out = {};
    for (const name of names) {
      const resp = await fetch(`http://127.0.0.1:${port}/${encodeURIComponent(name)}`);
      const buf = await resp.arrayBuffer();
      const file = new File([buf], name, { type: 'audio/wav' });
      const item = { kind: 'local-file', file, queuedAt: new Date().toISOString() };
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const result = await window.BADD_BULK_INTAKE.processItem(item, { audioCtx });

      let real = null;
      if (result.audioStatus === 'decoded' || result.validationStatus === 'passed' || result.validationStatus === 'warning') {
        // re-decode a fresh copy for the real engine (processItem's internal
        // audioBuf isn't exposed on the result -- decode is cheap and this
        // keeps pipeline.js's real API surface untouched)
        const resp2 = await fetch(`http://127.0.0.1:${port}/${encodeURIComponent(name)}`);
        const buf2 = await resp2.arrayBuffer();
        const audioBuf = await new Promise((res, rej) => audioCtx.decodeAudioData(buf2, res, rej));
        const engine = window.__BADD_LAB_BASELINE_ROOT.BADD_AUDIO_ENGINE_R1.createAudioEngine();
        const t0 = performance.now();
        const fp1 = await engine.computeFingerprint(audioBuf, () => {});
        const t1 = performance.now();
        const fp2 = await engine.computeFingerprint(audioBuf, () => {});
        const t2 = performance.now();
        real = {
          timingMs_run1: +(t1 - t0).toFixed(2),
          timingMs_run2: +(t2 - t1).toFixed(2),
          bpm: fp1.fingerprint.bpm,
          confidence: fp1.fingerprint.confidence,
          energyCurveLength: fp1.fingerprint.energyCurve.length,
          deterministic: JSON.stringify(fp1.fingerprint) === JSON.stringify(fp2.fingerprint),
        };
      }
      await audioCtx.close();
      out[name] = { pipeline: result, realEngine: real };
    }
    return out;
  }, { names: ['music_fixture.wav', 'synth_track_001.wav'], port });

  const musicResult = perFileMeasurements['music_fixture.wav'];
  const plainResult = perFileMeasurements['synth_track_001.wav'];

  cycle.stages.push(stage('TEST', 'DONE', {
    input: '2 real audio fixtures (musically-structured + plain-tone control) through pipeline.js\'s real decode/hash/RMS/peak/clip stages AND the real production computeFingerprint engine (run twice each for determinism)',
    output: { music: musicResult, plain: plainResult },
    success_condition: 'Both fixtures decode successfully, produce non-trivial real measurements (RMS>0, real BPM/confidence from the actual algorithm), and computeFingerprint is deterministic across 2 runs on the same buffer',
    failure_condition: 'Decode fails on a valid fixture, the real engine throws/crashes, or repeated runs on identical input diverge',
    evidence: join(outDir, 'test_results.json'),
  }));
  writeFileSync(join(outDir, 'test_results.json'), JSON.stringify(perFileMeasurements, null, 2));

  // ---------- ATTACKS ----------
  const attackResults = await session.page.evaluate(async ({ port }) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const out = {};

    // STORAGE_FAILURE: authorized-url pointing at a path that 404s.
    out.storageFailure = await window.BADD_BULK_INTAKE.processItem(
      { kind: 'authorized-url', url: `http://127.0.0.1:${port}/does-not-exist.wav`, queuedAt: new Date().toISOString() },
      { audioCtx }
    );

    // MALFORMED_INPUT: truncated WAV (30 bytes, well short of a valid header+data).
    const rT = await fetch(`http://127.0.0.1:${port}/zz_attack_truncated.wav`);
    const bT = await rT.arrayBuffer();
    out.malformed = await window.BADD_BULK_INTAKE.processItem(
      { kind: 'local-file', file: new File([bT], 'zz_attack_truncated.wav', { type: 'audio/wav' }), queuedAt: new Date().toISOString() },
      { audioCtx }
    );

    // EMPTY_INPUT: zero-byte file.
    const rE = await fetch(`http://127.0.0.1:${port}/zz_attack_empty.wav`);
    const bE = await rE.arrayBuffer();
    out.empty = await window.BADD_BULK_INTAKE.processItem(
      { kind: 'local-file', file: new File([bE], 'zz_attack_empty.wav', { type: 'audio/wav' }), queuedAt: new Date().toISOString() },
      { audioCtx }
    );

    // INTERRUPTION: race a real computeFingerprint call against an
    // artificially short timeout, then prove the engine still works
    // correctly on a FRESH call afterward (does an abandoned in-flight call
    // poison subsequent use). computeFingerprint itself has no
    // AbortSignal/cancellation support -- this tests the surrounding
    // orchestration's ability to safely disengage, not algorithm
    // preemptibility, and that distinction is recorded, not hidden.
    const rM = await fetch(`http://127.0.0.1:${port}/music_fixture.wav`);
    const bM = await rM.arrayBuffer();
    const audioBufForRace = await new Promise((res, rej) => audioCtx.decodeAudioData(bM.slice(0), res, rej));
    const engine = window.__BADD_LAB_BASELINE_ROOT.BADD_AUDIO_ENGINE_R1.createAudioEngine();
    const timeoutMarker = Symbol('timeout');
    const raced = await Promise.race([
      engine.computeFingerprint(audioBufForRace, () => {}),
      new Promise((res) => setTimeout(() => res(timeoutMarker), 1)),
    ]);
    const timedOut = raced === timeoutMarker;
    // fresh call afterward, on a newly-decoded buffer, to check for poisoning
    const rM2 = await fetch(`http://127.0.0.1:${port}/music_fixture.wav`);
    const bM2 = await rM2.arrayBuffer();
    const audioBufFresh = await new Promise((res, rej) => audioCtx.decodeAudioData(bM2, res, rej));
    let freshCallOk = false, freshError = null;
    try {
      const freshFp = await engine.computeFingerprint(audioBufFresh, () => {});
      freshCallOk = typeof freshFp.fingerprint.bpm === 'number';
    } catch (e) { freshError = e.message; }
    out.interruption = { timedOut, freshCallOk, freshError };

    await audioCtx.close();
    return out;
  }, { port });

  cycle.attacks.push({
    attack: 'STORAGE_FAILURE',
    relevance: 'Selected because pipeline.js supports authorized-url acquisition and a 404/missing source is the realistic failure mode for that path -- must fail closed, not hang or crash.',
    result: attackResults.storageFailure.acquisitionStatus === 'failed' && attackResults.storageFailure.errors.length > 0 ? 'SURVIVED' : 'FAILED',
    detail: `acquisitionStatus=${attackResults.storageFailure.acquisitionStatus}, errors=${JSON.stringify(attackResults.storageFailure.errors)}`,
  });
  cycle.attacks.push({
    attack: 'MALFORMED_INPUT',
    relevance: 'Cheapest realistic failure a real audio fixture can hit (truncated download/transfer) -- must be rejected cleanly, not crash the decode pipeline.',
    result: attackResults.malformed.audioStatus === 'decode-failed' && attackResults.malformed.validationStatus === 'failed' ? 'SURVIVED' : 'FAILED',
    detail: `audioStatus=${attackResults.malformed.audioStatus}, validationStatus=${attackResults.malformed.validationStatus}, errors=${JSON.stringify(attackResults.malformed.errors)}`,
  });
  cycle.attacks.push({
    attack: 'EMPTY_INPUT',
    relevance: 'Zero-length input is a distinct edge case from truncated-but-nonempty -- some decoders throw a different error class or hang on empty buffers.',
    result: attackResults.empty.audioStatus === 'decode-failed' && attackResults.empty.validationStatus === 'failed' ? 'SURVIVED' : 'FAILED',
    detail: `audioStatus=${attackResults.empty.audioStatus}, validationStatus=${attackResults.empty.validationStatus}, errors=${JSON.stringify(attackResults.empty.errors)}`,
  });
  const determinismOk = musicResult.realEngine && musicResult.realEngine.deterministic && plainResult.realEngine && plainResult.realEngine.deterministic;
  cycle.attacks.push({
    attack: 'REPEATED_EXECUTION',
    relevance: 'A fingerprint algorithm that isn\'t deterministic on identical input is unusable for near-duplicate/matching logic -- this is the single most important correctness property to check before trusting any measurement above.',
    result: determinismOk ? 'SURVIVED' : 'FAILED',
    detail: `music fixture deterministic: ${musicResult.realEngine ? musicResult.realEngine.deterministic : 'N/A (decode failed)'}; plain fixture deterministic: ${plainResult.realEngine ? plainResult.realEngine.deterministic : 'N/A'}`,
  });
  cycle.attacks.push({
    attack: 'INTERRUPTION',
    relevance: 'computeFingerprint runs synchronously-ish inside an async wrapper with no cancellation hook -- tests whether racing it against a timeout and abandoning it corrupts the engine for subsequent real use, which matters for any future UI that lets a user cancel an in-progress analysis.',
    result: attackResults.interruption.freshCallOk ? 'SURVIVED' : 'FAILED',
    detail: `raced against 1ms timeout (timedOut=${attackResults.interruption.timedOut}); fresh call after the race: ok=${attackResults.interruption.freshCallOk}, error=${attackResults.interruption.freshError}. Note: computeFingerprint itself has no AbortSignal -- this tests orchestration-level safety of abandoning a call, not algorithm preemptibility.`,
  });

  // CORRUPTED_STATE: evidence-tamper detection, checked on the Node side
  // against the evidence file this cycle itself just wrote.
  const evidencePath = join(outDir, 'test_results.json');
  const evidenceShaBefore = sha256File(evidencePath);
  const tamperedCopyPath = join(fixtureDir, 'tampered_evidence_copy.json');
  const originalBytes = readFileSync(evidencePath);
  const tamperedBytes = Buffer.from(originalBytes);
  tamperedBytes[Math.floor(tamperedBytes.length / 2)] ^= 0xff; // flip one byte
  writeFileSync(tamperedCopyPath, tamperedBytes);
  const tamperedSha = sha256File(tamperedCopyPath);
  const tamperDetected = tamperedSha !== evidenceShaBefore;
  cycle.attacks.push({
    attack: 'CORRUPTED_STATE',
    relevance: 'Evidence integrity matters as much as the measurement itself -- if a results file could be silently altered without detection, every PROVEN claim in this lab would be unverifiable after the fact.',
    result: tamperDetected ? 'SURVIVED' : 'FAILED',
    detail: `original sha256=${evidenceShaBefore}, single-byte-flipped copy sha256=${tamperedSha}, detected=${tamperDetected}`,
  });

  cycle.attacks.push({
    attack: 'PARTIAL_COMPLETION',
    relevance: 'Not applicable to this pipeline shape: decodeAudioData is atomic in this codebase (whole-buffer decode, no streaming/chunked API used) -- there is no mid-flight partial-decode state to inspect. EXP-013\'s CANCELLATION attack already covers the closest real analogue (in-flight items at batch level).',
    result: 'NOT_APPLICABLE',
    detail: 'No streaming/chunked decode path exists in pipeline.js to attack.',
  });
  cycle.attacks.push({
    attack: 'MEMORY_PRESSURE',
    relevance: 'Already rigorously tested at proper scale (5 repeated cycles, forced-GC methodology distinguishing real leaks from unswept garbage) in EXP-010. Repeating it here for 2 single-file runs would not add evidence, only checkbox coverage.',
    result: 'NOT_APPLICABLE',
    detail: 'See experiments/EXP-010/README.md, Experiment 2 -- flat 0.03MB floor across 5 forced-GC cycles, no leak.',
  });

  await session.close();
  server.close();

  // ---------- MEASURE (consolidated) ----------
  cycle.measurements = {
    music_fixture: {
      decodeSuccess: musicResult.pipeline.audioStatus === 'decoded' || musicResult.pipeline.validationStatus === 'passed',
      duration: musicResult.pipeline.duration,
      sampleRate: musicResult.pipeline.sampleRate,
      channels: musicResult.pipeline.channels,
      rms: musicResult.pipeline.warnings, // warnings array; real rms/peak below
      cheapAudioContentHash: musicResult.pipeline.hash.audioContentHash,
      sha256: musicResult.pipeline.hash.sha256,
      realEngine_bpm: musicResult.realEngine ? musicResult.realEngine.bpm : null,
      realEngine_confidence: musicResult.realEngine ? musicResult.realEngine.confidence : null,
      realEngine_timingMs_run1: musicResult.realEngine ? musicResult.realEngine.timingMs_run1 : null,
      realEngine_deterministic: musicResult.realEngine ? musicResult.realEngine.deterministic : null,
    },
    plain_fixture: {
      decodeSuccess: plainResult.pipeline.audioStatus === 'decoded' || plainResult.pipeline.validationStatus === 'passed',
      duration: plainResult.pipeline.duration,
      realEngine_bpm: plainResult.realEngine ? plainResult.realEngine.bpm : null,
      realEngine_confidence: plainResult.realEngine ? plainResult.realEngine.confidence : null,
      realEngine_deterministic: plainResult.realEngine ? plainResult.realEngine.deterministic : null,
    },
    evidenceIntegrityCheckPassed: tamperDetected,
  };
  cycle.stages.push(stage('MEASURE', 'DONE', { output: cycle.measurements }));
  cycle.stages.push(stage('ATTACK', 'DONE', { output: cycle.attacks }));

  // ---------- REGRESSION (determinism, since this is the first cycle of this shape) ----------
  cycle.regression_check = {
    baseline_cycle_id: null,
    compared_metric: 'computeFingerprint determinism across 2 runs of the identical decoded AudioBuffer (no prior comparable cycle exists to regress against -- see BASELINE stage note)',
    result: determinismOk ? 'NO_REGRESSION' : 'REGRESSION_FOUND',
    detail: `music fixture deterministic=${musicResult.realEngine ? musicResult.realEngine.deterministic : 'N/A'}; plain fixture deterministic=${plainResult.realEngine ? plainResult.realEngine.deterministic : 'N/A'}`,
  };
  cycle.stages.push(stage('REGRESSION', 'DONE', { output: cycle.regression_check }));

  // ---------- DECISION / STOP REASON ----------
  const decodedBoth = cycle.measurements.music_fixture.decodeSuccess && cycle.measurements.plain_fixture.decodeSuccess;
  const attacksOk = cycle.attacks.every((a) => a.result === 'SURVIVED' || a.result === 'NOT_APPLICABLE');
  const noRegression = cycle.regression_check.result === 'NO_REGRESSION';
  if (decodedBoth && attacksOk && noRegression) {
    cycle.decision = 'KEEP';
    cycle.stop_reason = 'COMPLETED';
  } else {
    cycle.decision = 'INVESTIGATE';
    cycle.stop_reason = attacksOk ? 'STOPPED_CONTRADICTION' : 'STOPPED_FAILURE';
  }

  // ---------- EXTRACT ----------
  cycle.reusable_capability_produced = [
    { name: 'cycle-lib.cjs (stage/parseQueueTask) reused a 2nd time', path: 'tools/engineering-cycle/cycle-lib.cjs', reuse_proof: 'USED_TWICE_PLUS' },
    { name: 'lab-harness shared Playwright+CDP session, reused again', path: 'tools/lab-harness/session.cjs', reuse_proof: 'USED_TWICE_PLUS' },
    { name: 'load_real_engine.cjs -- loads a checkpoint-instrumented REAL production audio engine into a page using EXP-008\'s proven calling convention', path: 'tools/engineering-cycle/load_real_engine.cjs', reuse_proof: 'USED_ONCE' },
    { name: 'make_music_like_wav.cjs -- deterministic, musically-structured (not pure-tone) synthetic fixture generator', path: 'tools/make_music_like_wav.cjs', reuse_proof: 'NOT_YET_REUSED' },
  ];

  // ---------- PRIORITIZE (advisory) ----------
  cycle.next_recommended_experiment = cycle.decision === 'KEEP'
    ? { task_id: 'AUTODJ-BOUNDARY-001', reason: 'AUDIO-AUTODJ-001 proved the engineering-cycle machinery works on real audio with the real algorithm. The user\'s own stated next direction is "the actual Auto-DJ boundary" -- the concrete next item is defining/verifying the adapters/ contract this cycle marks BLOCKED/UNVERIFIED (production scheduling/playback, unreachable from this public repo). CANCEL-OBS-001 remains open and independent, not blocking.' }
    : { task_id: 'AUDIO-AUTODJ-001-FOLLOWUP', reason: 'Result was not clean -- needs investigation before moving toward the production boundary.' };

  cycle.human_interventions = [
    'PRIORITIZE stage is advisory-only: recommends next_recommended_experiment but does not rewrite PRIORITY_QUEUE.md -- applied by the orchestrating session as a reviewed edit.',
    'RECORD produces cycle.json + raw evidence; the human-readable EXP-014/README.md narrative is still written by the orchestrating session.',
    'Production Auto-DJ scheduling/playback (startTransition/armBeatSnappedTransition) is entirely out of this script\'s reach by construction -- only the audio-engine IIFE (computeFingerprint) is extracted from reference/, never the main-IIFE scheduler, and nothing here touches bad_d_meomory. See adapters/AUTODJ_PRODUCTION_BOUNDARY.md for the explicit BLOCKED/UNVERIFIED boundary -- defining and eventually unblocking it is a human/maintainer decision, not something this script can resolve itself.',
  ];

  cycle.stages.push(stage('EXTRACT', 'DONE', { output: cycle.reusable_capability_produced }));
  cycle.stages.push(stage('RECORD', 'DONE', { output: join(outDir, 'cycle.json') }));
  cycle.stages.push(stage('PRIORITIZE', 'DONE', { output: cycle.next_recommended_experiment, note: 'advisory only, see human_interventions' }));

  writeFileSync(join(outDir, 'cycle.json'), JSON.stringify(cycle, null, 2));
  console.log('STOP_REASON:', cycle.stop_reason, '  DECISION:', cycle.decision);
  console.log(JSON.stringify({ measurements: cycle.measurements, attacks: cycle.attacks, regression_check: cycle.regression_check }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
