"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Needle, SimulationConfig, SimulationStats } from "@/types/simulation";
import type { NeedleCanvasHandle } from "@/components/NeedleCanvas";

export const DEFAULT_CONFIG: SimulationConfig = {
  needleLength: 50,
  lineSpacing: 80,
  speed: 5,
  maxNeedles: 5000,
};

/**
 * Converts a speed value (possibly < 1) to the number of frames between drops.
 * speed ≥ 1  → 1 frame interval (multiple needles per frame)
 * speed < 1  → round(1/speed) frames between single needle drops
 */
export function speedToFrameInterval(speed: number): number {
  return speed >= 1 ? 1 : Math.round(1 / speed);
}

interface UseSimulationReturn {
  needles: Needle[];
  stats: SimulationStats;
  config: SimulationConfig;
  isRunning: boolean;
  canvasRef: React.MutableRefObject<NeedleCanvasHandle | null>;
  setConfig: (cfg: SimulationConfig) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  dropOne: () => void;
  dropAtPosition: (cx: number, cy: number) => void;
}

/**
 * Determines whether a needle crosses one of the parallel horizontal lines.
 */
function checkCrossing(cy: number, angle: number, l: number, d: number): boolean {
  const halfProjection = (l / 2) * Math.abs(Math.sin(angle));
  const distToNearestLine = cy % d;
  return distToNearestLine <= halfProjection || (d - distToNearestLine) <= halfProjection;
}

function generateNeedle(w: number, h: number, l: number, d: number): Needle {
  const cx = Math.random() * w;
  const cy = Math.random() * h;
  const angle = Math.random() * Math.PI;
  return { cx, cy, angle, crossing: checkCrossing(cy, angle, l, d) };
}

function estimatePi(total: number, crossings: number, l: number, d: number): number {
  return (2 * l * total) / (d * crossings);
}

/** Minimum ms between React state flushes during animation (throttle). */
const STATE_FLUSH_INTERVAL_MS = 80;

