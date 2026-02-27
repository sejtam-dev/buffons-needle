"use client";

import React from "react";
import type { Translations } from "@/i18n/useLocale";

const REPO = "https://github.com/sejtam-dev/buffons-needle";

interface FooterProps {
  t: Translations;
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function ForkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M7 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0-9a1 1 0 0 1 1 1v4.17A3.001 3.001 0 0 1 7 19a3 3 0 0 1-1-5.83V9a1 1 0 0 1 1-1zm10 0a1 1 0 0 1 1 1v.17A3.001 3.001 0 0 1 17 17a3 3 0 0 1-2-2.83V11h-2a1 1 0 0 1 0-2h2V9a1 1 0 0 1 1-1z" />
    </svg>
  );
}

/**
 * Page footer with copyright, GitHub repo link, star and fork buttons.
 */
export default function Footer({ t }: FooterProps) {
  return (
    <footer className="border-t mt-8" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-4">
        {/* Copyright */}
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-subtle)" }}>
          <span>© {new Date().getFullYear()}</span>
          <a
            href="https://github.com/sejtam-dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-violet-500 transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            @Sejtam_
          </a>
          <span>·</span>
          <a
            href="https://buffons-needle.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-violet-500 transition-colors"
          >
            buffons-needle.vercel.app
          </a>
        </div>

        {/* GitHub buttons */}
        <div className="flex items-center gap-2">
          {/* Repo link */}
          <a
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors hover:border-violet-500 hover:text-violet-500"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "var(--bg-panel-alt)" }}
          >
            <GitHubIcon />
            <span>GitHub</span>
          </a>

          {/* Star */}
          <a
            href={`${REPO}/stargazers`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors hover:border-amber-400 hover:text-amber-400"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "var(--bg-panel-alt)" }}
            title={t.footerStar}
          >
            <StarIcon />
            <span>{t.footerStar}</span>
          </a>

          {/* Fork */}
          <a
            href={`${REPO}/fork`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors hover:border-violet-500 hover:text-violet-500"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "var(--bg-panel-alt)" }}
            title={t.footerFork}
          >
            <ForkIcon />
            <span>{t.footerFork}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

