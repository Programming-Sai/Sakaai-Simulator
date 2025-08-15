// components/Header.js
"use client";
import { useEffect, useState } from "react";
import styles from "./header.module.css";
import Link from "next/link";

export default function Header({ setOpenSideBar }) {
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

  function toggleSidebar() {
    // functional updater avoids stale values
    setOpenSideBar((prev) => {
      const next = !prev;
      return next;
    });
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.sidebarButton} onClick={toggleSidebar}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Link href={"/"} className={styles.logo}>
          Sakaai Simulator
        </Link>
      </div>
      <div className={styles.right}>
        <div
          className={styles.themeToggle}
          // className={"theme-toggle" + styles.themeToggle}
          onClick={toggle}
          aria-label="Toggle theme"
        >
          <span className={theme !== "dark" ? styles.active : ""}>☀</span>
          <span className={theme == "dark" ? styles.active : ""}>☾</span>
        </div>
      </div>
    </header>
  );
}
