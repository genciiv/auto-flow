"use client";

import { useState } from "react";
import {
  ChevronDown,
  CreditCard,
  HelpCircle,
  LogOut,
  Settings,
  User,
} from "lucide-react";

const menu = [
  { title: "Profili", icon: User },
  { title: "Settings", icon: Settings },
  { title: "Billing", icon: CreditCard },
  { title: "Help", icon: HelpCircle },
  { title: "Logout", icon: LogOut },
];

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
      >
        <div className="h-9 w-9 rounded-full bg-slate-200" />

        <div className="hidden text-left sm:block">
          <p className="text-sm font-bold text-slate-950">Auto Service</p>
          <p className="text-xs text-slate-500">Owner</p>
        </div>

        <ChevronDown size={16} className="hidden text-slate-400 sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10">
          <div className="border-b border-slate-100 px-3 py-3">
            <p className="font-bold text-slate-950">Auto Service Fier</p>
            <p className="text-sm text-slate-500">owner@autoflow.al</p>
          </div>

          <div className="mt-2 space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                >
                  <Icon size={18} />
                  {item.title}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
