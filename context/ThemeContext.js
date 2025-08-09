"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "sakaai:theme";
const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggle: () => {},
  ready: false,
});

export default function ThemeProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // safe get + prefers-color-scheme fallback
    try {
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = saved || (prefersDark ? "dark" : "light");
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    } catch (err) {
      // ignore localStorage errors in restricted environments
      setTheme("light");
      document.documentElement.setAttribute("data-theme", "light");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (err) {
      /* ignore */
    }
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, ready]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle, ready }}>
      {/* hide while hydrating to avoid FOUC */}
      <div style={{ display: ready ? "block" : "none" }}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
