// components/Sidebar/Submenu.jsx
"use client";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./submenu.module.css";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";

export default function Submenu({ genId, anchorRect, onClose, children }) {
  const { deleteGeneration } = useData();
  const router = useRouter();

  // Safety: do not render on server
  if (typeof document === "undefined") return null;

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    // prevent page scroll while modal open? optional
    // document.body.style.overflow = 'hidden';
    // return () => (document.body.style.overflow = '');
  }, []);

  // default coords (if not provided)
  const rect = anchorRect || {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: 0,
    width: 0,
  };

  // Prefer placing right aligned to button; fall back to left if not enough space
  const padding = 8;
  const menuWidth = 220; // adjust
  const menuHeight = 160; // approximate, this won't clip because it's fixed
  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : 1024;
  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : 768;

  let top = rect.bottom + padding;
  let left = rect.left;

  // ensure it stays inside viewport horizontally
  if (left + menuWidth + padding > viewportWidth) {
    left = Math.max(padding, rect.right - menuWidth);
  }

  // if bottom would go offscreen, position above the button
  if (top + menuHeight + padding > viewportHeight) {
    top = Math.max(padding, rect.top - menuHeight - padding);
  }

  const style = {
    position: "fixed",
    top: `${top}px`,
    left: `${left}px`,
    width: `${menuWidth}px`,
    zIndex: 9999,
  };

  const node = (
    <div className={styles.portalRoot} onMouseDown={(e) => e.stopPropagation()}>
      <div className={styles.submenu} style={style}>
        <div
          className={styles.item}
          onClick={() => {
            router.push(`/quiz?genId=${encodeURIComponent(genId)}`);
            onClose();
          }}
        >
          Open
        </div>
        {/* <div
          className={styles.item}
          onClick={() => {
            ();
          }}
        >
          Rename
        </div> */}
        <div
          className={styles.item}
          onClick={() => {
            if (confirm("Delete this quiz?")) deleteGeneration(genId);
            onClose();
          }}
          style={{ color: "rgba(255,0,0,0.9)" }}
        >
          Delete
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
