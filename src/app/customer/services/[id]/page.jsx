import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  Hash,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  Store,
  Wrench,
  XCircle,
} from "lucide-react";

import { requireCustomerContext } from "@/lib/customer-context";
import { db } from "@/lib/db";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;

  return {
    title: `Shërbimi ${resolvedParams.id} | AutoFlow`,
  };
}

function formatDate(value) {
  if (!value) {
    return "Nuk është vendosur";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    dateStyle: "long",
    timeStyle: "short",
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

function getInvoiceStatusLabel(status) {
  const labels = {
    DRAFT: "Draft",
    PAID: "E paguar",
    UNPAID: "E papaguar",
    OVERDUE: "Me vonesë",
  };

  return labels[status] || status;
}

export default async function CustomerServiceDetailsPage({ params }) {
  const { profileId } = await requireCustomerContext();
  const resolvedParams = await params;
  const serviceId = resolvedParams.id;

  const service = await db.serviceRecord.findFirst({
    where: {
      id: serviceId,
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
          email: true,
        },
      },
      vehicle: {
        select: {
          id: true,
          plate: true,
          brand: true,
          model: true,
          year: true,
          vin: true,
        },
      },
      invoice: {
        select: {
          id: true,
          number: true,
          status: true,
          total: true,
          createdAt: true,
        },
      },
      partsUsed: {
        include: {
          part: {
            select: {
              id: true,
              code: true,
              name: true,
              category: true,
              sellPrice: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!service) {
    notFound();
  }

  const statusConfig = getStatusConfig(service.status);
  const StatusIcon = statusConfig.icon;

  const vehicleTitle = [service.vehicle.brand, service.vehicle.model]
    .filter(Boolean)
    .join(" ");

  const partsTotal = service.partsUsed.reduce(
    (sum, usage) => sum + Number(usage.total || 0),
    0,
  );

  return (
    <div className="space-y-7">
      <div>
        <Link
          href="/customer/services"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Kthehu te historiku
        </Link>
      </div>

      <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
        <div className="relative">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                <Wrench size={14} />
                Detajet e shërbimit
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                {service.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusConfig.className}`}
                >
                  <StatusIcon size={14} />
                  {statusConfig.label}
                </span>

                <span className="text-sm font-semibold text-slate-300">
                  {formatDate(service.createdAt)}
                </span>
              </div>
            </div>

            <p className="text-3xl font-black text-white">
              {formatMoney(service.total)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <CarFront size={20} />
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Automjeti
          </p>

          <p className="mt-1 text-sm font-bold text-slate-950">
            {vehicleTitle}
          </p>

          <p className="mt-1 flex items-center gap-2 text-sm font-black tracking-wider text-blue-600">
            <Hash size={14} />
            {service.vehicle.plate}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Store size={20} />
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Servisi
          </p>

          <p className="mt-1 text-sm font-bold text-slate-950">
            {service.business.name}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {service.business.city || "Qyteti nuk është vendosur"}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Package size={20} />
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Pjesët e përdorura
          </p>

          <p className="mt-1 text-sm font-bold text-slate-950">
            {service.partsUsed.length} artikuj
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {formatMoney(partsTotal)}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <h2 className="text-lg font-bold text-slate-950">
            Përshkrimi i shërbimit
          </h2>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-sm leading-7 text-slate-600">
            {service.description ||
              "Nuk është vendosur një përshkrim për këtë shërbim."}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <h2 className="text-lg font-bold text-slate-950">
            Pjesët e përdorura
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Pjesët dhe materialet e regjistruara nga servisi.
          </p>
        </div>

        {service.partsUsed.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-6">
            <Package size={27} className="mx-auto text-slate-300" />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Nuk ka pjesë të regjistruara për këtë shërbim.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {service.partsUsed.map((usage) => (
              <div
                key={usage.id}
                className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6"
              >
                <div>
                  <p className="font-bold text-slate-950">{usage.part.name}</p>

                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                    {usage.part.code ? (
                      <span>Kodi: {usage.part.code}</span>
                    ) : null}

                    {usage.part.category ? (
                      <span>Kategoria: {usage.part.category}</span>
                    ) : null}

                    <span>Sasia: {usage.quantity}</span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <p className="text-sm text-slate-500">
                    {formatMoney(usage.unitPrice)} × {usage.quantity}
                  </p>

                  <p className="mt-1 font-black text-slate-950">
                    {formatMoney(usage.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Store size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-950">Të dhënat e servisit</h2>

              <p className="text-sm text-slate-500">{service.business.name}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {service.business.address || service.business.city ? (
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <MapPin size={17} className="mt-0.5 shrink-0 text-blue-600" />

                <span>
                  {[service.business.address, service.business.city]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            ) : null}

            {service.business.phone ? (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone size={17} className="text-blue-600" />
                {service.business.phone}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ReceiptText size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-950">Fatura</h2>

              <p className="text-sm text-slate-500">
                Informacioni financiar i shërbimit
              </p>
            </div>
          </div>

          {service.invoice ? (
            <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">Numri</span>

                <span className="text-sm font-bold text-slate-950">
                  {service.invoice.number}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">Statusi</span>

                <span className="text-sm font-bold text-slate-950">
                  {getInvoiceStatusLabel(service.invoice.status)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-3">
                <span className="text-sm font-bold text-slate-950">Totali</span>

                <span className="text-lg font-black text-slate-950">
                  {formatMoney(service.invoice.total)}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-slate-500">
              Për këtë shërbim nuk është krijuar ende një faturë.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
