"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Needle, PiDataPoint, SimulationConfig, SimulationStats } from "@/types/simulation";
import type { NeedleCanvasHandle } from "@/components/NeedleCanvas";
import type { WorkerConfigMessage, WorkerInMessage, WorkerOutMessage } from "@/workers/simulation.worker";

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
    piHistory: PiDataPoint[];
    config: SimulationConfig;
    isRunning: boolean;
    canvasRef: React.RefObject<NeedleCanvasHandle | null>;
    setConfig: (cfg: SimulationConfig) => void;
    start: () => void;
    pause: () => void;
    reset: () => void;
    dropOne: () => void;
    dropAtPosition: (cx: number, cy: number) => void;
}

/** Returns adaptive flush interval in ms based on current speed config. */
function adaptiveFlushInterval(speed: number): number {
    if (speed < 1) return 0; // flush every drop for very slow speeds
    if (speed <= 5) return 40; // ~25fps feel, responsive at low speeds
    if (speed <= 20) return 80; // default
    if (speed <= 100) return 150;
    return 250; // very high speed - less frequent updates
}

export function useSimulation(canvasWidth: number, canvasHeight: number): UseSimulationReturn {
    const [needles, setNeedles] = useState<Needle[]>([]);
    const [stats, setStats] = useState<SimulationStats>({ total: 0, crossings: 0, piEstimate: null, error: null });
    const [piHistory, setPiHistory] = useState<PiDataPoint[]>([]);
    const [config, setConfigState] = useState<SimulationConfig>(DEFAULT_CONFIG);
    const [isRunning, setIsRunning] = useState(false);

    const canvasRef = useRef<NeedleCanvasHandle | null>(null);

    const rafRef = useRef<number | null>(null);
    const isRunningRef = useRef(false);
    const needlesRef = useRef<Needle[]>([]);
    const statsRef = useRef<SimulationStats>({ total: 0, crossings: 0, piEstimate: null, error: null });
    const piHistoryRef = useRef<PiDataPoint[]>([]);
    const configRef = useRef<SimulationConfig>(DEFAULT_CONFIG);
    const canvasWidthRef = useRef(canvasWidth);
    const canvasHeightRef = useRef(canvasHeight);
    const frameCounterRef = useRef(0);
    const lastFlushRef = useRef(0);

    // ── Web Worker ────────────────────────────────────────────────────────────
    const workerRef = useRef<Worker | null>(null);

    // Pending promise resolver — main thread sends one batch request per frame
    // and waits for the worker to respond before scheduling the next frame.
    const pendingResolveRef = useRef<((needles: Needle[]) => void) | null>(null);

    useEffect(() => {
        const worker = new Worker(new URL("../workers/simulation.worker.ts", import.meta.url), { type: "module" });

        worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
            const msg = e.data;
            if (msg.type !== "batch") return;

            // Append to local needle array ref (for full redraws / reset)
            const incoming = msg.needles as Needle[];
            needlesRef.current = needlesRef.current.concat(incoming);
            statsRef.current = msg.stats;

            if (msg.historyPoint) {
                piHistoryRef.current = [...piHistoryRef.current, msg.historyPoint];
            }

            // Draw on canvas immediately (no React re-render needed)
            canvasRef.current?.appendNeedles(incoming);

            // Throttle React state flushes — adaptive based on current speed
            const now = performance.now();
            const flushInterval = adaptiveFlushInterval(configRef.current.speed);
            if (flushInterval === 0 || now - lastFlushRef.current >= flushInterval) {
                lastFlushRef.current = now;
                setNeedles([...needlesRef.current]);
                setStats({ ...statsRef.current });
                setPiHistory(piHistoryRef.current);
            }

            // Resolve the per-frame promise so the RAF loop can continue
            pendingResolveRef.current?.(incoming);
            pendingResolveRef.current = null;
        };

        workerRef.current = worker;

        return () => {
            worker.terminate();
            workerRef.current = null;
        };
    }, []);

    // Keep worker in sync with canvas dimensions
    useEffect(() => {
        canvasWidthRef.current = canvasWidth;
        canvasHeightRef.current = canvasHeight;
        postConfigure(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasWidth, canvasHeight]);

    useEffect(() => {
        configRef.current = config;
    }, [config]);

    // ── helpers ───────────────────────────────────────────────────────────────

    function postMessage(msg: WorkerInMessage) {
        workerRef.current?.postMessage(msg);
    }

    function postConfigure(reset: boolean) {
        const cfg = configRef.current;
        const msg: WorkerConfigMessage = {
            type: "configure",
            width: canvasWidthRef.current,
            height: canvasHeightRef.current,
            needleLength: cfg.needleLength,
            lineSpacing: cfg.lineSpacing,
            reset,
        };
        postMessage(msg);
    }

    // ── animation step ────────────────────────────────────────────────────────

    const stepRef = useRef<() => void>(() => {});

    useEffect(() => {
        stepRef.current = () => {
            if (!isRunningRef.current) return;

            const cfg = configRef.current;

            if (needlesRef.current.length >= cfg.maxNeedles) {
                isRunningRef.current = false;
                setIsRunning(false);
                setNeedles([...needlesRef.current]);
                setStats({ ...statsRef.current });
                setPiHistory(piHistoryRef.current);
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

            const batchSize =
                cfg.speed >= 1 ? Math.min(Math.floor(cfg.speed), cfg.maxNeedles - needlesRef.current.length) : 1;

            // Ask worker to generate the batch; schedule next frame after response arrives
            new Promise<Needle[]>((resolve) => {
                pendingResolveRef.current = resolve;
                postMessage({ type: "batch", size: batchSize });
            }).then(() => {
                if (isRunningRef.current) {
                    rafRef.current = requestAnimationFrame(() => stepRef.current());
                }
            });
        };
    });

    // ── shared applier for manual drops ──────────────────────────────────────

    function applyDrop(cx: number, cy: number) {
        new Promise<Needle[]>((resolve) => {
            pendingResolveRef.current = resolve;
            postMessage({ type: "drop", cx, cy });
        }).then(() => {
            setNeedles([...needlesRef.current]);
            setStats({ ...statsRef.current });
            setPiHistory(piHistoryRef.current);
        });
    }

    // ── controls ──────────────────────────────────────────────────────────────

    const start = useCallback(() => {
        if (isRunningRef.current) return;
        postConfigure(false);
        frameCounterRef.current = 0;
        lastFlushRef.current = 0;
        isRunningRef.current = true;
        setIsRunning(true);
        rafRef.current = requestAnimationFrame(() => stepRef.current());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pause = useCallback(() => {
        isRunningRef.current = false;
        setIsRunning(false);
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        pendingResolveRef.current = null;
        setNeedles([...needlesRef.current]);
        setStats({ ...statsRef.current });
        setPiHistory(piHistoryRef.current);
    }, []);

    const reset = useCallback(() => {
        isRunningRef.current = false;
        setIsRunning(false);
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        pendingResolveRef.current = null;
        needlesRef.current = [];
        piHistoryRef.current = [];
        const empty: SimulationStats = { total: 0, crossings: 0, piEstimate: null, error: null };
        statsRef.current = empty;
        setNeedles([]);
        setStats(empty);
        setPiHistory([]);
        postConfigure(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            pendingResolveRef.current = null;
            needlesRef.current = [];
            piHistoryRef.current = [];
            const empty: SimulationStats = { total: 0, crossings: 0, piEstimate: null, error: null };
            statsRef.current = empty;
            setNeedles([]);
            setStats(empty);
            setPiHistory([]);
            // postConfigure after configRef update propagates via useEffect
            setTimeout(() => postConfigure(true), 0);
        } else {
            // Speed / maxNeedles change — just update worker dimensions in case
            postConfigure(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const dropOne = useCallback(() => {
        const cfg = configRef.current;
        if (needlesRef.current.length >= cfg.maxNeedles) return;
        const w = canvasWidthRef.current;
        const h = canvasHeightRef.current;
        applyDrop(Math.random() * w, Math.random() * h);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const dropAtPosition = useCallback((cx: number, cy: number) => {
        const cfg = configRef.current;
        if (needlesRef.current.length >= cfg.maxNeedles) return;
        applyDrop(cx, cy);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return {
        needles,
        stats,
        piHistory,
        config,
        isRunning,
        canvasRef,
        setConfig,
        start,
        pause,
        reset,
        dropOne,
        dropAtPosition,
    };
}
