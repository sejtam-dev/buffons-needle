"use client";

import React, { createContext, useContext, useState, useEffect, useLayoutEffect, useRef } from "react";

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
  const [theme, setTheme] = useState<Theme>("dark");
  // Track whether the initial DOM sync has completed — we must not write
  // localStorage until we've read the real theme from the DOM.
  const initialised = useRef(false);

  useLayoutEffect(() => {
    const actual: Theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    initialised.current = true;
    if (actual !== theme) setTheme(actual);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep <html> class and localStorage in sync — but skip the very first run
  // (when theme is still the SSR default and initialised is not yet true).
  useEffect(() => {
    if (!initialised.current) return;
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

