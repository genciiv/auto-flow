"use client";

import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  ClipboardList,
  CreditCard,
  FileBarChart,
  Home,
  Landmark,
  Settings,
  ShieldCheck,
  WalletCards,
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
        name: "Cilësimet",
        icon: Settings,
        href: "/admin/settings",
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 overflow-y-auto border-r border-slate-200 bg-white p-5 lg:block">
      <div className="mb-6 flex items-center gap-3 px-2">
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
          />
        ))}
      </nav>
    </aside>
  );
}
