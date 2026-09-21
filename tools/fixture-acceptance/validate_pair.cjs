#!/usr/bin/env node
// Runs the fixture-acceptance validator (validator.js) against a pair of
// files in real Chromium (needs Web Crypto + Web Audio). Reusable CLI --
// any future experiment with a "content-identical, byte-different pair"
// fixture claim can call this instead of writing its own check.
//
// Usage: node validate_pair.cjs <fileA> <fileB> <outJson> \
//          --id=<fixture_set_id> --version=<v> --intended="<text>" \
//          --method="<generation method>" --tool=<generatorTool> [--tolerance=0]

const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { openSession } = require('../lab-harness/session.cjs');

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (const a of argv) {
    if (a.startsWith('--')) {
      const [k, ...rest] = a.slice(2).split('=');
      flags[k] = rest.join('=');
    } else positional.push(a);
  }
  return { positional, flags };
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const [fileAPath, fileBPath, outJsonPath] = positional;
  if (!fileAPath || !fileBPath || !outJsonPath) {
    console.error('Usage: validate_pair.cjs <fileA> <fileB> <outJson> --id= --version= --intended= --method= --tool= [--tolerance=]');
    process.exit(2);
  }

  const session = await openSession({ needsSecureContext: true }); // crypto.subtle needs a real page, not about:blank -- see tools/lab-harness/session.cjs
  const { page, pageErrors } = session;
  await page.addScriptTag({ content: readFileSync(resolve(__dirname, 'validator.js'), 'utf8') });

  const fileABuf = readFileSync(resolve(fileAPath));
  const fileBBuf = readFileSync(resolve(fileAPath) === resolve(fileBPath) ? fileAPath : fileBPath);
  const fileBBufReal = readFileSync(resolve(fileBPath));

  const report = await page.evaluate(async ({ aB64, bB64, aName, bName, opts }) => {
    function b64ToUint8(b64) { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
    const fileA = new File([b64ToUint8(aB64)], aName, { type: 'audio/wav' });
    const fileB = new File([b64ToUint8(bB64)], bName, { type: 'audio/wav' });
    return await window.BADD_FIXTURE_ACCEPTANCE.validateContentIdenticalPair({ fileA, fileB, ...opts });
  }, {
    aB64: fileABuf.toString('base64'), bB64: fileBBufReal.toString('base64'),
    aName: fileAPath.split('/').pop(), bName: fileBPath.split('/').pop(),
    opts: {
      fixtureSetId: flags.id || null,
      fixtureSetVersion: flags.version || '1',
      intendedCondition: flags.intended || null,
      generationMethod: flags.method || null,
      generatorTool: flags.tool || null,
      generatorVersion: flags.generatorVersion || null,
      contentToleranceAbs: flags.tolerance ? parseFloat(flags.tolerance) : 0,
    },
  });

  // NO_SILENT_MUTATION: re-fingerprint both files right now (immediately
  // after the primary validation pass) and compare against the fingerprints
  // just recorded -- proves the files didn't change mid-validation.
  const reverify = await page.evaluate(async ({ aB64, bB64, expectedA, expectedB }) => {
    function b64ToUint8(b64) { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
    const fileA = new File([b64ToUint8(aB64)], 'a');
    const fileB = new File([b64ToUint8(bB64)], 'b');
    const rA = await window.BADD_FIXTURE_ACCEPTANCE.reverifyNoMutation(fileA, expectedA);
    const rB = await window.BADD_FIXTURE_ACCEPTANCE.reverifyNoMutation(fileB, expectedB);
    return { rA, rB };
  }, { aB64: fileABuf.toString('base64'), bB64: fileBBufReal.toString('base64'), expectedA: report.fingerprints[0].sha256, expectedB: report.fingerprints[1].sha256 });

  const noMutation = reverify.rA.matches && reverify.rB.matches;
  report.post_experiment_reverification = { matches_baseline: noMutation, checkedAt: new Date().toISOString() };
  const nsmIdx = report.criteria_results.findIndex(c => c.criterion === 'NO_SILENT_MUTATION');
  if (nsmIdx >= 0) {
    report.criteria_results[nsmIdx] = { criterion: 'NO_SILENT_MUTATION', status: noMutation ? 'PASS' : 'FAIL', detail: noMutation ? 'sha256 re-check matches baseline for both files' : 'MUTATION DETECTED: ' + JSON.stringify(reverify), measured: reverify };
    const anyFail = report.criteria_results.some(c => c.status === 'FAIL');
    report.acceptance_status = anyFail ? 'FIXTURE_REJECTED' : 'FIXTURE_ACCEPTED';
    const failed = report.criteria_results.filter(c => c.status === 'FAIL').map(c => c.criterion);
    report.human_summary = report.acceptance_status === 'FIXTURE_ACCEPTED' ? 'FIXTURE ACCEPTED — experiment may run' : 'FIXTURE REJECTED — experiment must not be interpreted. Failed: ' + failed.join(', ');
  }

  report.pageErrors = pageErrors;
  await session.close();

  writeFileSync(outJsonPath, JSON.stringify(report, null, 2));
  console.log(report.human_summary);
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.acceptance_status === 'FIXTURE_ACCEPTED' ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
