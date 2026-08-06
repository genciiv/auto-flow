import { Calendar, CheckCircle2, Clock3, Wrench } from "lucide-react";

export default function AppointmentStats({ stats }) {
  const items = [
    {
      title: "Total termine",
      value: stats.totalAppointments,
      icon: Calendar,
    },
    {
      title: "Në pritje",
      value: stats.pendingAppointments,
      icon: Clock3,
    },
    {
      title: "Në proces",
      value: stats.inProgressAppointments,
      icon: Wrench,
    },
    {
      title: "Përfunduara",
      value: stats.completedAppointments,
      icon: CheckCircle2,
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
