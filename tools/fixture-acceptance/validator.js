// BAD-D Mobile Lab — reusable Fixture Acceptance Gate (browser-only: Web
// Crypto + Web Audio). Not specific to any one experiment. See
// contracts/fixture-acceptance.schema.json for the output shape and
// PROMOTION_GATE.md-adjacent rule: an experiment may not interpret its
// primary result (PASS/FAIL/SUPPORTED/etc.) until acceptance_status here is
// FIXTURE_ACCEPTED. REJECTED means the experiment is invalid, not that the
// system under test failed.
//
// V1 supports one fixture-set relationship, the one HASH-NEAR-001 needs and
// the one most near-duplicate-style experiments will need: a PAIR of files
// claimed to be "content-identical, byte-different" (e.g. same audio, a
// different container/metadata/chunk layout). Exposes
// window.BADD_FIXTURE_ACCEPTANCE.validateContentIdenticalPair(...).
// Architected so a second relationship type (e.g. "known-different-content"
// for a rejection test, or a tolerance-based near-duplicate for lossy
// re-encodes) can be added as a sibling function without touching this one.

(function (global) {
  'use strict';

  const SCHEMA_VERSION = '1.0.0';
  const VALIDATOR_VERSION = '0.1.0';

  async function sha256Hex(arrayBuffer) {
    const digest = await crypto.subtle.digest('SHA-256', arrayBuffer);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function decodeInfo(arrayBuffer, audioCtx) {
    try {
      const audioBuf = await new Promise((resolve, reject) => audioCtx.decodeAudioData(arrayBuffer.slice(0), resolve, reject));
      return { ok: true, audioBuf, error: null };
    } catch (e) {
      return { ok: false, audioBuf: null, error: e.message };
    }
  }

  function compareChannelSamples(bufA, bufB) {
    // Returns {identical, maxAbsDiff, firstDiffIndex, comparedSamples}
    const chCount = Math.min(bufA.numberOfChannels, bufB.numberOfChannels);
    let maxAbsDiff = 0, firstDiffIndex = -1, comparedSamples = 0;
    for (let c = 0; c < chCount; c++) {
      const a = bufA.getChannelData(c), b = bufB.getChannelData(c);
      const n = Math.min(a.length, b.length);
      for (let i = 0; i < n; i++) {
        const d = Math.abs(a[i] - b[i]);
        if (d > maxAbsDiff) maxAbsDiff = d;
        if (d > 0 && firstDiffIndex === -1) firstDiffIndex = i;
        comparedSamples++;
      }
    }
    return { identical: maxAbsDiff === 0, maxAbsDiff, firstDiffIndex, comparedSamples };
  }

  async function validateContentIdenticalPair(opts) {
    const {
      fileA, fileB, fixtureSetId, fixtureSetVersion, intendedCondition,
      generationMethod, generatorTool, generatorVersion,
      contentToleranceAbs = 0, // 0 = require bit-exact decoded sample equality
    } = opts;

    const criteria = [];
    const unexpected = [];
    const push = (criterion, status, detail, measured) => criteria.push({ criterion, status, detail, measured });

    // IDENTITY
    if (fixtureSetId && fixtureSetVersion) {
      push('IDENTITY', 'PASS', 'fixture_set_id and fixture_set_version provided', { fixtureSetId, fixtureSetVersion });
    } else {
      push('IDENTITY', 'FAIL', 'fixture_set_id and/or fixture_set_version missing');
    }

    // INTENDED_CONDITION (documentation check -- can only confirm it was stated, not that it's true; truth is established by the checks below)
    if (intendedCondition && intendedCondition.length > 0) {
      push('INTENDED_CONDITION', 'PASS', intendedCondition);
    } else {
      push('INTENDED_CONDITION', 'FAIL', 'no intended_condition statement provided');
    }

    // Read bytes + fingerprints
    const arrA = await fileA.arrayBuffer();
    const arrB = await fileB.arrayBuffer();
    const sha256A = await sha256Hex(arrA);
    const sha256B = await sha256Hex(arrB);
    const fingerprints = [
      { path: fileA.name, sha256: sha256A, byteLength: arrA.byteLength, decodedProperties: null },
      { path: fileB.name, sha256: sha256B, byteLength: arrB.byteLength, decodedProperties: null },
    ];

    // BASELINE_FINGERPRINT
    push('BASELINE_FINGERPRINT', 'PASS', 'sha256 + byteLength recorded for both files before experiment execution', {
      sha256A, sha256B, byteLengthA: arrA.byteLength, byteLengthB: arrB.byteLength,
    });

    // BYTE_REPRESENTATION_VERIFICATION: files must actually be byte-different, independently proven (not assumed from filenames)
    const bytesDiffer = sha256A !== sha256B;
    if (bytesDiffer) {
      push('BYTE_REPRESENTATION_VERIFICATION', 'PASS', 'sha256 differs between files -- byte-difference independently proven', { sha256A, sha256B });
    } else {
      push('BYTE_REPRESENTATION_VERIFICATION', 'FAIL', 'sha256 is IDENTICAL -- these are not byte-different files, they are the same file');
    }

    // VALIDITY: both must decode
    const audioCtx = new (global.AudioContext || global.webkitAudioContext)();
    const decA = await decodeInfo(arrA, audioCtx);
    const decB = await decodeInfo(arrB, audioCtx);
    if (decA.ok && decB.ok) {
      push('VALIDITY', 'PASS', 'both fixtures decoded successfully');
    } else {
      push('VALIDITY', 'FAIL', 'decode failed: ' + (decA.ok ? '' : 'A: ' + decA.error + ' ') + (decB.ok ? '' : 'B: ' + decB.error));
    }

    let contentResult = null;
    if (decA.ok && decB.ok) {
      fingerprints[0].decodedProperties = { sampleRate: decA.audioBuf.sampleRate, numberOfChannels: decA.audioBuf.numberOfChannels, duration: decA.audioBuf.duration, frameLength: decA.audioBuf.length };
      fingerprints[1].decodedProperties = { sampleRate: decB.audioBuf.sampleRate, numberOfChannels: decB.audioBuf.numberOfChannels, duration: decB.audioBuf.duration, frameLength: decB.audioBuf.length };

      // UNINTENDED_DIFFERENCES: sampleRate/channels/frameLength must match for a fair "content identical" claim
      if (decA.audioBuf.sampleRate !== decB.audioBuf.sampleRate) unexpected.push('sampleRate differs: ' + decA.audioBuf.sampleRate + ' vs ' + decB.audioBuf.sampleRate);
      if (decA.audioBuf.numberOfChannels !== decB.audioBuf.numberOfChannels) unexpected.push('numberOfChannels differs: ' + decA.audioBuf.numberOfChannels + ' vs ' + decB.audioBuf.numberOfChannels);
      if (decA.audioBuf.length !== decB.audioBuf.length) unexpected.push('decoded frame count differs: ' + decA.audioBuf.length + ' vs ' + decB.audioBuf.length);
      push('UNINTENDED_DIFFERENCES', unexpected.length ? 'FAIL' : 'PASS', unexpected.length ? unexpected.join('; ') : 'no unintended sampleRate/channel/length differences found');

      // CONTENT_VERIFICATION: actual decoded-sample comparison, not filenames/metadata
      contentResult = compareChannelSamples(decA.audioBuf, decB.audioBuf);
      const contentOk = contentResult.maxAbsDiff <= contentToleranceAbs;
      push('CONTENT_VERIFICATION', contentOk ? 'PASS' : 'FAIL',
        contentOk
          ? `decoded PCM ${contentResult.identical ? 'bit-exact identical' : 'within tolerance ' + contentToleranceAbs} across ${contentResult.comparedSamples} samples`
          : `decoded PCM differs beyond tolerance: maxAbsDiff=${contentResult.maxAbsDiff} at sample index ${contentResult.firstDiffIndex}`,
        contentResult);
    } else {
      push('UNINTENDED_DIFFERENCES', 'SKIPPED', 'cannot check -- decode failed');
      push('CONTENT_VERIFICATION', 'SKIPPED', 'cannot check -- decode failed');
    }
    try { await audioCtx.close(); } catch (_) {}

    // CONTROLLED_DIFFERENCE: documentation-level check that a difference was declared (the byte/representation check above independently proves *a* difference exists)
    if (generationMethod && generationMethod.length > 0) {
      push('CONTROLLED_DIFFERENCE', 'PASS', 'generationMethod documents the intended difference: ' + generationMethod);
    } else {
      push('CONTROLLED_DIFFERENCE', 'FAIL', 'no generationMethod provided -- cannot confirm the byte difference was the INTENDED one vs. an accident');
    }

    // REPEATABILITY
    if (generationMethod && generatorTool) {
      push('REPEATABILITY', 'PASS', 'generatorTool + generationMethod recorded, sufficient to regenerate', { generatorTool, generatorVersion: generatorVersion || null });
    } else {
      push('REPEATABILITY', 'FAIL', 'insufficient provenance to regenerate this fixture set');
    }

    // NO_SILENT_MUTATION is checked by the CALLER re-running fingerprinting
    // immediately before the primary experiment and comparing -- not
    // determinable from a single validation pass. Recorded as UNKNOWN here;
    // the CLI wrapper fills post_experiment_reverification separately.
    push('NO_SILENT_MUTATION', 'UNKNOWN', 'requires a second fingerprint pass immediately before experiment execution -- see post_experiment_reverification');

    const anyFail = criteria.some(c => c.status === 'FAIL');
    const anyUnknownRequired = criteria.some(c => c.status === 'UNKNOWN' && c.criterion !== 'NO_SILENT_MUTATION');
    const acceptance_status = anyFail ? 'FIXTURE_REJECTED' : (anyUnknownRequired ? 'FIXTURE_ACCEPTANCE_UNKNOWN' : 'FIXTURE_ACCEPTED');

    const failed = criteria.filter(c => c.status === 'FAIL').map(c => c.criterion);
    const human_summary = acceptance_status === 'FIXTURE_ACCEPTED'
      ? 'FIXTURE ACCEPTED — experiment may run'
      : acceptance_status === 'FIXTURE_REJECTED'
        ? 'FIXTURE REJECTED — experiment must not be interpreted. Failed: ' + failed.join(', ')
        : 'FIXTURE ACCEPTANCE UNKNOWN — investigate before proceeding';

    return {
      schema_version: SCHEMA_VERSION,
      fixture_set_id: fixtureSetId || null,
      fixture_set_version: fixtureSetVersion || null,
      intended_condition: intendedCondition || null,
      validation_timestamp: new Date().toISOString(),
      validator_version: VALIDATOR_VERSION,
      acceptance_status,
      human_summary,
      criteria_results: criteria,
      unexpected_differences: unexpected,
      fingerprints,
      post_experiment_reverification: { matches_baseline: null, checkedAt: null },
      provenance: { generationMethod: generationMethod || null, generatorTool: generatorTool || null, generatorVersion: generatorVersion || null },
    };
  }

  async function reverifyNoMutation(file, expectedSha256) {
    const arr = await file.arrayBuffer();
    const sha = await sha256Hex(arr);
    return { matches: sha === expectedSha256, actualSha256: sha, checkedAt: new Date().toISOString() };
  }

  global.BADD_FIXTURE_ACCEPTANCE = { SCHEMA_VERSION, VALIDATOR_VERSION, validateContentIdenticalPair, reverifyNoMutation, sha256Hex };
})(typeof window !== 'undefined' ? window : globalThis);
