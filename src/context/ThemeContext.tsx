"use client";

import React, { createContext, useContext, useCallback, useEffect, useState } from "react";

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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always "dark" on server and initial client render — prevents hydration mismatch.
  // After mount we read the real value from DOM (set by the inline theme-init script).
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const actual: Theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
    setTheme(actual);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      localStorage.setItem("theme", next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

