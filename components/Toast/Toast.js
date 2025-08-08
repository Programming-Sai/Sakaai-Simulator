// components/ToastContainer.js
"use client";
import styles from "./toast.module.css";

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
          <div>{t.message}</div>
          <button onClick={() => onRemove(t.id)} aria-label="Dismiss">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
