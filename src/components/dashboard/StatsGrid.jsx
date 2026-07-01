import StatCard from "./StatCard";
import { Calendar, Car, Euro, Package } from "lucide-react";

const stats = [
  { title: "Automjete", value: "2,410", change: "+12%", icon: Car },
  { title: "Termine sot", value: "18", change: "+6%", icon: Calendar },
  { title: "Pjesë në stok", value: "1,284", change: "-3%", icon: Package },
  { title: "Të ardhura", value: "€18,920", change: "+18%", icon: Euro },
];

export default function StatsGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
