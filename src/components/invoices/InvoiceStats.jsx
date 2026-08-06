import { BadgeEuro, CheckCircle2, Clock3, FileText } from "lucide-react";

import { formatCurrency } from "@/lib/formatters";

export default function InvoiceStats({ stats }) {
  const items = [
    { title: "Total fatura", value: stats.totalInvoices, description: `${stats.draftInvoices || 0} draft`, icon: FileText, tone: "bg-blue-50 text-blue-600" },
    { title: "Të paguara", value: stats.paidInvoices, description: "Pagesa të përfunduara", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
    { title: "Në pritje", value: stats.pendingInvoices, description: `${stats.overdueInvoices || 0} të vonuara`, icon: Clock3, tone: "bg-amber-50 text-amber-600" },
    { title: "Të ardhura", value: formatCurrency(stats.totalRevenue), description: "Nga faturat e paguara", icon: BadgeEuro, tone: "bg-violet-50 text-violet-600" },
  ];

  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{items.map((stat) => { const Icon = stat.icon; return <div key={stat.title} className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-slate-500">{stat.title}</p><p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{stat.value}</p><p className="mt-2 text-xs text-slate-400">{stat.description}</p></div><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${stat.tone}`}><Icon size={20} /></div></div></div>; })}</div>;
}
