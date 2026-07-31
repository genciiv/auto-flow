"use client";

import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  ClipboardList,
  CreditCard,
  FileBarChart,
  History,
  Home,
  Landmark,
  Settings,
  ShieldCheck,
  WalletCards,
  X,
} from "lucide-react";

import SidebarGroup from "@/components/dashboard/SidebarGroup";

const sidebarGroups = [
  {
    title: "KRYESORE",
    items: [
      {
        name: "Dashboard",
        icon: Home,
        href: "/admin",
      },
      {
        name: "Bizneset",
        icon: Building2,
        href: "/admin/businesses",
      },
      {
        name: "Aplikimet",
        icon: ClipboardList,
        href: "/admin/applications",
      },
    ],
  },
  {
    title: "FINANCA",
    items: [
      {
        name: "Planet",
        icon: WalletCards,
        href: "/admin/plans",
      },
      {
        name: "Abonimet",
        icon: CreditCard,
        href: "/admin/subscriptions",
      },
      {
        name: "Pagesat",
        icon: Landmark,
        href: "/admin/payments",
      },
    ],
  },
  {
    title: "ANALITIKA",
    items: [
      {
        name: "Raportet",
        icon: FileBarChart,
        href: "/admin/reports",
      },
      {
        name: "Analitika",
        icon: BarChart3,
        href: "/admin/analytics",
      },
    ],
  },
  {
    title: "SISTEMI",
    items: [
      {
        name: "Aktiviteti",
        icon: History,
        href: "/admin/activity-logs",
      },
      {
        name: "Cilësimet",
        icon: Settings,
        href: "/admin/settings",
      },
    ],
  },
];

export default function AdminSidebar({ open = false, onClose }) {
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
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-slate-200 bg-white p-5 transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <div className="mb-6 flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <ShieldCheck size={23} />
        </div>

        <div>
          <p className="text-lg font-bold tracking-tight text-slate-950">
            AutoFlow
          </p>

          <p className="text-xs font-medium text-slate-500">Platform Admin</p>
        </div>
        </div>

        <button
          type="button"
          aria-label="Mbyll menunë"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <ShieldCheck size={19} />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-950">Administrimi</p>

            <p className="text-xs text-slate-500">Kontrolli i platformës</p>
          </div>
        </div>
      </div>

      <nav className="mt-8 space-y-7">
        {sidebarGroups.map((group) => (
          <SidebarGroup
            key={group.title}
            title={group.title}
            items={group.items}
            pathname={pathname}
            onNavigate={onClose}
          />
        ))}
      </nav>
      </aside>
    </>
  );
}
