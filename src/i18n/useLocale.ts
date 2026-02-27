"use client";

import { useState, useCallback } from "react";
import { translations, LOCALES } from "./translations";
import type { LocaleCode, Translations } from "./translations";

export type { LocaleCode, Translations };
export { LOCALES };

/** Maps a BCP-47 language tag to a supported LocaleCode (falls back to "en"). */
function detectLocale(): LocaleCode {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language?.toLowerCase() ?? "";
  if (lang.startsWith("cs") || lang.startsWith("sk")) return "cs";
  if (lang.startsWith("de")) return "de";
  if (lang.startsWith("fr")) return "fr";
  return "en";
}

/**
 * Simple client-side locale hook with automatic browser language detection.
 */
export function useLocale() {
  const [locale, setLocale] = useState<LocaleCode>(detectLocale);

  const t: Translations = translations[locale];

  const changeLocale = useCallback((code: LocaleCode) => {
    setLocale(code);
  }, []);

  return { locale, t, changeLocale };
}
