"use client";

import React, { useState } from "react";
import type { SimulationConfig, SimulationStats } from "@/types/simulation";
import type { Translations } from "@/i18n/useLocale";
import { speedToFrameInterval } from "@/hooks/useSimulation";

interface SidebarPanelProps {
  config: SimulationConfig;
  stats: SimulationStats;
  isRunning: boolean;
  t: Translations;
  onConfigChange: (cfg: SimulationConfig) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDropOne: () => void;
}

// ─── Slider ──────────────────────────────────────────────────────────────────

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue?: string;
  description?: string;
  onChange: (v: number) => void;
  disabled?: boolean;
}

function SliderField({ label, value, min, max, step, displayValue, description, onChange, disabled = false }: SliderFieldProps) {
  return (
    <div className={`space-y-1.5 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{label}</label>
        <span className="text-sm font-mono font-semibold text-violet-500">{displayValue ?? value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-violet-500"
        style={{ background: "var(--border)" }}
      />
      {description && <p className="text-xs" style={{ color: "var(--text-subtle)" }}>{description}</p>}
    </div>
  );
}

// ─── Speed helpers ────────────────────────────────────────────────────────────

const SPEED_SLOW_MIN = 0.02;   // 1 needle every 50 frames
const SPEED_SLOW_MAX = 1;
const SPEED_FAST_MAX = 200;

function sliderToSpeed(pos: number): number {
  if (pos <= 50) return SPEED_SLOW_MIN + (pos / 50) * (SPEED_SLOW_MAX - SPEED_SLOW_MIN);
  return SPEED_SLOW_MAX + ((pos - 50) / 50) * (SPEED_FAST_MAX - SPEED_SLOW_MAX);
}

function speedToSlider(speed: number): number {
  if (speed <= SPEED_SLOW_MAX) return ((speed - SPEED_SLOW_MIN) / (SPEED_SLOW_MAX - SPEED_SLOW_MIN)) * 50;
  return 50 + ((speed - SPEED_SLOW_MAX) / (SPEED_FAST_MAX - SPEED_SLOW_MAX)) * 50;
}

function formatSpeedDesc(speed: number, t: Translations): string {
  if (speed >= 1) return `${Math.floor(speed)} ${t.descSpeed}`;
  return t.descSpeedSlow.replace("{n}", String(speedToFrameInterval(speed)));
}

// ─── Stat row ────────────────────────────────────────────────────────────────

function StatRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
      <span className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className={`text-sm font-mono font-semibold ${highlight ? "text-violet-500 text-base" : ""}`} style={highlight ? {} : { color: "var(--text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Action buttons (shared between tabs) ────────────────────────────────────

function ActionButtons({ isRunning, t, onStart, onPause, onReset, onDropOne }: {
  isRunning: boolean;
  t: Translations;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDropOne: () => void;
}) {
  return (
    <div className="pt-2 space-y-2 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="flex gap-2">
        {!isRunning ? (
          <button onClick={onStart} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors">
            {t.btnStart}
          </button>
        ) : (
          <button onClick={onPause} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold transition-colors">
            {t.btnPause}
          </button>
        )}
        <button onClick={onReset} className="py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors" style={{ background: "var(--bg-panel-alt)", color: "var(--text-muted)" }}>
          {t.btnReset}
        </button>
      </div>
      <button
        onClick={onDropOne}
        className="w-full py-2.5 rounded-xl border border-violet-500/40 hover:border-violet-400 hover:bg-violet-500/10 text-violet-500 text-sm font-semibold transition-colors"
      >
        {t.btnDropOne}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Unified sidebar panel with Parameters / Statistics tabs and shared action buttons.
 */
export default function SidebarPanel({ config, stats, isRunning, t, onConfigChange, onStart, onPause, onReset, onDropOne }: SidebarPanelProps) {
  const [tab, setTab] = useState<"params" | "stats">("params");

  // Derive slider position from config.speed — no local state needed
  const sliderPos = speedToSlider(config.speed);

  function update(partial: Partial<SimulationConfig>) {
    onConfigChange({ ...config, ...partial });
  }

  function handleSpeedSlider(pos: number) {
    onConfigChange({ ...config, speed: parseFloat(sliderToSpeed(pos).toFixed(2)) });
  }

  const speedLabel = config.speed >= 1 ? `×${Math.floor(config.speed)}` : `1/${speedToFrameInterval(config.speed)}`;

  const { total, crossings, piEstimate, error } = stats;
  const piDisplay = piEstimate !== null ? piEstimate.toFixed(6) : "—";
  const errorDisplay = error !== null ? error.toFixed(6) : "—";
  const errorPct = error !== null ? `${((error / Math.PI) * 100).toFixed(4)} %` : "—";
  const crossingPct = total > 0 ? `${((crossings / total) * 100).toFixed(2)} %` : "—";

  return (
    <div className="rounded-2xl border overflow-hidden flex flex-col" style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}>
      {/* Tab bar */}
      <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
        {(["params", "stats"] as const).map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === id ? "text-violet-500 border-b-2 border-violet-500" : ""}`}
            style={tab !== id ? { color: "var(--text-muted)" } : {}}
          >
            {id === "params" ? t.panelParameters : t.panelStats}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5 flex-1 space-y-5">
        {tab === "params" && (
          <>
            <p className="text-xs" style={{ color: "var(--text-subtle)" }}>{t.panelNeedleConstraint}</p>
            <SliderField
              label={t.labelNeedleLength} value={config.needleLength} min={10} max={config.lineSpacing} step={1}
              displayValue={`${config.needleLength} px`} description={t.descNeedleLength}
              onChange={(v) => update({ needleLength: v })} disabled={isRunning}
            />
            <SliderField
              label={t.labelLineSpacing} value={config.lineSpacing} min={30} max={200} step={5}
              displayValue={`${config.lineSpacing} px`} description={t.descLineSpacing}
              onChange={(v) => update({ lineSpacing: v, needleLength: Math.min(config.needleLength, v) })} disabled={isRunning}
            />
            <SliderField
              label={t.labelMaxNeedles} value={config.maxNeedles} min={100} max={50000} step={100}
              displayValue={config.maxNeedles.toLocaleString()} description={t.descMaxNeedles}
              onChange={(v) => update({ maxNeedles: v })} disabled={isRunning}
            />
          </>
        )}

        {tab === "stats" && (
          <>
            <StatRow label={t.statNeedlesDropped} value={total.toLocaleString()} />
            <StatRow label={t.statCrossingLines} value={crossings.toLocaleString()} />
            <StatRow label={t.statCrossingRatio} value={crossingPct} />
            <StatRow label={t.statPiReal} value={Math.PI.toFixed(6)} />
            <StatRow label={t.statPiEstimated} value={piDisplay} highlight />
            <StatRow label={t.statAbsError} value={errorDisplay} />
            <StatRow label={t.statRelError} value={errorPct} />
          </>
        )}
      </div>

      {/* Speed slider — shared, always visible */}
      <div className="px-5 pb-3 space-y-1.5 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex justify-between items-baseline pt-3">
          <label className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{t.labelSpeed}</label>
          <span className="text-sm font-mono font-semibold text-violet-500">{speedLabel}</span>
        </div>
        <input
          type="range" min={0} max={100} step={1} value={sliderPos}
          onChange={(e) => handleSpeedSlider(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-violet-500"
          style={{ background: "var(--border)" }}
        />
        <p className="text-xs" style={{ color: "var(--text-subtle)" }}>{formatSpeedDesc(config.speed, t)}</p>
      </div>

      {/* Action buttons — always visible */}
      <div className="px-5 pb-5">
        <ActionButtons isRunning={isRunning} t={t} onStart={onStart} onPause={onPause} onReset={onReset} onDropOne={onDropOne} />
      </div>
    </div>
  );
}
