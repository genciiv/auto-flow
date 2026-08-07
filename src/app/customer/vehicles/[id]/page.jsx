import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CarFront,
  Fuel,
  Gauge,
  Hash,
  Link2,
  Palette,
  ReceiptText,
  Settings2,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

import { updateCustomerVehicle } from "@/app/customer/vehicles/actions";
import CustomerVehicleForm from "@/components/customer/CustomerVehicleForm";
import CustomerVehicleHistoryForms from "@/components/customer/CustomerVehicleHistoryForms";
import CustomerVehicleDocuments from "@/components/customer/CustomerVehicleDocuments";
import CustomerVehicleMaintenanceForms from "@/components/customer/CustomerVehicleMaintenanceForms";
import CustomerVehicleMaintenanceOverview from "@/components/customer/CustomerVehicleMaintenanceOverview";
import DeleteCustomerVehicleButton from "@/components/customer/DeleteCustomerVehicleButton";
import DeleteCustomerVehicleExpenseButton from "@/components/customer/DeleteCustomerVehicleExpenseButton";
import { CUSTOMER_VEHICLE_EXPENSE_LABELS } from "@/config/customer-vehicle-history";
import { CUSTOMER_VEHICLE_MAINTENANCE_LABELS } from "@/config/customer-vehicle-maintenance";
import { customerVehicleAccessWhere } from "@/lib/customer-access";
import { requireCustomerContext } from "@/lib/customer-context";
import { formatAppDate } from "@/lib/date-time";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { SERVICE_STATUS_LABELS } from "@/lib/service-workflow";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;

  return {
    title: `Automjeti ${resolvedParams.id} | AutoFlow`,
  };
}

function formatMileage(value) {
  if (value === null || value === undefined) {
    return "Nuk është vendosur";
  }

  return `${new Intl.NumberFormat("sq-AL").format(value)} km`;
}

function getTodayInputValue() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Tirane",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getHistoryBadge(entry) {
  if (entry.kind === "SERVICE" || entry.kind === "SERVICE_MAINTENANCE") {
    return {
      label: "E verifikuar nga servisi",
      className: "bg-blue-50 text-blue-700 ring-blue-100",
    };
  }

  if (entry.kind === "MILEAGE" && entry.source === "SYSTEM") {
    return {
      label: "Regjistrim i sistemit",
      className: "bg-slate-100 text-slate-600 ring-slate-200",
    };
  }

  return {
    label: "Shtuar nga pronari",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  };
}

function buildTimeline({
  mileageHistory,
  expenses,
  services,
  maintenanceHistory,
  verifiedMaintenance,
}) {
  const mileageEntries = mileageHistory.map((entry) => ({
    id: `mileage-${entry.id}`,
    kind: "MILEAGE",
    date: entry.recordedAt,
    source: entry.source,
    title: "Kilometrazhi u përditësua",
    description: entry.notes,
    value: formatMileage(entry.mileage),
  }));

  const expenseEntries = expenses.map((expense) => ({
    id: `expense-${expense.id}`,
    kind: "EXPENSE",
    date: expense.occurredAt,
    title:
      CUSTOMER_VEHICLE_EXPENSE_LABELS[expense.type] || "Shpenzim personal",
    description: expense.notes,
    value: formatMoney(expense.amount, {
      currency: expense.currency,
      maximumFractionDigits: 2,
    }),
    mileage: expense.mileage,
  }));

  const maintenanceEntries = maintenanceHistory.map((item) => ({
    id: `maintenance-${item.id}`,
    kind: "MAINTENANCE",
    date: item.performedAt,
    source: item.source,
    title: CUSTOMER_VEHICLE_MAINTENANCE_LABELS[item.type] || item.title,
    description: item.notes,
    value: item.nextDate
      ? `Afati ${formatAppDate(item.nextDate)}`
      : item.nextMileage !== null
        ? `Afati ${formatMileage(item.nextMileage)}`
        : "Mirëmbajtje e regjistruar",
    mileage: item.mileage,
  }));

  const serviceEntries = services.map((service) => ({
    id: `service-${service.id}`,
    kind: "SERVICE",
    date:
      service.deliveredAt ||
      service.completedAt ||
      service.readyAt ||
      service.startedAt ||
      service.createdAt,
    title: service.title,
    description: `${service.business.name} · ${
      SERVICE_STATUS_LABELS[service.status] || service.status
    }`,
    value: formatMoney(service.total, {
      currency: service.business.currency,
      maximumFractionDigits: 2,
    }),
    href: `/customer/services/${service.id}`,
  }));

  const verifiedMaintenanceEntries = verifiedMaintenance.map((item) => ({
    id: `service-maintenance-${item.id}`,
    kind: "SERVICE_MAINTENANCE",
    date: item.lastDate || item.updatedAt,
    title: item.title,
    description: item.notes || "Mirëmbajtje e regjistruar nga servisi",
    value: item.nextDate
      ? `Afati ${formatAppDate(item.nextDate)}`
      : item.nextMileage !== null
        ? `Afati ${formatMileage(item.nextMileage)}`
        : "E verifikuar",
    mileage: item.lastMileage,
  }));

  return [
    ...mileageEntries,
    ...expenseEntries,
    ...maintenanceEntries,
    ...serviceEntries,
    ...verifiedMaintenanceEntries,
  ]
    .sort((left, right) => new Date(right.date) - new Date(left.date))
    .slice(0, 50);
}

