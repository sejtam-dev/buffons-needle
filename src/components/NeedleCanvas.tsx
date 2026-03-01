"use client";

import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import type { Needle } from "@/types/simulation";
import { useTheme } from "@/context/ThemeContext";

interface NeedleCanvasProps {
  width: number;
  height: number;
  /** Full needle array — used only for full redraws (reset, theme change, resize). */
  needles: Needle[];
  needleLength: number;
  lineSpacing: number;
  onCanvasClick: (cx: number, cy: number) => void;
}

export interface NeedleCanvasHandle {
  /** Draw only the newly added needles without clearing the canvas. */
  appendNeedles: (batch: Needle[]) => void;
  /** Full redraw from scratch (used after reset / theme / config change). */
  fullRedraw: () => void;
}

/**
 * Canvas-based renderer for Buffon's Needle simulation.
 *
 * Performance strategy:
 *  - Incremental drawing: new needles are painted on top without clearing.
 *  - Full redraw only when reset, theme, dimensions or line config change.
 *  - React state updates are throttled in the hook; canvas is always up-to-date.
 */
const NeedleCanvas = forwardRef<NeedleCanvasHandle, NeedleCanvasProps>(function NeedleCanvas(
  { width, height, needles, needleLength, lineSpacing, onCanvasClick },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const needlesRef = useRef<Needle[]>(needles);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isDarkRef = useRef(isDark);

  useEffect(() => { isDarkRef.current = isDark; }, [isDark]);

  // ── helpers ──────────────────────────────────────────────────────────────

  function getCtx() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d") ?? null;
  }

  function applyDpr() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawBackground(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = isDarkRef.current ? "#0f172a" : "#f8fafc";
    ctx.fillRect(0, 0, width, height);
  }

  function drawLines(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = isDarkRef.current
      ? "rgba(148, 163, 184, 0.30)"
      : "rgba(100, 116, 139, 0.35)";
    ctx.lineWidth = 1;
    for (let y = lineSpacing; y < height; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  function drawNeedle(ctx: CanvasRenderingContext2D, needle: Needle) {
    const halfLen = needleLength / 2;
    const dx = halfLen * Math.cos(needle.angle);
    const dy = halfLen * Math.sin(needle.angle);
    ctx.strokeStyle = needle.crossing
      ? isDarkRef.current ? "rgba(248, 113, 113, 0.85)" : "rgba(220, 38, 38, 0.80)"
      : isDarkRef.current ? "rgba(96, 165, 250, 0.70)" : "rgba(37, 99, 235, 0.65)";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(needle.cx - dx, needle.cy - dy);
    ctx.lineTo(needle.cx + dx, needle.cy + dy);
    ctx.stroke();
  }

  // ── full redraw ───────────────────────────────────────────────────────────

  const fullRedraw = useCallback(() => {
    applyDpr();
    const ctx = getCtx();
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    drawBackground(ctx);
    drawLines(ctx);
    for (const n of needlesRef.current) drawNeedle(ctx, n);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, needleLength, lineSpacing]);

  // ── incremental append ────────────────────────────────────────────────────

  const appendNeedles = useCallback((batch: Needle[]) => {
    const ctx = getCtx();
    if (!ctx) return;
    for (const n of batch) drawNeedle(ctx, n);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needleLength]);

  // ── expose handle to parent ───────────────────────────────────────────────

  useImperativeHandle(ref, () => ({ appendNeedles, fullRedraw }), [appendNeedles, fullRedraw]);

  // ── react to needles prop change (reset / manual drop) ────────────────────

  useEffect(() => {
    needlesRef.current = needles;
    fullRedraw();
  }, [needles, fullRedraw]);

  // ── react to theme / size / config ────────────────────────────────────────

  useEffect(() => {
    isDarkRef.current = isDark;
    fullRedraw();
  }, [isDark, fullRedraw]);

  // ── click handler ─────────────────────────────────────────────────────────

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    onCanvasClick(e.clientX - rect.left, e.clientY - rect.top);
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      className="rounded-xl cursor-crosshair"
      style={{ display: "block", width, height }}
    />
  );
});

export default NeedleCanvas;
