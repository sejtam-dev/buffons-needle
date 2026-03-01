"use client";

import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from "react";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start with "dark" on both server and client — matches the SSR default.
  // useLayoutEffect runs before paint and syncs with whatever the inline theme-init
  // script already applied to <html>, so there's no visible flash.
  const [theme, setTheme] = useState<Theme>("dark");

  useLayoutEffect(() => {
    const actual: Theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (actual !== "dark") setTheme(actual);
  }, []);

  // Keep <html> class and localStorage in sync whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggle() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

