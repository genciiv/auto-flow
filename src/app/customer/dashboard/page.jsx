import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CarFront,
  Gauge,
  History,
  Plus,
  Sparkles,
  Wrench,
} from "lucide-react";

import { CUSTOMER_VEHICLE_MAINTENANCE_LABELS } from "@/config/customer-vehicle-maintenance";
import { activeCustomerVehicleLinkWhere } from "@/lib/customer-access";
import { getMostUrgentVehicleDueItem } from "@/lib/customer-vehicle-maintenance";
import { requireCustomerContext } from "@/lib/customer-context";
import { formatAppDate } from "@/lib/date-time";
import { db } from "@/lib/db";

export const metadata = {
  title: "Përmbledhje | AutoFlow",
  description: "Menaxho automjetet dhe historikun e serviseve në AutoFlow.",
};

function formatMileage(value) {
  if (value === null || value === undefined) return "Pa kilometrazh";

  return `${new Intl.NumberFormat("sq-AL").format(value)} km`;
}

export default async function CustomerDashboardPage() {
  const { user, profileId } = await requireCustomerContext();

  const [vehicleCount, linkedVehicleCount, primaryVehicle] = await Promise.all([
    db.customerVehicle.count({ where: { profileId } }),
    db.customerVehicleLink.count({
      where: activeCustomerVehicleLinkWhere(profileId),
    }),
    db.customerVehicle.findFirst({
      where: { profileId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        brand: true,
        model: true,
        plate: true,
        mileage: true,
        mileageHistory: {
          orderBy: [{ recordedAt: "desc" }, { createdAt: "desc" }],
          take: 1,
          select: {
            recordedAt: true,
          },
        },
        maintenanceHistory: {
          orderBy: [{ performedAt: "desc" }, { createdAt: "desc" }],
          take: 20,
          select: {
            id: true,
            type: true,
            title: true,
            nextMileage: true,
            nextDate: true,
          },
        },
        reminders: {
          where: { isActive: true },
          orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
          take: 10,
          select: {
            id: true,
            title: true,
            dueDate: true,
            dueMileage: true,
          },
        },
        _count: {
          select: {
            expenses: true,
          },
        },
      },
    }),
  ]);

  const latestMaintenance = primaryVehicle
    ? primaryVehicle.maintenanceHistory.filter((item, index, records) =>
        records.findIndex((candidate) => candidate.type === item.type) === index,
      )
    : [];

  const nextDueItem = primaryVehicle
    ? getMostUrgentVehicleDueItem(
        [
          ...latestMaintenance.map((item) => ({
            ...item,
            title: CUSTOMER_VEHICLE_MAINTENANCE_LABELS[item.type] || item.title,
          })),
          ...primaryVehicle.reminders,
        ],
        primaryVehicle.mileage,
      )
    : null;

  const firstName =
    String(user.name || "Klient")
      .trim()
      .split(" ")[0] || "Klient";

  const stats = [
    {
      label: "Automjetet e mia",
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
              Menaxho automjetet, kilometrat, mirëmbajtjen, afatet, shpenzimet personale dhe historikun e serviseve nga një vend i vetëm.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={primaryVehicle ? `/customer/vehicles/${primaryVehicle.id}` : "/customer/vehicles/new"}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-950 transition hover:bg-blue-50"
              >
                {primaryVehicle ? <History size={17} /> : <Plus size={17} />}
                {primaryVehicle ? "Shiko historikun" : "Shto automjet"}
              </Link>

              {primaryVehicle ? (
                <Link
                  href="/customer/vehicles/new"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <Plus size={17} />
                  Shto tjetër
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {primaryVehicle ? (
        <Link
          href={`/customer/vehicles/${primaryVehicle.id}`}
          className="group block overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5 sm:p-6"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
                <CarFront size={22} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">
                  Dosja e automjetit
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                  {[primaryVehicle.brand, primaryVehicle.model].filter(Boolean).join(" ")}
                </h2>
                <p className="mt-1 text-xs font-bold tracking-[0.12em] text-slate-500">
                  {primaryVehicle.plate}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[300px]">
              <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Gauge size={15} />
                  <span className="text-[11px] font-bold uppercase tracking-wide">
                    Kilometrat
                  </span>
                </div>
                <p className="mt-2 text-sm font-black text-slate-950">
                  {formatMileage(primaryVehicle.mileage)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <History size={15} />
                  <span className="text-[11px] font-bold uppercase tracking-wide">
                    Shpenzime
                  </span>
                </div>
                <p className="mt-2 text-sm font-black text-slate-950">
                  {primaryVehicle._count.expenses}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-blue-100/70 pt-4 text-xs text-slate-500">
            <span>
              {primaryVehicle.mileageHistory[0]
                ? `Kilometrat u përditësuan më ${formatAppDate(primaryVehicle.mileageHistory[0].recordedAt)}`
                : "Fillo historikun duke regjistruar kilometrazhin."}
            </span>
            <ArrowRight
              size={17}
              className="shrink-0 text-blue-500 transition group-hover:translate-x-0.5"
            />
          </div>
        </Link>
      ) : null}

      {primaryVehicle && nextDueItem ? (
        <Link
          href={`/customer/vehicles/${primaryVehicle.id}#mirembajtja`}
          className="group flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <CalendarClock size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Mirëmbajtja e ardhshme
              </p>
              <h2 className="mt-1 text-base font-black text-slate-950">
                {nextDueItem.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{nextDueItem.dueState.text}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${nextDueItem.dueState.className}`}>
              {nextDueItem.dueState.label}
            </span>
            <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
          </div>
        </Link>
      ) : null}

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
                <ArrowRight
                  size={18}
                  className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                />
              </div>
              <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
                {item.value}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">{item.label}</p>
              <p className="mt-1 text-xs text-slate-500">{item.description}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
