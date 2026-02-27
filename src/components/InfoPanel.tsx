"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Translations } from "@/i18n/useLocale";

interface InfoModalProps {
  t: Translations;
  onClose: () => void;
}

/**
 * Modal overlay explaining the math behind Buffon's Needle.
 * Rendered via portal so it sits above all other content.
 * Responds to the active theme via CSS custom properties.
 */
export default function InfoModal({ t, onClose }: InfoModalProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border" style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{t.panelHowItWorks}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-violet-500/10 hover:text-violet-500 text-lg leading-none"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 text-sm leading-relaxed max-h-[70vh] overflow-y-auto" style={{ color: "var(--text-muted)" }}>
          <p>{t.infoLine1.replace("{l}", "l").replace("{d}", "d")}</p>
          <p>{t.infoLine2}</p>
          <div className="rounded-xl px-4 py-3 font-mono text-center text-base" style={{ background: "var(--bg-panel-alt)", color: "var(--text-primary)" }}>
            y<sub>c</sub> mod d &nbsp;≤&nbsp; (l/2) · |sin θ|
          </div>
          <p>{t.infoWhere.replace("{yc}", "y_c").replace("{theta}", "θ")}</p>
          <p>{t.infoAfter.replace("{n}", "n").replace("{c}", "c")}</p>
          <div className="rounded-xl px-4 py-3 font-mono text-center text-base" style={{ background: "var(--bg-panel-alt)", color: "var(--text-primary)" }}>
            π ≈ (2 · l · n) / (d · c)
          </div>
          <p>{t.infoConverge}</p>
        </div>
      </div>
    </div>,
    document.body
  );
}
