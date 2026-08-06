import Link from "next/link";
import { ArrowRight, Boxes, CalendarDays, CheckCircle2, ClipboardCheck, Clock3, Plus } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { createInventoryCountAction } from "../actions";

const labels = { DRAFT: "Draft", IN_REVIEW: "Në shqyrtim", APPROVED: "Aprovuar", POSTED: "Postuar", CANCELLED: "Anuluar" };
const statusClasses = { DRAFT: "bg-slate-100 text-slate-700", IN_REVIEW: "bg-amber-50 text-amber-700", APPROVED: "bg-blue-50 text-blue-700", POSTED: "bg-emerald-50 text-emerald-700", CANCELLED: "bg-red-50 text-red-700" };

export default async function CountsPage() {
  const { businessId, businessRole } = await requireBusinessPermission(PERMISSIONS.INVENTORY_COUNTS_VIEW);
  const canManageCounts = hasPermission(businessRole, PERMISSIONS.INVENTORY_COUNTS_MANAGE);
  const rows = await db.inventoryCount.findMany({ where: { businessId }, include: { _count: { select: { items: true } } }, orderBy: { countDate: "desc" } });

  const posted = rows.filter((row) => row.status === "POSTED").length;
  const active = rows.filter((row) => ["DRAFT", "IN_REVIEW", "APPROVED"].includes(row.status)).length;

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Inventari financiar</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Inventarizimet periodike</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Krahaso stokun në sistem me sasinë reale dhe posto korrigjimet vetëm pas aprovimit.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[{ label: "Gjithsej", value: rows.length, icon: ClipboardCheck }, { label: "Aktive", value: active, icon: Clock3 }, { label: "Të postuara", value: posted, icon: CheckCircle2 }].map((item) => { const Icon = item.icon; return <div key={item.label} className="rounded-2xl bg-slate-50 p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-slate-500">{item.label}</p><p className="mt-2 text-2xl font-black text-slate-950">{item.value}</p></div><Icon className="text-slate-400" size={22} /></div></div>; })}
          </div>
        </header>

        {canManageCounts ? <form action={createInventoryCountAction} className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[minmax(0,1fr)_220px_190px_auto]"><input name="name" required placeholder="P.sh. Inventarizim Gusht 2026" className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /><select name="periodType" className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"><option value="MONTHLY">Mujor</option><option value="QUARTERLY">3-mujor</option><option value="SIX_MONTHS">6-mujor</option><option value="YEARLY">Vjetor</option><option value="CUSTOM">Personalizuar</option></select><input name="countDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /><button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700"><Plus size={17} /> Krijo</button></form> : null}

        <section className="space-y-4">
          {rows.length === 0 ? <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><Boxes className="mx-auto h-11 w-11 text-slate-300" /><h2 className="mt-4 font-black text-slate-900">Nuk ka inventarizime</h2><p className="mt-2 text-sm text-slate-500">Krijo inventarizimin e parë për të krahasuar stokun fizik.</p></div> : rows.map((row) => <Link key={row.id} href={`/dashboard/finance/inventory-counts/${row.id}`} className="group block rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><ClipboardCheck size={22} /></div><div><h2 className="font-black text-slate-950">{row.name}</h2><div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500"><span className="inline-flex items-center gap-1.5"><CalendarDays size={15} />{new Date(row.countDate).toLocaleDateString("sq-AL")}</span><span className="inline-flex items-center gap-1.5"><Boxes size={15} />{row._count.items} artikuj</span></div></div></div><div className="flex items-center justify-between gap-4 sm:justify-end"><span className={`rounded-full px-3 py-1.5 text-xs font-black ${statusClasses[row.status] || statusClasses.DRAFT}`}>{labels[row.status] || row.status}</span><ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" size={19} /></div></div></Link>)}
        </section>
      </div>
    </DashboardLayout>
  );
}
