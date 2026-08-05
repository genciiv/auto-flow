"use client";

import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Car,
  ClipboardList,
  CreditCard,
  FileText,
  Landmark,
  Home,
  Link2,
  MessagesSquare,
  BriefcaseBusiness,
  LayoutDashboard,
  History,
  Package,
  Settings,
  Users,
  UserRoundCog,
  Wrench,
  X,
} from "lucide-react";

import SidebarGroup from "@/components/dashboard/SidebarGroup";
import WorkspaceSwitcher from "@/components/dashboard/WorkspaceSwitcher";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

const sidebarGroups = [
  {
    title: "Kryesore",
    items: [
      {
        name: "Workspace im",
        icon: LayoutDashboard,
        href: "/dashboard/workspace",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
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
        name: "Punët e mia",
        icon: BriefcaseBusiness,
        href: "/dashboard/my-work",
        permission: PERMISSIONS.SERVICES_VIEW,
        roles: ["OWNER", "MANAGER", "MECHANIC"],
      },
      {
        name: "Faturat",
        icon: FileText,
        href: "/dashboard/invoices",
        permission: PERMISSIONS.INVOICES_VIEW,
      },
      {
        name: "Mesazhet",
        icon: MessagesSquare,
        href: "/dashboard/messages",
        permission: PERMISSIONS.MESSAGES_VIEW,
      },
      {
        name: "Kërkesat për lidhje",
        icon: Link2,
        href: "/dashboard/vehicle-claims",
        permission: PERMISSIONS.VEHICLES_VIEW,
        badgeKey: "vehicleClaimPendingCount",
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
        name: "Lëvizjet e stokut",
        icon: History,
        href: "/dashboard/inventory/movements",
        permission: PERMISSIONS.INVENTORY_VIEW,
        roles: ["OWNER", "MANAGER", "WAREHOUSE"],
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
        name: "Financa & Raporte",
        icon: Landmark,
        href: "/dashboard/finance",
        permission: PERMISSIONS.FINANCE_VIEW,
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
        name: "Stafi",
        icon: UserRoundCog,
        href: "/dashboard/staff",
        permission: PERMISSIONS.STAFF_VIEW,
      },
      {
        name: "Audit Log",
        icon: ClipboardList,
        href: "/dashboard/audit-log",
        permission: PERMISSIONS.AUDIT_VIEW,
      },
      {
        name: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
        permission: PERMISSIONS.SETTINGS_VIEW,
      },
    ],
  },
];

export default function Sidebar({
  open = false,
  onClose,
  businessRole,
  businessName,
  businessId,
  memberships = [],
  globalRole,
  badgeCounts = {},
}) {
  const pathname = usePathname();

  const visibleGroups = sidebarGroups
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) =>
          hasPermission(businessRole, item.permission) &&
          (!item.roles || item.roles.includes(businessRole)),
        )
        .map((item) => ({
          ...item,
          badge: item.badgeKey ? Number(badgeCounts[item.badgeKey] || 0) : 0,
        })),
    }))
    .filter((group) => group.items.length > 0);

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
          <Car size={23} />
        </div>

        <div>
          <p className="text-lg font-bold tracking-tight text-slate-950">
            AutoFlow
          </p>

          <p className="text-xs font-medium text-slate-500">Service OS</p>
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

      <WorkspaceSwitcher
        businessName={businessName}
        businessId={businessId}
        memberships={memberships}
        canAccessCustomerPortal={globalRole === "CUSTOMER"}
      />

      <nav className="mt-8 space-y-7">
        {visibleGroups.map((group) => (
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
