import Link from "next/link";
import { Clock3, Wrench, Car, UserRound, ArrowRight } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";

const STATUS_LABELS = {
  DRAFT: "Draft",
  PENDING: "Në pritje",
  IN_PROGRESS: "Në proces",
  WAITING_FOR_PARTS: "Në pritje të pjesëve",
  READY_FOR_PICKUP: "Gati për dorëzim",
  COMPLETED: "Përfunduar",
  DELIVERED: "Dorëzuar",
  CANCELLED: "Anuluar",
};
const ACTIVE_STATUSES = ["DRAFT", "PENDING", "IN_PROGRESS", "WAITING_FOR_PARTS", "READY_FOR_PICKUP"];

export default async function MyWorkPage() {
  const { businessId, businessRole, userId } = await requireBusinessContext(["MECHANIC", "MANAGER", "OWNER"]);
  const services = await db.serviceRecord.findMany({
    where: { businessId, ...(businessRole === "MECHANIC" ? { assignedUserId: userId } : {}) },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      vehicle: { include: { customer: true } },
      assignedUser: { select: { id: true, name: true } },
      partsUsed: { select: { id: true } },
    },
  });
  const activeCount = services.filter((item) => ACTIVE_STATUSES.includes(item.status)).length;
  const waitingCount = services.filter((item) => item.status === "WAITING_FOR_PARTS").length;
  const readyCount = services.filter((item) => item.status === "READY_FOR_PICKUP").length;

  return <DashboardLayout><div className="space-y-7">
    <div><p className="text-sm font-semibold text-blue-600">Workspace i stafit</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Punët e mia</h1><p className="mt-2 text-slate-500">{businessRole === "MECHANIC" ? "Shiko dhe përditëso vetëm urdhër-punët që të janë caktuar." : "Monitoro punët aktive dhe ngarkesën e ekipit."}</p></div>
    <div className="grid gap-4 sm:grid-cols-3"><Stat label="Punë aktive" value={activeCount} icon={Wrench}/><Stat label="Në pritje të pjesëve" value={waitingCount} icon={Clock3}/><Stat label="Gati për dorëzim" value={readyCount} icon={Car}/></div>
    <div className="space-y-4">{services.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Wrench className="mx-auto text-slate-400" size={32}/><h2 className="mt-4 text-lg font-bold text-slate-900">Nuk ka punë të caktuara</h2><p className="mt-2 text-sm text-slate-500">Kur menaxheri të caktojë një urdhër-punë, ai do të shfaqet këtu.</p></div> : services.map((service) => <Link key={service.id} href={`/dashboard/services/${service.id}`} className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-lg font-bold text-slate-950">{service.title}</h2><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{STATUS_LABELS[service.status] ?? service.status}</span></div><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500"><span className="inline-flex items-center gap-2"><Car size={16}/>{service.vehicle.brand} {service.vehicle.model || ""} · {service.vehicle.plate}</span><span className="inline-flex items-center gap-2"><UserRound size={16}/>{service.vehicle.customer?.name || "Pa klient"}</span><span>{service.partsUsed.length} pjesë të regjistruara</span></div></div><div className="flex items-center gap-3 text-sm font-semibold text-blue-700">Hape urdhër-punën <ArrowRight size={18}/></div></div></Link>)}</div>
  </div></DashboardLayout>;
}
function Stat({ label, value, icon: Icon }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={20}/></div><p className="mt-4 text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-950">{value}</p></div>; }
