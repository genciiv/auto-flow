import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CarFront,
  ClipboardList,
  Mail,
  MapPin,
  Package,
  Phone,
  UserRound,
  Wrench,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/formatters";
import { PERMISSIONS } from "@/lib/permissions";

const statusLabels = {
  DRAFT: "Projekt",
  PENDING: "Në pritje",
  IN_PROGRESS: "Në proces",
  WAITING_FOR_PARTS: "Në pritje të pjesëve",
  READY_FOR_PICKUP: "Gati për dorëzim",
  COMPLETED: "Përfunduar",
  DELIVERED: "Dorëzuar",
  CANCELLED: "Anuluar",
};

const statusStyles = {
  DRAFT: "border-slate-200 bg-slate-100 text-slate-700",
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  IN_PROGRESS: "border-blue-200 bg-blue-50 text-blue-700",
  WAITING_FOR_PARTS: "border-violet-200 bg-violet-50 text-violet-700",
  READY_FOR_PICKUP: "border-cyan-200 bg-cyan-50 text-cyan-800",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  DELIVERED: "border-slate-300 bg-slate-900 text-white",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function CustomerDetailsPage({ params }) {
  const { id } = await params;

  const { businessId } = await requireBusinessPermission(
    PERMISSIONS.CUSTOMERS_VIEW,
  );

  const customer = await db.customer.findFirst({
    where: {
      id,
      businessId,
    },
    include: {
      vehicles: {
        where: {
          businessId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          services: {
            where: {
              businessId,
            },
            orderBy: {
              createdAt: "desc",
            },
            include: {
              assignedUser: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              partsUsed: {
                include: {
                  part: true,
                },
                orderBy: {
                  createdAt: "asc",
                },
              },
              laborItems: {
                include: {
                  createdBy: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: "asc",
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
            },
          },
        },
      },
      invoices: {
        where: {
          businessId,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const totalServices = customer.vehicles.reduce(
    (sum, vehicle) => sum + vehicle.services.length,
    0,
  );

  const totalSpent = customer.invoices.reduce(
    (sum, invoice) => sum + Number(invoice.total || 0),
    0,
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <div>
          <Link
            href="/dashboard/customers"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            Kthehu te klientët
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="af-page-eyebrow">Profili i klientit</p>

              <h1 className="af-page-title">{customer.name}</h1>

              <p className="af-page-description">
                Të dhënat e klientit, automjetet dhe historiku i plotë i
                shërbimeve.
              </p>
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              icon={Phone}
              label="Telefoni"
              value={customer.phone || "Pa telefon"}
            />

            <InfoCard
              icon={Mail}
              label="Email"
              value={customer.email || "Pa email"}
            />

            <InfoCard
              icon={MapPin}
              label="Qyteti"
              value={customer.city || "Pa qytet"}
            />

            <InfoCard
              icon={CarFront}
              label="Automjete"
              value={String(customer.vehicles.length)}
            />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Automjete"
            value={customer.vehicles.length}
          />

          <SummaryCard
            label="Shërbime gjithsej"
            value={totalServices}
          />

          <SummaryCard
            label="Shpenzuar gjithsej"
            value={formatCurrency(totalSpent)}
          />
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
              Automjetet
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Historiku sipas automjetit
            </h2>
          </div>

          {customer.vehicles.length === 0 ? (
            <div className="af-empty-state">
              <CarFront className="mx-auto h-8 w-8 text-slate-400" />

              <h3 className="mt-4 font-semibold text-slate-900">
                Ky klient nuk ka ende automjete
              </h3>
            </div>
          ) : (
            customer.vehicles.map((vehicle) => (
              <article
                key={vehicle.id}
                className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <CarFront size={21} />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
                          {vehicle.brand} {vehicle.model || ""}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                          <span className="font-mono font-semibold text-slate-700">
                            {vehicle.plate}
                          </span>

                          {vehicle.year ? (
                            <>
                              <span>•</span>
                              <span>{vehicle.year}</span>
                            </>
                          ) : null}

                          {vehicle.vin ? (
                            <>
                              <span>•</span>
                              <span>VIN: {vehicle.vin}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                      {vehicle.services.length} shërbime
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {vehicle.services.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                      <ClipboardList className="mx-auto h-7 w-7 text-slate-400" />

                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        Nuk ka ende histori shërbimesh për këtë automjet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {vehicle.services.map((service) => (
                        <div
                          key={service.id}
                          className="rounded-2xl border border-slate-200 p-5"
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-bold text-slate-950">
                                  {service.title}
                                </h4>

                                <span
                                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                    statusStyles[service.status] ||
                                    statusStyles.DRAFT
                                  }`}
                                >
                                  {statusLabels[service.status] ||
                                    service.status}
                                </span>
                              </div>

                              <p className="mt-2 text-sm text-slate-500">
                                {formatDate(service.createdAt)}
                                {service.assignedUser?.name
                                  ? ` • Mekanik: ${service.assignedUser.name}`
                                  : ""}
                              </p>
                            </div>

                            <p className="text-lg font-bold text-blue-700">
                              {formatCurrency(Number(service.total || 0))}
                            </p>
                          </div>

                          {(service.description ||
                            service.diagnosis ||
                            service.internalNotes) && (
                            <div className="mt-5 grid gap-4 lg:grid-cols-2">
                              {service.description ? (
                                <HistoryField
                                  label="Problemi / Përshkrimi"
                                  value={service.description}
                                />
                              ) : null}

                              {service.diagnosis ? (
                                <HistoryField
                                  label="Diagnoza"
                                  value={service.diagnosis}
                                />
                              ) : null}

                              {service.internalNotes ? (
                                <HistoryField
                                  label="Shënime teknike"
                                  value={service.internalNotes}
                                />
                              ) : null}
                            </div>
                          )}

                          {service.laborItems.length > 0 ? (
                            <div className="mt-5">
                              <div className="mb-3 flex items-center gap-2">
                                <Wrench
                                  size={16}
                                  className="text-slate-500"
                                />

                                <h5 className="text-sm font-bold text-slate-800">
                                  Punët e kryera
                                </h5>
                              </div>

                              <div className="space-y-2">
                                {service.laborItems.map((labor) => (
                                  <div
                                    key={labor.id}
                                    className="flex flex-col gap-1 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                  >
                                    <div>
                                      <p className="text-sm font-semibold text-slate-800">
                                        {labor.description}
                                      </p>

                                      {labor.createdBy?.name ? (
                                        <p className="mt-1 text-xs text-slate-500">
                                          Regjistruar nga{" "}
                                          {labor.createdBy.name}
                                        </p>
                                      ) : null}
                                    </div>

                                    <span className="text-sm font-bold text-slate-900">
                                      {formatCurrency(
                                        Number(labor.total || 0),
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {service.partsUsed.length > 0 ? (
                            <div className="mt-5">
                              <div className="mb-3 flex items-center gap-2">
                                <Package
                                  size={16}
                                  className="text-slate-500"
                                />

                                <h5 className="text-sm font-bold text-slate-800">
                                  Pjesët e përdorura
                                </h5>
                              </div>

                              <div className="space-y-2">
                                {service.partsUsed.map((usage) => (
                                  <div
                                    key={usage.id}
                                    className="flex flex-col gap-1 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                  >
                                    <div>
                                      <p className="text-sm font-semibold text-slate-800">
                                        {usage.part.name}
                                      </p>

                                      <p className="mt-1 text-xs text-slate-500">
                                        Sasia: {usage.quantity}
                                      </p>
                                    </div>

                                    <span className="text-sm font-bold text-slate-900">
                                      {formatCurrency(
                                        Number(usage.total || 0),
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              {service.invoice ? (
                                <>
                                  <span className="text-slate-500">
                                    Fatura:
                                  </span>

                                  <span className="font-semibold text-slate-900">
                                    {service.invoice.number}
                                  </span>

                                  <span className="text-slate-300">•</span>

                                  <span className="text-slate-600">
                                    {formatCurrency(
                                      Number(service.invoice.total || 0),
                                    )}
                                  </span>
                                </>
                              ) : (
                                <span className="text-slate-400">
                                  Pa faturë të lidhur
                                </span>
                              )}
                            </div>

                            <Link
                              href={`/dashboard/services/${service.id}`}
                              className="font-semibold text-blue-700 transition hover:text-blue-800 hover:underline"
                            >
                              Hap urdhër-punën →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="flex min-h-28 items-center gap-4 bg-white px-6 py-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </p>

        <p className="mt-1 truncate font-bold text-slate-950">
          {value}
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-2 text-2xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function HistoryField({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {value}
      </p>
    </div>
  );
}