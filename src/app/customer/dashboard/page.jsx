import Link from "next/link";
import { ArrowRight, CarFront, Plus, Sparkles, Wrench } from "lucide-react";

import { db } from "@/lib/db";
import { requireCustomerContext } from "@/lib/customer-context";
import { activeCustomerVehicleLinkWhere } from "@/lib/customer-access";

export const metadata = {
  title: "Përmbledhje | AutoFlow",
  description: "Menaxho automjetet dhe historikun e serviseve në AutoFlow.",
};

export default async function CustomerDashboardPage() {
  const { user, profileId } = await requireCustomerContext();

  const [vehicleCount, linkedVehicleCount] = await Promise.all([
    db.customerVehicle.count({ where: { profileId } }),
    db.customerVehicleLink.count({
      where: activeCustomerVehicleLinkWhere(profileId),
    }),
  ]);

  const firstName =
    String(user.name || "Klient")
      .trim()
      .split(" ")[0] || "Klient";

  const stats = [
    {
      label: "Makinat e mia",
      value: vehicleCount,
      description: "Automjete të regjistruara",
      icon: CarFront,
      href: "/customer/vehicles",
    },
    {
      label: "Automjete të lidhura",
      value: linkedVehicleCount,
      description: "Automjete të lidhura me servisin",
      icon: Wrench,
      href: "/customer/services",
    },
  ];

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
        <div className="relative">
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
              <Sparkles size={14} />
              Portali yt personal AutoFlow
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Mirë se erdhe, {firstName}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Menaxho automjetet dhe kontrollo historikun e serviseve nga një vend i vetëm.
            </p>
            <div className="mt-7">
              <Link
                href="/customer/vehicles/new"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-950 transition hover:bg-blue-50"
              >
                <Plus size={17} />
                Shto automjet
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon size={22} />
                </div>
                <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
              </div>
              <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">{item.value}</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{item.label}</p>
              <p className="mt-1 text-xs text-slate-500">{item.description}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
