import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, History, PackageOpen } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";

const movementConfig = {
  SERVICE_OUT: { label: "Dalje për servis", tone: "border-red-200 bg-red-50 text-red-700", icon: ArrowUpRight },
  SERVICE_RETURN: { label: "Kthim nga servisi", tone: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: ArrowDownLeft },
  PURCHASE_IN: { label: "Hyrje nga blerja", tone: "border-blue-200 bg-blue-50 text-blue-700", icon: ArrowDownLeft },
  ADJUSTMENT_IN: { label: "Korrigjim hyrje", tone: "border-violet-200 bg-violet-50 text-violet-700", icon: ArrowDownLeft },
  ADJUSTMENT_OUT: { label: "Korrigjim dalje", tone: "border-amber-200 bg-amber-50 text-amber-700", icon: ArrowUpRight },
};

function formatDate(value) {
  return new Intl.DateTimeFormat("sq-AL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Tirane",
  }).format(new Date(value));
}

export default async function InventoryMovementsPage() {
  const { businessId } = await requireBusinessPermission(PERMISSIONS.INVENTORY_VIEW);
  const movements = await db.inventoryMovement.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      part: true,
      user: { select: { name: true } },
      service: { select: { id: true, title: true } },
    },
  });

  const entries = movements.filter((item) => ["PURCHASE_IN", "SERVICE_RETURN", "ADJUSTMENT_IN"].includes(item.type)).length;
  const exits = movements.length - entries;

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <div className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <p className="text-sm font-semibold text-blue-600">Magazina</p>
            <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-950">Lëvizjet e stokut</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">Historik i pandryshueshëm i çdo hyrjeje, daljeje, kthimi dhe korrigjimi.</p>
          </div>
          <Link href="/dashboard/inventory" className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">Kthehu te inventari</Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Lëvizje gjithsej", movements.length, History],
            ["Hyrje / kthime", entries, ArrowDownLeft],
            ["Dalje / korrigjime", exits, ArrowUpRight],
          ].map(([label, value, Icon]) => (
            <div key={label} className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={20} /></div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-950">Historiku i lëvizjeve</h2>
            <p className="mt-1 text-xs text-slate-500">Po shfaqen {movements.length} lëvizjet më të fundit.</p>
          </div>
          {movements.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Data</th><th className="px-5 py-4">Pjesa</th><th className="px-5 py-4">Lëvizja</th><th className="px-5 py-4">Sasia</th><th className="px-5 py-4">Stoku</th><th className="px-5 py-4">Punonjësi</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {movements.map((movement) => {
                    const config = movementConfig[movement.type] || { label: movement.type, tone: "border-slate-200 bg-slate-50 text-slate-700", icon: History };
                    const Icon = config.icon;
                    return <tr key={movement.id} className="transition hover:bg-blue-50/40">
                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">{formatDate(movement.createdAt)}</td>
                      <td className="px-5 py-4"><p className="font-semibold text-slate-950">{movement.part.name}</p><p className="mt-1 text-xs text-slate-400">{movement.part.code || "Pa kod"}</p></td>
                      <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.tone}`}><Icon size={13} />{config.label}</span>{movement.service ? <p className="mt-2 text-xs text-slate-500">{movement.service.title}</p> : null}</td>
                      <td className="px-5 py-4 font-bold text-slate-950">{movement.quantity}</td>
                      <td className="px-5 py-4"><span className="font-medium text-slate-500">{movement.stockBefore}</span><span className="mx-2 text-slate-300">→</span><span className="font-bold text-slate-950">{movement.stockAfter}</span></td>
                      <td className="px-5 py-4 text-slate-600">{movement.user?.name || "Sistemi"}</td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><PackageOpen size={22} /></div><h3 className="mt-4 font-semibold text-slate-900">Nuk ka ende lëvizje inventari</h3><p className="mt-2 max-w-md text-sm text-slate-500">Lëvizjet do të shfaqen pasi të regjistrohen blerje, përdorime ose korrigjime stoku.</p></div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
