"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Package,
  Calendar,
  AlertTriangle,
} from "lucide-react";

const notifications = [
  {
    title: "BMW X5 u përfundua",
    text: "Shërbimi është gati për dorëzim.",
    icon: CheckCircle2,
  },
  {
    title: "Stok i ulët",
    text: "Filtri vajit ka mbetur 4 copë.",
    icon: Package,
  },
  { title: "Termin i ri", text: "Audi A4 rezervoi për 11:00.", icon: Calendar },
  {
    title: "Kujdes",
    text: "Mercedes C220 ka faturë të papaguar.",
    icon: AlertTriangle,
  },
];

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      >
        <Bell size={18} />
        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10">
          <div className="px-3 py-2">
            <p className="font-bold text-slate-950">Njoftimet</p>
            <p className="text-xs text-slate-500">Aktivitetet më të fundit</p>
          </div>

          <div className="mt-2 space-y-1">
            {notifications.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  className="flex w-full gap-3 rounded-2xl p-3 text-left hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {item.text}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
