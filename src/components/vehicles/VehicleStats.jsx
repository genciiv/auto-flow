import { Car, CheckCircle2, Clock3, Wrench } from "lucide-react";

export default function VehicleStats({ stats }) {
  const cards = [
    {
      label: "Total automjete",
      value: stats.totalVehicles,
      icon: Car,
    },
    {
      label: "Automjete aktive",
      value: stats.activeVehicles,
      icon: CheckCircle2,
    },
    {
      label: "Në servis",
      value: stats.vehiclesInService,
      icon: Wrench,
    },
    {
      label: "Në pritje",
      value: stats.pendingVehicles,
      icon: Clock3,
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Icon size={21} />
            </div>

            <p className="mt-6 text-sm font-medium text-slate-500">
              {card.label}
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
