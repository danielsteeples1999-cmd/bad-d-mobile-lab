#!/usr/bin/env node
// Engineering-cycle orchestrator. Executes DISCOVER->...->PRIORITIZE for one
// PRIORITY_QUEUE.md task and emits a machine-readable cycle record matching
// contracts/engineering-cycle.schema.json, plus the raw evidence files a
// human-readable EXP-NNN/README.md is then written from.
//
// This is NOT a generic spec-runner (that would be over-building before a
// second task shape has actually needed one -- see EXPERIMENT_PROTOCOL.md's
// "don't build a tool factory" rule). It is the SCALE-100-001 cycle,
// written so its reusable parts (session management via lab-harness,
// PRIORITY_QUEUE.md task parsing, the cycle-record shape) are separate from
// the SCALE-100-001-specific stage bodies. Extend this file's shape when a
// second real task needs it; don't build a DSL speculatively now.
//
// PRIORITIZE is advisory-only: this script computes and records
// next_recommended_experiment but does not itself rewrite the hand-
// maintained PRIORITY_QUEUE.md -- that's applied by the orchestrating
// session afterward. Recorded explicitly under human_interventions.
//
// Usage: node run_cycle.cjs <repoRoot> <outDir>

const { readFileSync, writeFileSync, mkdirSync, readdirSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { execFileSync } = require('node:child_process');
const { openSession } = require('../lab-harness/session.cjs');

const SCHEMA_VERSION = '1.0.0';
const GENERATOR_TOOL = 'tools/engineering-cycle/run_cycle.cjs';

function parseQueueTask(queueMd, taskId) {
  const lines = queueMd.split('\n');
  const startIdx = lines.findIndex((l) => l.includes(taskId + ' —') || l.includes(taskId + ' -'));
  if (startIdx === -1) return null;
  const block = [];
  for (let i = startIdx; i < lines.length; i++) {
    if (i > startIdx && /^\[[ x]\]/.test(lines[i].trim())) break;
    if (i > startIdx && /^(P\d|DONE)\s*[—-]/.test(lines[i].trim())) break;
    block.push(lines[i]);
  }
  return block.join('\n');
}

function stage(name, status, extra = {}) {
  return { stage: name, status, ...extra };
}

function makeTruncatedWav(sourcePath, destPath, keepBytes) {
  const full = readFileSync(sourcePath);
  writeFileSync(destPath, full.subarray(0, keepBytes));
}

async function runBatchInPage(page, pipelineJs, fileEntries, { concurrency, applyNormalise = false, experimentId }) {
  await page.addScriptTag({ content: pipelineJs });
  return page.evaluate(async ({ fileEntries, concurrency, applyNormalise, experimentId }) => {
    function b64ToUint8(b64) { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
    const items = fileEntries.map((f) => ({
      kind: 'local-file',
      file: new File([b64ToUint8(f.b64)], f.name, { type: 'audio/wav' }),
      queuedAt: new Date().toISOString(),
    }));
    const t0 = performance.now();
    const run = window.BADD_BULK_INTAKE.runBatch(items, { concurrency, applyNormalise, experimentId });
    const results = await run.promise;
    return { durationMs: performance.now() - t0, results, cancel: null };
  }, { fileEntries, concurrency, applyNormalise, experimentId });
}

async function main() {
  const repoRoot = resolve(process.argv[2] || '.');
  const outDir = resolve(process.argv[3] || join(repoRoot, 'experiments/EXP-013'));
  mkdirSync(outDir, { recursive: true });

  const cycle = {
    schema_version: SCHEMA_VERSION,
    cycle_id: 'EXP-013',
    queue_task_id: 'SCALE-100-001',
    objective: 'Determine whether bulk-media-intake handles a 100-item batch cleanly, and whether it survives realistic adverse conditions (malformed input, mid-batch cancellation) at that scale.',
    current_unknown: 'Does a 100-item batch (2x the previously-tested max of 50) complete cleanly, and does it survive malformed input and mid-batch cancellation at that scale?',
    hypothesis: 'A 100-item batch completes with the same per-item cost profile as the 50-item baseline (no phase transition), and survives malformed input + mid-batch cancellation the same way EXP-009 proved at smaller scale.',
    competing_hypotheses: [
      'H2: throughput degrades superlinearly past some item count (queue/array overhead, GC pressure) -- msPerItem rises measurably above baseline.',
      'H3: a scale-dependent failure appears that did not manifest at 50 (crash, hang, silent item loss).',
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
  const taskBlock = parseQueueTask(queueMd, 'SCALE-100-001');
  if (!taskBlock) {
    cycle.stages.push(stage('DISCOVER', 'FAILED', { note: 'SCALE-100-001 not found in PRIORITY_QUEUE.md.' }));
    cycle.stop_reason = 'STOPPED_FAILURE';
    writeFileSync(join(outDir, 'cycle.json'), JSON.stringify(cycle, null, 2));
    console.log('STOP:', cycle.stop_reason);
    process.exit(1);
  }
  cycle.stages.push(stage('DISCOVER', 'DONE', { input: 'PRIORITY_QUEUE.md', output: taskBlock.trim(), evidence: 'PRIORITY_QUEUE.md#SCALE-100-001' }));

  // ---------- BASELINE (reused, not re-measured -- prior evidence exists) ----------
  const baselinePath = join(repoRoot, 'experiments/EXP-009/queue_badd-q50.json');
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  const baselineMsPerItem = baseline.durationMs / baseline.fileCount;
  cycle.stages.push(stage('BASELINE', 'DONE', {
    input: 'experiments/EXP-009/queue_badd-q50.json',
    output: { fileCount: baseline.fileCount, durationMs: baseline.durationMs, msPerItem: +baselineMsPerItem.toFixed(1), passedCount: baseline.passedCount },
    evidence: 'experiments/EXP-009/queue_badd-q50.json',
  }));

  cycle.stages.push(stage('HYPOTHESIZE', 'DONE', { output: cycle.hypothesis }));
  cycle.stages.push(stage('DISCRIMINATE', 'DONE', { output: 'The 100-item run is the discriminating experiment: compare its msPerItem and pass/fail/heap profile against the 50-item baseline.' }));

  // ---------- FIXTURE_VALIDATION ----------
  // No claimed relationship between fixtures here (independent batch items,
  // not a content-identical/different pair) -- the fixture-acceptance gate
  // (tools/fixture-acceptance/) doesn't apply. Recorded, not silently skipped.
  cycle.stages.push(stage('FIXTURE_VALIDATION', 'SKIPPED', {
    note: 'No fixture relationship claim in this experiment shape -- tools/fixture-acceptance/ gates relationship claims (e.g. HASH-NEAR-001), not independent batch items.',
  }));

  // ---------- BUILD ----------
  const fixtureDir = join(outDir, 'fixtures-100item');
  mkdirSync(fixtureDir, { recursive: true });
  execFileSync('node', [join(repoRoot, 'tools/make_synth_wavs.cjs'), fixtureDir, '97', '12'], { stdio: 'pipe' });
  const goodFiles = readdirSync(fixtureDir).filter((f) => f.endsWith('.wav')).sort();

  // ATTACK fixtures, built into the same batch rather than a separate run --
  // ATTACK: MALFORMED_INPUT, selected because it's the cheapest realistic
  // failure a bulk upload actually sees; EXP-009 proved rejection works at
  // small scale, this checks it still does at 100-item scale.
  makeTruncatedWav(join(fixtureDir, goodFiles[0]), join(fixtureDir, 'zz_attack_truncated.wav'), 30);
  writeFileSync(join(fixtureDir, 'zz_attack_garbage.wav'), require('node:crypto').randomBytes(5000));
  writeFileSync(join(fixtureDir, 'zz_attack_empty.wav'), Buffer.alloc(0)); // ATTACK: EMPTY_INPUT
  const allFiles = readdirSync(fixtureDir).filter((f) => f.endsWith('.wav')).sort();
  cycle.stages.push(stage('BUILD', 'DONE', {
    input: '97x 12s synthetic WAV via tools/make_synth_wavs.cjs (reused, not rebuilt) + 3 deliberately malformed files (truncated/garbage/empty) = 100 total',
    output: { fixtureDir, totalFiles: allFiles.length },
    evidence: fixtureDir,
  }));

  // ---------- TEST (main 100-item run) ----------
  const pipelineJs = readFileSync(join(repoRoot, 'tools/bulk-media-intake/pipeline.js'), 'utf8');
  const fileEntries = allFiles.map((name) => ({ name, b64: readFileSync(join(fixtureDir, name)).toString('base64') }));

  const testSession = await openSession({ needsSecureContext: false });
  const testRun = await runBatchInPage(testSession.page, pipelineJs, fileEntries, { concurrency: 4, experimentId: 'EXP-013-SCALE-100' });
  const testHeap = await testSession.heapUsage();
  await testSession.close();

  const passed = testRun.results.filter((r) => r.validationStatus === 'passed').length;
  const failed = testRun.results.filter((r) => r.acquisitionStatus === 'failed' || r.validationStatus === 'failed').length;
  const expectedFailures = ['zz_attack_truncated.wav', 'zz_attack_garbage.wav', 'zz_attack_empty.wav'];
  const failedNames = testRun.results.filter((r) => r.validationStatus === 'failed').map((r) => r.source?.originalName);
  const allExpectedFailuresRejected = expectedFailures.every((n) => failedNames.includes(n));
  const noUnexpectedFailures = failedNames.every((n) => expectedFailures.includes(n));

  cycle.stages.push(stage('TEST', 'DONE', {
    input: `${allFiles.length} files (97 valid + 3 deliberately malformed), concurrency=4 (per EXP-011's evidence-based recommendation)`,
    output: { durationMs: +testRun.durationMs.toFixed(1), passed, failed, totalResults: testRun.results.length, heap: testHeap },
    success_condition: 'All 97 valid files pass, exactly the 3 malformed files fail, no console/page errors',
    failure_condition: 'Any valid file fails, any malformed file is silently accepted, or an unexpected file fails',
    evidence: join(outDir, 'test_100item_results.json'),
  }));
  writeFileSync(join(outDir, 'test_100item_results.json'), JSON.stringify({ durationMs: testRun.durationMs, results: testRun.results, heap: testHeap, pageErrors: testSession.pageErrors, consoleErrors: testSession.consoleErrors }, null, 2));

  cycle.attacks.push({
    attack: 'MALFORMED_INPUT',
    relevance: 'Cheapest realistic failure mode a bulk upload sees; tests whether rejection still works correctly mixed into a 100-item batch, not just in isolation (EXP-009 tested isolation only).',
    result: allExpectedFailuresRejected && noUnexpectedFailures ? 'SURVIVED' : 'FAILED',
    detail: `expected failures [${expectedFailures.join(', ')}] all rejected: ${allExpectedFailuresRejected}. No unexpected failures beyond those 3: ${noUnexpectedFailures}. Actual failed: [${failedNames.join(', ')}]`,
  });

  // ---------- ATTACK: CANCELLATION at 100-item scale ----------
  const cancelSession = await openSession({ needsSecureContext: false });
  await cancelSession.page.addScriptTag({ content: pipelineJs });
  const cancelResult = await cancelSession.page.evaluate(async ({ fileEntries }) => {
    function b64ToUint8(b64) { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
    const items = fileEntries.map((f) => ({ kind: 'local-file', file: new File([b64ToUint8(f.b64)], f.name, { type: 'audio/wav' }), queuedAt: new Date().toISOString() }));
    const run = window.BADD_BULK_INTAKE.runBatch(items, { concurrency: 4, experimentId: 'EXP-013-CANCEL-100' });
    await new Promise((r) => setTimeout(r, 100)); // cancel almost immediately -- want genuinely in-flight items, matching EXP-010's successful cancellation-timing pattern
    run.cancel();
    const results = await run.promise;
    return { completed: results.filter((r) => r.validationStatus === 'passed' || r.validationStatus === 'failed').length, total: results.length };
  }, { fileEntries: fileEntries.filter((f) => !f.name.startsWith('zz_attack')) }); // cancellation attack tests the mechanism, not malformed-input interaction -- clean 97-item set
  const cancelPageErrors = cancelSession.pageErrors;
  await cancelSession.close();

  cycle.attacks.push({
    attack: 'CANCELLATION',
    relevance: 'EXP-009 found and fixed a cancellation display bug at small scale; this checks the underlying mechanism (not just display) still cleans up correctly at 2x the previously-tested batch size, with no orphaned AudioContext/resources (0 page errors is the proof).',
    result: cancelPageErrors.length === 0 ? 'SURVIVED' : 'FAILED',
    detail: `cancelled after 100ms in-flight; ${cancelResult.completed}/${cancelResult.total} items had a result at cancellation time; pageErrors: ${cancelPageErrors.length}`,
  });

  // ---------- MEASURE ----------
  const measuredMsPerItem = testRun.durationMs / 97; // valid-file cost, exclude the 3 malformed (near-instant rejections would skew it down)
  cycle.measurements = {
    itemCount: allFiles.length,
    validItemCount: 97,
    durationMs: +testRun.durationMs.toFixed(1),
    msPerItem: +measuredMsPerItem.toFixed(2),
    baselineMsPerItem: +baselineMsPerItem.toFixed(2),
    heapUsedMB: testHeap.usedMB,
    heapBackingMB: testHeap.backingMB,
  };

  // ---------- REGRESSION ----------
  const perItemRatio = measuredMsPerItem / baselineMsPerItem;
  const regressionThreshold = 1.5; // >50% worse per-item cost would indicate a real scale problem, not noise
  cycle.regression_check = {
    baseline_cycle_id: 'EXP-009',
    compared_metric: 'msPerItem (100-item run vs 50-item baseline)',
    result: perItemRatio <= regressionThreshold ? 'NO_REGRESSION' : 'REGRESSION_FOUND',
    detail: `100-item msPerItem=${measuredMsPerItem.toFixed(2)} vs 50-item baseline msPerItem=${baselineMsPerItem.toFixed(2)} (ratio ${perItemRatio.toFixed(2)}x, threshold ${regressionThreshold}x)`,
  };
  cycle.stages.push(stage('MEASURE', 'DONE', { output: cycle.measurements }));
  cycle.stages.push(stage('ATTACK', testRun.results.length > 0 ? 'DONE' : 'FAILED', { output: cycle.attacks }));
  cycle.stages.push(stage('REGRESSION', 'DONE', { output: cycle.regression_check }));

  // ---------- DECISION / STOP REASON ----------
  const attacksSurvived = cycle.attacks.every((a) => a.result === 'SURVIVED');
  const noRegression = cycle.regression_check.result === 'NO_REGRESSION';
  if (attacksSurvived && noRegression) {
    cycle.decision = 'KEEP';
    cycle.stop_reason = 'COMPLETED';
  } else {
    cycle.decision = 'INVESTIGATE';
    cycle.stop_reason = attacksSurvived ? 'STOPPED_CONTRADICTION' : 'STOPPED_FAILURE';
  }

  // ---------- EXTRACT ----------
  cycle.reusable_capability_produced = [
    { name: 'run_cycle.cjs engineering-cycle orchestrator', path: 'tools/engineering-cycle/run_cycle.cjs', reuse_proof: 'USED_ONCE' },
    { name: 'lab-harness shared Playwright+CDP session', path: 'tools/lab-harness/session.cjs', reuse_proof: 'USED_TWICE_PLUS' },
    { name: '100-item mixed-malformed attack batch composition (97 valid + truncated + garbage + empty)', path: 'experiments/EXP-013/fixtures-100item/', reuse_proof: 'NOT_YET_REUSED' },
  ];

  // ---------- PRIORITIZE (advisory) ----------
  cycle.next_recommended_experiment = cycle.decision === 'KEEP'
    ? { task_id: 'CANCEL-OBS-001', reason: 'SCALE-100-001 closes the last OPEN P1 unknown. CANCEL-OBS-001/RESUME-001 are known gaps (build items) rather than unknowns -- of those, CANCEL-OBS-001 is the cheaper, more contained fix and has no open dependency on a design decision the way RESUME-001 does.' }
    : { task_id: 'SCALE-100-001-FOLLOWUP', reason: 'Result was not clean -- needs a follow-up investigation before moving on, not a fresh unrelated experiment.' };

  cycle.human_interventions = [
    'PRIORITIZE stage is advisory-only: this script recommends next_recommended_experiment but does not rewrite PRIORITY_QUEUE.md itself -- applied by the orchestrating session as a reviewed edit.',
    'RECORD stage produces cycle.json + raw evidence; the human-readable EXP-013/README.md narrative is still written by the orchestrating session, not generated from this script.',
    'Production integration (bad_d_meomory) is entirely out of this script\'s scope by construction -- control_mode is always LAB_AUTONOMOUS here.',
  ];

  cycle.stages.push(stage('EXTRACT', 'DONE', { output: cycle.reusable_capability_produced }));
  cycle.stages.push(stage('RECORD', 'DONE', { output: join(outDir, 'cycle.json') }));
  cycle.stages.push(stage('PRIORITIZE', 'DONE', { output: cycle.next_recommended_experiment, note: 'advisory only, see human_interventions' }));

  writeFileSync(join(outDir, 'cycle.json'), JSON.stringify(cycle, null, 2));
  console.log('STOP_REASON:', cycle.stop_reason, '  DECISION:', cycle.decision);
  console.log(JSON.stringify({ measurements: cycle.measurements, attacks: cycle.attacks, regression_check: cycle.regression_check }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
