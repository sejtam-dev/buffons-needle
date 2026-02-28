"use client";

import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Brush,
  ResponsiveContainer,
} from "recharts";
import type { PiDataPoint } from "@/types/simulation";

interface PiChartProps {
  history: PiDataPoint[];
  height?: number;
}

const PI = Math.PI;

/** Recharts custom tooltip */
function ChartTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null;
  const val: number = payload[0].value;
  const err = Math.abs(val - PI);
  return (
    <div
      className="rounded-xl border px-3 py-2 text-xs shadow-xl"
      style={{ background: "var(--bg-panel-solid)", borderColor: "var(--border)", color: "var(--text-primary)" }}
    >
      <div className="font-mono font-bold">π ≈ {val.toFixed(6)}</div>
      <div style={{ color: "var(--text-muted)" }}>Δ {err.toFixed(6)}</div>
    </div>
  );
}

/** Inner chart — shared between inline and modal */
function ChartInner({
  history,
  height,
  showBrush,
}: {
  history: PiDataPoint[];
  height: number;
  showBrush: boolean;
}) {
  const t = useTranslations();
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const gridColor   = isDark ? "rgba(51,65,85,0.5)"   : "rgba(226,232,240,0.9)";
  const lineColor   = isDark ? "#a78bfa"               : "#7c3aed";
  const piColor     = isDark ? "rgba(139,92,246,0.55)" : "rgba(109,40,217,0.45)";
  const axisColor   = isDark ? "#64748b"               : "#94a3b8";
  const brushBg     = isDark ? "#1e293b"               : "#f1f5f9";

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center w-full" style={{ height, color: "var(--text-subtle)", fontSize: 13 }}>
        {t("chartNoData")}
      </div>
    );
  }

  const estimates = history.map((p) => p.piEstimate);
  const minVal = Math.min(...estimates, PI);
  const maxVal = Math.max(...estimates, PI);
  const pad = Math.max((maxVal - minVal) * 0.15, 0.04);
  const yMin = minVal - pad;
  const yMax = maxVal + pad;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={history} margin={{ top: 8, right: 24, bottom: showBrush ? 8 : 4, left: 8 }}>
        <CartesianGrid strokeDasharray="4 3" stroke={gridColor} />
        <XAxis
          dataKey="total"
          tick={{ fontSize: 11, fill: axisColor }}
          tickLine={false}
          axisLine={{ stroke: gridColor }}
          label={{ value: "n", position: "insideBottomRight", offset: -4, fontSize: 11, fill: axisColor }}
        />
        <YAxis
          domain={[yMin, yMax]}
          tick={{ fontSize: 11, fill: axisColor, fontFamily: "ui-monospace, monospace" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => v.toFixed(3)}
          width={54}
        />
        <Tooltip content={<ChartTooltip />} />
        <ReferenceLine
          y={PI}
          stroke={piColor}
          strokeDasharray="7 4"
          strokeWidth={1.5}
          label={{ value: "π", position: "right", fill: piColor, fontSize: 13, fontWeight: "bold" }}
        />
        <Line
          type="monotone"
          dataKey="piEstimate"
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        {showBrush && (
          <Brush
            dataKey="total"
            height={22}
            stroke={lineColor}
            fill={brushBg}
            travellerWidth={6}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Modal with expanded chart */
function PiChartModal({ history, onClose }: { history: PiDataPoint[]; onClose: () => void }) {
  const t = useTranslations();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden"
        style={{ background: "var(--bg-panel-solid)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            {t("chartPiConvergence")}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-violet-500/10 hover:text-violet-500 text-lg leading-none"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Chart */}
        <div className="p-4 sm:p-6">
          <ChartInner history={history} height={420} showBrush />
        </div>

        {/* Footer hint */}
        <p className="px-6 pb-4 text-xs" style={{ color: "var(--text-subtle)" }}>
          {t("chartZoomHint")}
        </p>
      </div>
    </div>,
    document.body
  );
}

/** Public component — inline chart card with expand button */
export default function PiChart({ history, height = 200 }: PiChartProps) {
  const t = useTranslations();
  const [modalOpen, setModalOpen] = useState(false);
  const open  = useCallback(() => setModalOpen(true),  []);
  const close = useCallback(() => setModalOpen(false), []);

  // Force re-render when theme changes so colours update
  const [, setTick] = useState(0);
  const moRef = useRef<MutationObserver | null>(null);
  useEffect(() => {
    moRef.current = new MutationObserver(() => setTick((t) => t + 1));
    moRef.current.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => moRef.current?.disconnect();
  }, []);

  return (
    <>
      <div
        className="w-full rounded-2xl border overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--bg-panel)" }}
      >
        {/* Chart header row */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            {t("chartPiConvergence")}
          </span>
          <button
            onClick={open}
            title={t("chartExpand")}
            className="w-7 h-7 flex items-center justify-center rounded-lg border transition-colors hover:border-violet-500 hover:text-violet-500"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2h4v4M6 14H2v-4M14 2l-5 5M2 14l5-5" />
            </svg>
          </button>
        </div>

        <div className="px-2 pb-2">
          <ChartInner history={history} height={height} showBrush={false} />
        </div>
      </div>

      {modalOpen && <PiChartModal history={history} onClose={close} />}
    </>
  );
}

