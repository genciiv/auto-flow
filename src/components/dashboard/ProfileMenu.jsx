"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  ChevronDown,
  CreditCard,
  HelpCircle,
  LoaderCircle,
  LogOut,
  Settings,
  User,
} from "lucide-react";

const menuItems = [
  {
    title: "Profili",
    icon: User,
    href: "/dashboard/settings",
  },
  {
    title: "Cilësimet",
    icon: Settings,
    href: "/dashboard/settings",
  },
  {
    title: "Abonimi",
    icon: CreditCard,
    href: "/dashboard/settings#billing",
  },
  {
    title: "Ndihmë",
    icon: HelpCircle,
    href: "/#contact",
  },
];

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      setOpen(false);

      await signOut({
        callbackUrl: "/login",
      });
    } catch (error) {
      console.error("Gabim gjatë daljes nga llogaria:", error);
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((currentValue) => !currentValue)}
        aria-expanded={open}
        aria-label="Hap menunë e profilit"
        className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
          AS
        </div>

        <div className="hidden text-left sm:block">
          <p className="text-sm font-bold text-slate-950">Auto Service</p>

          <p className="text-xs text-slate-500">Pronar</p>
        </div>

        <ChevronDown
          size={16}
          className={`hidden text-slate-400 transition-transform sm:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Mbyll menunë"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="absolute right-0 z-50 mt-3 w-64 rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10">
            <div className="border-b border-slate-100 px-3 py-3">
              <p className="font-bold text-slate-950">Auto Service Fier</p>

              <p className="mt-1 text-sm text-slate-500">owner@autoflow.al</p>
            </div>

            <div className="mt-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <Icon size={18} />
                    {item.title}
                  </Link>
                );
              })}

              <div className="my-2 border-t border-slate-100" />

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <LogOut size={18} />
                )}

                {isLoggingOut ? "Duke dalë..." : "Dil nga llogaria"}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
