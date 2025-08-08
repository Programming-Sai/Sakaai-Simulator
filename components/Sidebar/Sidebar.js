// components/Sidebar.js
"use client";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  return (
    <div className={styles.wrapper + " panel"}>
      <h3 className="h1">History</h3>
      <p className="lead">No quizzes yet — hit "Generate" to get started.</p>
      <div className={styles.list}>{/* future: map quiz items here */}</div>
    </div>
  );
}
