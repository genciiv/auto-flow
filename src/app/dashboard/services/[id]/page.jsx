import { notFound } from "next/navigation";
import {
  CarFront,
  CircleDollarSign,
  ClipboardList,
  PackageCheck,
  UserRound,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ServiceOperationsPanel from "@/components/services/ServiceOperationsPanel";
import ServiceWorkflowPanel from "@/components/services/ServiceWorkflowPanel";
import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/formatters";
import { PERMISSIONS } from "@/lib/permissions";
import { calculateServiceLinesTotal } from "@/lib/service-total";

const labels = {
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

export default async function ServiceDetailsPage({ params }) {
  const { id } = await params;
  const { businessId, businessRole, userId } = await requireBusinessPermission(
    PERMISSIONS.SERVICES_VIEW,
  );

  const [service, members, parts] = await Promise.all([
    db.serviceRecord.findFirst({
      where: {
        id,
        businessId,
        ...(businessRole === "MECHANIC" ? { assignedUserId: userId } : {}),
      },
      include: {
        vehicle: { include: { customer: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
        partsUsed: {
          include: { part: true },
          orderBy: { createdAt: "asc" },
        },
        laborItems: {
          include: { createdBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          include: { changedBy: { select: { name: true } } },
        },
        invoice: {
          select: {
            id: true,
            number: true,
            status: true,
            total: true,
            customerPayments: { select: { amount: true } },
          },
        },
      },
    }),
    db.businessUser.findMany({
      where: { businessId, isActive: true },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.part.findMany({
      where: { businessId, stock: { gt: 0 } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, stock: true, sellPrice: true },
    }),
  ]);

  if (!service) notFound();

  const calculatedTotal = calculateServiceLinesTotal({
    laborItems: service.laborItems,
    partsUsed: service.partsUsed,
  });

  const serializable = JSON.parse(JSON.stringify({ ...service, total: calculatedTotal }));
  const serializableParts = JSON.parse(JSON.stringify(parts));

  const staff = members
    .filter((member) => member.role === "MECHANIC")
    .map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
    }));

  const canManageAssignment = ["OWNER", "MANAGER"].includes(businessRole);
  const canManageParts = ["OWNER", "MANAGER", "MECHANIC", "WAREHOUSE"].includes(
    businessRole,
  );
  const canCreateInvoice =
    ["OWNER", "MANAGER", "RECEPTIONIST", "ACCOUNTANT"].includes(businessRole) &&
    ["READY_FOR_PICKUP", "COMPLETED", "DELIVERED"].includes(service.status);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-6 py-6 text-white lg:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-200">
                  <ClipboardList size={15} />
                  <span>Urdhër-punë</span>
                  <span className="text-white/35">•</span>
                  <span className="font-mono text-white/75">{service.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  {service.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-2">
                    <CarFront size={16} />
                    {service.vehicle.brand} {service.vehicle.model || ""}
                  </span>
                  <span className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1 font-mono font-bold text-white">
                    {service.vehicle.plate}
                  </span>
                </div>
              </div>

              <span
                className={`inline-flex w-fit items-center rounded-full border px-4 py-2 text-sm font-bold ${statusStyles[service.status]}`}
              >
                {labels[service.status]}
              </span>
            </div>
          </div>

          <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
            <Info icon={UserRound} label="Klienti" value={service.vehicle.customer?.name || "Pa klient"} />
            <Info icon={UserRound} label="Mekaniku" value={service.assignedUser?.name || "Pa caktuar"} />
            <Info icon={CircleDollarSign} label="Totali" value={formatCurrency(calculatedTotal)} emphasize />
            <Info icon={PackageCheck} label="Pjesë të përdorura" value={String(service.partsUsed.length)} />
          </div>
        </section>

        <ServiceWorkflowPanel
          service={serializable}
          staff={staff}
          businessRole={businessRole}
          canManageAssignment={canManageAssignment}
        />

        <ServiceOperationsPanel
          service={serializable}
          parts={serializableParts}
          canManageParts={canManageParts}
          canCreateInvoice={canCreateInvoice}
        />
      </div>
    </DashboardLayout>
  );
}

function Info({ icon: Icon, label, value, emphasize = false }) {
  return (
    <div className="flex min-h-28 items-center gap-4 bg-white px-6 py-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        <p className={`mt-1 truncate font-bold ${emphasize ? "text-xl text-blue-700" : "text-base text-slate-950"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
