"use client";

import { useTranslations, useLocale as useNextIntlLocale } from "next-intl";
import { useState, useTransition } from "react";
import { LOCALES, locales } from "./locales";
import type { LocaleCode } from "./locales";

export type { LocaleCode };
export { LOCALES, locales };

/**
 * Client-side locale hook.
 * Switching locale writes a cookie and reloads so the server re-renders in the new language.
 */
export function useLocale() {
  const currentLocale = useNextIntlLocale() as LocaleCode;
  const [locale, setLocale] = useState<LocaleCode>(currentLocale);
  const t = useTranslations();
  const [, startTransition] = useTransition();

  function changeLocale(code: LocaleCode) {
    document.cookie = `locale=${code};path=/;max-age=31536000`;
    setLocale(code);
    startTransition(() => {
      window.location.reload();
    });
  }

  return { locale, t, changeLocale };
}
