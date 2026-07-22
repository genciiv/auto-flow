"use client";

import Link from "next/link";

import { Bell, Heart, Menu, Search, ShoppingBag } from "lucide-react";

export default function CustomerTopbar({
  userName,
  favoriteCount = 0,
  onOpenMenu,
}) {
  const firstName =
    String(userName || "Klient")
      .trim()
      .split(" ")[0] || "Klient";

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

        <div className="hidden md:block">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Portali i klientit
          </p>

          <p className="mt-1 text-sm font-bold text-slate-950">
            Mirë se erdhe, {firstName}
          </p>
        </div>

        <Link
          href="/marketplace"
          className="ml-auto hidden h-11 min-w-0 items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:flex sm:w-64 lg:w-80"
        >
          <Search size={17} className="shrink-0" />

          <span className="truncate">Kërko në Marketplace</span>
        </Link>

        <Link
          href="/customer/listings"
          aria-label="Publikimet e mia"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <ShoppingBag size={18} />
        </Link>

        <Link
          href="/customer/favorites"
          aria-label="Favoritet"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <Heart size={18} />

          {favoriteCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white ring-2 ring-white">
              {favoriteCount > 99 ? "99+" : favoriteCount}
            </span>
          ) : null}
        </Link>

        <button
          type="button"
          aria-label="Njoftimet"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}
