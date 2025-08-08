// components/ThemeProvider.js
"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "sakaai:theme";

export default function ThemeProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, ready]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // while hydrating keep children hidden to avoid FOUC
  return (
    <>
      <div style={{ display: ready ? "block" : "none" }}>{children}</div>
      {/* small accessible floating control (optional) */}
      <div
        id="theme-visual-hidden"
        aria-hidden="true"
        style={{ position: "fixed", left: -9999 }}
      />
      {/* expose toggle via window for debug if you like */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__sakaai_toggleTheme = ${toggle.toString()}`,
        }}
      />
    </>
  );
}
