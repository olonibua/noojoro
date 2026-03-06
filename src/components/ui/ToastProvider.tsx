"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  exiting?: boolean;
}

type Action =
  | { type: "ADD"; toast: Toast }
  | { type: "MARK_EXITING"; id: string }
  | { type: "REMOVE"; id: string };

const MAX_TOASTS = 5;

function reducer(state: Toast[], action: Action): Toast[] {
  switch (action.type) {
    case "ADD": {
      const next = [...state, action.toast];
      if (next.length > MAX_TOASTS) {
        return [{ ...next[0], exiting: true }, ...next.slice(1)];
      }
      return next;
    }
    case "MARK_EXITING":
      return state.map((t) => (t.id === action.id ? { ...t, exiting: true } : t));
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

export const ToastContext = createContext<ToastContextValue>({
  success: () => {},
  error: () => {},
  info: () => {},
});

let toastId = 0;

const AUTO_DISMISS: Record<ToastType, number> = {
  success: 4000,
  info: 4000,
  error: 6000,
};

const icons: Record<ToastType, ReactNode> = {
  success: (
    <svg className="h-5 w-5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const typeStyles: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, []);
  const [mounted, setMounted] = useState(false);
  const timers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    setMounted(true);
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    dispatch({ type: "MARK_EXITING", id });
    setTimeout(() => {
      dispatch({ type: "REMOVE", id });
      const timer = timers.current.get(id);
      if (timer) {
        clearTimeout(timer);
        timers.current.delete(id);
      }
    }, 300);
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = `toast-${++toastId}`;
      dispatch({ type: "ADD", toast: { id, type, message } });
      const timer = setTimeout(() => dismiss(id), AUTO_DISMISS[type]);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  const ctx: ToastContextValue = {
    success: useCallback((msg: string) => addToast("success", msg), [addToast]),
    error: useCallback((msg: string) => addToast("error", msg), [addToast]),
    info: useCallback((msg: string) => addToast("info", msg), [addToast]),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {mounted &&
        createPortal(
          <div
            aria-live="polite"
            className="fixed top-4 left-1/2 z-[70] flex -translate-x-1/2 flex-col items-center gap-2"
          >
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${
                  typeStyles[t.type]
                } ${t.exiting ? "animate-toast-out" : "animate-toast-in"}`}
              >
                {icons[t.type]}
                <span className="text-sm font-medium">{t.message}</span>
                <button
                  onClick={() => dismiss(t.id)}
                  className="ml-1 shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
