// components/FeedbackComponent/FeedbackComponent.jsx
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "./feedbackcomponent.module.css";
import { useData } from "@/context/DataContext";

/**
 * Key changes:
 * - `sleep` is stable (useCallback) and not recreated by inner closures.
 * - useRef `startedRef` ensures intro runs only once.
 * - handleSend uses localIndex (not stale `messages`) to compute next question.
 * - botSay has a lock and sets/clears isBotTyping reliably.
 * - useEffect "smart flow" only asks when appropriate and is guarded against duplicates.
 */

export default function FeedbackComponent({ width, right, smallScreenOffset }) {
  const { data, addFeedbackMessage, setFeedbackInput, submitFeedback } =
    useData();
  const chatRef = useRef(null);

  // config & state that come from context
  const questions = (data?.config?.feedback_questions || []).slice();
  const messages = data.messages || [];
  const currentInput = data.currentInput || "";
  const inFlight = data.inFlight || false;

  // local flow state
  // localIndex: how many questions have been answered so far (0..n)
  const [localIndex, setLocalIndex] = useState(() => {
    const userReplies = (data.messages || []).filter(
      (m) => m.role === "user"
    ).length;
    return Math.min(userReplies, questions.length);
  });
  const [isBotTyping, setIsBotTyping] = useState(false);

  // refs to avoid repeated intro or simultaneous asks
  const botLockRef = useRef(false); // prevents overlapping botSay
  const startedRef = useRef(false); // ensure intro runs only once per mount

  // stable sleep helper (won't change each render)
  const sleep = useCallback(
    (ms) => new Promise((res) => setTimeout(res, ms)),
    []
  );

  // auto-scroll to bottom when messages change
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    // small delay to allow DOM render
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages.length, isBotTyping]);

  // botSay: typing indicator + add bot message
  async function botSay(text, minMs = 500, maxMs = 1100) {
    // avoid duplicate asks
    if (botLockRef.current) return;
    botLockRef.current = true;
    try {
      setIsBotTyping(true);
      const delay =
        minMs + Math.floor(Math.random() * Math.max(0, maxMs - minMs + 1));
      await sleep(delay);
      setIsBotTyping(false);
      addFeedbackMessage && addFeedbackMessage("bot", text);
    } finally {
      botLockRef.current = false;
    }
  }

  // submit logic that uses context submitFeedback (which has retries)
  async function handleSubmitAuto() {
    if (data.inFlight) return;
    addFeedbackMessage &&
      addFeedbackMessage("bot", "Submitting your responses...");
    const res = await submitFeedback({
      padTo: 0,
      maxRetries: 3,
      initialDelayMs: 800,
    });

    if (res && res.ok) {
      addFeedbackMessage &&
        addFeedbackMessage("bot", "All done — thank you! 🎉");
      setTimeout(() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = "/"; // fallback home
        }
      }, 2000);
    } else {
      addFeedbackMessage &&
        addFeedbackMessage(
          "bot",
          "Could not submit feedback right now. Your responses are saved locally and we'll retry automatically when possible."
        );
    }
  }

  // handle user pressing send (Enter or button)
  function handleSend() {
    const txt = (currentInput || "").trim();
    if (!txt) return;

    // Add user's message right away
    addFeedbackMessage && addFeedbackMessage("user", txt);
    // clear draft input in context
    setFeedbackInput && setFeedbackInput("");

    // Use localIndex (not stale `messages`) to advance flow.
    // localIndex equals number of user replies so far before this send.
    const nextAnsweredCount = localIndex + 1;
    setLocalIndex(nextAnsweredCount);

    if (nextAnsweredCount < questions.length) {
      const nextQIndex = nextAnsweredCount; // ask next question
      // schedule next question
      botSay(questions[nextQIndex]);
    } else {
      // Last answer submitted — show submit flow
      (async () => {
        await botSay("Thanks — submitting your feedback.");
        await sleep(3000);
        await handleSubmitAuto();
      })();
    }
  }

  // Smart effect: start intro when component mounts and no messages exist;
  // if user answered a question outside flow, ask next question.
  useEffect(() => {
    if (!questions || questions.length === 0) return;

    // If no messages at all => start intro -> ask first question
    if (messages.length === 0 && !startedRef.current) {
      startedRef.current = true;
      (async () => {
        await sleep(350);
        await botSay(
          `Yo — quick favor: can I ask ${questions?.length} quick questions about your experience? Won't take long, promise.`,
          900,
          1400
        );
        // small pause before first question so it feels natural
        await sleep(5000);
        if (questions[0]) {
          setLocalIndex(0);
          await botSay(questions[0]);
        }
      })();
      return;
    }

    // If user has replied more times than localIndex and there are more questions,
    // the user must have answered externally — ask the next question.
    const userCount = messages.filter((m) => m.role === "user").length;
    if (userCount > localIndex && userCount < questions.length) {
      const nextQIndex = userCount;
      setLocalIndex(userCount);
      botSay(questions[nextQIndex]);
      return;
    }

    // nothing to do otherwise
  }, [messages, questions, localIndex, sleep]);

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
          const cls = m.role === "user" ? styles.res : styles.req;
          return (
            <div key={m.id} className={cls}>
              <span>{m.text}</span>
            </div>
          );
        })}

        {isBotTyping && (
          <div className={styles.req} aria-hidden>
            <span>
              {/* typing SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="18"
                viewBox="0 0 56 18"
                role="img"
                aria-label="Typing indicator"
              >
                <title>Typing…</title>
                <g fill="currentColor">
                  <circle cx="6" cy="9" r="4">
                    <animate
                      attributeName="opacity"
                      values="0.25;1;0.25"
                      dur="1.2s"
                      repeatCount="indefinite"
                      begin="0s"
                    />
                    <animate
                      attributeName="cy"
                      values="9;5;9"
                      dur="1.2s"
                      repeatCount="indefinite"
                      begin="0s"
                    />
                  </circle>
                  <circle cx="28" cy="9" r="4">
                    <animate
                      attributeName="opacity"
                      values="0.25;1;0.25"
                      dur="1.2s"
                      repeatCount="indefinite"
                      begin="0.15s"
                    />
                    <animate
                      attributeName="cy"
                      values="9;5;9"
                      dur="1.2s"
                      repeatCount="indefinite"
                      begin="0.15s"
                    />
                  </circle>
                  <circle cx="50" cy="9" r="4">
                    <animate
                      attributeName="opacity"
                      values="0.25;1;0.25"
                      dur="1.2s"
                      repeatCount="indefinite"
                      begin="0.3s"
                    />
                    <animate
                      attributeName="cy"
                      values="9;5;9"
                      dur="1.2s"
                      repeatCount="indefinite"
                      begin="0.3s"
                    />
                  </circle>
                </g>
              </svg>
            </span>
          </div>
        )}
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
        disabled={inFlight}
      />
      <button
        className={styles.sendButton}
        onClick={handleSend}
        aria-label="Send message"
        disabled={!currentInput.trim() || inFlight}
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
