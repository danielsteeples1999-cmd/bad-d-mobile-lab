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

const { readFileSync, writeFileSync, mkdirSync, readdirSync, symlinkSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { execFileSync } = require('node:child_process');
const { mkdtempSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { runOnce } = require('../bulk-media-intake/run_experiment.cjs');
const { stage, parseQueueTask } = require('./cycle-lib.cjs');

const SCHEMA_VERSION = '1.0.0';
const GENERATOR_TOOL = 'tools/engineering-cycle/run_cycle.cjs';

function makeTruncatedWav(sourcePath, destPath, keepBytes) {
  const full = readFileSync(sourcePath);
  writeFileSync(destPath, full.subarray(0, keepBytes));
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
    // decision is a required, non-nullable enum field even on an early
    // failure exit -- DEFER is the closest fit ("nothing to act on until
    // the queue task exists again"), not a silent null that would fail
    // this record's own schema validation.
    cycle.decision = 'DEFER';
    cycle.human_interventions.push('DISCOVER failed to locate the queue task -- a human needs to confirm whether PRIORITY_QUEUE.md was intentionally changed (task renamed/removed/completed elsewhere) before this cycle can be re-run.');
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

  cycle.stages.push(stage('REPRODUCE', 'SKIPPED', {
    note: 'SCALE-100-001 is an untested-scale question, not a reported bug -- there is nothing prior to reproduce. REPRODUCE applies to cycles investigating a specific reported failure (e.g. EXP-008\'s real-device fingerprint mismatch); this cycle starts fresh at BASELINE instead.',
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
  // Fixtures are generated to a system tmpdir, NOT under outDir/the repo --
  // 100x 12s WAVs is ~100MB of regeneratable synthetic audio (same reason
  // EXP-009 never committed its generated WAVs either). Only JSON evidence
  // and this README are meant to live under experiments/EXP-013/.
  const fixtureDir = mkdtempSync(join(tmpdir(), 'exp013-fixtures-'));
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

  // Separate clean-only dir (symlinks, no copying) for the CANCELLATION
  // attack, which tests the cancel mechanism itself, not its interaction
  // with malformed-input handling.
  const cleanDir = mkdtempSync(join(tmpdir(), 'exp013-clean-'));
  for (const f of goodFiles) symlinkSync(join(fixtureDir, f), join(cleanDir, f));

  cycle.stages.push(stage('BUILD', 'DONE', {
    input: '97x 12s synthetic WAV via tools/make_synth_wavs.cjs (reused, not rebuilt) + 3 deliberately malformed files (truncated/garbage/empty) = 100 total',
    output: { fixtureDir, totalFiles: allFiles.length },
    evidence: 'fixtures generated to OS tmpdir, not committed (regeneratable, see BUILD input) -- filenames listed in test_100item_results.json',
  }));

  // ---------- TEST (main 100-item run) ----------
  // Reuses tools/bulk-media-intake/run_experiment.cjs's runOnce() as-is --
  // it drives the real intake.html via page.locator('#fileInput').setInputFiles(),
  // the SAME mechanism EXP-009's queue-scale baseline used. A first version
  // of this script reinvented file delivery as base64 embedded in a
  // page.evaluate() argument instead of reusing this; that hit a hard
  // ~100MB page.evaluate/CDP argument-payload ceiling around 70-100 items
  // and was misread as a scale-dependent app failure until bisection
  // (65 OK, 68 OK, 71+ instant page-closed) and a fetch()-based control
  // test proved the SAME 97/100-item batch completes cleanly (0 page
  // errors, ~1.9s) once files are delivered via setInputFiles/fetch
  // instead of a giant evaluate() argument. Recorded as a lab-harness
  // lesson below (see EXTRACT) rather than silently fixed and forgotten.
  const testRunRaw = await runOnce(fixtureDir, 4, null);

  const passed = testRunRaw.passedCount;
  const expectedFailures = ['zz_attack_truncated.wav', 'zz_attack_garbage.wav', 'zz_attack_empty.wav'];
  const failedNames = testRunRaw.summary.filter((r) => r.status === 'failed').map((r) => r.name);
  const allExpectedFailuresRejected = expectedFailures.every((n) => failedNames.includes(n));
  const noUnexpectedFailures = failedNames.every((n) => expectedFailures.includes(n));

  cycle.stages.push(stage('TEST', 'DONE', {
    input: `${allFiles.length} files (97 valid + 3 deliberately malformed), concurrency=4 (per EXP-011's evidence-based recommendation), delivered via run_experiment.cjs's proven setInputFiles() mechanism`,
    output: { durationMs: testRunRaw.durationMs, passed, failed: testRunRaw.failedCount, totalResults: testRunRaw.summary.length, maxHeapMB: testRunRaw.maxHeapMB },
    success_condition: 'All 97 valid files pass, exactly the 3 malformed files fail, no console/page errors',
    failure_condition: 'Any valid file fails, any malformed file is silently accepted, or an unexpected file fails',
    evidence: join(outDir, 'test_100item_results.json'),
  }));
  writeFileSync(join(outDir, 'test_100item_results.json'), JSON.stringify(testRunRaw, null, 2));

  cycle.attacks.push({
    attack: 'MALFORMED_INPUT',
    relevance: 'Cheapest realistic failure mode a bulk upload sees; tests whether rejection still works correctly mixed into a 100-item batch, not just in isolation (EXP-009 tested isolation only).',
    result: allExpectedFailuresRejected && noUnexpectedFailures ? 'SURVIVED' : 'FAILED',
    detail: `expected failures [${expectedFailures.join(', ')}] all rejected: ${allExpectedFailuresRejected}. No unexpected failures beyond those 3: ${noUnexpectedFailures}. Actual failed: [${failedNames.join(', ')}]`,
  });

  // ---------- ATTACK: CANCELLATION at 100-item scale ----------
  const cancelRunRaw = await runOnce(cleanDir, 4, 100); // cancel after 100ms in-flight, matching EXP-010's successful cancellation-timing pattern
  const cancelPageErrors = cancelRunRaw.pageErrors;

  cycle.attacks.push({
    attack: 'CANCELLATION',
    relevance: 'EXP-009 found and fixed a cancellation display bug at small scale; this checks the underlying mechanism (not just display) still cleans up correctly at 2x the previously-tested batch size, with no orphaned AudioContext/resources (0 page errors is the proof).',
    result: cancelPageErrors.length === 0 ? 'SURVIVED' : 'FAILED',
    detail: `cancelled after 100ms in-flight; statusText="${cancelRunRaw.statusText}"; ${cancelRunRaw.summary.length} items had a result at cancellation time; pageErrors: ${cancelPageErrors.length}`,
  });

  // ---------- MEASURE ----------
  const measuredMsPerItem = testRunRaw.durationMs / 97; // valid-file cost, exclude the 3 malformed (near-instant rejections would skew it down)
  cycle.measurements = {
    itemCount: allFiles.length,
    validItemCount: 97,
    durationMs: testRunRaw.durationMs,
    msPerItem: +measuredMsPerItem.toFixed(2),
    baselineMsPerItem: +baselineMsPerItem.toFixed(2),
    maxHeapMB: testRunRaw.maxHeapMB,
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
  cycle.stages.push(stage('ATTACK', testRunRaw.summary.length > 0 ? 'DONE' : 'FAILED', { output: cycle.attacks }));
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
    { name: 'run_experiment.cjs runOnce() reused a 3rd+ time as the standard file-delivery mechanism (setInputFiles, not base64/page.evaluate)', path: 'tools/bulk-media-intake/run_experiment.cjs', reuse_proof: 'USED_TWICE_PLUS' },
    { name: 'Documented lesson: page.evaluate()/CDP argument payloads have a hard ceiling around ~100MB in this sandbox -- bisected between 68 items (~104MB, OK) and 71 items (~108MB, instant page-closed with no pageerror/console signal); use setInputFiles() or same-origin fetch() for any real-file-content delivery instead of embedding file bytes in evaluate() arguments', path: 'EXPERIMENT_PROTOCOL.md', reuse_proof: 'NOT_YET_REUSED' },
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
