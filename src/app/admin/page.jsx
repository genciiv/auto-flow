import { Building2, ShieldCheck, UserRoundCheck, Users } from "lucide-react";

import { db } from "@/lib/db";

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

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
          live
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
  const [
    totalBusinesses,
    activeBusinesses,
    totalBusinessUsers,
    platformAdmins,
    recentBusinesses,
  ] = await Promise.all([
    db.business.count(),

    db.business.count({
      where: {
        isActive: true,
      },
    }),

    db.businessUser.count({
      where: {
        isActive: true,
      },
    }),

    db.user.count({
      where: {
        globalRole: "PLATFORM_ADMIN",
        isActive: true,
      },
    }),

    db.business.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        users: {
          where: {
            role: "OWNER",
            isActive: true,
          },
          take: 1,
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            customers: true,
            vehicles: true,
            services: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-blue-600">Platform Admin</p>

        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Mirë se erdhe në administrimin e AutoFlow
            </h1>

            <p className="mt-2 text-slate-500">
              Menaxho bizneset, përdoruesit dhe funksionimin e platformës.
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
          value={totalBusinesses}
          description="Të gjitha bizneset e regjistruara"
          icon={Building2}
        />

        <StatCard
          title="Biznese aktive"
          value={activeBusinesses}
          description="Biznese me akses aktiv"
          icon={UserRoundCheck}
        />

        <StatCard
          title="Përdorues biznesi"
          value={totalBusinessUsers}
          description="Owner dhe anëtarë aktivë"
          icon={Users}
        />

        <StatCard
          title="Administratorë"
          value={platformAdmins}
          description="Administratorë të platformës"
          icon={ShieldCheck}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Bizneset e fundit
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Bizneset e regjistruara së fundmi në AutoFlow.
              </p>
            </div>

            <a
              href="/admin/businesses"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Shiko të gjitha
            </a>
          </div>

          {recentBusinesses.length > 0 ? (
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
                      Të dhënat
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
                  {recentBusinesses.map((business) => {
                    const owner = business.users[0]?.user;

                    return (
                      <tr
                        key={business.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <Building2 size={19} />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-950">
                                {business.name}
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                {business.city || "Qyteti nuk është vendosur"}
                              </p>
                            </div>
                          </div>
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

              <p className="mt-2 text-sm text-slate-500">
                Bizneset e reja do të shfaqen këtu.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Gjendja e platformës
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Përmbledhje e shpejtë e sistemit.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Databaza</p>

                <span className="text-xs font-semibold text-emerald-600">
                  Aktive
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                PostgreSQL dhe Prisma janë funksionale.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  Authentication
                </p>

                <span className="text-xs font-semibold text-emerald-600">
                  Aktive
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Login dhe role-based access janë aktive.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Abonimet</p>

                <span className="text-xs font-semibold text-amber-600">
                  Në zhvillim
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Moduli i planeve dhe abonimeve do të ndërtohet më pas.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  Aplikimet
                </p>

                <span className="text-xs font-semibold text-amber-600">
                  Në zhvillim
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Procesi i aplikimit dhe aprovimit do të shtohet më pas.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
