"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CarFront,
  Gauge,
  Heart,
  LogOut,
  MessageSquareText,
  Settings,
  ShoppingBag,
  X,
} from "lucide-react";

import { logoutCustomerAction } from "@/app/customer/actions";

const navigationItems = [
  {
    label: "Përmbledhje",
    href: "/customer/dashboard",
    icon: Gauge,
  },
  {
    label: "Makinat e mia",
    href: "/customer/vehicles",
    icon: CarFront,
  },
  {
    label: "Kërkesat e mia",
    href: "/customer/inquiries",
    icon: MessageSquareText,
  },
  {
    label: "Favoritet",
    href: "/customer/favorites",
    icon: Heart,
  },
  {
    label: "Publikimet e mia",
    href: "/customer/listings",
    icon: ShoppingBag,
  },
  {
    label: "Profili",
    href: "/customer/profile",
    icon: Settings,
  },
];

function isNavigationItemActive(pathname, href) {
  if (href === "/customer/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function CustomerSidebar({
  open = false,
  onClose,
  userName,
  userEmail,
}) {
  const pathname = usePathname();

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Mbyll menunë"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <Link
            href="/customer/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <CarFront size={22} />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-slate-950">
                AutoFlow
              </p>

              <p className="text-xs text-slate-500">Portali i klientit</p>
            </div>
          </Link>

          <button
            type="button"
            aria-label="Mbyll menunë"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Menuja
          </p>

          <div className="space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavigationItemActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon size={19} />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 rounded-2xl bg-slate-50 p-3">
            <p className="truncate text-sm font-bold text-slate-950">
              {userName || "Klient AutoFlow"}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500">{userEmail}</p>
          </div>

          <form action={logoutCustomerAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={18} />
              Dil nga llogaria
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
