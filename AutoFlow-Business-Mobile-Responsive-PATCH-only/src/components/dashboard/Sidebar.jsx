"use client";

import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Car,
  ClipboardList,
  CreditCard,
  FileText,
  History,
  Home,
  Landmark,
  LayoutDashboard,
  Link2,
  MessagesSquare,
  Package,
  Settings,
  Sparkles,
  UserRoundCog,
  Users,
  Wrench,
  X,
  BriefcaseBusiness,
} from "lucide-react";

import SidebarGroup from "@/components/dashboard/SidebarGroup";
import WorkspaceSwitcher from "@/components/dashboard/WorkspaceSwitcher";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

const sidebarGroups = [
  {
    title: "Kryesore",
    items: [
      {
        name: "Hapësira ime",
        icon: LayoutDashboard,
        href: "/dashboard/workspace",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
      {
        name: "Paneli kryesor",
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
    title: "Operacionet",
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
    title: "Raportimi",
    items: [
      {
        name: "Financa dhe raportet",
        icon: Landmark,
        href: "/dashboard/finance",
        permission: PERMISSIONS.FINANCE_VIEW,
      },
      {
        name: "Analitika",
        icon: BarChart3,
        href: "/dashboard/analytics",
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
    ],
  },
  {
    title: "Administrimi",
    items: [
      {
        name: "Stafi",
        icon: UserRoundCog,
        href: "/dashboard/staff",
        permission: PERMISSIONS.STAFF_VIEW,
      },
      {
        name: "Regjistri i aktivitetit",
        icon: ClipboardList,
        href: "/dashboard/audit-log",
        permission: PERMISSIONS.AUDIT_VIEW,
      },
      {
        name: "Cilësimet",
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
        .filter(
          (item) =>
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
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={`af-scrollbar fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto lg:w-64 border-r border-slate-200/90 bg-white px-4 py-4 shadow-[8px_0_30px_rgba(15,23,42,0.025)] transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-2 py-1">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
              <Car size={21} strokeWidth={2.2} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-extrabold tracking-tight text-slate-950">
                AutoFlow
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Service OS
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Mbyll menunë"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mt-5">
          <WorkspaceSwitcher
            businessName={businessName}
            businessId={businessId}
            memberships={memberships}
            canAccessCustomerPortal={globalRole === "CUSTOMER"}
          />
        </div>

        <nav className="mt-6 flex-1 space-y-6">
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

        <div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-3.5">
          <div className="flex items-center gap-2 text-blue-700">
            <Sparkles size={15} />
            <p className="text-xs font-extrabold uppercase tracking-[0.12em]">
              AutoFlow
            </p>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Menaxhim i qartë për ekipin, servisin dhe financat.
          </p>
        </div>
      </aside>
    </>
  );
}
