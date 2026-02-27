"use client";

import React, { useRef, useEffect, useState } from "react";
import NeedleCanvas from "@/components/NeedleCanvas";
import SidebarPanel from "@/components/ControlPanel";
import InfoModal from "@/components/InfoPanel";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { useSimulation } from "@/hooks/useSimulation";
import { useLocale } from "@/i18n/useLocale";
import { useTheme } from "@/context/ThemeContext";

const CANVAS_HEIGHT = 520;

/**
 * Main simulation page — composes all panels and the canvas.
 */
export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(700);
  const [infoOpen, setInfoOpen] = useState(false);
  const { locale, t, changeLocale } = useLocale();
  const { theme, toggle: toggleTheme } = useTheme();

  // Measure the canvas container to make it fully responsive
  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.clientWidth);
      }
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const { needles, stats, config, isRunning, canvasRef, setConfig, start, pause, reset, dropOne, dropAtPosition } =
    useSimulation(canvasWidth, CANVAS_HEIGHT);

  const isDark = theme === "dark";

  return (
    <main className="min-h-screen font-sans transition-colors" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Header */}
      <header className="border-b px-6 py-4" style={{ borderColor: "var(--border)", background: "var(--bg-panel)" }}>
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm select-none shrink-0">
            π
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold tracking-tight leading-tight">{t.appTitle}</h1>
            <p className="text-xs leading-tight" style={{ color: "var(--text-subtle)" }}>{t.appSubtitle}</p>
          </div>

          {/* Info button */}
          <button
            onClick={() => setInfoOpen(true)}
            title={t.panelHowItWorks}
            className="w-8 h-8 flex items-center justify-center rounded-full border text-sm font-bold transition-colors hover:border-violet-500 hover:text-violet-500 shrink-0"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            ?
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-8 h-8 flex items-center justify-center rounded-full border transition-colors hover:border-violet-500 shrink-0"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          <LocaleSwitcher locale={locale} onChange={changeLocale} />
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Canvas column */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* π badge */}
          <div className="flex items-center gap-3 h-9">
            {stats.piEstimate !== null ? (
              <>
                <span className="text-3xl font-mono font-bold text-violet-500">
                  π ≈ {stats.piEstimate.toFixed(5)}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full font-mono ${
                  stats.error! < 0.01 ? "bg-emerald-500/15 text-emerald-500"
                  : stats.error! < 0.1 ? "bg-amber-500/15 text-amber-500"
                  : "bg-rose-500/15 text-rose-500"
                }`}>
                  Δ {stats.error!.toFixed(5)}
                </span>
              </>
            ) : (
              <span className="text-sm" style={{ color: "var(--text-subtle)" }}>{t.dropHint}</span>
            )}
          </div>

          {/* Canvas wrapper */}
          <div
            ref={containerRef}
            className="w-full rounded-2xl overflow-hidden border shadow-[0_0_60px_-10px_rgba(139,92,246,0.15)]"
            style={{ borderColor: "var(--border)" }}
          >
            <NeedleCanvas
              ref={canvasRef}
              width={canvasWidth}
              height={CANVAS_HEIGHT}
              needles={needles}
              needleLength={config.needleLength}
              lineSpacing={config.lineSpacing}
              onCanvasClick={dropAtPosition}
            />
          </div>

          {/* Legend */}
          <div className="flex gap-6 text-xs" style={{ color: "var(--text-subtle)" }}>
            <span className="flex items-center gap-2">
              <span className="inline-block w-5 h-0.5 bg-red-500 rounded" />
              {t.legendCrossing}
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-5 h-0.5 bg-blue-500 rounded" />
              {t.legendNotCrossing}
            </span>
            <span className="flex items-center gap-2" style={{ color: "var(--text-subtle)" }}>
              {t.clickToDropHint}
            </span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <SidebarPanel
            config={config}
            stats={stats}
            isRunning={isRunning}
            t={t}
            onConfigChange={setConfig}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onDropOne={dropOne}
          />
        </div>
      </div>

      {/* Info modal — rendered via portal */}
      {infoOpen && <InfoModal t={t} onClose={() => setInfoOpen(false)} />}
    </main>
  );
}
