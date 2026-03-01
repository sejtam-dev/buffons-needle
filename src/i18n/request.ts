import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import type { LocaleCode } from "./locales";
import { locales } from "./locales";

export type { LocaleCode };
export { locales };

/** Detect locale from Accept-Language header, falls back to "en". */
function detectLocale(acceptLanguage: string | null): LocaleCode {
    if (!acceptLanguage) return "en";
    const lang = acceptLanguage.toLowerCase();
    if (lang.startsWith("cs") || lang.startsWith("sk")) return "cs";
    if (lang.startsWith("de")) return "de";
    if (lang.startsWith("fr")) return "fr";
    return "en";
}

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const headerStore = await headers();

    const saved = cookieStore.get("locale")?.value as LocaleCode | undefined;
    const locale: LocaleCode =
        saved && locales.includes(saved) ? saved : detectLocale(headerStore.get("accept-language"));

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
});
