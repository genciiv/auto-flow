import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Clock3,
  CircleDollarSign,
  Wrench,
} from "lucide-react";

import { formatCurrency } from "@/lib/formatters";

export default function ServiceStats({ stats }) {
  const items = [
    {
      title: "Shërbime aktive",
      value: stats.activeServices,
      description: "Punë aktualisht në proces",
      icon: Wrench,
    },
    {
      title: "Përfunduara",
      value: stats.completedServices,
      description: "Përfunduar ose dorëzuar",
      icon: CheckCircle2,
    },
    {
      title: "Shërbime të paguara",
      value: stats.paidServices,
      description: "Fatura të paguara plotësisht",
      icon: BadgeCheck,
    },
    {
      title: "Pagesa të pjesshme",
      value: stats.partiallyPaidServices,
      description: "Kanë ende detyrim të mbetur",
      icon: Clock3,
    },
    {
      title: "Të arkëtuara",
      value: formatCurrency(stats.collectedValue),
      description: "Pagesa reale të regjistruara",
      icon: Banknote,
    },
    {
      title: "Për t’u arkëtuar",
      value: formatCurrency(stats.outstandingValue),
      description: "Detyrimi i mbetur nga faturat",
      icon: CircleDollarSign,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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

            <p className="mt-2 text-xs leading-5 text-slate-400">
              {stat.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
