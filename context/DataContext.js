// contexts/DataContext.js
"use client";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "./ToastContext";

const API_BASE = "https://sakaai-simulator.onrender.com"; // adjust if needed
const MAX_QUIZZES = 10;

const REQUEST_ID_KEY = "sakaai:requestId";
const QUIZZES_KEY = "sakaai:quizzes";
const HISTORY_KEY = "sakaai:history";
const USAGE_KEY = "sakaai:usage";
const ANSWERS_KEY = "sakaai:answers";
const FB_KEY = "sakaai:feedback_conversation";
const FB_DONE_KEY = "sakaai:feedback_completed";
const CONFIG_KEY = "sakaai:config";

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

// ---------- START: usage / concurrency helpers (paste after writeJSON) ----------
/**
 * Usage object schema stored at USAGE_KEY:
 * { used: number, limit: number, lastReset: "YYYY-MM-DD" }
 */
function todayDateStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}
// ---------- START: window-anchor based usage helpers ----------

// Read config from localStorage (fallbacks)
function readConfigFromStorage() {
  try {
    const cfg = readJSON(CONFIG_KEY, null);
    return (
      cfg || {
        reset_hour: 0,
        reset_minute: 0,
        max_requests_per_day: MAX_QUIZZES,
      }
    );
  } catch (e) {
    return {
      reset_hour: 0,
      reset_minute: 0,
      max_requests_per_day: MAX_QUIZZES,
    };
  }
}

/**
 * Compute the ISO anchor string for the current window based on configured reset time.
 * Returns something stable for a window, e.g. "2025-08-19T16:20:00.000Z".
 */
function currentWindowAnchorIso() {
  const cfg = readConfigFromStorage();
  const now = new Date();

  // Use UTC/GMT anchor
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0-based
  const day = now.getUTCDate();
  const hour = Number(cfg?.reset_hour ?? 0) || 0;
  const minute = Number(cfg?.reset_minute ?? 0) || 0;

  // build today's reset anchor UTC
  let reset = new Date(Date.UTC(year, month, day, hour, minute, 0, 0));

  // if current time is strictly before today's reset, anchor belongs to yesterday
  if (now.getTime() < reset.getTime()) {
    // move to yesterday's anchor
    const yesterday = new Date(reset.getTime() - 24 * 3600 * 1000);
    reset = new Date(
      Date.UTC(
        yesterday.getUTCFullYear(),
        yesterday.getUTCMonth(),
        yesterday.getUTCDate(),
        hour,
        minute,
        0,
        0
      )
    );
  }

  return reset.toISOString(); // canonical anchor id
}

/**
 * Normalize stored usage according to window anchor.
 * storedUsage: object from localStorage (may be null)
 * defaultLimit: fallback limit if missing
 *
 * Schema persisted at USAGE_KEY:
 * { used: number, limit: number, lastReset: string (anchor ISO) }
 */
function normalizeStoredUsage(storedUsage, defaultLimit = MAX_QUIZZES) {
  const anchorIso = currentWindowAnchorIso(); // authoritative window id for client
  const raw =
    storedUsage && typeof storedUsage === "object" ? { ...storedUsage } : null;

  // base object
  const u = raw || { used: 0, limit: defaultLimit, lastReset: anchorIso };

  // make sure limit numeric
  u.limit = Number(u.limit || defaultLimit);

  // if lastReset differs from current window anchor -> new window -> reset used
  if (!u.lastReset || String(u.lastReset) !== anchorIso) {
    u.used = 0;
    u.lastReset = anchorIso;
  } else {
    u.used = Number(u.used || 0);
  }

  return u;
}

/**
 * Atomic read-modify-write helper for usage.
 * modifier receives a normalized usage object and should return the new usage object.
 * We persist the final normalized object to localStorage.
 */
function atomicModifyUsage(modifier) {
  try {
    const stored = readJSON(USAGE_KEY, null);
    const normalized = normalizeStoredUsage(stored, MAX_QUIZZES);
    const next =
      modifier && typeof modifier === "function"
        ? modifier({ ...normalized })
        : normalized;
    // normalize again (ensures lastReset anchored)
    const final = normalizeStoredUsage(next, next?.limit ?? MAX_QUIZZES);
    writeJSON(USAGE_KEY, final);
    return final;
  } catch (e) {
    console.warn("atomicModifyUsage failed", e);
    const fallback = {
      used: 0,
      limit: MAX_QUIZZES,
      lastReset: currentWindowAnchorIso(),
    };
    try {
      writeJSON(USAGE_KEY, fallback);
    } catch (_) {}
    return fallback;
  }
}

