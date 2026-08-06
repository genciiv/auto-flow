import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Scale,
  Send,
  Warehouse,
} from "lucide-react";
import Link from "next/link";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";
import { addMoney, moneyToNumber, toMoney } from "@/lib/money";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

import {
  approveInventoryCountAction,
  postInventoryCountAction,
  saveInventoryCountAction,
  submitInventoryCountAction,
} from "../../actions";

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", className: "border-slate-200 bg-slate-100 text-slate-700" },
  IN_REVIEW: { label: "Në shqyrtim", className: "border-amber-200 bg-amber-50 text-amber-700" },
  APPROVED: { label: "Aprovuar", className: "border-blue-200 bg-blue-50 text-blue-700" },
  POSTED: { label: "Postuar", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
};

function formatAmount(value) {
  return moneyToNumber(value).toLocaleString("sq-AL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default async function CountDetail({ params }) {
  const { id } = await params;
  const { businessId, businessRole } = await requireBusinessContext();

  const count = await db.inventoryCount.findFirst({
    where: { id, businessId },
    include: { items: { orderBy: { partName: "asc" } } },
  });

  if (!count) notFound();

  const editable =
    count.status === "DRAFT" &&
    hasPermission(businessRole, PERMISSIONS.INVENTORY_COUNTS_MANAGE);
  const canApprove = hasPermission(
    businessRole,
    PERMISSIONS.INVENTORY_COUNTS_APPROVE,
  );

  const totals = count.items.reduce(
    (accumulator, item) => ({
      expected: addMoney(accumulator.expected, item.expectedValue),
      actual: addMoney(accumulator.actual, item.actualValue ?? 0),
      difference: addMoney(accumulator.difference, item.differenceValue ?? 0),
    }),
    { expected: toMoney(0), actual: toMoney(0), difference: toMoney(0) },
  );

  const summaryCards = [
    { label: "Vlera sipas sistemit", value: totals.expected, icon: Warehouse },
    { label: "Vlera reale", value: totals.actual, icon: Boxes },
    { label: "Diferenca", value: totals.difference, icon: Scale },
  ];
  const statusConfig = STATUS_CONFIG[count.status] ?? STATUS_CONFIG.DRAFT;

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
          <div className="relative">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Link href="/dashboard/finance/inventory-counts" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">
                  <ArrowLeft size={16} /> Kthehu te inventarizimet
                </Link>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{count.name}</h1>
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusConfig.className}`}>{statusConfig.label}</span>
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  Inventarizim i datës {new Intl.DateTimeFormat("sq-AL", { dateStyle: "long", timeZone: "Europe/Tirane" }).format(new Date(count.countDate))}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Artikuj të kontrolluar</p>
                <p className="mt-1 text-3xl font-black">{count.items.length}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {summaryCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Icon size={21} /></div>
              <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{formatAmount(value)} ALL</p>
            </div>
          ))}
        </section>

        <form action={saveInventoryCountAction} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <input type="hidden" name="inventoryCountId" value={count.id} />
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-950">Rezultatet sipas artikullit</h2>
            <p className="mt-1 text-sm text-slate-500">Krahaso sasinë e sistemit me numërimin real fizik.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr><th className="px-5 py-3">Pjesa</th><th className="px-4 py-3">Pritet</th><th className="px-4 py-3">Reale</th><th className="px-4 py-3">Diferenca</th><th className="px-4 py-3">Vlera</th><th className="px-5 py-3">Shënim</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {count.items.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50/80">
                    <td className="px-5 py-4 font-semibold text-slate-900">{item.partName}<div className="mt-1 text-xs font-normal text-slate-400">{item.partCode || "Pa kod"}</div></td>
                    <td className="px-4 py-4 text-slate-600">{item.expectedQuantity}</td>
                    <td className="px-4 py-4">{editable ? <input type="number" min="0" name={`actual_${item.id}`} defaultValue={item.actualQuantity ?? item.expectedQuantity} className="w-24 rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /> : <span className="font-semibold text-slate-800">{item.actualQuantity ?? "—"}</span>}</td>
                    <td className="px-4 py-4"><span className={`font-bold ${(item.difference ?? 0) < 0 ? "text-red-600" : (item.difference ?? 0) > 0 ? "text-emerald-600" : "text-slate-500"}`}>{item.difference ?? "—"}</span></td>
                    <td className="px-4 py-4 font-semibold text-slate-800">{formatAmount(item.differenceValue ?? 0)} ALL</td>
                    <td className="px-5 py-4">{editable ? <input name={`note_${item.id}`} defaultValue={item.note || ""} placeholder="Shënim opsional" className="w-full min-w-48 rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /> : <span className="text-slate-600">{item.note || "—"}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {editable ? <div className="flex justify-end border-t border-slate-200 bg-slate-50/70 p-4"><button className="rounded-xl bg-slate-950 px-5 py-2.5 font-bold text-white transition hover:bg-slate-800">Ruaj sasitë</button></div> : null}
        </form>

        <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div><h2 className="font-bold text-slate-950">Hapi i radhës</h2><p className="mt-1 text-sm text-slate-500">Vazhdo inventarizimin sipas statusit dhe rolit tënd.</p></div>
          <div className="flex flex-wrap gap-3">
            {editable ? <form action={submitInventoryCountAction}><input type="hidden" name="inventoryCountId" value={count.id} /><button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white transition hover:bg-blue-700"><Send size={17} /> Dërgo për shqyrtim</button></form> : null}
            {count.status === "IN_REVIEW" && canApprove ? <form action={approveInventoryCountAction}><input type="hidden" name="inventoryCountId" value={count.id} /><button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white transition hover:bg-emerald-700"><CheckCircle2 size={17} /> Aprovo</button></form> : null}
            {count.status === "APPROVED" && canApprove ? <form action={postInventoryCountAction}><input type="hidden" name="inventoryCountId" value={count.id} /><button className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 font-bold text-white transition hover:bg-amber-700"><ClipboardCheck size={17} /> Posto korrigjimet</button></form> : null}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
