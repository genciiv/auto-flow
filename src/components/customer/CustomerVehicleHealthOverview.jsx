import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  FileClock,
  Gauge,
  ReceiptText,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { formatMoney } from "@/lib/money";

const ACTION_ICONS = {
  DOCUMENT: FileClock,
  MAINTENANCE: Wrench,
  REMINDER: CalendarClock,
  MILEAGE: Gauge,
};

function StatusIcon({ status }) {
  if (status === "URGENT") return <AlertTriangle size={22} />;
  if (status === "ATTENTION") return <CalendarClock size={22} />;
  return <BadgeCheck size={22} />;
}

export default function CustomerVehicleHealthOverview({ health, compact = false }) {
  const metrics = [
    {
      label: "Shpenzime 12 muaj",
      value: formatMoney(health.metrics.expenseTotal12Months, { currency: "ALL" }),
      icon: ReceiptText,
    },
    {
      label: "Mirëmbajtje të ndjekura",
      value: health.metrics.maintenanceTracked,
      icon: Wrench,
    },
    {
      label: "Dokumente",
      value: health.metrics.documentCount,
      icon: ShieldCheck,
    },
    {
      label: "Servise të verifikuara",
      value: health.metrics.serviceCount,
      icon: BadgeCheck,
    },
  ];

  return (
    <section className={`rounded-3xl border p-5 shadow-sm sm:p-6 ${health.panelClassName}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm ring-1 ring-slate-100">
            <StatusIcon status={health.status} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
              Vehicle Health
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-slate-950">
                Gjendja e automjetit
              </h2>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${health.className}`}>
                {health.label}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {health.description}
            </p>
          </div>
        </div>

        {health.actionCount ? (
          <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-2xl font-black text-slate-950">{health.actionCount}</p>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              veprime
            </p>
          </div>
        ) : null}
      </div>

      {!compact ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-center gap-2 text-slate-400">
                  <Icon size={15} />
                  <span className="text-[11px] font-bold uppercase tracking-wide">{metric.label}</span>
                </div>
                <p className="mt-2 text-sm font-black text-slate-950">{metric.value}</p>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-5 border-t border-slate-200/70 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Veprimet e ardhshme
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Prioritetet llogariten nga afatet reale të automjetit.
            </p>
          </div>
        </div>

        {health.actions.length ? (
          <div className="mt-4 grid gap-2">
            {health.actions.map((action) => {
              const Icon = ACTION_ICONS[action.kind] || CalendarClock;
              return (
                <Link
                  key={action.key}
                  href={action.href}
                  className="group flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-100 transition hover:ring-blue-200"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-950">{action.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{action.detail}</p>
                  </div>
                  <span className={`hidden rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset sm:inline-flex ${action.severity === "URGENT" ? "bg-red-50 text-red-700 ring-red-100" : "bg-amber-50 text-amber-700 ring-amber-100"}`}>
                    {action.severity === "URGENT" ? "Urgjente" : "Vëmendje"}
                  </span>
                  <ArrowRight size={16} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
            Nuk ka veprime urgjente për momentin.
          </div>
        )}
      </div>
    </section>
  );
}
