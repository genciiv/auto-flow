import { Bell, Search } from "lucide-react";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between px-6">
        <div className="hidden w-full max-w-md items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 lg:flex">
          <Search size={18} className="text-slate-400" />
          <input
            placeholder="Kërko klient, automjet, faturë..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
            <Bell size={18} />
          </button>

          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2">
            <div className="h-9 w-9 rounded-full bg-slate-200" />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-950">Auto Service</p>
              <p className="text-xs text-slate-500">Owner</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
