#!/usr/bin/env node
// Regression test for CANCEL-OBS-001: every submitted item must produce a
// results row, regardless of whether it started before cancellation fired.
// Reuses run_experiment.cjs's runOnce() (existing, real UI-driven runner)
// rather than reimplementing batch execution -- this is a check on its
// output, not a new harness.
//
// Reproduces EXP-009's original cancel_test3.json conditions (20 heavy
// files, concurrency=2, cancelAfterMs=20) since that's what reliably
// catches items mid-queue rather than letting the whole batch race ahead
// of a light cancellation window.
//
// Usage: node regression_cancel_obs.cjs [fileCount] [concurrency] [cancelAfterMs]
// Exit 0 = PASS (all submitted items got a row), 1 = FAIL or error.

const { execFileSync } = require('node:child_process');
const { mkdtempSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');
const { runOnce } = require('./run_experiment.cjs');

async function main() {
  const fileCount = parseInt(process.argv[2] || '20', 10);
  const concurrency = parseInt(process.argv[3] || '2', 10);
  const cancelAfterMs = parseInt(process.argv[4] || '20', 10);

  const fixtureDir = mkdtempSync(join(tmpdir(), 'cancel-obs-regression-'));
  execFileSync('node', [join(__dirname, '../make_synth_wavs.cjs'), fixtureDir, String(fileCount), '50'], { stdio: 'pipe' });

  const r = await runOnce(fixtureDir, concurrency, cancelAfterMs);

  const rowCountOk = r.summary.length === r.fileCount;
  const accountedFor = r.passedCount + r.cancelledCount + r.failedCount + r.warningCount;
  const accountingOk = accountedFor === r.fileCount;
  const cancellationActuallyHappened = r.cancelledCount > 0; // sanity: if 0, the test didn't exercise the bug at all

  const pass = rowCountOk && accountingOk && cancellationActuallyHappened;

  console.log(JSON.stringify({
    fileCount: r.fileCount, concurrency, cancelAfterMs, durationMs: r.durationMs,
    summaryRowCount: r.summary.length, passedCount: r.passedCount, cancelledCount: r.cancelledCount,
    failedCount: r.failedCount, warningCount: r.warningCount,
    checks: { rowCountOk, accountingOk, cancellationActuallyHappened },
    result: pass ? 'PASS' : 'FAIL',
  }, null, 2));

  process.exit(pass ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
