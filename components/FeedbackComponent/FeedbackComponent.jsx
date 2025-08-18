// components/FeedbackComponent/FeedbackComponent.jsx
"use client";
import React, { useEffect, useRef } from "react";
import styles from "./feedbackcomponent.module.css";
import { useData } from "@/context/DataContext";

export default function FeedbackComponent({ width, right, smallScreenOffset }) {
  const { data, addFeedbackMessage, setFeedbackInput, submitFeedback } =
    useData();
  const chatRef = useRef(null);

  const messages = data.messages || [];
  const currentInput = data.currentInput || "";
  const inFlight = data.inFlight || false;

  // auto-scroll to bottom when messages change
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    // small delay to allow DOM render
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages.length]);

  function handleSend() {
    const txt = (currentInput || "").trim();
    if (!txt) return;
    addFeedbackMessage("user", txt);
    // optionally, you can queue a "bot" followup message here if needed
  }

  async function handleSubmit() {
    if (inFlight) return;
    // submitFeedback will read FB_KEY messages and POST { requestId, answers }
    const res = await submitFeedback();
    if (!res.ok) {
      // show error UI as needed — minimal: console
      console.error("submit feedback failed", res.error);
      return;
    }
    // success: you can optionally display a thank-you message
    addFeedbackMessage("bot", "Thanks — your feedback was recorded.");
  }

  // const messages = [
  //   { type: "req", text: "Hey there!" },
  //   { type: "res", text: "Hi! How's it going?" },
  //   { type: "req", text: "Pretty good, just working on a project." },
  //   { type: "res", text: "Nice! What are you building?" },
  //   { type: "req", text: "A feedback chat UI in React." },
  //   { type: "res", text: "Cool! Are you making it dynamic?" },
  //   { type: "req", text: "Yep, that's the plan." },
  //   {
  //     type: "res",
  //     text: "Let me know if you need help with state or scrolling.",
  //   },
  //   { type: "req", text: "Sure thing, I'll try this array out first." },
  //   {
  //     type: "res",
  //     text: "Alright, give it a go and see if the scrollbar works!",
  //   },
  // ];
  return (
    <div
      className={styles.feedbackContainer}
      style={{
        "--width": (width % 101) + "%",
        "--right": (right % 101) + "%",
        "--offset": (smallScreenOffset % 101) + "%",
      }}
    >
      <div
        className={styles.chatBox}
        ref={chatRef}
        role="log"
        aria-live="polite"
      >
        {messages.map((m) => {
          const cls = m.role === "user" ? styles.res : styles.req; // res = user bubble (right), req = bot bubble (left)
          return (
            <div key={m.id} className={cls}>
              <span>{m.text}</span>
            </div>
          );
        })}
      </div>
      <input
        aria-label="Type your response"
        type="text"
        className={styles.type}
        placeholder="Your Response..."
        value={currentInput}
        onChange={(e) => setFeedbackInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <button
        className={styles.sendButton}
        onClick={handleSend}
        aria-label="Send message"
        disabled={!currentInput.trim()}
        title="Send"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          role="img"
          style={{ verticalAlign: "middle" }}
        >
          <path
            d="M22 2L11 13"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 2L15 22L11 13L2 9L22 2Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
