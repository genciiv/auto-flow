"use client";

import { Building2, ChevronDown } from "lucide-react";

export default function WorkspaceSwitcher({ businessName }) {
  const displayedBusinessName = businessName?.trim() || "Biznesi im";

  return (
    <button
      type="button"
      aria-label="Workspace aktiv"
      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:bg-slate-100"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
        <Building2 size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-950">
          {displayedBusinessName}
        </p>

        <p className="mt-0.5 text-xs font-medium text-slate-500">
          Workspace aktiv
        </p>
      </div>

      <ChevronDown size={16} className="shrink-0 text-slate-400" />
    </button>
  );
}
