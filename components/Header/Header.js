// components/Header.js
"use client";
import { useEffect, useState } from "react";
import styles from "./header.module.css";

export default function Header() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(t);
    const obs = new MutationObserver(() =>
      setTheme(document.documentElement.getAttribute("data-theme") || "light")
    );
    obs.observe(document.documentElement, { attributes: true });
    return () => obs.disconnect();
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("sakaai:theme", next);
    setTheme(next);
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>Sakaai</div>
      </div>
      <div className={styles.right}>
        <button
          className="theme-toggle"
          onClick={toggle}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "🌚 Dark" : "🌞 Light"}
        </button>
      </div>
    </header>
  );
}