function HistoryIcon({ kind }) {
  if (kind === "SERVICE" || kind === "SERVICE_MAINTENANCE" || kind === "MAINTENANCE") {
    return <Wrench size={18} />;
  }
  if (kind === "EXPENSE") return <ReceiptText size={18} />;
  return <Gauge size={18} />;
}

export default async function CustomerVehicleDetailsPage({ params }) {
  const { profileId } = await requireCustomerContext();
  const resolvedParams = await params;
  const vehicleId = resolvedParams.id;

  const vehicle = await db.customerVehicle.findFirst({
    where: customerVehicleAccessWhere(profileId, vehicleId),
    include: {
      mileageHistory: {
        orderBy: [{ recordedAt: "desc" }, { createdAt: "desc" }],
        take: 25,
      },
      expenses: {
        orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
        take: 12,
      },
      maintenanceHistory: {
        orderBy: [{ performedAt: "desc" }, { createdAt: "desc" }],
        take: 30,
      },
      reminders: {
        where: { isActive: true },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        take: 12,
      },
      documents: {
        orderBy: [{ expiresAt: "asc" }, { createdAt: "desc" }],
        take: 30,
      },
      links: {
        where: {
          isActive: true,
        },
        select: {
          vehicleId: true,
        },
      },
    },
  });

  if (!vehicle) {
    notFound();
  }

  const linkedVehicleIds = [...new Set(vehicle.links.map((link) => link.vehicleId))];

  const [services, verifiedMaintenance, expenseSummary] = await Promise.all([
    linkedVehicleIds.length
      ? db.serviceRecord.findMany({
          where: {
            vehicleId: {
              in: linkedVehicleIds,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 25,
          select: {
            id: true,
            title: true,
            status: true,
            total: true,
            createdAt: true,
            startedAt: true,
            readyAt: true,
            completedAt: true,
            deliveredAt: true,
            business: {
              select: {
                name: true,
                currency: true,
              },
            },
          },
        })
      : Promise.resolve([]),
    linkedVehicleIds.length
      ? db.maintenanceItem.findMany({
          where: {
            vehicleId: {
              in: linkedVehicleIds,
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 12,
          select: {
            id: true,
            type: true,
            title: true,
            lastMileage: true,
            nextMileage: true,
            lastDate: true,
            nextDate: true,
            notes: true,
            updatedAt: true,
          },
        })
      : Promise.resolve([]),
    db.customerVehicleExpense.aggregate({
      where: {
        customerVehicleId: vehicle.id,
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    }),
  ]);

  const vehicleTitle =
    [vehicle.brand, vehicle.model].filter(Boolean).join(" ") || vehicle.brand;
  const updateAction = updateCustomerVehicle.bind(null, vehicle.id);
  const vehicleFormData = {
    id: vehicle.id,
    plate: vehicle.plate,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    fuel: vehicle.fuel,
    engine: vehicle.engine,
    transmission: vehicle.transmission,
    vin: vehicle.vin,
    mileage: vehicle.mileage,
    color: vehicle.color,
    notes: vehicle.notes,
  };
  const defaultDate = getTodayInputValue();
  const timeline = buildTimeline({
    mileageHistory: vehicle.mileageHistory,
    expenses: vehicle.expenses,
    services,
    maintenanceHistory: vehicle.maintenanceHistory,
    verifiedMaintenance,
  });

  const details = [
    {
      label: "Targa",
      value: vehicle.plate,
      icon: Hash,
    },
    {
      label: "Viti",
      value: vehicle.year || "Nuk është vendosur",
      icon: CalendarDays,
    },
    {
      label: "Karburanti",
      value: vehicle.fuel || "Nuk është vendosur",
      icon: Fuel,
    },
    {
      label: "Kambio",
      value: vehicle.transmission || "Nuk është vendosur",
      icon: Settings2,
    },
    {
      label: "Kilometrat",
      value: formatMileage(vehicle.mileage),
      icon: Gauge,
    },
    {
      label: "Ngjyra",
      value: vehicle.color || "Nuk është vendosur",
      icon: Palette,
    },
  ];

  return (
    <div className="space-y-7">
      <div>
        <Link
          href="/customer/vehicles"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Kthehu te automjetet
        </Link>
      </div>

      <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
        <div className="relative">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                <CarFront size={14} />
                Dosja dixhitale e automjetit
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                {vehicleTitle}
              </h1>

              <p className="mt-3 text-sm font-black tracking-[0.18em] text-blue-300">
                {vehicle.plate}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200 ring-1 ring-white/10">
                <Gauge size={16} className="text-blue-300" />
                <span className="font-semibold">{formatMileage(vehicle.mileage)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <Link
                href={`/customer/vehicles/${vehicle.id}/claim`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Link2 size={18} />
                Lidhe me një servis
              </Link>

              <DeleteCustomerVehicleButton
                vehicleId={vehicle.id}
                vehicleName={`${vehicleTitle} (${vehicle.plate})`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {details.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon size={20} />
              </div>

              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                {item.label}
              </p>

              <p className="mt-1 text-sm font-bold text-slate-950">
                {item.value}
              </p>
            </div>
          );
        })}
      </section>

      <CustomerVehicleHistoryForms
        vehicleId={vehicle.id}
        currentMileage={vehicle.mileage}
        defaultDate={defaultDate}
      />

      <CustomerVehicleMaintenanceForms
        vehicleId={vehicle.id}
        currentMileage={vehicle.mileage}
        defaultDate={defaultDate}
      />

      <CustomerVehicleMaintenanceOverview
        vehicleId={vehicle.id}
        currentMileage={vehicle.mileage}
        maintenanceRecords={vehicle.maintenanceHistory}
        reminders={vehicle.reminders}
        verifiedMaintenance={verifiedMaintenance}
      />

      <CustomerVehicleDocuments
        vehicleId={vehicle.id}
        documents={vehicle.documents}
      />

      <section id="historiku" className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Sparkles size={17} />
                  <p className="text-xs font-black uppercase tracking-[0.16em]">
                    Timeline
                  </p>
                </div>
                <h2 className="mt-2 text-lg font-bold text-slate-950">
                  Historiku i automjetit
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Kilometra, mirëmbajtje, shpenzime personale dhe servise të verifikuara në një vend.
                </p>
              </div>

              <div className="hidden rounded-2xl bg-slate-50 px-3 py-2 text-right sm:block">
                <p className="text-xs font-semibold text-slate-400">Regjistrime</p>
                <p className="text-lg font-black text-slate-950">{timeline.length}</p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {timeline.length ? (
              <div className="relative space-y-1 before:absolute before:bottom-5 before:left-[21px] before:top-5 before:w-px before:bg-slate-200">
                {timeline.map((entry) => {
                  const badge = getHistoryBadge(entry);
                  const content = (
                    <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition group-hover:border-blue-100 group-hover:bg-blue-50/30">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-400">
                            {formatAppDate(entry.date)}
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-950">
                            {entry.title}
                          </p>
                          {entry.description ? (
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              {entry.description}
                            </p>
                          ) : null}
                          {entry.mileage !== null && entry.mileage !== undefined ? (
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {formatMileage(entry.mileage)}
                            </p>
                          ) : null}
                        </div>

                        <div className="shrink-0 sm:text-right">
                          <p className="text-sm font-black text-slate-950">
                            {entry.value}
                          </p>
                          <span
                            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <div key={entry.id} className="group relative flex gap-4 py-2">
                      <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-blue-600 shadow-sm">
                        <HistoryIcon kind={entry.kind} />
                      </div>

                      {entry.href ? (
                        <Link href={entry.href} className="min-w-0 flex-1">
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                <Gauge size={30} className="mx-auto text-slate-300" />
                <h3 className="mt-3 text-sm font-bold text-slate-800">
                  Historiku do të shfaqet këtu
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                  Regjistro kilometrat ose një shpenzim. Serviset e lidhura do të shtohen automatikisht.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Shpenzimet personale
                </p>
                <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                  {formatMoney(expenseSummary._sum.amount || 0, {
                    currency: "ALL",
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {expenseSummary._count.id} regjistrime gjithsej
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Banknote size={20} />
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-bold text-slate-950">
                Shpenzimet e fundit
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {vehicle.expenses.length ? (
                vehicle.expenses.map((expense) => (
                  <div key={expense.id} className="flex items-start gap-3 px-5 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                      <ReceiptText size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900">
                        {CUSTOMER_VEHICLE_EXPENSE_LABELS[expense.type] || "Shpenzim"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {formatAppDate(expense.occurredAt)}
                        {expense.mileage !== null ? ` · ${formatMileage(expense.mileage)}` : ""}
                      </p>
                      {expense.notes ? (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {expense.notes}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm font-black text-slate-950">
                        {formatMoney(expense.amount, {
                          currency: expense.currency,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <DeleteCustomerVehicleExpenseButton
                      vehicleId={vehicle.id}
                      expenseId={expense.id}
                    />
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center">
                  <ReceiptText size={24} className="mx-auto text-slate-300" />
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    Nuk ka shpenzime të regjistruara.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Të dhënat e servisit nuk ndryshohen nga klienti
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Serviset dhe mirëmbajtjet e servisit shfaqen si të verifikuara. Kilometrat, mirëmbajtjet dhe shpenzimet personale shënohen qartë si të shtuara nga pronari.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <h2 className="text-lg font-bold text-slate-950">
            Përditëso të dhënat teknike
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Ndrysho targën, markën, modelin dhe të dhënat e tjera. Kilometrazhi menaxhohet veçmas që historiku të mos humbasë.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <CustomerVehicleForm
            action={updateAction}
            vehicle={vehicleFormData}
            submitLabel="Ruaj ndryshimet"
          />
        </div>
      </section>
    </div>
  );
}
