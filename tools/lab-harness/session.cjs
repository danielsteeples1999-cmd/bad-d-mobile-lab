#!/usr/bin/env node
// Shared Playwright+CDP session helper. Found by audit: 8 existing tools
// (bulk_import_stress.cjs, cpu_profile_import.cjs, mainthread_jank_probe.cjs,
// reload_recovery_probe.cjs, startup_probe.cjs, testing_deck_stress.cjs,
// bulk-media-intake/run_experiment.cjs, fixture-acceptance/validate_pair.cjs)
// each hand-roll the same chromium.launch + context + CDP-session + error-
// listener boilerplate. This is that logic, extracted once. New tools
// (starting with tools/engineering-cycle/run_cycle.cjs) use this; existing
// tools are NOT force-migrated in this pass (working, evidence-backed code
// isn't touched without a reason) -- tools/fixture-acceptance/validate_pair.cjs
// was migrated as the "does a second consumer actually work" proof, see its
// own file history / EXP-013.
//
// Carries forward two hard-won lessons from prior experiments rather than
// re-discovering them:
//   - EXP-005: performance.memory is unreliable in this sandbox. Use CDP
//     Runtime.getHeapUsage() instead.
//   - EXP-008 (building DANIEL_TEST artifacts): about:blank is an opaque
//     origin -- crypto.subtle needs a real file:// page.

const { chromium, devices } = require('playwright');
const { writeFileSync, mkdtempSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');

/**
 * @param {object} opts
 * @param {string} [opts.device] - a Playwright devices[] key, default 'Pixel 7'
 * @param {number} [opts.heapMb] - if set, launches with --js-flags=--max-old-space-size=<heapMb>
 * @param {boolean} [opts.needsSecureContext] - if true, navigates to a real local
 *   file:// page first (required for crypto.subtle) instead of leaving the page blank
 */
async function openSession(opts = {}) {
  const { device = 'Pixel 7', heapMb = null, needsSecureContext = false } = opts;
  const launchArgs = heapMb ? [`--js-flags=--max-old-space-size=${heapMb}`] : [];
  const browser = await chromium.launch({ headless: true, args: launchArgs });
  const context = await browser.newContext({ ...devices[device] });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Runtime.enable');

  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (e) => pageErrors.push(e.message));

  if (needsSecureContext) {
    const tmpDir = mkdtempSync(join(tmpdir(), 'badd-lab-harness-'));
    const blankHtmlPath = join(tmpDir, 'blank.html');
    writeFileSync(blankHtmlPath, '<!DOCTYPE html><html><body></body></html>');
    await page.goto('file://' + blankHtmlPath);
  }

  return {
    browser, context, page, cdp, consoleErrors, pageErrors,
    async heapUsage() {
      const h = await cdp.send('Runtime.getHeapUsage');
      return { usedMB: +(h.usedSize / 1e6).toFixed(2), totalMB: +(h.totalSize / 1e6).toFixed(2), backingMB: +(h.backingStorageSize / 1e6).toFixed(2) };
    },
    async forceGc() {
      try { await cdp.send('HeapProfiler.enable'); await cdp.send('HeapProfiler.collectGarbage'); } catch (_) {}
    },
    async close() {
      try { await browser.close(); } catch (_) {}
    },
  };
}

module.exports = { openSession };
