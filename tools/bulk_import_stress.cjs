#!/usr/bin/env node
// Diagnostic tool: drives the real #fileLib bulk-import input with N synthetic
// WAV files and polls window.library.length + performance.memory while the
// app's own processLibraryQueue()/yieldForMemoryPressure() run, unmodified.
// This exercises the actual shipped intake path black-box, through the UI,
// rather than reaching into internal closures.
//
// Set BADD_HEAP_MB to launch Chromium with a constrained V8 old-space, as a
// cheap proxy for a memory-limited mobile Chrome tab (real phones report a
// much lower performance.memory.jsHeapSizeLimit than a desktop headless run).
//
// Usage:
//   NODE_PATH=/opt/node22/lib/node_modules [BADD_HEAP_MB=256] node tools/bulk_import_stress.cjs \
//     <path-to-html> <wavDir> <outfile.json> [pollMs] [timeoutMs]

const { chromium, devices } = require('playwright');
const { readdirSync, writeFileSync } = require('node:fs');
const { pathToFileURL } = require('node:url');
const { resolve, join } = require('node:path');

(async () => {
  const targetPath = process.argv[2];
  const wavDir = process.argv[3];
  const outFile = process.argv[4];
  const pollMs = parseInt(process.argv[5] || '500', 10);
  const timeoutMs = parseInt(process.argv[6] || '120000', 10);
  const heapMb = process.env.BADD_HEAP_MB ? parseInt(process.env.BADD_HEAP_MB, 10) : null;

  if (!targetPath || !wavDir || !outFile) {
    console.error('Usage: bulk_import_stress.cjs <html> <wavDir> <outfile.json> [pollMs] [timeoutMs]');
    process.exit(2);
  }

  const wavFiles = readdirSync(wavDir)
    .filter((f) => f.endsWith('.wav'))
    .sort()
    .map((f) => join(wavDir, f));

  const url = pathToFileURL(resolve(targetPath)).href;

  const result = {
    target: targetPath,
    wavCount: wavFiles.length,
    startedAt: new Date().toISOString(),
    samples: [], // {tMs, libraryLength, statusText, heapUsedMB, heapLimitMB}
    consoleErrors: [],
    pageErrors: [],
    finalLibraryLength: null,
    crashed: false,
    timedOut: false,
    heapConstraintMb: heapMb,
  };

  const launchArgs = heapMb ? [`--js-flags=--max-old-space-size=${heapMb}`] : [];
  const browser = await chromium.launch({ headless: true, args: launchArgs });
  try {
    const context = await browser.newContext({ ...devices['Pixel 7'] });
    const page = await context.newPage();

    page.on('console', (msg) => { if (msg.type() === 'error') result.consoleErrors.push(msg.text()); });
    page.on('pageerror', (err) => result.pageErrors.push(err.message || String(err)));
    page.on('crash', () => { result.crashed = true; });

    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(500);

    const fileInput = page.locator('#fileLib');
    const t0 = Date.now();
    await fileInput.setInputFiles(wavFiles);

    // Poll until library.length stops growing and settles, or timeout.
    let lastLen = -1;
    let stableSince = null;
    while (Date.now() - t0 < timeoutMs) {
      if (page.isClosed() || result.crashed) break;
      let snap;
      try {
        snap = await page.evaluate(() => {
          const m = performance.memory;
          const statusEl = document.getElementById('libStatus');
          return {
            libraryLength: (typeof window.library !== 'undefined' && Array.isArray(window.library)) ? window.library.length : null,
            statusText: statusEl ? statusEl.textContent : null,
            heapUsedMB: m ? +(m.usedJSHeapSize / 1e6).toFixed(2) : null,
            heapLimitMB: m ? +(m.jsHeapSizeLimit / 1e6).toFixed(2) : null,
          };
        });
      } catch (e) {
        result.pageErrors.push('evaluate failed (page likely crashed): ' + e.message);
        result.crashed = true;
        break;
      }
      result.samples.push({ tMs: Date.now() - t0, ...snap });

      if (snap.libraryLength === lastLen) {
        if (stableSince === null) stableSince = Date.now();
        else if (Date.now() - stableSince > 3000 && !/analyzing/i.test(snap.statusText || '')) {
          break; // settled: length unchanged and status no longer says "analyzing"
        }
      } else {
        stableSince = null;
        lastLen = snap.libraryLength;
      }
      await page.waitForTimeout(pollMs);
    }
    if (Date.now() - t0 >= timeoutMs) result.timedOut = true;

    if (!result.crashed && !page.isClosed()) {
      result.finalLibraryLength = await page.evaluate(() => (Array.isArray(window.library) ? window.library.length : null));
    }
  } finally {
    try { await browser.close(); } catch (_) {}
  }

  const json = JSON.stringify(result, null, 2);
  writeFileSync(outFile, json);
  console.log(json);
})();
