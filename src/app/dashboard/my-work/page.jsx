import Link from "next/link";
import { ArrowRight, Car, Clock3, UserRound, Wrench } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";

const STATUS_CONFIG = {
  DRAFT: ["Draft", "border-slate-200 bg-slate-100 text-slate-700"],
  PENDING: ["Në pritje", "border-amber-200 bg-amber-50 text-amber-700"],
  IN_PROGRESS: ["Në proces", "border-blue-200 bg-blue-50 text-blue-700"],
  WAITING_FOR_PARTS: ["Në pritje të pjesëve", "border-orange-200 bg-orange-50 text-orange-700"],
  READY_FOR_PICKUP: ["Gati për dorëzim", "border-emerald-200 bg-emerald-50 text-emerald-700"],
  COMPLETED: ["Përfunduar", "border-emerald-200 bg-emerald-50 text-emerald-700"],
  DELIVERED: ["Dorëzuar", "border-slate-200 bg-slate-100 text-slate-700"],
  CANCELLED: ["Anuluar", "border-red-200 bg-red-50 text-red-700"],
};
const ACTIVE_STATUSES = ["DRAFT", "PENDING", "IN_PROGRESS", "WAITING_FOR_PARTS", "READY_FOR_PICKUP"];

export default async function MyWorkPage() {
  const { businessId, businessRole, userId } = await requireBusinessContext(["MECHANIC", "MANAGER", "OWNER"]);
  const services = await db.serviceRecord.findMany({
    where: { businessId, ...(businessRole === "MECHANIC" ? { assignedUserId: userId } : {}) },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: { vehicle: { include: { customer: true } }, assignedUser: { select: { id: true, name: true } }, partsUsed: { select: { id: true } } },
  });

  const stats = [
    ["Punë aktive", services.filter((item) => ACTIVE_STATUSES.includes(item.status)).length, Wrench],
    ["Në pritje të pjesëve", services.filter((item) => item.status === "WAITING_FOR_PARTS").length, Clock3],
    ["Gati për dorëzim", services.filter((item) => item.status === "READY_FOR_PICKUP").length, Car],
  ];

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <div className="af-page-header">
          <div>
            <p className="af-page-eyebrow">Workspace i stafit</p>
            <h1 className="af-page-title">Punët e mia</h1>
            <p className="af-page-description">
              {businessRole === "MECHANIC"
                ? "Shiko dhe përditëso vetëm urdhër-punët që të janë caktuar."
                : "Monitoro punët aktive dhe ngarkesën e ekipit."}
            </p>
          </div>

          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 sm:flex">
            <Wrench size={22} />
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">{stats.map(([label, value, Icon]) => <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Icon size={21} /></div><p className="mt-4 text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-3xl font-black text-slate-950">{value}</p></div>)}</section>

        <section className="space-y-4">
          {services.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><Wrench size={27} /></div><h2 className="mt-5 text-lg font-bold text-slate-900">Nuk ka punë të caktuara</h2><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Kur menaxheri të caktojë një urdhër-punë, ai do të shfaqet këtu.</p></div> : services.map((service) => {
            const [statusLabel, statusClass] = STATUS_CONFIG[service.status] ?? [service.status, "border-slate-200 bg-slate-100 text-slate-700"];
            return <Link key={service.id} href={`/dashboard/services/${service.id}`} className="group block rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-lg font-bold text-slate-950">{service.title}</h2><span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}>{statusLabel}</span></div><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500"><span className="inline-flex items-center gap-2"><Car size={16} />{service.vehicle.brand} {service.vehicle.model || ""} · {service.vehicle.plate}</span><span className="inline-flex items-center gap-2"><UserRound size={16} />{service.vehicle.customer?.name || "Pa klient"}</span><span className="inline-flex items-center gap-2"><Wrench size={16} />{service.partsUsed.length} pjesë</span></div></div><div className="inline-flex items-center gap-2 self-start rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white lg:self-auto">Hape urdhër-punën <ArrowRight size={17} className="transition group-hover:translate-x-0.5" /></div></div></Link>;
          })}
        </section>
      </div>
    </DashboardLayout>
  );
}
