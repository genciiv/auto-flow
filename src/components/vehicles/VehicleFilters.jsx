"use client";

import { Search, SlidersHorizontal } from "lucide-react";

export default function VehicleFilters() {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-md">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Kërko targë, markë, model, pronar..."
          className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Aktivë
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <SlidersHorizontal size={17} />
          Filtra
        </button>
      </div>
    </div>
  );
}
