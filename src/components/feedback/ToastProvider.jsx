"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const variants = {
  success: { icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  error: { icon: CircleAlert, className: "border-red-200 bg-red-50 text-red-900" },
  info: { icon: Info, className: "border-blue-200 bg-blue-50 text-blue-900" },
};

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(({ title, message, variant = "info", duration = 4500 }) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, title, message, variant }]);
    const timer = setTimeout(() => dismiss(id), duration);
    timers.current.set(id, timer);
    return id;
  }, [dismiss]);

  const value = useMemo(() => ({
    showToast,
    success: (message, title = "Veprimi u krye") => showToast({ title, message, variant: "success" }),
    error: (message, title = "Veprimi dështoi") => showToast({ title, message, variant: "error", duration: 6000 }),
    info: (message, title = "Njoftim") => showToast({ title, message, variant: "info" }),
    dismiss,
  }), [dismiss, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => {
          const config = variants[toast.variant] || variants.info;
          const Icon = config.icon;
          return (
            <div key={toast.id} role={toast.variant === "error" ? "alert" : "status"} className={`pointer-events-auto rounded-2xl border p-4 shadow-lg ${config.className}`}>
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  {toast.title ? <p className="text-sm font-bold">{toast.title}</p> : null}
                  {toast.message ? <p className="mt-1 text-sm leading-5 opacity-90">{toast.message}</p> : null}
                </div>
                <button type="button" onClick={() => dismiss(toast.id)} aria-label="Mbyll njoftimin" className="rounded-lg p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100">
                  <X className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast duhet të përdoret brenda ToastProvider.");
  return context;
}
