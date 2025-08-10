import React from "react";
import styles from "./feedbackcomponent.module.css";

export default function FeedbackComponent({ width, right }) {
  const messages = [
    { type: "req", text: "Hey there!" },
    { type: "res", text: "Hi! How's it going?" },
    { type: "req", text: "Pretty good, just working on a project." },
    { type: "res", text: "Nice! What are you building?" },
    { type: "req", text: "A feedback chat UI in React." },
    { type: "res", text: "Cool! Are you making it dynamic?" },
    { type: "req", text: "Yep, that's the plan." },
    {
      type: "res",
      text: "Let me know if you need help with state or scrolling.",
    },
    { type: "req", text: "Sure thing, I'll try this array out first." },
    {
      type: "res",
      text: "Alright, give it a go and see if the scrollbar works!",
    },
  ];
  return (
    <div
      className={styles.feedbackContainer}
      style={{ "--width": (width % 101) + "%", "--right": (right % 101) + "%" }}
    >
      <div className={styles.chatBox}>
        {messages.map((msg, i) => (
          <div key={i} className={styles[msg.type]}>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <input
        type="text"
        className={styles.type}
        placeholder="Your Response..."
      />
      <button className={styles.sendButton}>
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
