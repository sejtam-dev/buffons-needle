"use client";

import React, { createContext, useContext } from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

export type Theme = "dark" | "light";

interface ThemeContextValue {
    theme: Theme;
    toggle: () => void;
    mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: "dark",
    toggle: () => {},
    mounted: false,
});

function ThemeContextBridge({ children }: { children: React.ReactNode }) {
    const { resolvedTheme, setTheme } = useNextTheme();
    const mounted = resolvedTheme !== undefined;
    const theme: Theme = resolvedTheme === "light" ? "light" : "dark";

    function toggle() {
        setTheme(theme === "dark" ? "light" : "dark");
    }

    return <ThemeContext.Provider value={{ theme, toggle, mounted }}>{children}</ThemeContext.Provider>;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <ThemeContextBridge>{children}</ThemeContextBridge>
        </NextThemesProvider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
