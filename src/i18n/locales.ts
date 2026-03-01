/**
 * Shared locale types and metadata — safe to import from both server and client.
 */

export type LocaleCode = "en" | "cs" | "de" | "fr";

export const locales: LocaleCode[] = ["en", "cs", "de", "fr"];

export const LOCALES: Record<LocaleCode, { label: string; flag: string }> = {
    en: { label: "English", flag: "🇬🇧" },
    cs: { label: "Čeština", flag: "🇨🇿" },
    de: { label: "Deutsch", flag: "🇩🇪" },
    fr: { label: "Français", flag: "🇫🇷" },
};