/** Convenience wrappers (use atomicModifyUsage) */
function getUsageFromStorage() {
  const stored = readJSON(USAGE_KEY, null);
  return normalizeStoredUsage(stored, MAX_QUIZZES);
}
function incrementUsageBy(n = 1) {
  return atomicModifyUsage((u) => ({
    ...u,
    used: (Number(u.used) || 0) + Number(n),
    lastReset: currentWindowAnchorIso(),
  }));
}
function decrementUsageBy(n = 1) {
  return atomicModifyUsage((u) => ({
    ...u,
    used: Math.max(0, (Number(u.used) || 0) - Number(n)),
    lastReset: u.lastReset || currentWindowAnchorIso(),
  }));
}

/**
 * Returns seconds until the next configured reset time (GMT/UTC).
 * cfg: { reset_hour: number|string, reset_minute: number|string } (may be missing)
 * nowOverride: optional Date or timestamp (ms) for testing
 *
 * Examples:
 *  secondsUntilNextResetFromConfig({reset_hour: 0, reset_minute: 5}) -> seconds until next 00:05 UTC
 */
function secondsUntilNextResetFromConfig(cfg = {}, nowOverride) {
  // Use provided "now" for determinism in tests, otherwise use current time.
  const now = nowOverride ? new Date(nowOverride) : new Date();

  // defensively parse config values
  const rawH =
    cfg && typeof cfg.reset_hour !== "undefined" ? Number(cfg.reset_hour) : NaN;
  const rawM =
    cfg && typeof cfg.reset_minute !== "undefined"
      ? Number(cfg.reset_minute)
      : NaN;

  const h = Number.isFinite(rawH) ? Math.floor(rawH) : 0;
  const m = Number.isFinite(rawM) ? Math.floor(rawM) : 0;

  // clamp to valid ranges
  const hour = Math.max(0, Math.min(23, h));
  const minute = Math.max(0, Math.min(59, m));

  // Use UTC date components
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0-based
  const day = now.getUTCDate();

  // build today's reset moment in UTC (ms since epoch)
  let resetMs = Date.UTC(year, month, day, hour, minute, 0, 0);

  // if now is already at/after today's reset, target tomorrow's reset
  if (now.getTime() >= resetMs) {
    // Date.UTC will handle day overflow correctly
    resetMs = Date.UTC(year, month, day + 1, hour, minute, 0, 0);
  }

  const diffSec = Math.floor((resetMs - now.getTime()) / 1000);
  return Math.max(0, diffSec);
}

// ---------- END: usage / concurrency helpers ----------

