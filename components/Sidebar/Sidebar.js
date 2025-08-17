// components/Sidebar.js
"use client";
import { useState } from "react";
import styles from "./sidebar.module.css";
import Link from "next/link";
import { useData } from "@/context/DataContext";
import { useSearchParams } from "next/navigation";

export default function Sidebar({ openSideBar, setOpenSideBar }) {
  const { data } = useData();
  const searchParams = useSearchParams();
  const genId = searchParams.get("genId");
  const [subMenOpen, setSubMenuOpen] = useState(
    data?.history.map((hist, id) => ({ id, value: false }))
  );

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
        <p className="lead">No quizzes yet — hit "Generate" to get started.</p>
      ) : (
        <ul className={styles.list}>
          {data.history.map((h) => (
            <li
              className={`${styles.listItem} ${
                h.generationId === genId && styles.linkActive
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
                onClick={() =>
                  setSubMenuOpen((prev) => {
                    // if
                  })
                }
              >
                ...
              </button>
              <ul className={styles.submenu}>
                <li>
                  <p>option 1</p>
                </li>{" "}
                <li>
                  <p>option 1</p>
                </li>{" "}
                <li>
                  <p>option 1</p>
                </li>{" "}
                <li>
                  <p>option 1</p>
                </li>
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
