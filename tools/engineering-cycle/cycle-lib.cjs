// Shared helpers for engineering-cycle orchestrator scripts. Extracted from
// run_cycle.cjs once a second real cycle script (run_cycle_audio_autodj.cjs,
// EXP-014) needed the same two functions -- per EXPERIMENT_PROTOCOL.md's
// compounding test, only worth extracting once genuinely reused twice, not
// speculatively. Deliberately NOT a generic "cycle DSL" -- each cycle
// script still owns its own stage bodies.

function stage(name, status, extra = {}) {
  return { stage: name, status, ...extra };
}

// Finds a queue item's block in PRIORITY_QUEUE.md by TASK-ID, matching either
// an em dash or hyphen after the ID, stopping at the next checkbox/priority
// line.
function parseQueueTask(queueMd, taskId) {
  const lines = queueMd.split('\n');
  const startIdx = lines.findIndex((l) => l.includes(taskId + ' —') || l.includes(taskId + ' -'));
  if (startIdx === -1) return null;
  const block = [];
  for (let i = startIdx; i < lines.length; i++) {
    if (i > startIdx && /^\[[ x]\]/.test(lines[i].trim())) break;
    if (i > startIdx && /^(P\d|DONE)\s*[—-]/.test(lines[i].trim())) break;
    block.push(lines[i]);
  }
  return block.join('\n');
}

module.exports = { stage, parseQueueTask };
