// app/@feedback/(.)feedback/page.jsx
"use client";

import FeedbackComponent from "@/components/FeedbackComponent/FeedbackComponent";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

export default function FeedbackModal() {
  const router = useRouter();
  const { theme } = useTheme();
  const close = () => {
    // go back in history to close the modal (or router.replace(...) to remove segment)
    router.back();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: "rgba(0,0,0,0.45)",
        zIndex: 9999,
      }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(800px, 95%)",
          background: theme === "light" ? "#fafbfb" : "#5b606c",
          borderRadius: 8,
          padding: 24,
        }}
      >
        <button
          style={{
            backgroundColor: "#9a5656ff",
            width: 30,
            height: 30,
            borderRadius: 100,
            border: "none",
            outline: "none",
            color: "white",
            marginRight: 30,
            fontWeight: "bold",
            padding: "5px",
          }}
          onClick={close}
          aria-label="Close"
        >
          ✕
        </button>
        <FeedbackComponent width={100} right={25.5} />
      </div>
    </div>
  );
}
