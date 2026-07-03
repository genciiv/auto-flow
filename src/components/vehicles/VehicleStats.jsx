import { Car, ShieldCheck, Wrench, Clock3 } from "lucide-react";

export default function VehicleStats({ stats }) {
  const items = [
    { title: "Total automjete", value: stats.totalVehicles, icon: Car },
    { title: "Në servis", value: stats.inService, icon: Wrench },
    {
      title: "Përfunduara",
      value: stats.completedThisMonth,
      icon: ShieldCheck,
    },
    { title: "Në pritje", value: stats.pendingVehicles, icon: Clock3 },
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
