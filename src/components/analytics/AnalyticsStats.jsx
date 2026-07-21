import { BadgeDollarSign, Car, Package, Wrench } from "lucide-react";

function formatMoney(value) {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "ALL",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatNumber(value) {
  return new Intl.NumberFormat("sq-AL").format(Number(value || 0));
}

function formatChange(value) {
  const number = Number(value || 0);
  const sign = number > 0 ? "+" : "";

  return `${sign}${number.toFixed(1)}%`;
}

export default function AnalyticsStats({ stats }) {
  const items = [
    {
      title: "Të ardhura mujore",
      value: formatMoney(stats?.monthlyRevenue),
      change: stats?.monthlyRevenueChange,
      icon: BadgeDollarSign,
    },
    {
      title: "Shërbime këtë muaj",
      value: formatNumber(stats?.services),
      change: stats?.servicesChange,
      icon: Wrench,
    },
    {
      title: "Automjete gjithsej",
      value: formatNumber(stats?.vehicles),
      change: stats?.vehiclesChange,
      icon: Car,
    },
    {
      title: "Pjesë të përdorura",
      value: formatNumber(stats?.partsUsed),
      change: stats?.partsUsedChange,
      icon: Package,
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const isPositive = Number(item.change || 0) >= 0;

        return (
          <div
            key={item.title}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Icon size={22} />
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  isPositive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {formatChange(item.change)}
              </span>
            </div>

            <p className="mt-6 text-sm font-medium text-slate-500">
              {item.title}
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {item.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
