#!/usr/bin/env node
// Drives intake.html headlessly with a given file set and concurrency,
// measuring wall-clock time, per-item timing, CDP heap (see EXP-005 --
// performance.memory is unreliable in this sandbox, CDP is validated),
// and pass/fail counts. Reusable across the queue-scale, concurrency-sweep,
// duplicate-detection, malformed-input, and cancellation experiments.
//
// Usage: node run_experiment.cjs <wavDir> <concurrency> [cancelAfterMs]

const { chromium, devices } = require('playwright');
const { readdirSync } = require('node:fs');
const path = require('node:path');

async function runOnce(wavDir, concurrency, cancelAfterMs) {
  const files = readdirSync(wavDir).filter(f => f.endsWith('.wav') || f.endsWith('.bin')).sort().map(f => path.join(wavDir, f));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ...devices['Pixel 7'] });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Runtime.enable');
  const consoleErrors = [], pageErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(e.message));

  await page.goto('file://' + path.resolve(__dirname, 'intake.html'));
  await page.waitForTimeout(300);
  await page.locator('#fileInput').setInputFiles(files);
  await page.fill('#concurrency', String(concurrency));

  const heapSamples = [];
  const heapInterval = setInterval(async () => {
    try { const h = await cdp.send('Runtime.getHeapUsage'); heapSamples.push(h.usedSize); } catch (_) {}
  }, 150);

  const t0 = Date.now();
  await page.click('#startBtn');

  if (cancelAfterMs) {
    await page.waitForTimeout(cancelAfterMs);
    await page.click('#cancelBtn');
  }

  await page.waitForFunction(() => {
    const t = document.getElementById('statusText').textContent;
    return t.startsWith('Done') || t.startsWith('Cancelling');
  }, { timeout: 120000 });
  // if cancelled, give the runner a moment to actually settle to "Done"
  await page.waitForFunction(() => document.getElementById('statusText').textContent.startsWith('Done'), { timeout: 30000 }).catch(() => {});

  const durationMs = Date.now() - t0;
  clearInterval(heapInterval);

  const results = await page.evaluate(() => window.lastResultsForExport || null).catch(() => null);
  // fallback: read from the DOM/export path via a hook we didn't add -- pull from page state instead
  const summary = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#resultsBody tr'));
    return rows.map(r => {
      const cells = r.querySelectorAll('td');
      return { name: cells[0]?.textContent, status: cells[1]?.textContent, duration: cells[2]?.textContent, sha256: cells[3]?.textContent, timingMs: cells[4]?.textContent };
    });
  });
  const statusText = await page.locator('#statusText').textContent();

  await browser.close();

  return {
    concurrency, fileCount: files.length, cancelAfterMs: cancelAfterMs || null,
    durationMs, statusText, summary,
    passedCount: summary.filter(r => r.status === 'passed').length,
    failedCount: summary.filter(r => r.status === 'failed').length,
    cancelledCount: summary.filter(r => r.status === 'cancelled').length,
    warningCount: summary.filter(r => r.status === 'warning').length,
    maxHeapMB: heapSamples.length ? +(Math.max(...heapSamples) / 1e6).toFixed(1) : null,
    heapSampleCount: heapSamples.length,
    consoleErrors, pageErrors,
  };
}

if (require.main === module) {
  const [wavDir, concurrency, cancelAfterMs] = process.argv.slice(2);
  runOnce(wavDir, parseInt(concurrency, 10) || 1, cancelAfterMs ? parseInt(cancelAfterMs, 10) : null)
    .then(r => console.log(JSON.stringify(r, null, 2)))
    .catch(e => { console.error(e); process.exit(1); });
}

module.exports = { runOnce };
