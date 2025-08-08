// lib/appContext.js
"use client";
import React, { createContext, useContext, useEffect, useReducer } from "react";

const STORAGE = "sakaai:appstate";

const initial = {
  quizzes: [], // { id, title, createdAt, questions: [...] }
  activeId: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOAD":
      return { ...state, ...action.payload };
    case "ADD_QUIZ":
      return { ...state, quizzes: [action.payload, ...state.quizzes] };
    case "SET_ACTIVE":
      return { ...state, activeId: action.payload };
    case "UPDATE_QUIZ":
      return {
        ...state,
        quizzes: state.quizzes.map((q) =>
          q.id === action.payload.id ? action.payload : q
        ),
      };
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) dispatch({ type: "LOAD", payload: JSON.parse(raw) });
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(state));
    } catch (e) {}
  }, [state]);

  const api = {
    state,
    addQuiz: (quiz) => dispatch({ type: "ADD_QUIZ", payload: quiz }),
    setActive: (id) => dispatch({ type: "SET_ACTIVE", payload: id }),
    updateQuiz: (quiz) => dispatch({ type: "UPDATE_QUIZ", payload: quiz }),
  };

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
