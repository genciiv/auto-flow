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
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

const sidebarGroups = [
  {
    title: "Kryesore",
    items: [
      {
        name: "Dashboard",
        icon: Home,
        href: "/dashboard",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
      {
        name: "Klientët",
        icon: Users,
        href: "/dashboard/customers",
        permission: PERMISSIONS.CUSTOMERS_VIEW,
      },
      {
        name: "Automjetet",
        icon: Car,
        href: "/dashboard/vehicles",
        permission: PERMISSIONS.VEHICLES_VIEW,
      },
    ],
  },
  {
    title: "Servisi",
    items: [
      {
        name: "Terminet",
        icon: Calendar,
        href: "/dashboard/appointments",
        permission: PERMISSIONS.APPOINTMENTS_VIEW,
      },
      {
        name: "Shërbimet",
        icon: Wrench,
        href: "/dashboard/services",
        permission: PERMISSIONS.SERVICES_VIEW,
      },
      {
        name: "Faturat",
        icon: FileText,
        href: "/dashboard/invoices",
        permission: PERMISSIONS.INVOICES_VIEW,
      },
    ],
  },
  {
    title: "Magazina",
    items: [
      {
        name: "Inventari",
        icon: Package,
        href: "/dashboard/inventory",
        permission: PERMISSIONS.INVENTORY_VIEW,
      },
      {
        name: "Porositë",
        icon: CreditCard,
        href: "/dashboard/purchases",
        permission: PERMISSIONS.PURCHASES_VIEW,
      },
    ],
  },
  {
    title: "Rritja",
    items: [
      {
        name: "Marketplace",
        icon: ShoppingCart,
        href: "/dashboard/marketplace",
        permission: PERMISSIONS.MARKETPLACE_VIEW,
      },
      {
        name: "Analytics",
        icon: BarChart3,
        href: "/dashboard/analytics",
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
    ],
  },
  {
    title: "Sistemi",
    items: [
      {
        name: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
        permission: PERMISSIONS.SETTINGS_VIEW,
      },
    ],
  },
];

export default function Sidebar({ businessRole }) {
  const pathname = usePathname();

  const visibleGroups = sidebarGroups
    .map((group) => ({
      ...group,

      items: group.items.filter((item) =>
        hasPermission(businessRole, item.permission),
      ),
    }))
    .filter((group) => group.items.length > 0);

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
        {visibleGroups.map((group) => (
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
