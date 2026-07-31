"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { TriangleAlert, X } from "lucide-react";

const ConfirmContext = createContext(null);

export default function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const close = useCallback((confirmed) => {
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
    setDialog(null);
  }, []);

  const confirm = useCallback((options) => new Promise((resolve) => {
    resolverRef.current = resolve;
    setDialog({
      title: "Konfirmo veprimin",
      description: "Ky veprim kërkon konfirmim.",
      confirmLabel: "Konfirmo",
      cancelLabel: "Anulo",
      tone: "danger",
      ...options,
    });
  }), []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {dialog ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && close(false)}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description" className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${dialog.tone === "danger" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
                <TriangleAlert className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="confirm-title" className="text-lg font-black text-slate-950">{dialog.title}</h2>
                <p id="confirm-description" className="mt-2 text-sm leading-6 text-slate-600">{dialog.description}</p>
              </div>
              <button type="button" onClick={() => close(false)} aria-label="Mbyll dialogun" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="size-5" /></button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => close(false)} className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50">{dialog.cancelLabel}</button>
              <button type="button" autoFocus onClick={() => close(true)} className={`h-11 rounded-xl px-4 text-sm font-bold text-white transition ${dialog.tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"}`}>{dialog.confirmLabel}</button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm duhet të përdoret brenda ConfirmProvider.");
  return context;
}
