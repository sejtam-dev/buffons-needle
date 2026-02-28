/**
 * Simulation Web Worker
 *
 * Runs needle generation and statistics entirely off the main thread.
 * Communication protocol:
 *
 * Main → Worker  (WorkerInMessage)
 *   { type: "configure", ... }   — set canvas size + simulation config
 *   { type: "batch",  size }     — generate <size> needles and reply
 *   { type: "drop",   cx, cy }   — generate one needle at a fixed position
 *
 * Worker → Main  (WorkerOutMessage)
 *   { type: "batch", needles, stats, historyPoint? }
 */

export interface WorkerConfigMessage {
  type: "configure";
  width: number;
  height: number;
  needleLength: number;
  lineSpacing: number;
  /** Reset counters when true (used on config change / reset) */
  reset: boolean;
}

export interface WorkerBatchMessage {
  type: "batch";
  size: number;
}

export interface WorkerDropMessage {
  type: "drop";
  cx: number;
  cy: number;
}

export type WorkerInMessage = WorkerConfigMessage | WorkerBatchMessage | WorkerDropMessage;

// ── types mirrored here to avoid importing from src/types inside a worker ──
export interface WorkerNeedle {
  cx: number;
  cy: number;
  angle: number;
  crossing: boolean;
}

export interface WorkerStats {
  total: number;
  crossings: number;
  piEstimate: number | null;
  error: number | null;
}

export interface WorkerBatchResult {
  type: "batch";
  needles: WorkerNeedle[];
  stats: WorkerStats;
  /** Present only when a new history point was recorded */
  historyPoint?: { total: number; piEstimate: number };
}

export type WorkerOutMessage = WorkerBatchResult;

// ── worker state ────────────────────────────────────────────────────────────

let width = 700;
let height = 520;
let needleLength = 50;
let lineSpacing = 80;
let total = 0;
let crossings = 0;
let lastHistoryTotal = 0;

function checkCrossing(cy: number, angle: number, l: number, d: number): boolean {
  const halfProjection = (l / 2) * Math.abs(Math.sin(angle));
  const distToNearestLine = cy % d;
  return distToNearestLine <= halfProjection || (d - distToNearestLine) <= halfProjection;
}

function estimatePi(t: number, c: number, l: number, d: number): number {
  return (2 * l * t) / (d * c);
}

function generateNeedle(): WorkerNeedle {
  const cx = Math.random() * width;
  const cy = Math.random() * height;
  const angle = Math.random() * Math.PI;
  return { cx, cy, angle, crossing: checkCrossing(cy, angle, needleLength, lineSpacing) };
}

function makeStats(): WorkerStats {
  const piEst = crossings > 0 ? estimatePi(total, crossings, needleLength, lineSpacing) : null;
  return {
    total,
    crossings,
    piEstimate: piEst,
    error: piEst !== null ? Math.abs(piEst - Math.PI) : null,
  };
}

self.onmessage = (e: MessageEvent<WorkerInMessage>) => {
  const msg = e.data;

  if (msg.type === "configure") {
    width = msg.width;
    height = msg.height;
    needleLength = msg.needleLength;
    lineSpacing = msg.lineSpacing;
    if (msg.reset) {
      total = 0;
      crossings = 0;
      lastHistoryTotal = 0;
    }
    return;
  }

  if (msg.type === "batch") {
    const needles: WorkerNeedle[] = [];
    for (let i = 0; i < msg.size; i++) {
      const n = generateNeedle();
      needles.push(n);
      total++;
      if (n.crossing) crossings++;
    }

    const stats = makeStats();

    // Record a history point every ~50 needles
    let historyPoint: WorkerBatchResult["historyPoint"];
    if (stats.piEstimate !== null && total - lastHistoryTotal >= 50) {
      historyPoint = { total, piEstimate: stats.piEstimate };
      lastHistoryTotal = total;
    }

    const result: WorkerBatchResult = { type: "batch", needles, stats, historyPoint };
    self.postMessage(result);
    return;
  }

  if (msg.type === "drop") {
    const angle = Math.random() * Math.PI;
    const needle: WorkerNeedle = {
      cx: msg.cx,
      cy: msg.cy,
      angle,
      crossing: checkCrossing(msg.cy, angle, needleLength, lineSpacing),
    };
    total++;
    if (needle.crossing) crossings++;

    const stats = makeStats();
    let historyPoint: WorkerBatchResult["historyPoint"];
    if (stats.piEstimate !== null) {
      historyPoint = { total, piEstimate: stats.piEstimate };
      lastHistoryTotal = total;
    }

    const result: WorkerBatchResult = { type: "batch", needles: [needle], stats, historyPoint };
    self.postMessage(result);
  }
};

