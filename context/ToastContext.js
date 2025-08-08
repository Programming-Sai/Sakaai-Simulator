// components/ToastProvider.js
"use client";
import { createContext, useContext, useReducer } from "react";
import ToastContainer from "../components/Toast/Toast";

const ToastContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, action.payload];
    case "REMOVE":
      return state.filter((t) => t.id !== action.payload);
    default:
      return state;
  }
}

export default function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, []);
  const add = (type, message, ttl = 4000) => {
    const id = Date.now().toString(36);
    dispatch({ type: "ADD", payload: { id, type, message } });
    if (ttl) setTimeout(() => dispatch({ type: "REMOVE", payload: id }), ttl);
  };
  const remove = (id) => dispatch({ type: "REMOVE", payload: id });
  return (
    <ToastContext.Provider value={{ add, remove }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast used outside provider");
  return ctx;
};
