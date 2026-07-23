import { AlertTriangle, CheckCircle2, Clock3, Wrench } from "lucide-react";

import MaintenanceManager from "@/components/maintenance/MaintenanceManager";
import { db } from "@/lib/db";
import { requireBusinessContext } from "@/lib/business-context";

export const metadata = {
  title: "Mirëmbajtja | AutoFlow",
};

export default async function MaintenancePage() {
  const { businessId } = await requireBusinessContext();

  const [vehicles, services, items] = await Promise.all([
    db.vehicle.findMany({
      where: {
        businessId,
      },
      select: {
        id: true,
        plate: true,
        brand: true,
        model: true,
        year: true,
      },
      orderBy: {
        plate: "asc",
      },
    }),

    db.serviceRecord.findMany({
      where: {
        businessId,
      },
      select: {
        id: true,
        vehicleId: true,
        title: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    db.maintenanceItem.findMany({
      where: {
        vehicle: {
          businessId,
        },
      },
      include: {
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            year: true,
          },
        },
        serviceRecord: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [
        {
          status: "desc",
        },
        {
          nextDate: "asc",
        },
        {
          nextMileage: "asc",
        },
      ],
    }),
  ]);

  const stats = {
    total: items.length,
    ok: items.filter((item) => item.status === "OK").length,
    soon: items.filter((item) => item.status === "SOON").length,
    overdue: items.filter((item) => item.status === "OVERDUE").length,
  };

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
        <div className="relative">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
              <Wrench size={14} />
              Menaxhimi i servisit
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Mirëmbajtja e automjeteve
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Regjistro vajin, filtrat, frenat, rripin e fazës dhe afatet e
              ardhshme të mirëmbajtjes.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <Wrench size={21} className="text-blue-600" />
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Gjithsej
          </p>
          <p className="mt-1 text-3xl font-black text-slate-950">
            {stats.total}
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <CheckCircle2 size={21} className="text-emerald-600" />
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-emerald-700">
            Në rregull
          </p>
          <p className="mt-1 text-3xl font-black text-emerald-950">
            {stats.ok}
          </p>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <Clock3 size={21} className="text-amber-600" />
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-amber-700">
            Së shpejti
          </p>
          <p className="mt-1 text-3xl font-black text-amber-950">
            {stats.soon}
          </p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
          <AlertTriangle size={21} className="text-red-600" />
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-red-700">
            Me vonesë
          </p>
          <p className="mt-1 text-3xl font-black text-red-950">
            {stats.overdue}
          </p>
        </div>
      </section>

      <MaintenanceManager
        vehicles={vehicles}
        services={services}
        items={items}
      />
    </div>
  );
}
