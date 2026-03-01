"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import Math from "@/components/Math";
import { MathText } from "@/components/Math";

interface InfoModalProps {
  onClose: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold mt-5 mb-1.5" style={{ color: "var(--text-primary)" }}>
      {children}
    </h3>
  );
}

/**
 * Modal overlay explaining the math behind Buffon's Needle.
 * Rendered via portal. Uses KaTeX for LaTeX rendering.
 * Strings from translations may contain $...$ markers which MathText parses inline.
 */
export default function InfoModal({ onClose }: InfoModalProps) {
  const t = useTranslations();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border" style={{ background: "var(--bg-panel-solid)", borderColor: "var(--border)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            <MathText text={t("panelHowItWorks")} />
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-violet-500/10 hover:text-violet-500 text-lg leading-none" style={{ color: "var(--text-muted)" }} aria-label="Close">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-1 text-sm leading-relaxed max-h-[75vh] overflow-y-auto" style={{ color: "var(--text-muted)" }}>

          <p><MathText text={t("infoIntro")} /></p>

          <SectionTitle><MathText text={t("infoSetupTitle")} /></SectionTitle>
          <p><MathText text={t("infoSetup")} /></p>
          <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}><MathText text={t("infoConstraint")} /></p>

          <SectionTitle><MathText text={t("infoConditionTitle")} /></SectionTitle>
          <p><MathText text={t("infoCondition")} /></p>
          <div className="my-3 py-3 rounded-xl text-center" style={{ background: "var(--bg-panel-alt)" }}>
            <Math block math={String.raw`y_c \bmod d \;\leq\; \frac{l}{2} \left|\sin\theta\right|`} />
          </div>
          <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
            <Math math="y_c \in [0,\, d)" />, <Math math="\theta \in [0,\, \pi)" />
          </p>

          <SectionTitle><MathText text={t("infoProbTitle")} /></SectionTitle>
          <p><MathText text={t("infoProb")} /></p>
          <div className="my-3 py-3 rounded-xl text-center" style={{ background: "var(--bg-panel-alt)" }}>
            <Math block math={String.raw`P = \frac{2l}{d\pi}`} />
          </div>

          <SectionTitle><MathText text={t("infoEstimateTitle")} /></SectionTitle>
          <p><MathText text={t("infoEstimate")} /></p>
          <div className="my-3 py-3 rounded-xl text-center" style={{ background: "var(--bg-panel-alt)" }}>
            <Math block math={String.raw`\hat{\pi} \approx \frac{2l \cdot n}{d \cdot c}`} />
          </div>
          <p><MathText text={t("infoConverge")} /></p>

          <SectionTitle><MathText text={t("infoInteractTitle")} /></SectionTitle>
          <p><MathText text={t("infoInteract")} /></p>
        </div>
      </div>
    </div>,
    document.body
  );
}
