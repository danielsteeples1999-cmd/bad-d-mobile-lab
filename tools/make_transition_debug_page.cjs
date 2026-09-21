#!/usr/bin/env node
// AUTODJ-BOUNDARY-001: exposes the production transition-decision chain
// (scoreTransition, previewTimingPlan -- both private to the main IIFE,
// explicitly documented in reference/ as "calls the exact same estimation/
// decision/planning functions startTransition does... applies nothing,
// touches no audio param, fires no logEvent") for direct testing.
//
// Unlike tools/make_checkpoint_engines.cjs (which extracts one small,
// self-contained IIFE as a standalone script), this writes out the ENTIRE
// reference HTML file unmodified except for one inserted export line just
// before the main IIFE's closing `})();` -- preserving the real page/DOM
// exactly as-is, so any top-level init code the main IIFE runs still finds
// the DOM elements it expects. Read-only against reference/; never touches
// bad_d_meomory.
//
// Usage: node make_transition_debug_page.cjs [sourceHtml] [outPath]

const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

const sourceHtml = process.argv[2] || 'reference/BAD-D_SIGNAL_15_72_0-mobile.REFERENCE_READONLY.html';
const outPath = process.argv[3] || '/tmp/badd-transition-debug.html';

const lines = readFileSync(resolve(sourceHtml), 'utf8').split('\n');

// Anchor: find the main IIFE's closing `})();` by locating the unique
// line immediately followed by `</script>` and the next script tag's
// opening -- verified below by requiring exactly one match, same
// discipline as tools/make_checkpoint_engines.cjs.
const closeIdx = lines.findIndex((l, i) =>
  l.trim() === '})();' && lines[i + 1] && lines[i + 1].trim() === '</script>' &&
  lines[i + 2] !== undefined && lines[i + 3] && lines[i + 3].includes('<script id="badd-asr-loader">')
);
const allMatches = lines.filter((l, i) =>
  l.trim() === '})();' && lines[i + 1] && lines[i + 1].trim() === '</script>' &&
  lines[i + 2] !== undefined && lines[i + 3] && lines[i + 3].includes('<script id="badd-asr-loader">')
).length;
if (closeIdx === -1 || allMatches !== 1) {
  throw new Error(`Extraction sanity check failed: expected exactly 1 match of the main-IIFE closing anchor, found ${allMatches}. The source file structure may have changed -- update this tool's assumptions before trusting its output.`);
}

const exportLine = "  window.__BADD_TRANSITION_DEBUG = { scoreTransition, previewTimingPlan, arbitrateTimingLever, detectTransitionHazards, decideVocalCollisions, decideHarmonicClash, pickTransitionTechnique, bestBeatmatchRate, trackElapsed, computeFingerprint };";
lines.splice(closeIdx, 0, exportLine);
const patched = lines.join('\n');
writeFileSync(resolve(outPath), patched);
console.log(JSON.stringify({ sourceHtml, outPath, bytesWritten: patched.length, exported: ['scoreTransition', 'previewTimingPlan', 'arbitrateTimingLever', 'detectTransitionHazards', 'decideVocalCollisions', 'decideHarmonicClash', 'pickTransitionTechnique', 'bestBeatmatchRate', 'trackElapsed'] }, null, 2));
