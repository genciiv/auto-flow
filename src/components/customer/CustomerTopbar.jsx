"use client";

import { Bell, Menu } from "lucide-react";

export default function CustomerTopbar({ userName, onOpenMenu }) {
  const displayName =
    String(userName || "Klient AutoFlow").trim() || "Klient AutoFlow";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
      <div className="flex h-20 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          aria-label="Hap menunë"
          onClick={onOpenMenu}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Portali i klientit
          </p>
          <p className="mt-1 text-sm font-bold text-slate-950">
            {displayName}
          </p>
        </div>

        <button
          type="button"
          aria-label="Njoftimet"
          className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}
