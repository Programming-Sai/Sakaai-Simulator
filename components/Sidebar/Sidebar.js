// components/Sidebar/Sidebar.js
"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./sidebar.module.css";
import Link from "next/link";
import { useData } from "@/context/DataContext";
import { useSearchParams } from "next/navigation";
import Submenu from "../Submenu/Submenu";

export default function Sidebar({ openSideBar, setOpenSideBar }) {
  const { data } = useData();
  const searchParams = useSearchParams();

  const genId = searchParams.get("genId");

  // submenu state: { id: generationId, rect } or null
  const [submenu, setSubmenu] = useState(null);
  // const [selected, setSelected] = useState({});

  // close on outside click
  useEffect(() => {
    function onDocDown(e) {
      // If a submenu is open and click is outside, close it.
      // We cannot easily inspect portal DOM here -> just close always if click occurs
      if (submenu) {
        setSubmenu(null);
      }
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [submenu]);

  // handle toggle button
  function onToggleMenuClick(e, generationId) {
    e.stopPropagation();
    e.preventDefault();
    const btnRect = e.currentTarget.getBoundingClientRect();

    // toggle: if same id, close; else open under this button
    if (submenu && submenu.id === generationId) {
      setSubmenu(null);
      return;
    }
    setSubmenu({ id: generationId, rect: btnRect });
  }

  return (
    <div
      className={`${styles.wrapper} panel ${openSideBar ? styles.active : ""}`}
    >
      <div className={styles.usageContainer}>
        <div className={styles.usageStats}>
          <p>{data.usage.limit - data.usage.used}</p>
          <p>{data.usage.limit}</p>
        </div>
        <div className={styles.usageProgressContainer}>
          <div
            className={styles.usageProgress}
            style={{
              "--usage": `${
                ((data.usage.limit - data.usage.used) / data.usage.limit) * 100
              }%`,
            }}
          />
        </div>
      </div>
      <Link
        onClick={() => setOpenSideBar((prev) => !prev)}
        href="/"
        className={styles.newButton}
      >
        ✚ New Quiz
      </Link>
      <h3 className={styles.quizHeader}>Quizzes</h3>

      {!data.history || data.history.length === 0 ? (
        <p className="lead">No quizzes yet.</p>
      ) : (
        <ul className={styles.list}>
          {data.history.map((h) => (
            <li
              className={`${styles.listItem} ${
                h.generationId === genId ? styles.linkActive : ""
              }`}
              key={h.generationId}
              role="button"
              tabIndex={0}
              onClick={() => setOpenSideBar((prev) => !prev)}
            >
              <Link
                href={`/quiz?genId=${encodeURIComponent(h.generationId)}`}
                className={styles.listItemText}
                title={h?.preview || h?.topic || "Untitled quiz"}
              >
                {h?.preview || h?.topic || "Untitled quiz"}
              </Link>

              <button
                aria-label="Open submenu"
                onClick={(e) => onToggleMenuClick(e, h.generationId)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  role="img"
                >
                  {/* <circle cx="5" cy="12" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="19" cy="12" r="1.5" /> */}
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {submenu && (
        <Submenu
          genId={submenu?.id}
          anchorRect={submenu.rect}
          onClose={() => setSubmenu(null)}
        />
      )}
    </div>
  );
}
