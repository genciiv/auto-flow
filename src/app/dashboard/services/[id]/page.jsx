import { notFound } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ServiceWorkflowPanel from "@/components/services/ServiceWorkflowPanel";
import ServiceOperationsPanel from "@/components/services/ServiceOperationsPanel";
import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";
import { formatCurrency } from "@/lib/formatters";

const labels = { DRAFT:"Draft", PENDING:"Në pritje", IN_PROGRESS:"Në proces", WAITING_FOR_PARTS:"Në pritje të pjesëve", READY_FOR_PICKUP:"Gati për dorëzim", COMPLETED:"Përfunduar", DELIVERED:"Dorëzuar", CANCELLED:"Anuluar" };

export default async function ServiceDetailsPage({ params }) {
  const { id } = await params;
  const { businessId, businessRole, userId } = await requireBusinessPermission(PERMISSIONS.SERVICES_VIEW);
  const [service, members, parts] = await Promise.all([
    db.serviceRecord.findFirst({
      where: { id, businessId, ...(businessRole === "MECHANIC" ? { assignedUserId: userId } : {}) },
      include: {
        vehicle: { include: { customer: true } },
        assignedUser: { select: { id:true, name:true, email:true } },
        partsUsed: { include: { part:true }, orderBy: { createdAt:"asc" } },
        laborItems: { include: { createdBy: { select: { id:true, name:true } } }, orderBy: { createdAt:"asc" } },
        statusHistory: { orderBy: { createdAt:"desc" }, include: { changedBy: { select:{ name:true } } } },
        invoice: {
          select: {
            id: true,
            number: true,
            status: true,
            total: true,
            customerPayments: {
              select: {
                amount: true,
              },
            },
          },
        },
      },
    }),
    db.businessUser.findMany({
      where: { businessId, isActive:true },
      include: { user: { select: { id:true, name:true, email:true } } },
      orderBy: { createdAt:"asc" },
    }),
    db.part.findMany({ where: { businessId, stock: { gt: 0 } }, orderBy: { name:"asc" }, select: { id:true, name:true, stock:true, sellPrice:true } }),
  ]);
  if (!service) notFound();
  const serializable = JSON.parse(JSON.stringify(service));
  const serializableParts = JSON.parse(JSON.stringify(parts));
  const staff = members.filter((member) => member.role === "MECHANIC").map((member) => ({ id:member.user.id, name:member.user.name, email:member.user.email, role:member.role }));
  const canManageAssignment = ["OWNER", "MANAGER"].includes(businessRole);
  const canManageParts = ["OWNER", "MANAGER", "MECHANIC", "WAREHOUSE"].includes(businessRole);
  const canCreateInvoice = ["OWNER", "MANAGER", "RECEPTIONIST", "ACCOUNTANT"].includes(businessRole) && ["READY_FOR_PICKUP", "COMPLETED", "DELIVERED"].includes(service.status);

  return <DashboardLayout><div className="space-y-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-semibold text-blue-600">Urdhër-punë</p><h1 className="mt-2 text-3xl font-bold text-slate-950">{service.title}</h1><p className="mt-2 text-slate-500">{service.vehicle.brand} {service.vehicle.model || ""} · {service.vehicle.plate}</p></div>
      <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">{labels[service.status]}</div>
    </div>
    <div className="grid gap-4 md:grid-cols-4">
      <Info label="Klienti" value={service.vehicle.customer?.name || "Pa klient"}/><Info label="Mekaniku" value={service.assignedUser?.name || "Pa caktuar"}/><Info label="Totali" value={formatCurrency(service.total)}/><Info label="Pjesë të përdorura" value={String(service.partsUsed.length)}/>
    </div>
    <ServiceWorkflowPanel service={serializable} staff={staff} businessRole={businessRole} canManageAssignment={canManageAssignment}/>
    <ServiceOperationsPanel service={serializable} parts={serializableParts} canManageParts={canManageParts} canCreateInvoice={canCreateInvoice}/>
  </div></DashboardLayout>;
}
function Info({label,value}) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-base font-bold text-slate-950">{value}</p></div>; }
