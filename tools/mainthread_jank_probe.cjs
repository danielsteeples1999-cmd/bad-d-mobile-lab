#!/usr/bin/env node
// Diagnostic tool: measures main-thread blocking ("long tasks", >50ms) during
// idle vs. during a real bulk library import, using the standard
// PerformanceObserver longtask API (no app internals touched).
//
// WHY: the production build's Auto-DJ transition/crossfade logic is driven
// by setInterval-based "tick" scheduler functions (confirmed by static read:
// several `setInterval(tick, Nms)` calls in the main script). A scheduler
// like that only fires as promptly as the main thread lets it -- if bulk
// import work (five-scan preparation per track) blocks the main thread for
// stretches comparable to or longer than the tick interval, a scheduled
// crossfade/transition could fire late, which is a plausible mechanism for
// "audio chopping" that's distinct from anything EXP-001..005 tested (those
// were all about crash/memory, never about playback timing).
//
// This tool does NOT claim to hear a glitch -- it measures the main-thread
// blocking that is a necessary precondition for this class of glitch, as a
// cheap, local, device-independent proxy. Real audio-glitch confirmation
// still needs a human listening on a real device.
//
// Usage:
//   NODE_PATH=/opt/node22/lib/node_modules node tools/mainthread_jank_probe.cjs \
//     <path-to-html> <wavDir> <outfile.json> [idleMs]

const { chromium, devices } = require('playwright');
const { readdirSync, writeFileSync } = require('node:fs');
const { pathToFileURL } = require('node:url');
const { resolve, join } = require('node:path');

(async () => {
  const targetPath = process.argv[2];
  const wavDir = process.argv[3];
  const outFile = process.argv[4];
  const idleMs = parseInt(process.argv[5] || '5000', 10);

  if (!targetPath || !wavDir || !outFile) {
    console.error('Usage: mainthread_jank_probe.cjs <html> <wavDir> <outfile.json> [idleMs]');
    process.exit(2);
  }

  const wavFiles = readdirSync(wavDir).filter((f) => f.endsWith('.wav')).sort().map((f) => join(wavDir, f));
  const url = pathToFileURL(resolve(targetPath)).href;

  const result = {
    target: targetPath,
    wavCount: wavFiles.length,
    startedAt: new Date().toISOString(),
    idleMs,
    longtaskApiSupported: null,
    idlePhase: { durationMs: idleMs, longTasks: [], count: 0, totalBlockedMs: 0, maxTaskMs: 0 },
    importPhase: { durationMs: null, longTasks: [], count: 0, totalBlockedMs: 0, maxTaskMs: 0 },
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

    // Install the long-task collector BEFORE anything else happens, so we
    // capture idle baseline too. window.__jank accumulates {start,dur}.
    result.longtaskApiSupported = await page.evaluate(() => {
      try {
        window.__jank = [];
        const obs = new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            window.__jank.push({ start: e.startTime, dur: e.duration });
          }
        });
        obs.observe({ entryTypes: ['longtask'] });
        window.__jankObserver = obs;
        return true;
      } catch (e) {
        window.__jankReason = e.message;
        return false;
      }
    });

    if (!result.longtaskApiSupported) {
      const reason = await page.evaluate(() => window.__jankReason || 'unknown');
      result.blocked = `PerformanceObserver longtask API unavailable: ${reason}`;
      writeFileSync(outFile, JSON.stringify(result, null, 2));
      console.log(JSON.stringify(result, null, 2));
      await browser.close();
      return;
    }

    // Phase 1: idle baseline.
    await page.waitForTimeout(idleMs);
    const idleTasks = await page.evaluate(() => { const t = window.__jank.slice(); window.__jank.length = 0; return t; });
    result.idlePhase.longTasks = idleTasks;
    result.idlePhase.count = idleTasks.length;
    result.idlePhase.totalBlockedMs = +idleTasks.reduce((s, t) => s + t.dur, 0).toFixed(1);
    result.idlePhase.maxTaskMs = idleTasks.length ? +Math.max(...idleTasks.map((t) => t.dur)).toFixed(1) : 0;

    // Phase 2: real bulk import, same page, same observer, still running.
    const t0 = Date.now();
    await page.locator('#fileLib').setInputFiles(wavFiles);

    let lastLen = -1, stableSince = null;
    while (Date.now() - t0 < 180000) {
      const len = await page.evaluate(() => (Array.isArray(window.library) ? window.library.length : null));
      if (len === lastLen) {
        if (stableSince === null) stableSince = Date.now();
        else if (Date.now() - stableSince > 3000) break;
      } else { stableSince = null; lastLen = len; }
      await page.waitForTimeout(500);
    }
    result.importPhase.durationMs = Date.now() - t0;

    const importTasks = await page.evaluate(() => window.__jank.slice());
    result.importPhase.longTasks = importTasks;
    result.importPhase.count = importTasks.length;
    result.importPhase.totalBlockedMs = +importTasks.reduce((s, t) => s + t.dur, 0).toFixed(1);
    result.importPhase.maxTaskMs = importTasks.length ? +Math.max(...importTasks.map((t) => t.dur)).toFixed(1) : 0;
  } finally {
    try { await browser.close(); } catch (_) {}
  }

  const json = JSON.stringify(result, null, 2);
  writeFileSync(outFile, json);
  console.log(json);
})();