export function DataProvider({ children }) {
  const router = useRouter();
  const { add: toast } = useToast();
  // data store
  const [data, setData] = useState({
    quizzes: {},
    answers: {},
    feedback: {},
    history: [],
    usage: { used: 0, limit: MAX_QUIZZES, lastReset: currentWindowAnchorIso() },
    setupInstructions: null,
    results: {},
    lastRequestMeta: null,

    open: false, // whether UI is visible
    messages: [
      // { id: "m_1", role: "bot"|"user", text: "question or reply", ts: "ISO" }
    ],
    currentInput: "", // typed draft
    inFlight: false, // network sending
    lastSavedAt: null,

    config: {
      reset_hour: 0,
      reset_minute: 5,
      max_file_size: 5, // MB default
      max_number_of_questions_per_generation: 30,
      max_requests_per_day: MAX_QUIZZES,
      feedback_questions: [],
    },
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

  async function fetchAndSyncConfig() {
    try {
      const res = await fetch(`${API_BASE}/`, { method: "GET" });
      if (!res.ok) {
        // If not OK, don't throw — fallback to previously stored config
        console.warn("health check returned not ok", res.status);
        return null;
      }
      const json = await res.json();
      const cfg = json?.config || null;

      if (cfg) {
        // Normalize: ensure numeric types, arrays, and reset time (GMT)
        const normalized = {
          reset_hour: Number.isFinite(Number(cfg.reset_hour))
            ? Number(cfg.reset_hour)
            : Number(cfg.reset_hour || 0),
          reset_minute: Number.isFinite(Number(cfg.reset_minute))
            ? Number(cfg.reset_minute)
            : Number(cfg.reset_minute || 0),
          max_file_size: Number(cfg.max_file_size) || 5,
          max_number_of_questions_per_generation:
            Number(cfg.max_number_of_questions_per_generation) || 30,
          max_requests_per_day: Number(cfg.max_requests_per_day) || MAX_QUIZZES,
          feedback_questions: Array.isArray(cfg.feedback_questions)
            ? cfg.feedback_questions.slice()
            : [],
        };

        // persist to localStorage
        writeJSON(CONFIG_KEY, normalized);

        // Atomically sync usage.limit to server-provided limit
        try {
          atomicModifyUsage((u) => ({
            ...u,
            limit: Number(normalized.max_requests_per_day) || u.limit,
          }));
        } catch (e) {
          console.warn("failed to sync usage limit to config", e);
        }

        // update state with normalized config and refreshed usage
        const freshUsage = getUsageFromStorage();
        setData((prev) => {
          const nextUsage = freshUsage || prev.usage;
          return {
            ...prev,
            config: normalized,
            usage: nextUsage,
          };
        });

        return normalized;
      }
      console.log("Fetching Data: ", data?.config);
    } catch (err) {
      console.warn("fetchAndSyncConfig failed", err);
      return null;
    }
    return null;
  }

  // wake backend on provider mount (try / then fallback to base url)
  useEffect(() => {
    console.log("Waking Server!!!");
    let cancelled = false;
    async function wake() {
      try {
        await fetchAndSyncConfig();
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
      // const storedUsage = readJSON(USAGE_KEY, null);
      const storedQuizzesMap = readJSON(QUIZZES_KEY, {});
      const storedAnswers = readJSON(ANSWERS_KEY, {});
      const storedFeedback = readJSON(FB_KEY, {
        messages: [],
        currentInput: "",
        open: false,
      });
      const storedFeedbackDone = readJSON(FB_DONE_KEY, false);
      const storedConfig = readJSON(CONFIG_KEY, null);

      // dedupe storedHistory right away
      const dedupedHistory = dedupeHistoryArray(storedHistory);

      // normalize stored usage (handles daily reset)
      const normalizedUsage = normalizeStoredUsage(
        readJSON(USAGE_KEY, null),
        storedConfig?.max_requests_per_day || MAX_QUIZZES
      );
      // persist back normalized (ensures lastReset exists)
      writeJSON(USAGE_KEY, normalizedUsage);

      // if dedupe removed duplicates, persist back cleaned history
      if (dedupedHistory.length !== (storedHistory || []).length) {
        writeJSON(HISTORY_KEY, dedupedHistory);
      }

      setData((prev) => ({
        ...prev,
        answers: storedAnswers || prev.answers,
        history: dedupedHistory || prev.history,
        usage: normalizedUsage ||
          prev.usage || {
            used: 0,
            limit: storedConfig?.max_requests_per_day || MAX_QUIZZES,
          },
        quizzes: Object.keys(prev.quizzes || {}).length
          ? prev.quizzes
          : storedQuizzesMap,
        results: prev.results || {},
        messages: storedFeedback.messages || prev.messages,
        currentInput: storedFeedback.currentInput || prev.currentInput,
        open: !!storedFeedback.open || prev.open,
        feedbackDone: storedFeedbackDone || false,
        config: storedConfig || prev.config,
      }));
    } catch (e) {
      console.warn("DataProvider init error", e);
    }
  }, []);

  useEffect(() => {
    const alreadyDone = readJSON(FB_DONE_KEY, false);

    if (!alreadyDone && data?.usage?.used >= 2) {
      // Give them ~2 seconds to finish what they were doing
      const timer = setTimeout(() => {
        router.push("/feedback");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [data?.usage?.used, router]);

  useEffect(() => {
    function onStorage(e) {
      if (!e.key) return;
      if (e.key === USAGE_KEY) {
        setData((prev) => ({
          ...prev,
          usage: normalizeStoredUsage(
            readJSON(USAGE_KEY, null),
            prev?.config?.max_requests_per_day || MAX_QUIZZES
          ),
        }));
      }
      if (e.key === HISTORY_KEY) {
        setData((prev) => ({
          ...prev,
          history: dedupeHistoryArray(readJSON(HISTORY_KEY, [])),
        }));
      }
      if (e.key === QUIZZES_KEY) {
        setData((prev) => ({ ...prev, quizzes: readJSON(QUIZZES_KEY, {}) }));
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // schedule client-side normalization at next configured reset (GMT)
  useEffect(() => {
    let timer = null;
    function schedule() {
      try {
        const cfg = data?.config || {};
        // compute seconds to next reset (helper re-used from earlier suggestions)
        const seconds = secondsUntilNextResetFromConfig(cfg); // implement helper as earlier recommended
        if (!seconds || seconds <= 0) return;
        timer = setTimeout(() => {
          const normalizedUsage = normalizeStoredUsage(
            readJSON(USAGE_KEY, null),
            data?.config?.max_requests_per_day || MAX_QUIZZES
          );
          writeJSON(USAGE_KEY, normalizedUsage);
          setData((prev) => ({ ...prev, usage: normalizedUsage }));
          // reschedule for the next day
          schedule();
        }, seconds * 1000 + 50);
      } catch (e) {
        // ignore
      }
    }
    schedule();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [
    data?.config?.reset_hour,
    data?.config?.reset_minute,
    data?.usage?.lastReset,
  ]);

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

    // Build the results/meta object we will merge into state
    const incomingResultEntry = {
      meta: {
        model_used: responseJson.model_used,
        inference_time: responseJson.inference_time,
        question_count: responseJson.question_count,
        token_usage: responseJson.token_usage,
        attempt_number: responseJson.attempt_number,
      },
      quizzes,
    };

    // ---- Persist to localStorage first (decide whether to increment usage) ----
    let persistedUsage = null;
    try {
      // read current persisted maps
      const quizzesMap = readJSON(QUIZZES_KEY, {});
      const storedHistory = readJSON(HISTORY_KEY, []);

      const alreadyInQuizzesMap = !!quizzesMap[genId];
      const alreadyInStoredHistory = storedHistory.some(
        (h) => h.generationId === genId
      );

      // persist quizzes if missing
      if (!alreadyInQuizzesMap) {
        quizzesMap[genId] = quizzes;
        writeJSON(QUIZZES_KEY, quizzesMap);
      }

      // persist history if missing
      if (!alreadyInStoredHistory) {
        const newStoredHistory = [historyItem, ...storedHistory].slice(0, 200);
        writeJSON(HISTORY_KEY, dedupeHistoryArray(newStoredHistory));
      }

      // increment usage *only if* this generation is new (not stored already)
      if (!alreadyInQuizzesMap && !alreadyInStoredHistory) {
        // atomic helper will read->normalize->write and return the new usage object
        persistedUsage = incrementUsageBy(1);
      } else {
        // read-normalize current usage and persist (in case normalization resets day)
        persistedUsage = getUsageFromStorage();
        writeJSON(USAGE_KEY, persistedUsage);
      }
    } catch (e) {
      console.warn("persist pushResponseToData failed", e);
      // fallback: at least attempt to read whatever is in storage now
      try {
        persistedUsage = getUsageFromStorage();
      } catch (_) {
        persistedUsage = {
          used: 0,
          limit: MAX_QUIZZES,
          lastReset: new Date().toISOString().slice(0, 10),
        };
      }
    }

    // ---- Now update in-memory React state using persistedUsage (authoritative cache) ----
    setData((prev) => {
      const alreadyInResults = !!(prev.results && prev.results[genId]);

      // Build next results map (idempotent)
      const nextResults = {
        ...(prev.results || {}),
        [genId]: incomingResultEntry,
      };

      // Only add to history if not already present in-memory
      const alreadyInMemoryHistory = (prev.history || []).some(
        (h) => h.generationId === genId
      );
      const nextHistory = alreadyInMemoryHistory
        ? prev.history
        : [historyItem, ...(prev.history || [])].slice(0, 200);

      // Merge quizzes into in-memory map
      const nextQuizzesMap = { ...(prev.quizzes || {}) };
      nextQuizzesMap[genId] = quizzes;

      return {
        ...prev,
        quizzes: nextQuizzesMap,
        results: nextResults,
        history: nextHistory,
        // use the usage object we persisted above (guarantees UI reflects storage)
        usage: persistedUsage || getUsageFromStorage(),
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
    const storedUsage = getUsageFromStorage();
    const effectiveLimit =
      data?.config?.max_requests_per_day ?? storedUsage.limit ?? MAX_QUIZZES;
    const remaining = effectiveLimit - (storedUsage.used ?? 0);
    // if (remaining <= 0) {
    //   return {
    //     ok: false,
    //     error: new Error("Usage limit reached"),
    //     status: 429,
    //   };
    // }

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
        const json = await res.json();
        const retryAfter = json?.retry_after;
        const seconds = parseInt(retryAfter, 10);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const formatted = `${hours}h ${minutes}m`;
        toast(
          "error",
          `Server error ${res.status}: ${json?.detail} in ${formatted}`,
          5500
        );
        return {
          ok: false,
          error: `Server error ${res.status}: ${json}`,
          status: res.status,
        };

        // throw new Error(`Server error ${res.status}: ${text}`);
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
      toast("error", err, 5500);
      return { ok: false, error: err, status: res.status };
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
      usage: {
        used: 0,
        limit: data?.config?.max_requests_per_day || MAX_QUIZZES,
        lastReset: currentWindowAnchorIso(),
      },
      setupInstructions: null,
      results: {},
      lastRequestMeta: null,
    });
    try {
      const freshUsage = {
        used: 0,
        limit: data?.config?.max_requests_per_day || MAX_QUIZZES,
        lastReset: currentWindowAnchorIso(),
      };
      writeJSON(USAGE_KEY, freshUsage);
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

  function deleteGeneration(genId) {
    setData((prev) => {
      const nextResults = { ...(prev.results || {}) };
      const nextQuizzes = { ...(prev.quizzes || {}) };
      const nextAnswers = { ...(prev.answers || {}) };
      const nextHistory = (prev.history || []).filter(
        (h) => h.generationId !== genId
      );

      // remove in-memory
      delete nextResults[genId];
      delete nextQuizzes[genId];
      delete nextAnswers[genId];

      // persist changes to localStorage (but DO NOT modify usage here)
      try {
        const quizzesMap = readJSON(QUIZZES_KEY, {});
        delete quizzesMap[genId];
        writeJSON(QUIZZES_KEY, quizzesMap);

        const storedHistory = readJSON(HISTORY_KEY, []).filter(
          (h) => h.generationId !== genId
        );
        writeJSON(HISTORY_KEY, dedupeHistoryArray(storedHistory));

        const answersMap = readJSON(ANSWERS_KEY, {});
        delete answersMap[genId];
        writeJSON(ANSWERS_KEY, answersMap);

        // NOTE: we intentionally DO NOT change USAGE_KEY here.
        // Usage is authoritative from the server and only updated when
        // a server generation succeeds (pushResponseToData).
      } catch (e) {
        console.warn("deleteGeneration failed", e);
        return prev;
      }

      return {
        ...prev,
        results: nextResults,
        quizzes: nextQuizzes,
        answers: nextAnswers,
        history: nextHistory,
        // keep usage unchanged in-memory as well (reflect stored usage)
        usage: prev.usage,
      };
    });
  }

  // Duplicate a generation: copy quizzes, results and add a new history item
  function duplicateGeneration(genId) {
    setData((prev) => {
      const sourceQuizzes =
        (prev.quizzes || {})[genId] || prev.results?.[genId]?.quizzes || [];
      if (!sourceQuizzes || !sourceQuizzes.length) return prev;

      const newGenId = makeGenId();
      const now = new Date().toISOString();

      const newHistoryItem = {
        generationId: newGenId,
        requestId, // keep same requestId (state var)
        topic: `Copy of ${
          prev.history.find((h) => h.generationId === genId)?.topic || "quiz"
        }`,
        preview: (sourceQuizzes[0]?.question || "").slice(0, 120),
        question_count: sourceQuizzes.length,
        createdAt: now,
        model_used: prev.results?.[genId]?.meta?.model_used || null,
      };

      const nextQuizzes = {
        ...(prev.quizzes || {}),
        [newGenId]: sourceQuizzes,
      };
      const nextResults = {
        ...(prev.results || {}),
        [newGenId]: {
          meta: prev.results?.[genId]?.meta || null,
          quizzes: sourceQuizzes,
        },
      };
      const nextHistory = [newHistoryItem, ...(prev.history || [])].slice(
        0,
        200
      );

      // persist local copies (but DO NOT touch usage)
      try {
        const quizzesMap = readJSON(QUIZZES_KEY, {});
        quizzesMap[newGenId] = sourceQuizzes;
        writeJSON(QUIZZES_KEY, quizzesMap);

        const storedHistory = readJSON(HISTORY_KEY, []);
        writeJSON(
          HISTORY_KEY,
          dedupeHistoryArray([newHistoryItem, ...storedHistory]).slice(0, 200)
        );

        // DO NOT change USAGE_KEY: duplication is local only
      } catch (e) {
        console.warn("duplicateGeneration persist failed", e);
      }

      return {
        ...prev,
        quizzes: nextQuizzes,
        results: nextResults,
        history: nextHistory,
        // keep usage unchanged
        usage: prev.usage,
      };
    });
  }

  // Prepare export object for a generation (returns an object); caller can JSON.stringify or download
  function getExportData(genId) {
    const quizzesMap = readJSON(QUIZZES_KEY, {});
    const storedHistory = readJSON(HISTORY_KEY, []);
    const answersMap = readJSON(ANSWERS_KEY, {});
    const hist = storedHistory.find((h) => h.generationId === genId) || null;
    const quizzes = quizzesMap[genId] || [];
    const exportObj = {
      generationId: genId,
      history: hist,
      quizzes,
      answers: answersMap[genId] || {},
      exportedAt: new Date().toISOString(),
    };
    return exportObj;
  }

  // Trigger download for a generation (client-side)
  function downloadGeneration(genId, filename) {
    const data = getExportData(genId);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `sakaai-quiz-${genId}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Update the history item metadata (rename/annotate)
  function updateHistoryItem(genId, updates = {}) {
    setData((prev) => {
      const nextHistory = (prev.history || []).map((h) =>
        h.generationId === genId ? { ...h, ...updates } : h
      );

      // persist
      try {
        writeJSON(HISTORY_KEY, dedupeHistoryArray(nextHistory));
      } catch (e) {
        console.warn("updateHistoryItem failed persist", e);
      }

      return {
        ...prev,
        history: nextHistory,
      };
    });
  }

  // Clear all history (with wipe of quizzes and answers) — use with caution
  function clearAllHistory() {
    setData((prev) => {
      try {
        writeJSON(HISTORY_KEY, []);
        writeJSON(QUIZZES_KEY, {});
        writeJSON(ANSWERS_KEY, {});
        writeJSON(USAGE_KEY, {
          used: 0,
          limit: data?.config?.max_requests_per_day || MAX_QUIZZES,
          lastReset: currentWindowAnchorIso(),
        });
      } catch (e) {
        console.warn("clearAllHistory persist failed", e);
      }
      return {
        ...prev,
        history: [],
        quizzes: {},
        answers: {},
        results: {},
        usage: {
          used: 0,
          limit: data?.config?.max_requests_per_day || MAX_QUIZZES,
        },
      };
    });
  }

  // helper: persist feedback draft
  function persistFeedbackDraft(
    messages = [],
    currentInput = "",
    open = false
  ) {
    try {
      writeJSON(FB_KEY, { messages, currentInput, open });
    } catch (e) {
      console.warn("persistFeedbackDraft failed", e);
    }
  }

  function setFeedbackDoneFlag(done = true) {
    try {
      writeJSON(FB_DONE_KEY, !!done);
    } catch (e) {
      console.warn("setFeedbackDoneFlag failed", e);
    }
  }

  // open/close feedback UI (modal)
  function openFeedback() {
    setData((prev) => {
      persistFeedbackDraft(prev.messages || [], prev.currentInput || "", true);
      return { ...prev, open: true };
    });
  }
  function closeFeedback() {
    setData((prev) => {
      persistFeedbackDraft(prev.messages || [], prev.currentInput || "", false);
      return { ...prev, open: false };
    });
  }

  // add a message to feedback conversation (role = 'user' | 'bot')
  function addFeedbackMessage(role, text) {
    if (!text && text !== "") return;
    const id =
      "m_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 8);
    const msg = { id, role, text: String(text), ts: new Date().toISOString() };
    setData((prev) => {
      const nextMessages = [...(prev.messages || []), msg];
      persistFeedbackDraft(nextMessages, "", prev.open || false);
      return { ...prev, messages: nextMessages, currentInput: "" };
    });
  }

  // set the draft value (input field)
  function setFeedbackInput(text) {
    setData((prev) => {
      persistFeedbackDraft(
        prev.messages || [],
        String(text || ""),
        prev.open || false
      );
      return { ...prev, currentInput: String(text || "") };
    });
  }

  // mark feedback done locally (no server call)
  function markFeedbackDoneOnClient() {
    setFeedbackDoneFlag(true);
    setData((prev) => ({ ...prev, feedbackDone: true }));
  }

  // submit feedback to backend
  async function submitFeedback({
    padTo = 0,
    maxRetries = 3,
    initialDelayMs = 800,
    clear = false,
  } = {}) {
    // derive answers from latest persisted draft (keeps behaviour you already had)
    const draft = readJSON(FB_KEY, { messages: [], currentInput: "" });
    const messagesSnapshot = draft.messages || [];
    const answers = messagesSnapshot
      .filter((m) => m.role === "user")
      .map((m) => String(m.text || ""));

    // optional padding
    while (answers.length < padTo) answers.push("");

    const body = { requestId, answers };

    // mark in-flight UI state
    setData((prev) => ({ ...prev, inFlight: true }));

    // helper sleep
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

    let attempt = 0;
    let lastErr = null;

    while (attempt < maxRetries) {
      attempt += 1;
      try {
        const res = await fetch(`${API_BASE}/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          // try to parse JSON response (but don't throw if parse fails)
          let json = null;
          try {
            json = await res.json();
          } catch (e) {
            json = { message: "ok" };
          }

          // success => mark done (persist flag)
          setFeedbackDoneFlag(true); // persists FB_DONE_KEY

          // If clear requested: clear persisted draft and clear in-memory conversation & close UI
          if (clear) {
            persistFeedbackDraft([], "", false);
            setData((prev) => ({
              ...prev,
              messages: [],
              currentInput: "",
              open: false,
              inFlight: false,
              lastSavedAt: new Date().toISOString(),
              feedbackDone: true,
              feedbackResponseMeta: json,
            }));
          } else {
            // If not clearing: keep messages/draft as-is, but update meta / flags
            setData((prev) => ({
              ...prev,
              inFlight: false,
              lastSavedAt: new Date().toISOString(),
              feedbackDone: true,
              feedbackResponseMeta: json,
            }));
            // NOTE: we *don't* call persistFeedbackDraft([], "", false) so draft stays in localStorage
          }

          return { ok: true, json };
        } else {
          // Non-2xx response — treat as failure to retry
          const txt = await res.text().catch(() => "");
          lastErr = new Error(`Feedback server error ${res.status}: ${txt}`);
        }
      } catch (err) {
        lastErr = err;
      }

      // retry/backoff if we have attempts left
      if (attempt < maxRetries) {
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }

    // final failure after retries: keep draft persisted and update state
    console.error("submitFeedback final failure:", lastErr);

    // ensure inFlight toggled off
    setData((prev) => ({ ...prev, inFlight: false }));

    // do not clear local draft — allow later retries
    return { ok: false, error: lastErr };
  }

  // Expose these in value object (add to the 'value' returned by provider)

  const value = {
    data,
    setData,
    isLoading,
    setIsLoading,
    requestId,
    generateQuiz,
    wakeBackend: async () => {
      try {
        await fetchAndSyncConfig();
      } catch (e) {}
    },
    setSetupInstructions,
    resetAll,
    setAnswer,
    resetAnswers,

    deleteGeneration,
    duplicateGeneration,
    getExportData,
    downloadGeneration,
    updateHistoryItem,
    clearAllHistory,

    openFeedback,
    closeFeedback,
    addFeedbackMessage,
    setFeedbackInput,
    submitFeedback,
    markFeedbackDoneOnClient,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
};
