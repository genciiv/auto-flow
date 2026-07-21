import { BadgeEuro, Car, FilePenLine, Package } from "lucide-react";

function formatCurrency(value, currency = "ALL") {
  const amount = Number(value || 0);

  if (currency === "EUR") {
    return new Intl.NumberFormat("sq-AL", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return `${new Intl.NumberFormat("sq-AL", {
    maximumFractionDigits: 0,
  }).format(amount)} Lek`;
}

export default function MarketplaceStats({
  activeListings = 0,
  draftListings = 0,
  vehicleListings = 0,
  soldValue = 0,
  currency = "ALL",
}) {
  const stats = [
    {
      title: "Publikime aktive",
      value: new Intl.NumberFormat("sq-AL").format(activeListings),
      icon: Package,
    },
    {
      title: "Draft",
      value: new Intl.NumberFormat("sq-AL").format(draftListings),
      icon: FilePenLine,
    },
    {
      title: "Automjete në shitje",
      value: new Intl.NumberFormat("sq-AL").format(vehicleListings),
      icon: Car,
    },
    {
      title: "Vlera e shitjeve",
      value: formatCurrency(soldValue, currency),
      icon: BadgeEuro,
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
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
