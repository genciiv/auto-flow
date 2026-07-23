import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  FileText,
  Link2,
  ReceiptText,
  Wrench,
  XCircle,
} from "lucide-react";

import { requireCustomerContext } from "@/lib/customer-context";
import { db } from "@/lib/db";

export const metadata = {
  title: "Historiku i serviseve | AutoFlow",
};

function formatDate(value) {
  if (!value) {
    return "Nuk është vendosur";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatMoney(value) {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "ALL",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getStatusConfig(status) {
  if (status === "COMPLETED") {
    return {
      label: "Përfunduar",
      icon: CheckCircle2,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (status === "IN_PROGRESS") {
    return {
      label: "Në proces",
      icon: Clock3,
      className: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  if (status === "CANCELLED") {
    return {
      label: "Anuluar",
      icon: XCircle,
      className: "border-red-200 bg-red-50 text-red-700",
    };
  }

  return {
    label: "Në pritje",
    icon: Clock3,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  };
}

export default async function CustomerServicesPage() {
  const { profileId } = await requireCustomerContext();

  const [services, activeLinksCount] = await Promise.all([
    db.serviceRecord.findMany({
      where: {
        vehicle: {
          customerLinks: {
            some: {
              isActive: true,
              customerVehicle: {
                profileId,
              },
            },
          },
        },
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            phone: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            year: true,
          },
        },
        invoice: {
          select: {
            id: true,
            number: true,
            status: true,
            total: true,
          },
        },
        partsUsed: {
          select: {
            id: true,
            quantity: true,
            total: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    db.customerVehicleLink.count({
      where: {
        isActive: true,
        customerVehicle: {
          profileId,
        },
      },
    }),
  ]);

  const completedCount = services.filter(
    (service) => service.status === "COMPLETED",
  ).length;

  const activeCount = services.filter(
    (service) =>
      service.status === "PENDING" || service.status === "IN_PROGRESS",
  ).length;

  const totalSpent = services
    .filter((service) => service.status === "COMPLETED")
    .reduce((sum, service) => sum + Number(service.total || 0), 0);

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
        <div className="relative">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                <Wrench size={14} />
                Portali i klientit
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Historiku i serviseve
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Shiko statusin, punët, pjesët dhe faturat që servisi ka
                regjistruar për automjetet e lidhura.
              </p>
            </div>

            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <Link2 size={22} className="text-blue-300" />

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Automjete të lidhura
                </p>

                <p className="text-xl font-black text-white">
                  {activeLinksCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText size={20} />
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Gjithsej shërbime
          </p>

          <p className="mt-1 text-3xl font-black text-slate-950">
            {services.length}
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <CheckCircle2 size={22} className="text-emerald-600" />

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-emerald-700">
            Të përfunduara
          </p>

          <p className="mt-1 text-3xl font-black text-emerald-950">
            {completedCount}
          </p>
        </div>

        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5">
          <Clock3 size={22} className="text-blue-600" />

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-blue-700">
            Aktive
          </p>

          <p className="mt-1 text-3xl font-black text-blue-950">
            {activeCount}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Totali i shërbimeve të përfunduara
            </p>

            <p className="mt-2 text-2xl font-black text-slate-950">
              {formatMoney(totalSpent)}
            </p>
          </div>

          <ReceiptText size={27} className="text-blue-600" />
        </div>
      </section>

      {activeLinksCount === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Link2 size={25} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-950">
            Nuk ke lidhur ende një automjet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Kërko automjetin e regjistruar nga servisi dhe dërgo kërkesën për
            aprovim.
          </p>

          <Link
            href="/customer/vehicles"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Shiko makinat e mia
            <ArrowRight size={17} />
          </Link>
        </section>
      ) : services.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Wrench size={25} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-950">
            Nuk ka ende shërbime
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Automjeti është lidhur me servisin, por servisi nuk ka regjistruar
            ende shërbime për të.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          {services.map((service) => {
            const statusConfig = getStatusConfig(service.status);
            const StatusIcon = statusConfig.icon;

            const vehicleTitle = [service.vehicle.brand, service.vehicle.model]
              .filter(Boolean)
              .join(" ");

            return (
              <article
                key={service.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-950">
                          {service.title}
                        </h2>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusConfig.className}`}
                        >
                          <StatusIcon size={14} />
                          {statusConfig.label}
                        </span>
                      </div>

                      {service.description ? (
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                          {service.description}
                        </p>
                      ) : null}
                    </div>

                    <p className="text-xl font-black text-slate-950">
                      {formatMoney(service.total)}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Automjeti
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-950">
                        <CarFront size={16} className="text-blue-600" />
                        {vehicleTitle}
                      </div>

                      <p className="mt-1 text-sm font-black tracking-wider text-blue-600">
                        {service.vehicle.plate}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Servisi
                      </p>

                      <p className="mt-2 text-sm font-bold text-slate-950">
                        {service.business.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {service.business.city || "Qyteti nuk është vendosur"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Data
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-950">
                        <CalendarDays size={16} className="text-blue-600" />
                        {formatDate(service.createdAt)}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Pjesë të përdorura
                      </p>

                      <p className="mt-2 text-sm font-bold text-slate-950">
                        {service.partsUsed.length}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {service.invoice
                          ? `Fatura: ${service.invoice.number}`
                          : "Pa faturë"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <Link
                      href={`/customer/services/${service.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-600"
                    >
                      Shiko detajet
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
