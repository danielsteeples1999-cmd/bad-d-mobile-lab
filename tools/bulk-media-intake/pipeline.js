// BAD-D Mobile Lab — Bulk Media Intake pipeline (browser-only: uses Web
// Crypto + Web Audio). Scope: LOCAL FILES and AUTHORIZED URLS only. No
// platform-specific scraping/extraction is implemented here — see
// ../../SECURITY.md. Exposes window.BADD_BULK_INTAKE.
//
// Pipeline stages, each independently callable and testable:
//   metadata -> acquire -> hashBytes -> decodeValidate -> qualityCheck
//   -> normalise (optional) -> audioContentHash -> package
//
// A queue runner (runBatch) drives many items through this with a fixed
// concurrency limit, real cancellation, and per-item timing.

(function (global) {
  'use strict';

  const TOOL_VERSION = '0.1.0';

  // ---------- stage: metadata ----------
  function stageMetadata(item) {
    if (item.kind === 'local-file') {
      return {
        source: { kind: 'local-file', originalName: item.file.name, url: null },
        sourceIdentity: { url: null, filename: item.file.name, declaredSize: item.file.size },
      };
    }
    return {
      source: { kind: 'authorized-url', originalName: null, url: item.url },
      sourceIdentity: { url: item.url, filename: item.url.split('/').pop() || null, declaredSize: null },
    };
  }

  // ---------- stage: acquire (read bytes) ----------
  async function stageAcquire(item, signal) {
    if (item.kind === 'local-file') {
      const buf = await item.file.arrayBuffer();
      return buf;
    }
    const resp = await fetch(item.url, { signal });
    if (!resp.ok) throw new Error('fetch failed: HTTP ' + resp.status);
    return await resp.arrayBuffer();
  }

  // ---------- stage: hash raw bytes (exact-duplicate identity) ----------
  async function stageHashBytes(arrayBuffer) {
    const digest = await crypto.subtle.digest('SHA-256', arrayBuffer);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ---------- stage: decode + validate ----------
  async function stageDecodeValidate(arrayBuffer, audioCtx) {
    try {
      // decodeAudioData detaches/consumes the buffer in some browsers -- pass a copy.
      const copy = arrayBuffer.slice(0);
      const audioBuf = await new Promise((resolve, reject) => audioCtx.decodeAudioData(copy, resolve, reject));
      return { status: 'decoded', audioBuf, error: null };
    } catch (e) {
      return { status: 'decode-failed', audioBuf: null, error: e.message };
    }
  }

  // ---------- stage: quality check (silence, clipping, duration sanity) ----------
  function stageQualityCheck(audioBuf) {
    const warnings = [];
    const ch0 = audioBuf.getChannelData(0);
    let sumSq = 0, peak = 0, clippedSamples = 0;
    const clipCeiling = 0.999;
    for (let i = 0; i < ch0.length; i++) {
      const v = Math.abs(ch0[i]);
      sumSq += ch0[i] * ch0[i];
      if (v > peak) peak = v;
      if (v >= clipCeiling) clippedSamples++;
    }
    const rms = Math.sqrt(sumSq / Math.max(1, ch0.length));
    const clippedFraction = clippedSamples / Math.max(1, ch0.length);
    let audioStatus = 'decoded';
    if (rms < 0.0005) { audioStatus = 'silent'; warnings.push('near-silent: RMS ' + rms.toFixed(6)); }
    if (audioBuf.duration < 0.05) { warnings.push('extremely short duration (' + audioBuf.duration.toFixed(3) + 's) -- possibly truncated'); }
    if (clippedFraction > 0.01) { warnings.push('clipping detected: ' + (clippedFraction * 100).toFixed(2) + '% of samples at/above ' + clipCeiling); }
    return { audioStatus, warnings, peak, rms, clippedFraction };
  }

  // ---------- stage: normalise (optional, real — peak-normalizes, records provenance) ----------
  function stageNormalise(audioBuf, targetPeakDb, applyIt) {
    const targetPeak = Math.pow(10, targetPeakDb / 20);
    const ch0 = audioBuf.getChannelData(0);
    let peak = 0;
    for (let i = 0; i < ch0.length; i++) { const v = Math.abs(ch0[i]); if (v > peak) peak = v; }
    const currentDb = peak > 0 ? 20 * Math.log10(peak) : -Infinity;
    if (!applyIt || peak === 0 || peak >= targetPeak) {
      return { applied: false, changes: [], peakDb: currentDb };
    }
    const gain = targetPeak / peak;
    // Note: does NOT mutate the original decoded buffer in this lab tool --
    // normalisation here is measured/reported, not silently applied to the
    // AudioBuffer that quality-check already read from. A real pipeline
    // would render a new buffer via OfflineAudioContext; left as a documented
    // next step (see EXP-009 NEXT QUESTION) rather than adding untested
    // audio-mutation code to a correctness-sensitive path this session.
    return {
      applied: false,
      changes: ['WOULD peak-normalize by ' + (20 * Math.log10(gain)).toFixed(2) + 'dB (from ' + currentDb.toFixed(2) + 'dBFS to ' + targetPeakDb + 'dBFS) -- not actually applied in this lab build, see pipeline.js stageNormalise comment'],
      peakDb: currentDb,
    };
  }

  // ---------- stage: cheap audio-content hash (near-duplicate signal, NOT a real fingerprint) ----------
  function stageAudioContentHash(audioBuf) {
    // Downsample the channel-0 energy envelope to a fixed number of bins and
    // hash that. Two files with the SAME audio content but different byte-
    // level encoding (different WAV header, different bit depth) should
    // produce the same/very-similar envelope and therefore the same hash.
    // This is NOT robust to resampling, pitch shift, or lossy re-encoding
    // artifacts -- explicitly a cheap heuristic, documented as such in the
    // schema (`hash.audioContentHash`), not sold as real acoustic fingerprinting.
    const ch0 = audioBuf.getChannelData(0);
    const bins = 256;
    const binSize = Math.max(1, Math.floor(ch0.length / bins));
    let h = 0;
    for (let b = 0; b < bins; b++) {
      let sum = 0;
      const start = b * binSize;
      const end = Math.min(ch0.length, start + binSize);
      for (let i = start; i < end; i++) sum += ch0[i] * ch0[i];
      const energy = Math.round(Math.sqrt(sum / Math.max(1, end - start)) * 1e5);
      h = (h * 31 + energy) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  }

  // ---------- run one item through the full pipeline ----------
  async function processItem(item, { audioCtx, experimentId, applyNormalise, signal }) {
    const timestamps = { queuedAt: item.queuedAt, acquisitionStartedAt: null, acquisitionCompletedAt: null, validationCompletedAt: null };
    const pipelineStagesRun = [];
    const errors = [], warnings = [];
    const meta = stageMetadata(item);
    pipelineStagesRun.push('metadata');

    let result = {
      resultSchemaVersion: '1.0.0',
      ...meta,
      acquisitionStatus: 'running',
      localIdentity: { id: null, byteLength: null },
      hash: { sha256: null, audioContentHash: null },
      fileFormat: { mimeType: item.kind === 'local-file' ? (item.file.type || null) : null, container: null },
      duration: null, sampleRate: null, channels: null, size: null,
      audioStatus: 'not-attempted',
      validationStatus: 'pending',
      normalisationStatus: { applied: false, changes: [] },
      errors, warnings,
      timestamps,
      experimentId: experimentId || 'unspecified',
      toolVersion: TOOL_VERSION,
      provenance: { originalIdentity: null, resultingIdentity: null, pipelineStagesRun },
    };

    try {
      timestamps.acquisitionStartedAt = new Date().toISOString();
      if (signal && signal.aborted) { result.acquisitionStatus = 'cancelled'; return result; }
      let arrayBuffer = await stageAcquire(item, signal);
      pipelineStagesRun.push('acquire');
      timestamps.acquisitionCompletedAt = new Date().toISOString();
      result.acquisitionStatus = 'completed';
      result.localIdentity.byteLength = arrayBuffer.byteLength;
      result.size = arrayBuffer.byteLength;

      if (signal && signal.aborted) { result.acquisitionStatus = 'cancelled'; return result; }
      const sha256 = await stageHashBytes(arrayBuffer);
      pipelineStagesRun.push('hashBytes');
      result.hash.sha256 = sha256;
      result.localIdentity.id = sha256.slice(0, 16);
      result.provenance.originalIdentity = sha256;

      if (signal && signal.aborted) { result.acquisitionStatus = 'cancelled'; return result; }
      const decodeResult = await stageDecodeValidate(arrayBuffer, audioCtx);
      // RAM-PRESSURE-001: hashBytes (sha256) already ran above, and nothing
      // past this point needs the raw bytes -- only the decoded audioBuf.
      // Drop the reference now instead of letting it sit alive for the rest
      // of this function (qualityCheck/normalise/audioContentHash, the
      // longest-running stages) alongside the decoded buffer. Baseline
      // measurement (CDP backingStorageSize, not just usedSize -- see
      // EXPERIMENT_PROTOCOL.md) showed peak backing-store memory during a
      // 30x60s/concurrency-4 run matched ~4 concurrent items each holding
      // raw+decoded simultaneously; this closes that window per item
      // without touching stageDecodeValidate's own defensive copy (still
      // needed there -- decodeAudioData detaches/consumes its input in some
      // browsers -- and changing that reusable stage function's contract is
      // out of scope for this fix).
      arrayBuffer = null;
      pipelineStagesRun.push('decodeValidate');
      result.audioStatus = decodeResult.status;
      if (decodeResult.status === 'decode-failed') {
        errors.push('decode failed: ' + decodeResult.error);
        result.validationStatus = 'failed';
        timestamps.validationCompletedAt = new Date().toISOString();
        return result;
      }

      const audioBuf = decodeResult.audioBuf;
      result.duration = audioBuf.duration;
      result.sampleRate = audioBuf.sampleRate;
      result.channels = audioBuf.numberOfChannels;

      const qc = stageQualityCheck(audioBuf);
      pipelineStagesRun.push('qualityCheck');
      result.audioStatus = qc.audioStatus;
      warnings.push(...qc.warnings);

      const norm = stageNormalise(audioBuf, -1, !!applyNormalise);
      pipelineStagesRun.push('normalise');
      result.normalisationStatus = { applied: norm.applied, changes: norm.changes };

      const contentHash = stageAudioContentHash(audioBuf);
      pipelineStagesRun.push('audioContentHash');
      result.hash.audioContentHash = contentHash;
      result.provenance.resultingIdentity = sha256; // unchanged in this build (no mutation applied)

      result.validationStatus = qc.audioStatus === 'silent' || qc.audioStatus === 'corrupt' ? 'warning' : 'passed';
      timestamps.validationCompletedAt = new Date().toISOString();
    } catch (e) {
      if (signal && signal.aborted) {
        result.acquisitionStatus = 'cancelled';
      } else {
        result.acquisitionStatus = 'failed';
        errors.push(e.message);
        result.validationStatus = 'failed';
      }
    }
    return result;
  }

  // Synthesized result for an item that was submitted but never dequeued
  // before cancellation -- same schema shape as processItem's real result
  // (minus stages that never ran), with an explicit `neverStarted: true`
  // marker so this is distinguishable from an item that started and was
  // cancelled mid-flight (which already gets a normal result via
  // processItem's own signal.aborted handling).
  function makeNeverStartedResult(item, experimentId) {
    const meta = stageMetadata(item);
    return {
      resultSchemaVersion: '1.0.0',
      ...meta,
      acquisitionStatus: 'cancelled',
      localIdentity: { id: null, byteLength: null },
      hash: { sha256: null, audioContentHash: null },
      fileFormat: { mimeType: item.kind === 'local-file' ? (item.file.type || null) : null, container: null },
      duration: null, sampleRate: null, channels: null, size: null,
      audioStatus: 'not-attempted',
      validationStatus: 'cancelled',
      normalisationStatus: { applied: false, changes: [] },
      errors: [], warnings: [],
      timestamps: { queuedAt: item.queuedAt, acquisitionStartedAt: null, acquisitionCompletedAt: null, validationCompletedAt: null },
      experimentId: experimentId || 'unspecified',
      toolVersion: TOOL_VERSION,
      provenance: { originalIdentity: null, resultingIdentity: null, pipelineStagesRun: [] },
      neverStarted: true,
    };
  }

  // RAM-PRESSURE-001: adaptive resource governor. Adapted (not copied) from
  // the existing production heuristic (resourcePressureHigh/
  // yieldForMemoryPressure in reference/...html) -- same signal
  // (performance.memory ratio) and same 0.82 "high" threshold, reused
  // rather than invented, applied to this queue's event-driven
  // launchNext() shape instead of production's sequential
  // processLibraryQueue loop. `memoryReader` is injectable so this can be
  // driven deterministically in tests -- performance.memory is
  // quantized/unreliable for small deltas in this lab's sandbox (EXP-005),
  // so a real high-pressure event cannot be reliably reproduced headlessly;
  // the injection seam lets the governor's actual behavior (defer, then
  // resume once pressure clears) be verified directly instead of only
  // asserted.
  function resourcePressureHigh(memoryReader) {
    const m = (memoryReader || (() => (typeof performance !== 'undefined' ? performance.memory : null)))();
    return !!(m && m.jsHeapSizeLimit > 0 && m.usedJSHeapSize / m.jsHeapSizeLimit >= 0.82);
  }

  // ---------- bounded-concurrency batch runner with real cancellation ----------
  function runBatch(items, { concurrency, experimentId, applyNormalise, onItemStart, onItemDone, onProgress, memoryReader, pressureRecheckMs }) {
    const controller = new AbortController();
    const audioCtx = new (global.AudioContext || global.webkitAudioContext)();
    const results = new Array(items.length);
    let nextIndex = 0, activeCount = 0, completedCount = 0;
    let resolveAll, rejectAll;
    const donePromise = new Promise((res, rej) => { resolveAll = res; rejectAll = rej; });
    const recheckMs = pressureRecheckMs || 120; // reused from production's own yieldForMemoryPressure backoff constant

    function launchNext() {
      if (controller.signal.aborted) { maybeFinish(); return; }
      if (nextIndex >= items.length) { maybeFinish(); return; }
      // Under high measured pressure, hold off launching a NEW item --
      // don't add more concurrent decode/analysis work -- and recheck
      // shortly rather than applying a long or unconditional delay. Never
      // defer when activeCount is 0: a stale/quantized high reading must
      // not starve the queue to a permanent stall (SMALL/SIMPLE TRACK ->
      // process normally; RISING PRESSURE -> reduce concurrency/yield;
      // PRESSURE RECOVERS -> resume -- this is the recovery half).
      if (activeCount > 0 && resourcePressureHigh(memoryReader)) {
        setTimeout(launchNext, recheckMs);
        return;
      }
      const idx = nextIndex++;
      const item = items[idx];
      activeCount++;
      if (onItemStart) onItemStart(idx, item);
      const t0 = performance.now();
      processItem(item, { audioCtx, experimentId, applyNormalise, signal: controller.signal })
        .then((result) => {
          result.__timingMs = performance.now() - t0;
          results[idx] = result;
        })
        .catch((e) => {
          results[idx] = { acquisitionStatus: 'failed', errors: [e.message], __timingMs: performance.now() - t0 };
        })
        .finally(() => {
          activeCount--; completedCount++;
          if (onItemDone) onItemDone(idx, results[idx]);
          if (onProgress) onProgress(completedCount, items.length);
          if (!controller.signal.aborted) launchNext();
          maybeFinish();
        });
    }

    let finished = false;
    function maybeFinish() {
      if (finished) return;
      if (completedCount >= items.length || (controller.signal.aborted && activeCount === 0)) {
        finished = true;
        // Backfill a row for every item that was submitted but never
        // dequeued (nextIndex never reached it) before cancellation --
        // otherwise it's silently absent from `results` and never
        // rendered, even though it was part of the submitted batch.
        // CANCEL-OBS-001: see PRIORITY_QUEUE.md and EXP-009's
        // cancel_test3.json for the original gap this closes.
        for (let idx = nextIndex; idx < items.length; idx++) {
          results[idx] = makeNeverStartedResult(items[idx], experimentId);
          if (onItemDone) onItemDone(idx, results[idx]);
        }
        if (audioCtx.state !== 'closed') { try { audioCtx.close(); } catch (_) {} }
        resolveAll(results);
      }
    }

    for (let i = 0; i < Math.min(concurrency, items.length); i++) launchNext();
    if (items.length === 0) maybeFinish();

    return { promise: donePromise, cancel: () => controller.abort() };
  }

  global.BADD_BULK_INTAKE = { TOOL_VERSION, stageMetadata, stageAcquire, stageHashBytes, stageDecodeValidate, stageQualityCheck, stageNormalise, stageAudioContentHash, processItem, runBatch, resourcePressureHigh };
})(typeof window !== 'undefined' ? window : globalThis);
