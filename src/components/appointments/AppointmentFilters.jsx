import { Search, SlidersHorizontal } from "lucide-react";

export default function AppointmentFilters() {
  return (
    <div className="flex flex-col gap-3 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex w-full items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 md:max-w-md">
        <Search size={18} className="text-slate-400" />
        <input
          placeholder="Kërko klient, targë, shërbim..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="flex gap-3">
        <button className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Sot
        </button>

        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <SlidersHorizontal size={17} />
          Filtra
        </button>
      </div>
    </div>
  );
}
