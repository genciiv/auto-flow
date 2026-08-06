import { Download, FileSpreadsheet, FileText, ShieldCheck } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PeriodFilter from "@/components/finance/PeriodFilter";
import { requireBusinessPermission } from "@/lib/business-context";
import { parseFinancePeriod } from "@/lib/finance-period";
import { PERMISSIONS } from "@/lib/permissions";

export default async function ReportsPage({ searchParams }) {
  const params = await searchParams;
  const period = parseFinancePeriod(params);
  await requireBusinessPermission(PERMISSIONS.FINANCE_EXPORT);
  const query = new URLSearchParams({ preset: period.preset, start: period.startInput, end: period.endInput, type: "FULL" }).toString();

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><FileSpreadsheet size={23} /></div><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Raporte & eksport</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Eksporto raportin financiar</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Zgjidh periudhën dhe shkarko një file Excel të strukturuar për analizë, arkivim ose kontabilitet.</p></div></div>
        </header>
        <PeriodFilter period={period} />
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><FileSpreadsheet size={20} /></div><div><h2 className="text-xl font-black text-slate-950">Raporti i plotë financiar</h2><p className="mt-1 text-sm text-slate-500">Format Excel (.xlsx)</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{["Përmbledhje financiare", "Të ardhura dhe shpenzime", "Fatura dhe pagesa", "Inventar dhe porosi", "Lëvizje stoku", "Të dhëna për periudhën"].map((item) => <div key={item} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700"><ShieldCheck size={16} className="text-emerald-600" />{item}</div>)}</div><a href={`/api/dashboard/finance/export?${query}`} className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-black text-white transition hover:bg-emerald-700"><Download size={18} /> Shkarko Excel (.xlsx)</a></div>
          <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm"><FileText className="text-blue-300" size={26} /><h3 className="mt-5 text-lg font-black">Gati për përdorim</h3><p className="mt-3 text-sm leading-6 text-slate-300">File-i shkarkohet direkt dhe mund të hapet në Microsoft Excel, Google Sheets ose LibreOffice Calc.</p><div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Periudha</p><p className="mt-2 font-black">{period.startInput} — {period.endInput}</p></div></aside>
        </section>
      </div>
    </DashboardLayout>
  );
}
