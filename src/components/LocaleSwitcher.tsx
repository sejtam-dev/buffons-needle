"use client";

import React, { useState, useRef, useEffect } from "react";
import { LOCALES } from "@/i18n/useLocale";
import type { LocaleCode } from "@/i18n/useLocale";
import { useTheme } from "@/context/ThemeContext";

interface LocaleSwitcherProps {
  locale: LocaleCode;
  onChange: (code: LocaleCode) => void;
}

/**
 * Dropdown button that lets the user switch the UI language.
 */
export default function LocaleSwitcher({ locale, onChange }: LocaleSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Solid colours — never transparent so the dropdown is always readable
  const dropdownBg = theme === "dark" ? "#1e293b" : "#ffffff";
  const dropdownBorder = theme === "dark" ? "#334155" : "#e2e8f0";
  const itemColor = theme === "dark" ? "#94a3b8" : "#64748b";

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = LOCALES[locale];

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors hover:border-violet-500"
        style={{ background: "var(--bg-panel-alt)", borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <span className="text-xs opacity-60">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 w-44 rounded-xl border shadow-2xl overflow-hidden z-50"
          style={{ background: dropdownBg, borderColor: dropdownBorder }}
        >
          {(Object.keys(LOCALES) as LocaleCode[]).map((code) => (
            <button
              key={code}
              onClick={() => { onChange(code); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-violet-500/10"
              style={code === locale
                ? { background: "rgba(139,92,246,0.15)", color: "rgb(167,139,250)" }
                : { color: itemColor }
              }
            >
              <span>{LOCALES[code].flag}</span>
              <span>{LOCALES[code].label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
