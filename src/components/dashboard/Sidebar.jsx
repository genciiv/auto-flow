import {
  BarChart3,
  Calendar,
  Car,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Wrench,
} from "lucide-react";

const menu = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Klientët", icon: Users, href: "/dashboard/customers" },
  { name: "Automjetet", icon: Car, href: "/dashboard/vehicles" },
  { name: "Shërbimet", icon: Wrench, href: "/dashboard/services" },
  { name: "Terminet", icon: Calendar, href: "/dashboard/appointments" },
  { name: "Magazina", icon: Package, href: "/dashboard/inventory" },
  { name: "Marketplace", icon: ShoppingCart, href: "/dashboard/marketplace" },
  { name: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white p-5 lg:block">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <Car size={23} />
        </div>

        <div>
          <p className="text-lg font-bold tracking-tight">AutoFlow</p>
          <p className="text-xs font-medium text-slate-500">Service OS</p>
        </div>
      </div>

      <nav className="mt-10 space-y-1">
        {menu.map((item, index) => {
          const Icon = item.icon;
          const active = index === 0;

          return (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <Icon size={19} />
              {item.name}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
