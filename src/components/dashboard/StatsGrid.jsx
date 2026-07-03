import StatCard from "./StatCard";
import { Calendar, Car, Euro, Package, Users, Wrench } from "lucide-react";

export default function StatsGrid({ stats }) {
  const items = [
    { title: "Klientë", value: stats.customers, change: "+", icon: Users },
    { title: "Automjete", value: stats.vehicles, change: "+", icon: Car },
    {
      title: "Shërbime aktive",
      value: stats.activeServices,
      change: "live",
      icon: Wrench,
    },
    {
      title: "Të ardhura",
      value: `€${stats.revenue.toFixed(0)}`,
      change: "paid",
      icon: Euro,
    },
    {
      title: "Stok i ulët",
      value: stats.lowStock,
      change: "alert",
      icon: Package,
    },
    {
      title: "Termine",
      value: stats.appointments,
      change: "today",
      icon: Calendar,
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
