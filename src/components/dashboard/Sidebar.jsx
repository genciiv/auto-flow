"use client";

import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Car,
  CreditCard,
  FileText,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Wrench,
} from "lucide-react";

import WorkspaceSwitcher from "@/components/dashboard/WorkspaceSwitcher";
import SidebarGroup from "@/components/dashboard/SidebarGroup";

const sidebarGroups = [
  {
    title: "Main",
    items: [
      { name: "Dashboard", icon: Home, href: "/dashboard" },
      { name: "Klientët", icon: Users, href: "/dashboard/customers" },
      { name: "Automjetet", icon: Car, href: "/dashboard/vehicles" },
    ],
  },
  {
    title: "Workshop",
    items: [
      { name: "Terminet", icon: Calendar, href: "/dashboard/appointments" },
      { name: "Shërbimet", icon: Wrench, href: "/dashboard/services" },
      { name: "Faturat", icon: FileText, href: "/dashboard/invoices" },
    ],
  },
  {
    title: "Inventory",
    items: [
      { name: "Magazina", icon: Package, href: "/dashboard/inventory" },
      { name: "Porositë", icon: CreditCard, href: "/dashboard/purchases" },
    ],
  },
  {
    title: "Growth",
    items: [
      {
        name: "Marketplace",
        icon: ShoppingCart,
        href: "/dashboard/marketplace",
      },
      { name: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    ],
  },
  {
    title: "System",
    items: [{ name: "Settings", icon: Settings, href: "/dashboard/settings" }],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 overflow-y-auto border-r border-slate-200 bg-white p-5 lg:block">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <Car size={23} />
        </div>

        <div>
          <p className="text-lg font-bold tracking-tight text-slate-950">
            AutoFlow
          </p>
          <p className="text-xs font-medium text-slate-500">Service OS</p>
        </div>
      </div>

      <WorkspaceSwitcher />

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
