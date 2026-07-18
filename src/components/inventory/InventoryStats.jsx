import { AlertTriangle, Boxes, Package, Wallet } from "lucide-react";

import { formatCurrency } from "@/lib/formatters";

export default function InventoryStats({ stats }) {
  const items = [
    {
      title: "Pjesë totale",
      value: stats.totalParts,
      icon: Package,
    },
    {
      title: "Stok total",
      value: stats.totalStock,
      icon: Boxes,
    },
    {
      title: "Stok i ulët",
      value: stats.lowStock,
      icon: AlertTriangle,
    },
    {
      title: "Vlera e inventarit",
      value: formatCurrency(stats.inventoryValue),
      icon: Wallet,
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
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
