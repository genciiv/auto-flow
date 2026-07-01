import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import QuickActions from "@/components/dashboard/QuickActions";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { Car, Calendar, Package, Euro } from "lucide-react";

const stats = [
  { title: "Automjete", value: "2,410", change: "+12%", icon: Car },
  { title: "Termine sot", value: "18", change: "+6%", icon: Calendar },
  { title: "Pjesë në stok", value: "1,284", change: "-3%", icon: Package },
  { title: "Të ardhura", value: "€18,920", change: "+18%", icon: Euro },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold text-blue-600">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Mirë se erdhe në AutoFlow
          </h1>
          <p className="mt-2 text-slate-500">
            Pamje e përgjithshme e servisit, terminet, magazina dhe aktivitetet.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Shërbimet e sotme
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Terminet dhe punët aktive.
                </p>
              </div>

              <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                Shto shërbim
              </button>
            </div>

            <div className="space-y-4">
              {[
                ["BMW X5", "Ndërrim vaji + filtra", "Në proces", "09:30"],
                ["Audi A4", "Diagnostikim OBD", "Në pritje", "11:00"],
                ["VW Golf 7", "Kontroll frenash", "Përfunduar", "13:45"],
                ["Mercedes C220", "Goma + balancim", "Në proces", "15:20"],
              ].map(([car, service, status, time]) => (
                <div
                  key={car}
                  className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-950">{car}</p>
                    <p className="mt-1 text-sm text-slate-500">{service}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                      {time}
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <QuickActions />
        </div>

        <ActivityFeed />
      </div>
    </DashboardLayout>
  );
}
