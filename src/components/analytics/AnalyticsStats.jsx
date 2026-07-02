import { BadgeEuro, Car, Package, Wrench } from "lucide-react";

const stats = [
  {
    title: "Të ardhura mujore",
    value: "€18,920",
    change: "+18%",
    icon: BadgeEuro,
  },
  { title: "Shërbime", value: "486", change: "+12%", icon: Wrench },
  { title: "Automjete", value: "2,410", change: "+9%", icon: Car },
  { title: "Pjesë të përdorura", value: "1,284", change: "+6%", icon: Package },
];

export default function AnalyticsStats() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Icon size={22} />
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                {stat.change}
              </span>
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
