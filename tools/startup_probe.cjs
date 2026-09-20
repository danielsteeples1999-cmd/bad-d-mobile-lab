#!/usr/bin/env node
// Diagnostic tool: loads a BAD-D build headlessly under a mobile emulation
// profile and records startup evidence (errors, timing, heap) as JSON.
// Reusable — do not hand-roll this check again, extend this tool instead.
//
// Usage:
//   NODE_PATH=/opt/node22/lib/node_modules node tools/startup_probe.cjs <path-to-html> [outfile.json]

const { chromium, devices } = require('playwright');
const { writeFileSync } = require('node:fs');
const { pathToFileURL } = require('node:url');
const { resolve } = require('node:path');

(async () => {
  const targetPath = process.argv[2];
  const outFile = process.argv[3] || null;

  if (!targetPath) {
    console.error('Usage: startup_probe.cjs <path-to-html> [outfile.json]');
    process.exit(2);
  }

  const url = pathToFileURL(resolve(targetPath)).href;

  const result = {
    target: targetPath,
    url,
    startedAt: new Date().toISOString(),
    emulation: 'Pixel 7 (mobile Chrome profile)',
    consoleErrors: [],
    consoleWarnings: [],
    pageErrors: [],
    requestFailures: [],
    timing: {},
    heap: null,
    titleText: null,
    detectedDevice: null, // what the app's own DEVICE_TIER logic concluded
    ok: null,
  };

  const browser = await chromium.launch({ headless: true });
  try {
    const device = devices['Pixel 7'];
    const context = await browser.newContext({ ...device });
    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') result.consoleErrors.push(msg.text());
      if (msg.type() === 'warning') result.consoleWarnings.push(msg.text());
    });
    page.on('pageerror', (err) => {
      result.pageErrors.push(err.message || String(err));
    });
    page.on('requestfailed', (req) => {
      result.requestFailures.push({ url: req.url(), failure: req.failure()?.errorText });
    });

    const t0 = Date.now();
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    result.timing.loadEventMs = Date.now() - t0;

    // Let any deferred init / rAF loops settle.
    await page.waitForTimeout(1500);
    result.timing.settledMs = Date.now() - t0;

    result.titleText = await page.title();

    result.heap = await page.evaluate(() => {
      const m = performance.memory;
      return m
        ? {
            usedMB: +(m.usedJSHeapSize / 1e6).toFixed(2),
            totalMB: +(m.totalJSHeapSize / 1e6).toFixed(2),
            limitMB: +(m.jsHeapSizeLimit / 1e6).toFixed(2),
          }
        : null;
    });

    result.detectedDevice = await page.evaluate(() => {
      try {
        return typeof DEVICE_TIER !== 'undefined' ? DEVICE_TIER : 'DEVICE_TIER undefined in page scope';
      } catch (e) {
        return 'error reading DEVICE_TIER: ' + e.message;
      }
    });

    result.ok = result.pageErrors.length === 0 && result.consoleErrors.length === 0;
  } finally {
    await browser.close();
  }

  const json = JSON.stringify(result, null, 2);
  if (outFile) {
    writeFileSync(outFile, json);
  }
  console.log(json);
  process.exit(result.ok ? 0 : 1);
})();
