"use client";

import { useEffect, useState } from "react";
import { Search, X, Car, Users, FileText, Package } from "lucide-react";

const results = [
  {
    type: "Klient",
    title: "Arben Hoxha",
    subtitle: "BMW X5 • AA123BB",
    icon: Users,
  },
  {
    type: "Automjet",
    title: "Volkswagen Golf 7",
    subtitle: "AB456CD • Servisi i fundit 12/06",
    icon: Car,
  },
  {
    type: "Faturë",
    title: "Fatura #1024",
    subtitle: "€240 • Paguar",
    icon: FileText,
  },
  {
    type: "Pjesë",
    title: "Filtri vajit MANN",
    subtitle: "4 copë në stok",
    icon: Package,
  },
];

export default function SearchCommand() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }

      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden w-full max-w-md items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 hover:bg-white lg:flex"
      >
        <span className="flex items-center gap-3">
          <Search size={18} className="text-slate-400" />
          Kërko klient, automjet, faturë...
        </span>

        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold text-slate-400">
          Ctrl K
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-24 max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
              <Search size={20} className="text-slate-400" />
              <input
                autoFocus
                placeholder="Kërko në AutoFlow..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3">
              {results.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    className="flex w-full items-center gap-4 rounded-2xl p-4 text-left hover:bg-slate-50"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Icon size={20} />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-950">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.subtitle}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                      {item.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
