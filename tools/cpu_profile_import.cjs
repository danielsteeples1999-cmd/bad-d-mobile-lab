#!/usr/bin/env node
// Diagnostic tool: CPU-profiles the real page (via CDP Profiler, not source
// edits) during a bulk import, then aggregates self-time by function name to
// find what's actually inside the long tasks EXP-006 measured. No file is
// touched -- this observes the unmodified reference build running exactly
// as shipped.
//
// Usage:
//   NODE_PATH=/opt/node22/lib/node_modules node tools/cpu_profile_import.cjs \
//     <path-to-html> <wavDir> <outfile.json> [trackCount]

const { chromium, devices } = require('playwright');
const { readdirSync, writeFileSync } = require('node:fs');
const { pathToFileURL } = require('node:url');
const { resolve, join } = require('node:path');

(async () => {
  const targetPath = process.argv[2];
  const wavDir = process.argv[3];
  const outFile = process.argv[4];
  const trackCount = process.argv[5] ? parseInt(process.argv[5], 10) : null;

  if (!targetPath || !wavDir || !outFile) {
    console.error('Usage: cpu_profile_import.cjs <html> <wavDir> <outfile.json> [trackCount]');
    process.exit(2);
  }

  let wavFiles = readdirSync(wavDir).filter((f) => f.endsWith('.wav')).sort().map((f) => join(wavDir, f));
  if (trackCount) wavFiles = wavFiles.slice(0, trackCount);
  const url = pathToFileURL(resolve(targetPath)).href;

  const browser = await chromium.launch({ headless: true });
  const result = { target: targetPath, wavCount: wavFiles.length, startedAt: new Date().toISOString() };
  try {
    const context = await browser.newContext({ ...devices['Pixel 7'] });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);

    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(300);

    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); // microseconds -> 0.2ms samples
    await cdp.send('Profiler.start');

    const t0 = Date.now();
    await page.locator('#fileLib').setInputFiles(wavFiles);
    let lastLen = -1, stableSince = null;
    while (Date.now() - t0 < 120000) {
      const len = await page.evaluate(() => (Array.isArray(window.library) ? window.library.length : null));
      if (len === lastLen) {
        if (stableSince === null) stableSince = Date.now();
        else if (Date.now() - stableSince > 2000) break;
      } else { stableSince = null; lastLen = len; }
      await page.waitForTimeout(300);
    }
    result.importDurationMs = Date.now() - t0;

    const { profile } = await cdp.send('Profiler.stop');

    // Aggregate self-time per function name using the node hit counts
    // (standard CPU profile format: nodes[].hitCount * sample interval).
    const nodeById = new Map(profile.nodes.map((n) => [n.id, n]));
    const totalSamples = profile.samples.length;
    const hitsByFn = new Map();
    for (const n of profile.nodes) {
      const name = n.callFrame.functionName || '(anonymous)';
      const url_ = n.callFrame.url ? n.callFrame.url.split('/').pop() : '';
      const key = `${name}${url_ ? ' @' + url_ : ''}:${n.callFrame.lineNumber}`;
      hitsByFn.set(key, (hitsByFn.get(key) || 0) + (n.hitCount || 0));
    }
    const durationMicros = profile.endTime - profile.startTime;
    const totalHits = [...hitsByFn.values()].reduce((a, b) => a + b, 0) || 1;
    const topFunctions = [...hitsByFn.entries()]
      .map(([key, hits]) => ({ key, hits, estMs: +((hits / totalHits) * (durationMicros / 1000)).toFixed(1), pct: +((hits / totalHits) * 100).toFixed(1) }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 25)
      .filter((f) => f.hits > 0);

    result.profileDurationMs = +(durationMicros / 1000).toFixed(1);
    result.totalSamples = totalSamples;
    result.topFunctionsBySelfTime = topFunctions;
  } finally {
    try { await browser.close(); } catch (_) {}
  }

  const json = JSON.stringify(result, null, 2);
  writeFileSync(outFile, json);
  console.log(json);
})();
