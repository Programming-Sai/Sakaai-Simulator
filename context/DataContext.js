// contexts/DataContext.js
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

const API_BASE = "https://sakaai-simulator.onrender.com"; // adjust if needed
const REQUEST_ID_KEY = "sakaai:requestId";
const MAX_QUIZZES = 10;

// Add near top (after constants)
const QUIZZES_KEY = "sakaai:quizzes";
const HISTORY_KEY = "sakaai:history";
const USAGE_KEY = "sakaai:usage";
const ANSWERS_KEY = "sakaai:answers";

const DataContext = createContext();

function makeRequestId() {
  // small UUID v4-like generator (no deps)
  return (
    "req_" +
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    })
  );
}

function makeGenId() {
  return (
    "gen_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 9)
  );
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("readJSON failed", key, e);
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("writeJSON failed", key, e);
  }
}

// dedupe and safe localStorage IO helpers
function dedupeHistoryArray(arr) {
  const seen = new Set();
  const out = [];
  for (const it of arr || []) {
    if (!it || !it.generationId) continue;
    if (!seen.has(it.generationId)) {
      seen.add(it.generationId);
      out.push(it);
    }
  }
  return out;
}

export function DataProvider({ children }) {
  // data store
  const [data, setData] = useState({
    quizzes: {},
    answers: {},
    feedback: {},
    history: [],
    usage: { used: 0, limit: MAX_QUIZZES },
    setupInstructions: null,
    results: {},
    lastRequestMeta: null,
  });

  // global loading flag
  const [isLoading, setIsLoading] = useState(false);

  // request id persisted once
  const [requestId, setRequestId] = useState(() => {
    try {
      const stored = localStorage.getItem(REQUEST_ID_KEY);
      if (stored) return stored;
    } catch (e) {
      // localStorage may not be available during SSR — fine
    }
    const id = makeRequestId();
    try {
      localStorage.setItem(REQUEST_ID_KEY, id);
    } catch (e) {}
    return id;
  });

  // wake backend on provider mount (try /health then fallback to base url)
  useEffect(() => {
    let cancelled = false;
    async function wake() {
      try {
        const healthUrl = `${API_BASE}/health`;
        let res = await fetch(healthUrl, { method: "GET" });
        if (!res.ok) {
          // fallback to base
          res = await fetch(API_BASE, { method: "GET" });
        }
        // If you want to check JSON: const json = await res.json()
      } catch (err) {
        // ignore — backend might still be sleeping. We'll still clear loading.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    wake();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      const storedHistory = readJSON(HISTORY_KEY, []);
      const storedUsage = readJSON(USAGE_KEY, null);
      const storedQuizzesMap = readJSON(QUIZZES_KEY, {});
      const storedAnswers = readJSON(ANSWERS_KEY, {});

      // dedupe storedHistory right away
      const dedupedHistory = dedupeHistoryArray(storedHistory);

      // if dedupe removed duplicates, persist back cleaned history
      if (dedupedHistory.length !== (storedHistory || []).length) {
        writeJSON(HISTORY_KEY, dedupedHistory);
      }

      setData((prev) => ({
        ...prev,
        answers: storedAnswers || prev.answers,
        history: dedupedHistory || prev.history,
        usage: storedUsage || prev.usage || { used: 0, limit: MAX_QUIZZES },
        quizzes: Object.keys(prev.quizzes || {}).length
          ? prev.quizzes
          : storedQuizzesMap,
        results: prev.results || {},
      }));
    } catch (e) {
      console.warn("DataProvider init error", e);
    }
  }, []);

  // helper: merge new quiz response into data
  function pushResponseToData(responseJson, formPayload, generationIdParam) {
    const rid = formPayload.request_id || requestId || null; // user id
    const genId = generationIdParam || makeGenId();
    const now = new Date().toISOString();
    const quizzes = Array.isArray(responseJson.quizzes)
      ? responseJson.quizzes
      : [];

    const historyItem = {
      generationId: genId,
      requestId: rid,
      topic: formPayload.topic || "",
      preview: (quizzes[0]?.question || "").slice(0, 120),
      question_count: responseJson.question_count || quizzes.length || 0,
      createdAt: now,
      model_used: responseJson.model_used || null,
    };

    setData((prev) => {
      // If results already has genId, we may still want to refresh it but avoid double-history
      const alreadyInResults = !!(prev.results && prev.results[genId]);
      const alreadyInHistory = (prev.history || []).some(
        (h) => h.generationId === genId
      );

      // Build next results map (idempotent)
      const nextResults = {
        ...(prev.results || {}),
        [genId]: {
          meta: {
            model_used: responseJson.model_used,
            inference_time: responseJson.inference_time,
            question_count: responseJson.question_count,
            token_usage: responseJson.token_usage,
            attempt_number: responseJson.attempt_number,
          },
          quizzes,
        },
      };

      // Only add to history if not already present
      const nextHistory = alreadyInHistory
        ? prev.history
        : [historyItem, ...(prev.history || [])].slice(0, 200);

      // Only increment usage if this is a new generation
      const prevUsed = prev.usage?.used || 0;
      const prevLimit =
        typeof prev.usage?.limit === "number" ? prev.usage.limit : MAX_QUIZZES;
      const nextUsage = alreadyInResults
        ? { ...prev.usage }
        : { ...prev.usage, used: prevUsed + 1 };

      // persist only new pieces to localStorage
      try {
        const quizzesMap = readJSON(QUIZZES_KEY, {});
        if (!quizzesMap[genId]) {
          quizzesMap[genId] = quizzes;
          writeJSON(QUIZZES_KEY, quizzesMap);
        }

        const storedHistory = readJSON(HISTORY_KEY, []);
        const alreadyStored = storedHistory.some(
          (h) => h.generationId === genId
        );
        if (!alreadyStored) {
          const newStoredHistory = [historyItem, ...storedHistory].slice(
            0,
            200
          );
          writeJSON(HISTORY_KEY, dedupeHistoryArray(newStoredHistory));
        }

        // always write usage (it may or may not have changed)
        writeJSON(USAGE_KEY, nextUsage);
      } catch (e) {
        console.warn("persist pushResponseToData failed", e);
      }

      return {
        ...prev,
        results: nextResults,
        history: nextHistory,
        usage: nextUsage,
        lastRequestMeta: nextResults[genId].meta,
        setupInstructions: null,
      };
    });
  }

  // generateQuiz: posts to /generate with body from form; updates data
  // Ensure requestId exists (run on mount or before sending)
  function ensureRequestId() {
    try {
      let id = localStorage.getItem(REQUEST_ID_KEY);
      if (!id) {
        id = makeRequestId();
        localStorage.setItem(REQUEST_ID_KEY, id);
      }
      return id;
    } catch (e) {
      return makeRequestId();
    }
  }

  // generateQuiz using FormData
  async function generateQuiz(payload = {}) {
    const rid = requestId || ensureRequestId();
    const generationId = makeGenId();

    // Check usage remaining (per-request model)
    const currUsage = data?.usage || { used: 0, limit: MAX_QUIZZES };
    const remaining = (currUsage.limit ?? MAX_QUIZZES) - (currUsage.used ?? 0);
    if (remaining <= 0) {
      return { ok: false, error: new Error("Usage limit reached") };
    }

    // Build FormData (same as your implementation)...
    const fd = new FormData();
    fd.append("request_id", String(rid));
    fd.append(
      "user_additional_instructions",
      String(payload.user_additional_instructions ?? "")
    );
    if (typeof payload.topic !== "undefined")
      fd.append("topic", payload.topic ?? "");
    if (typeof payload.num_questions !== "undefined")
      fd.append("num_questions", String(payload.num_questions ?? ""));
    if (typeof payload.options_per_question !== "undefined")
      fd.append(
        "options_per_question",
        String(payload.options_per_question ?? "")
      );
    fd.append("answer_required", String(Boolean(payload.answer_required)));
    fd.append(
      "explanation_required",
      String(Boolean(payload.explanation_required))
    );
    if (Array.isArray(payload.quiz_type) && payload.quiz_type.length) {
      payload.quiz_type.forEach((t) => fd.append("quiz_type", String(t)));
    } else fd.append("quiz_type", "");

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text}`);
      }
      const json = await res.json();

      // persist request id if needed
      try {
        if (!requestId) {
          localStorage.setItem(REQUEST_ID_KEY, rid);
          setRequestId(rid);
        }
      } catch (e) {}

      // IMPORTANT: use explicit rid param here
      pushResponseToData(json, { request_id: rid, ...payload }, generationId);

      return { ok: true, json, requestId: rid, generationId };
    } catch (err) {
      console.error("generateQuiz (formdata) error", err);
      return { ok: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }

  // optional helper: setSetupInstructions (used while user types instructions)
  function setSetupInstructions(text) {
    setData((prev) => ({ ...prev, setupInstructions: text }));
  }

  // reset store (if you want a full reset)
  function resetAll() {
    setData({
      quizzes: {},
      answers: {},
      feedback: {},
      history: [],
      usage: { used: 0, limit: MAX_QUIZZES },
      setupInstructions: null,
      results: {},
      lastRequestMeta: null,
    });
    try {
      localStorage.removeItem(REQUEST_ID_KEY);
    } catch (e) {}
    const freshId = makeRequestId();
    try {
      localStorage.setItem(REQUEST_ID_KEY, freshId);
    } catch (e) {}
    setRequestId(freshId);
  }

  function setAnswer(genId, questionIndex, value, options = {}) {
    setData((prev) => {
      const prevAnswers = prev.answers[genId]?.[questionIndex];
      let newValue = value;

      if (options.multi) {
        // Ensure array
        const currentArr = Array.isArray(prevAnswers) ? prevAnswers : [];
        if (currentArr.includes(value)) {
          // remove if already selected
          newValue = currentArr.filter((v) => v !== value);
        } else {
          // add if not selected
          newValue = [...currentArr, value];
        }
      }

      const updatedAnswers = {
        ...prev.answers,
        [genId]: {
          ...(prev.answers[genId] || {}),
          [questionIndex]: newValue,
        },
      };

      writeJSON(ANSWERS_KEY, updatedAnswers);

      return {
        ...prev,
        answers: updatedAnswers,
      };
    });
  }

  function resetAnswers(genId) {
    setData((prev) => {
      const updatedAnswers = { ...prev.answers };
      delete updatedAnswers[genId];
      writeJSON(ANSWERS_KEY, updatedAnswers);

      return { ...prev, answers: updatedAnswers };
    });
  }

  const value = {
    data,
    setData,
    isLoading,
    setIsLoading,
    requestId,
    generateQuiz,
    wakeBackend: async () => {
      try {
        await fetch(`${API_BASE}/health`);
      } catch (e) {}
    },
    setSetupInstructions,
    resetAll,
    setAnswer,
    resetAnswers,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
};
