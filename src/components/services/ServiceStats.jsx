import { CheckCircle2, Clock3, Euro, Wrench } from "lucide-react";

export default function ServiceStats({ stats }) {
  const items = [
    {
      title: "Shërbime aktive",
      value: stats.activeServices,
      icon: Wrench,
    },
    {
      title: "Në pritje",
      value: stats.pendingServices,
      icon: Clock3,
    },
    {
      title: "Përfunduara",
      value: stats.completedServices,
      icon: CheckCircle2,
    },
    {
      title: "Të ardhura",
      value: `€${stats.totalRevenue.toFixed(0)}`,
      icon: Euro,
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
