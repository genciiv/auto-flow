import Link from "next/link";
import {
  Building2,
  Car,
  ShieldCheck,
  UserRoundCheck,
  Users,
  Wrench,
} from "lucide-react";

import { getPlatformDashboardData } from "@/services/admin/dashboard-service";

function formatDate(date) {
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Live
        </span>
      </div>

      <p className="mt-7 text-sm font-medium text-slate-500">{title}</p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export default async function AdminPage() {
  const dashboard = await getPlatformDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-blue-600">Platform Admin</p>

        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Mirë se erdhe në AutoFlow
            </h1>

            <p className="mt-2 text-slate-500">
              Monitoro bizneset, përdoruesit dhe aktivitetin e platformës.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Platforma aktive
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Totali i bizneseve"
          value={dashboard.totalBusinesses}
          description={`${dashboard.inactiveBusinesses} biznese joaktive`}
          icon={Building2}
        />

        <StatCard
          title="Biznese aktive"
          value={dashboard.activeBusinesses}
          description="Biznese me akses aktiv"
          icon={UserRoundCheck}
        />

        <StatCard
          title="Përdorues biznesi"
          value={dashboard.totalBusinessUsers}
          description="Owner dhe anëtarë të stafit"
          icon={Users}
        />

        <StatCard
          title="Administratorë"
          value={dashboard.platformAdmins}
          description="Administratorë aktivë"
          icon={ShieldCheck}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Users size={19} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Klientë</p>

              <p className="text-xl font-bold text-slate-950">
                {dashboard.totalCustomers}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Car size={19} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Automjete</p>

              <p className="text-xl font-bold text-slate-950">
                {dashboard.totalVehicles}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Wrench size={19} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Shërbime</p>

              <p className="text-xl font-bold text-slate-950">
                {dashboard.totalServices}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Bizneset e fundit
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Regjistrimet më të fundit në platformë.
            </p>
          </div>

          <Link
            href="/admin/businesses"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Shiko të gjitha
          </Link>
        </div>

        {dashboard.recentBusinesses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Biznesi
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Pronari
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Aktiviteti
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Statusi
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Data
                  </th>
                </tr>
              </thead>

              <tbody>
                {dashboard.recentBusinesses.map((business) => {
                  const owner = business.users[0]?.user;

                  return (
                    <tr
                      key={business.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-5">
                        <Link
                          href={`/admin/businesses/${business.id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Building2 size={19} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-950 hover:text-blue-600">
                              {business.name}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {business.city || "Qyteti i pacaktuar"}
                            </p>
                          </div>
                        </Link>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-800">
                          {owner?.name || "Pa pronar"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {owner?.email || "—"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm text-slate-600">
                          {business._count.customers} klientë
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {business._count.vehicles} automjete ·{" "}
                          {business._count.services} shërbime
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            business.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {business.isActive ? "Aktiv" : "Joaktiv"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {formatDate(business.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <Building2 size={34} className="mx-auto text-slate-300" />

            <p className="mt-4 font-semibold text-slate-700">
              Nuk ka ende biznese
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
