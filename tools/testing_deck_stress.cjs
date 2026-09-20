#!/usr/bin/env node
// Diagnostic tool: drives the real #testingFiles input (Testing Deck bulk/
// folder upload -> add() -> queueAutoPipeline() -> runAutoPipelineQueue())
// with N synthetic WAV files and polls performance.memory + the optimizer
// readout element while the app's own autonomous pipeline runs, unmodified.
//
// This is the counterpart to bulk_import_stress.cjs (which drives #fileLib /
// processLibraryQueue). The two intake paths are known from static reading to
// differ: processLibraryQueue calls yieldForMemoryPressure() (heap-ratio-based
// cooldown) between tracks; runAutoPipelineQueue does not call any heap-based
// cooldown — it only nulls out item.buffer for non-active tracks after each
// pipeline pass. This tool exists to see whether that asymmetry shows up as a
// measurable difference in heap behavior, not just as a difference on paper.
//
// Usage:
//   NODE_PATH=/opt/node22/lib/node_modules [BADD_HEAP_MB=256] node tools/testing_deck_stress.cjs \
//     <path-to-html> <wavDir> <outfile.json> [pollMs] [timeoutMs]

const { chromium, devices } = require('playwright');
const { readdirSync, writeFileSync } = require('node:fs');
const { pathToFileURL } = require('node:url');
const { resolve, join } = require('node:path');

(async () => {
  const targetPath = process.argv[2];
  const wavDir = process.argv[3];
  const outFile = process.argv[4];
  const pollMs = parseInt(process.argv[5] || '700', 10);
  const timeoutMs = parseInt(process.argv[6] || '240000', 10);
  const heapMb = process.env.BADD_HEAP_MB ? parseInt(process.env.BADD_HEAP_MB, 10) : null;

  if (!targetPath || !wavDir || !outFile) {
    console.error('Usage: testing_deck_stress.cjs <html> <wavDir> <outfile.json> [pollMs] [timeoutMs]');
    process.exit(2);
  }

  const wavFiles = readdirSync(wavDir).filter((f) => f.endsWith('.wav')).sort().map((f) => join(wavDir, f));
  const url = pathToFileURL(resolve(targetPath)).href;

  const result = {
    target: targetPath,
    wavCount: wavFiles.length,
    startedAt: new Date().toISOString(),
    heapConstraintMb: heapMb,
    samples: [], // {tMs, readoutText, heapUsedMB, heapLimitMB}
    consoleErrors: [],
    pageErrors: [],
    crashed: false,
    timedOut: false,
    finalReadoutText: null,
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

    const t0 = Date.now();
    // #testingFiles has the webkitdirectory attribute; Playwright requires a
    // directory path (not a file list) for such inputs.
    await page.locator('#testingFiles').setInputFiles(resolve(wavDir));

    let lastText = null;
    let stableSince = null;
    while (Date.now() - t0 < timeoutMs) {
      if (page.isClosed() || result.crashed) break;
      let snap;
      try {
        snap = await page.evaluate(() => {
          const m = performance.memory;
          const el = document.getElementById('testingOptimizerReadout');
          return {
            readoutText: el ? el.textContent : null,
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

      const done = /AUTO PIPELINE/.test(snap.readoutText || '') &&
        (/stopped before a measured result|DJ READY|HOLD ·/.test(snap.readoutText || ''));
      if (snap.readoutText === lastText) {
        if (stableSince === null) stableSince = Date.now();
        else if (Date.now() - stableSince > 5000) break; // no progress for 5s -> assume queue drained or stuck
      } else {
        stableSince = null;
        lastText = snap.readoutText;
      }
      await page.waitForTimeout(pollMs);
    }
    if (Date.now() - t0 >= timeoutMs) result.timedOut = true;

    if (!result.crashed && !page.isClosed()) {
      result.finalReadoutText = await page.evaluate(() => {
        const el = document.getElementById('testingOptimizerReadout');
        return el ? el.textContent : null;
      });
    }
  } finally {
    try { await browser.close(); } catch (_) {}
  }

  const json = JSON.stringify(result, null, 2);
  writeFileSync(outFile, json);
  console.log(json);
})();
