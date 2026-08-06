import { Banknote, Car, UserCheck, Users } from "lucide-react";

import { formatCurrency } from "@/lib/formatters";

export default function CustomerStats({ stats }) {
  const items = [
    {
      title: "Total klientë",
      value: stats.totalCustomers,
      icon: Users,
    },
    {
      title: "Klientë aktivë",
      value: stats.activeCustomers,
      icon: UserCheck,
    },
    {
      title: "Automjete",
      value: stats.totalVehicles,
      icon: Car,
    },
    {
      title: "Shpenzuar total",
      value: formatCurrency(stats.totalSpent),
      icon: Banknote,
    },
  ];

  return (
    <div className="af-stat-grid">
      {items.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="af-stat-tile"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Icon size={22} />
            </div>

            <p className="mt-6 text-sm font-medium text-slate-500">
              {stat.title}
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
