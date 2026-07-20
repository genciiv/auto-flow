"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  ChevronDown,
  LoaderCircle,
  LogOut,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";

export default function AdminProfileMenu({
  name = "AutoFlow Admin",
  email = "admin@autoflow.al",
}) {
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
      console.error("Gabim gjatë daljes:", error);
      setIsLoggingOut(false);
    }
  }

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((currentValue) => !currentValue)}
        aria-expanded={open}
        className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {initials}
        </div>

        <div className="hidden text-left sm:block">
          <p className="text-sm font-bold text-slate-950">{name}</p>

          <p className="text-xs text-slate-500">Administrator</p>
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

          <div className="absolute right-0 z-50 mt-3 w-72 rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10">
            <div className="border-b border-slate-100 px-3 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <ShieldCheck size={21} />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-950">{name}</p>

                  <p className="truncate text-sm text-slate-500">{email}</p>
                </div>
              </div>
            </div>

            <div className="mt-2 space-y-1">
              <Link
                href="/admin/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <User size={18} />
                Profili
              </Link>

              <Link
                href="/admin/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <Settings size={18} />
                Cilësimet
              </Link>

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