export function useSimulation(canvasWidth: number, canvasHeight: number): UseSimulationReturn {
  const [needles, setNeedles] = useState<Needle[]>([]);
  const [stats, setStats] = useState<SimulationStats>({ total: 0, crossings: 0, piEstimate: null, error: null });
  const [config, setConfigState] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [isRunning, setIsRunning] = useState(false);

  // Canvas imperative handle — set by page via ref
  const canvasRef = useRef<NeedleCanvasHandle | null>(null);

  const rafRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const needlesRef = useRef<Needle[]>([]);
  const statsRef = useRef<SimulationStats>({ total: 0, crossings: 0, piEstimate: null, error: null });
  const configRef = useRef<SimulationConfig>(DEFAULT_CONFIG);
  const canvasWidthRef = useRef(canvasWidth);
  const canvasHeightRef = useRef(canvasHeight);
  const frameCounterRef = useRef(0);
  /** Timestamp of last React state flush — used for throttling. */
  const lastFlushRef = useRef(0);

  useEffect(() => { canvasWidthRef.current = canvasWidth; canvasHeightRef.current = canvasHeight; }, [canvasWidth, canvasHeight]);
  useEffect(() => { configRef.current = config; }, [config]);

  // ── animation step ────────────────────────────────────────────────────────

  const stepRef = useRef<() => void>(() => {});

  useEffect(() => {
    stepRef.current = () => {
      if (!isRunningRef.current) return;

      const cfg = configRef.current;

      if (needlesRef.current.length >= cfg.maxNeedles) {
        isRunningRef.current = false;
        setIsRunning(false);
        // Final state flush
        setNeedles([...needlesRef.current]);
        setStats({ ...statsRef.current });
        return;
      }

      // Sub-frame throttle for speed < 1
      frameCounterRef.current += 1;
      const frameInterval = cfg.speed >= 1 ? 1 : Math.round(1 / cfg.speed);
      if (frameCounterRef.current < frameInterval) {
        rafRef.current = requestAnimationFrame(() => stepRef.current());
        return;
      }
      frameCounterRef.current = 0;

      const batchSize = cfg.speed >= 1
        ? Math.min(Math.floor(cfg.speed), cfg.maxNeedles - needlesRef.current.length)
        : 1;

      const batch: Needle[] = [];
      for (let i = 0; i < batchSize; i++) {
        batch.push(generateNeedle(canvasWidthRef.current, canvasHeightRef.current, cfg.needleLength, cfg.lineSpacing));
      }

      // Draw incrementally on canvas — O(batch) not O(total)
      canvasRef.current?.appendNeedles(batch);

      // Update internal refs immediately
      const next = needlesRef.current.concat(batch);
      needlesRef.current = next;
      const newCrossings = statsRef.current.crossings + batch.filter((n) => n.crossing).length;
      const piEst = newCrossings > 0 ? estimatePi(next.length, newCrossings, cfg.needleLength, cfg.lineSpacing) : null;
      statsRef.current = {
        total: next.length,
        crossings: newCrossings,
        piEstimate: piEst,
        error: piEst !== null ? Math.abs(piEst - Math.PI) : null,
      };

      // Throttle React state updates so re-renders don't saturate the main thread
      const now = performance.now();
      if (now - lastFlushRef.current >= STATE_FLUSH_INTERVAL_MS) {
        lastFlushRef.current = now;
        setNeedles([...needlesRef.current]);
        setStats({ ...statsRef.current });
      }

      rafRef.current = requestAnimationFrame(() => stepRef.current());
    };
  });

  // ── shared batch applier (used by manual drops) ───────────────────────────

  function applyBatch(batch: Needle[]) {
    canvasRef.current?.appendNeedles(batch);
    const next = needlesRef.current.concat(batch);
    needlesRef.current = next;
    const newCrossings = statsRef.current.crossings + batch.filter((n) => n.crossing).length;
    const cfg = configRef.current;
    const piEst = newCrossings > 0 ? estimatePi(next.length, newCrossings, cfg.needleLength, cfg.lineSpacing) : null;
    const newStats: SimulationStats = {
      total: next.length,
      crossings: newCrossings,
      piEstimate: piEst,
      error: piEst !== null ? Math.abs(piEst - Math.PI) : null,
    };
    statsRef.current = newStats;
    // Manual drops always flush immediately
    setNeedles([...next]);
    setStats(newStats);
  }

  // ── controls ──────────────────────────────────────────────────────────────

  const start = useCallback(() => {
    if (isRunningRef.current) return;
    frameCounterRef.current = 0;
    lastFlushRef.current = 0;
    isRunningRef.current = true;
    setIsRunning(true);
    rafRef.current = requestAnimationFrame(() => stepRef.current());
  }, []);

  const pause = useCallback(() => {
    isRunningRef.current = false;
    setIsRunning(false);
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    // Flush final state on pause
    setNeedles([...needlesRef.current]);
    setStats({ ...statsRef.current });
  }, []);

  const reset = useCallback(() => {
    isRunningRef.current = false;
    setIsRunning(false);
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    needlesRef.current = [];
    const empty: SimulationStats = { total: 0, crossings: 0, piEstimate: null, error: null };
    statsRef.current = empty;
    setNeedles([]);
    setStats(empty);
    // fullRedraw will be triggered by needles prop change in NeedleCanvas
  }, []);

  const setConfig = useCallback((cfg: SimulationConfig) => {
    const prev = configRef.current;
    configRef.current = cfg;
    setConfigState(cfg);

    const needsReset = cfg.needleLength !== prev.needleLength || cfg.lineSpacing !== prev.lineSpacing;
    if (needsReset) {
      isRunningRef.current = false;
      setIsRunning(false);
      frameCounterRef.current = 0;
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      needlesRef.current = [];
      const empty: SimulationStats = { total: 0, crossings: 0, piEstimate: null, error: null };
      statsRef.current = empty;
      setNeedles([]);
      setStats(empty);
    }
  }, []);

  const dropOne = useCallback(() => {
    const cfg = configRef.current;
    if (needlesRef.current.length >= cfg.maxNeedles) return;
    applyBatch([generateNeedle(canvasWidthRef.current, canvasHeightRef.current, cfg.needleLength, cfg.lineSpacing)]);
  }, []);

  const dropAtPosition = useCallback((cx: number, cy: number) => {
    const cfg = configRef.current;
    if (needlesRef.current.length >= cfg.maxNeedles) return;
    const angle = Math.random() * Math.PI;
    applyBatch([{ cx, cy, angle, crossing: checkCrossing(cy, angle, cfg.needleLength, cfg.lineSpacing) }]);
  }, []);

  useEffect(() => {
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, []);

  return { needles, stats, config, isRunning, canvasRef, setConfig, start, pause, reset, dropOne, dropAtPosition };
}
