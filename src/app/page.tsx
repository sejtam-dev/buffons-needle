"use client";

import React, { useRef, useEffect, useState } from "react";
import NeedleCanvas from "@/components/NeedleCanvas";
import SidebarPanel from "@/components/ControlPanel";
import InfoModal from "@/components/InfoPanel";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import Footer from "@/components/Footer";
import { useSimulation } from "@/hooks/useSimulation";
import { useLocale, LOCALES } from "@/i18n/useLocale";
import { useTheme } from "@/context/ThemeContext";
import { useTranslations } from "next-intl";
import { MathText } from "@/components/Math";

const CANVAS_HEIGHT_DESKTOP = 520;
const CANVAS_HEIGHT_MOBILE = 320;

/**
 * Main simulation page — composes all panels and the canvas.
 */
export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(700);
  const [canvasHeight, setCanvasHeight] = useState(CANVAS_HEIGHT_DESKTOP);
  const [infoOpen, setInfoOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { locale, changeLocale } = useLocale();
  const t = useTranslations();
  const { theme, toggle: toggleTheme } = useTheme();

  // Measure the canvas container to make it fully responsive
  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setCanvasWidth(w);
        setCanvasHeight(w < 640 ? CANVAS_HEIGHT_MOBILE : CANVAS_HEIGHT_DESKTOP);
      }
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick() { setMenuOpen(false); }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  const { needles, stats, config, isRunning, canvasRef, setConfig, start, pause, reset, dropOne, dropAtPosition } =
    useSimulation(canvasWidth, canvasHeight);

  const isDark = theme === "dark";

  return (
    <main className="min-h-screen flex flex-col font-sans transition-colors" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Header */}
      <header className="border-b px-4 sm:px-6 py-4" style={{ borderColor: "var(--border)", background: "var(--bg-panel)" }}>
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm select-none shrink-0">
            π
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold tracking-tight leading-tight">{t("appTitle")}</h1>
            <p className="text-xs leading-tight" style={{ color: "var(--text-subtle)" }}><MathText text={t("appSubtitle")} /></p>
          </div>

          {/* Desktop controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setInfoOpen(true)}
              title={t("panelHowItWorks")}
              className="w-8 h-8 flex items-center justify-center rounded-full border text-sm font-bold transition-colors hover:border-violet-500 hover:text-violet-500 shrink-0"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              ?
            </button>
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

          {/* Mobile controls — info button always visible, rest in hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setInfoOpen(true)}
              title={t("panelHowItWorks")}
              className="w-8 h-8 flex items-center justify-center rounded-full border text-sm font-bold transition-colors hover:border-violet-500 hover:text-violet-500 shrink-0"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              ?
            </button>
            {/* Hamburger */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
                className="w-8 h-8 flex flex-col items-center justify-center gap-1 rounded-full border transition-colors hover:border-violet-500 shrink-0"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                aria-label="Menu"
              >
                <span className="block w-4 h-0.5 rounded" style={{ background: "var(--text-muted)" }} />
                <span className="block w-4 h-0.5 rounded" style={{ background: "var(--text-muted)" }} />
                <span className="block w-4 h-0.5 rounded" style={{ background: "var(--text-muted)" }} />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-10 z-50 rounded-xl border shadow-xl p-3 flex flex-col gap-2 min-w-40"
                  style={{ background: "var(--bg-panel-solid)", borderColor: "var(--border)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Theme toggle row */}
                  <button
                    onClick={() => { toggleTheme(); setMenuOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:text-violet-500"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span>{isDark ? "☀️" : "🌙"}</span>
                    <span>{isDark ? "Light mode" : "Dark mode"}</span>
                  </button>
                  {/* Locale list — flat buttons, no nested dropdown */}
                  <div className="border-t pt-2 flex flex-col" style={{ borderColor: "var(--border)" }}>
                    {(Object.keys(LOCALES) as Array<keyof typeof LOCALES>).map((code) => (
                      <button
                        key={code}
                        onClick={() => { changeLocale(code); setMenuOpen(false); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:text-violet-500"
                        style={code === locale
                          ? { color: "rgb(167,139,250)", background: "rgba(139,92,246,0.1)" }
                          : { color: "var(--text-muted)" }
                        }
                      >
                        <span>{LOCALES[code].flag}</span>
                        <span>{LOCALES[code].label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl w-full mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
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
              <span className="text-sm" style={{ color: "var(--text-subtle)" }}><MathText text={t("dropHint")} /></span>
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
              height={canvasHeight}
              needles={needles}
              needleLength={config.needleLength}
              lineSpacing={config.lineSpacing}
              onCanvasClick={dropAtPosition}
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 sm:gap-6 text-xs" style={{ color: "var(--text-subtle)" }}>
            <span className="flex items-center gap-2">
              <span className="inline-block w-5 h-0.5 bg-red-500 rounded" />
              {t("legendCrossing")}
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-5 h-0.5 bg-blue-500 rounded" />
              {t("legendNotCrossing")}
            </span>
            <span className="flex items-center gap-2" style={{ color: "var(--text-subtle)" }}>
              {t("clickToDropHint")}
            </span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <SidebarPanel
            config={config}
            stats={stats}
            isRunning={isRunning}
            onConfigChange={setConfig}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onDropOne={dropOne}
          />
        </div>
      </div>

      {/* Info modal — rendered via portal */}
      {infoOpen && <InfoModal onClose={() => setInfoOpen(false)} />}

      <Footer />
    </main>
  );
}
