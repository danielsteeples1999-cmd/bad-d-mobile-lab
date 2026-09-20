#!/usr/bin/env node
// Diagnostic tool: tests whether the library bulk-import path survives a
// page reload mid-batch. Static reading of the production build shows
// `const library = [];` is re-initialized empty on every load with no
// rehydration call, while `cacheStore` (the fingerprint cache) IS loaded
// from a persistent JSON store (loadCacheStore() -> loadJSONStore(CACHE_KEY)).
// This tool checks that split dynamically rather than trusting the read.
//
// Sequence: import N files -> wait for M to commit -> reload() -> check
// library.length post-reload -> scan DOM for any recovery/resume UI ->
// re-submit the SAME files and check whether analysis is skipped (cache hit).
//
// Usage:
//   NODE_PATH=/opt/node22/lib/node_modules node tools/reload_recovery_probe.cjs \
//     <path-to-html> <wavDir> <outfile.json> [waitBeforeReloadMs]

const { chromium, devices } = require('playwright');
const { readdirSync, writeFileSync } = require('node:fs');
const { pathToFileURL } = require('node:url');
const { resolve, join } = require('node:path');

(async () => {
  const targetPath = process.argv[2];
  const wavDir = process.argv[3];
  const outFile = process.argv[4];
  const waitBeforeReloadMs = parseInt(process.argv[5] || '3000', 10);

  if (!targetPath || !wavDir || !outFile) {
    console.error('Usage: reload_recovery_probe.cjs <html> <wavDir> <outfile.json> [waitBeforeReloadMs]');
    process.exit(2);
  }

  const wavFiles = readdirSync(wavDir).filter((f) => f.endsWith('.wav')).sort().map((f) => join(wavDir, f));
  const url = pathToFileURL(resolve(targetPath)).href;

  const result = {
    target: targetPath,
    wavCount: wavFiles.length,
    startedAt: new Date().toISOString(),
    waitBeforeReloadMs,
    libraryLengthBeforeReload: null,
    statusTextBeforeReload: null,
    libraryLengthAfterReload: null,
    statusTextAfterReload: null,
    recoveryUiTextFound: null,
    resubmit: { statusText: null, libraryLength: null, cacheHitsMentioned: null },
    consoleErrors: [],
    pageErrors: [],
  };

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ ...devices['Pixel 7'] });
    const page = await context.newPage();
    page.on('console', (msg) => { if (msg.type() === 'error') result.consoleErrors.push(msg.text()); });
    page.on('pageerror', (err) => result.pageErrors.push(err.message || String(err)));

    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(300);

    // Start a bulk import of everything at once (worst case: interruption
    // partway through a real multi-select bulk upload).
    await page.locator('#fileLib').setInputFiles(wavFiles);
    await page.waitForTimeout(waitBeforeReloadMs); // interrupt mid-batch, not after completion

    const before = await page.evaluate(() => ({
      len: Array.isArray(window.library) ? window.library.length : null,
      status: document.getElementById('libStatus')?.textContent || null,
    }));
    result.libraryLengthBeforeReload = before.len;
    result.statusTextBeforeReload = before.status;

    // Simulate the crash-safety scenario the docs call out: refresh mid-run.
    await page.reload({ waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(800);

    const after = await page.evaluate(() => ({
      len: Array.isArray(window.library) ? window.library.length : null,
      status: document.getElementById('libStatus')?.textContent || null,
      bodyText: document.body.innerText || '',
    }));
    result.libraryLengthAfterReload = after.len;
    result.statusTextAfterReload = after.status;
    result.recoveryUiTextFound = /recover|resume|restore|interrupted run|checkpoint/i.test(after.bodyText) || null;

    // Re-submit the identical file list post-reload: does the fingerprint
    // cache actually survive even though library membership did not?
    await page.locator('#fileLib').setInputFiles(wavFiles);
    await page.waitForTimeout(Math.min(30000, 700 * wavFiles.length + 3000));
    const resub = await page.evaluate(() => ({
      len: Array.isArray(window.library) ? window.library.length : null,
      status: document.getElementById('libStatus')?.textContent || null,
    }));
    result.resubmit.libraryLength = resub.len;
    result.resubmit.statusText = resub.status;
    result.resubmit.cacheHitsMentioned = /from cache/i.test(resub.status || '');
  } finally {
    try { await browser.close(); } catch (_) {}
  }

  const json = JSON.stringify(result, null, 2);
  writeFileSync(outFile, json);
  console.log(json);
})();
