import { Banknote, Calendar, Car, Package, Users, Wrench } from "lucide-react";

import { formatCurrency } from "@/lib/formatters";
import StatCard from "./StatCard";

export default function StatsGrid({ stats }) {
  const safeStats = {
    customers: Number(stats?.customers || 0),
    vehicles: Number(stats?.vehicles || 0),
    activeServices: Number(stats?.activeServices || 0),
    revenue: Number(stats?.revenue || 0),
    lowStock: Number(stats?.lowStock || 0),
    appointments: Number(stats?.appointments || 0),
  };

  const items = [
    {
      title: "Klientë",
      value: safeStats.customers,
      change: "+",
      icon: Users,
    },
    {
      title: "Automjete",
      value: safeStats.vehicles,
      change: "+",
      icon: Car,
    },
    {
      title: "Shërbime aktive",
      value: safeStats.activeServices,
      change: "live",
      icon: Wrench,
    },
    {
      title: "Të ardhura",
      value: formatCurrency(safeStats.revenue),
      change: "paid",
      icon: Banknote,
    },
    {
      title: "Stok i ulët",
      value: safeStats.lowStock,
      change: "alert",
      icon: Package,
    },
    {
      title: "Termine",
      value: safeStats.appointments,
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
