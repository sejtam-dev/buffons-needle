"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { SimulationConfig, SimulationStats } from "@/types/simulation";
import { useTranslations } from "next-intl";
import MathComponent, { MathText } from "@/components/Math";
import { speedToFrameInterval } from "@/hooks/useSimulation";

type T = ReturnType<typeof useTranslations>;

interface SidebarPanelProps {
  config: SimulationConfig;
  stats: SimulationStats;
  isRunning: boolean;
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
  displayMin?: string;
  displayMax?: string;
  description?: string;
  onChange: (v: number) => void;
  onCommit?: (v: number) => void;
  disabled?: boolean;
}

function SliderField({ label, value, min, max, step, displayValue, displayMin, displayMax, description, onChange, onCommit, disabled = false }: SliderFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    if (disabled) return;
    setDraft(String(value));
    setEditing(true);
  }

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function commitEdit() {
    setEditing(false);
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, Math.round(parsed / step) * step));
      onChange(clamped);
      onCommit?.(clamped);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditing(false);
  }

  return (
    <div className={`space-y-1.5 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{label}</label>
        {editing ? (
          <div className="flex items-center gap-1 rounded-lg px-2 py-0.5 border border-violet-500" style={{ background: "var(--bg-panel-solid)" }}>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              className="text-sm font-mono font-semibold text-violet-500 w-16 text-right bg-transparent outline-none"
            />
          </div>
        ) : (
          <button
            onClick={startEdit}
            title="Click to enter value"
            className="text-sm font-mono font-semibold text-violet-500 rounded-lg px-2 py-0.5 transition-colors hover:bg-violet-500/15"
          >
            {displayValue ?? value}
          </button>
        )}
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-violet-500"
        style={{ background: "var(--border)" }}
      />
      <div className="flex justify-between text-xs" style={{ color: "var(--text-subtle)" }}>
        <span>{displayMin ?? min}</span>
        <span>{displayMax ?? max}</span>
      </div>
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

function formatSpeedDesc(speed: number, t: T): string {
  if (speed >= 1) return `${Math.floor(speed)} ${t("descSpeed")}`;
  return t("descSpeedSlow", { n: speedToFrameInterval(speed) });
}

// ─── Stat tooltip ─────────────────────────────────────────────────────────────

interface StatTooltipProps {
  formula: string;
  explanation: string;
}

function StatTooltip({ formula, explanation }: StatTooltipProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function openTooltip() {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const panelW = 272;
    const panelH = 180; // approximate

    // Prefer right of button, flip left if not enough space
    let left = r.right + 8;
    if (left + panelW > vw - 8) left = r.left - panelW - 8;

    // Prefer below top of button, shift up if not enough space
    let top = r.top;
    if (top + panelH > vh - 8) top = vh - panelH - 8;
    if (top < 8) top = 8;

    setPos({ top, left });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        btnRef.current && !btnRef.current.contains(target)
      ) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        ref={btnRef}
        onClick={openTooltip}
        className="w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center transition-colors hover:bg-violet-500/20 hover:text-violet-500 focus:outline-none"
        style={{ color: "var(--text-subtle)", border: "1px solid var(--border)" }}
        tabIndex={-1}
      >
        ?
      </button>
      {open && pos && typeof document !== "undefined" && createPortal(
        <div
          ref={panelRef}
          className="fixed z-9999 w-68 rounded-xl border shadow-2xl p-3 space-y-2"
          style={{
            background: "var(--bg-panel-solid)",
            borderColor: "var(--border)",
            top: pos.top,
            left: pos.left,
            width: 272,
          }}
        >
          <div className="flex justify-center py-1">
            <MathComponent math={formula} block />
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}><MathText text={explanation} /></p>
        </div>,
        document.body
      )}
    </span>
  );
}

// ─── Stat row ────────────────────────────────────────────────────────────────

interface StatRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  formula?: string;
  formulaExplanation?: string;
}

function StatRow({ label, value, highlight = false, formula, formulaExplanation }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
      <span className="text-sm flex items-center gap-0.5" style={{ color: "var(--text-muted)" }}>
        <MathText text={label} />
        {formula && formulaExplanation && (
          <StatTooltip formula={formula} explanation={formulaExplanation} />
        )}
      </span>
      <span className={`text-sm font-mono font-semibold ${highlight ? "text-violet-500 text-base" : ""}`} style={highlight ? {} : { color: "var(--text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Action buttons (shared between tabs) ────────────────────────────────────

function ActionButtons({ isRunning, isMaxReached, onStart, onPause, onReset, onDropOne }: {
  isRunning: boolean;
  isMaxReached: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDropOne: () => void;
}) {
  const t = useTranslations();
  return (
    <div className="pt-2 space-y-2 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="flex gap-2">
        {isMaxReached ? (
          <button onClick={onReset} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">
            {t("btnMaxReached")}
          </button>
        ) : !isRunning ? (
          <button onClick={onStart} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors">
            {t("btnStart")}
          </button>
        ) : (
          <button onClick={onPause} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold transition-colors">
            {t("btnPause")}
          </button>
        )}
        {!isMaxReached && (
          <button onClick={onReset} className="py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors" style={{ background: "var(--bg-panel-alt)", color: "var(--text-muted)" }}>
            {t("btnReset")}
          </button>
        )}
      </div>
      <button onClick={onDropOne} disabled={isMaxReached} className={`w-full py-2.5 rounded-xl border border-violet-500/40 hover:border-violet-400 hover:bg-violet-500/10 text-violet-500 text-sm font-semibold transition-colors ${isMaxReached ? "opacity-40 pointer-events-none" : ""}`}>
        {t("btnDropOne")}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Unified sidebar panel with Parameters / Statistics tabs and shared action buttons.
 */
export default function SidebarPanel({ config, stats, isRunning, onConfigChange, onStart, onPause, onReset, onDropOne }: SidebarPanelProps) {
  const t = useTranslations();
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

  const isMaxReached = !isRunning && total >= config.maxNeedles && total > 0;

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
            {id === "params" ? t("panelParameters") : t("panelStats")}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5 flex-1 space-y-5">
        {tab === "params" && (
          <>
            <p className="text-xs" style={{ color: "var(--text-subtle)" }}>{t("panelNeedleConstraint")}</p>
            <SliderField
              label={t("labelNeedleLength")} value={config.needleLength} min={10} max={config.lineSpacing} step={1}
              displayValue={`${config.needleLength} px`} displayMin="10 px" displayMax={`${config.lineSpacing} px`}
              description={t("descNeedleLength")}
              onChange={(v) => update({ needleLength: v })} disabled={isRunning}
            />
            <SliderField
              label={t("labelLineSpacing")} value={config.lineSpacing} min={30} max={200} step={5}
              displayValue={`${config.lineSpacing} px`} displayMin="30 px" displayMax="200 px"
              description={t("descLineSpacing")}
              onChange={(v) => update({ lineSpacing: v, needleLength: Math.min(config.needleLength, v) })} disabled={isRunning}
            />
            <SliderField
              label={t("labelMaxNeedles")} value={config.maxNeedles} min={100} max={50000} step={100}
              displayValue={config.maxNeedles.toLocaleString()} displayMin="100" displayMax="50 000"
              description={t("descMaxNeedles")}
              onChange={(v) => update({ maxNeedles: v })} disabled={isRunning}
            />
          </>
        )}

        {tab === "stats" && (
          <>
            <StatRow label={t("statNeedlesDropped")} value={total.toLocaleString()} />
            <StatRow label={t("statCrossingLines")} value={crossings.toLocaleString()} />
            <StatRow
              label={t("statCrossingRatio")} value={crossingPct}
              formula={String.raw`\hat{p} = \frac{c}{n}`}
              formulaExplanation={t("tooltipCrossingRatio")}
            />
            <StatRow label={t("statPiReal")} value={Math.PI.toFixed(6)} />
            <StatRow
              label={t("statPiEstimated")} value={piDisplay} highlight
              formula={String.raw`\hat{\pi} = \frac{2l}{d \cdot \hat{p}}`}
              formulaExplanation={t("tooltipPiEstimated")}
            />
            <StatRow
              label={t("statAbsError")} value={errorDisplay}
              formula={String.raw`|\hat{\pi} - \pi|`}
              formulaExplanation={t("tooltipAbsError")}
            />
            <StatRow
              label={t("statRelError")} value={errorPct}
              formula={String.raw`\frac{|\hat{\pi} - \pi|}{\pi} \times 100\%`}
              formulaExplanation={t("tooltipRelError")}
            />
          </>
        )}
      </div>

      {/* Speed slider — shared, always visible */}
      <div className="px-5 pb-3 space-y-1.5 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex justify-between items-baseline pt-3">
          <label className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{t("labelSpeed")}</label>
          <span className="text-sm font-mono font-semibold text-violet-500">{speedLabel}</span>
        </div>
        <input
          type="range" min={0} max={100} step={1} value={sliderPos}
          onChange={(e) => handleSpeedSlider(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-violet-500"
          style={{ background: "var(--border)" }}
        />
        <div className="flex justify-between text-xs" style={{ color: "var(--text-subtle)" }}>
          <span>1/50×</span>
          <span>×200</span>
        </div>
        <p className="text-xs" style={{ color: "var(--text-subtle)" }}>{formatSpeedDesc(config.speed, t)}</p>
      </div>

      {/* Action buttons — always visible */}
      <div className="px-5 pb-5">
        <ActionButtons isRunning={isRunning} isMaxReached={isMaxReached} onStart={onStart} onPause={onPause} onReset={onReset} onDropOne={onDropOne} />
      </div>
    </div>
  );
}
