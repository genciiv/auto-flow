import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  CircleAlert,
  Database,
  HardDrive,
  KeyRound,
  Mail,
  RefreshCw,
  Server,
  TimerReset,
  XCircle,
} from "lucide-react";

import { getSystemHealth } from "@/services/admin/system-health-service";

export const dynamic = "force-dynamic";

const STATUS_STYLES = {
  up: {
    label: "Healthy",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
  },
  warning: {
    label: "Warning",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: CircleAlert,
    iconClass: "text-amber-600",
  },
  down: {
    label: "Down",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    icon: XCircle,
    iconClass: "text-rose-600",
  },
};

const CHECK_META = {
  database: {
    title: "Database",
    description: "Lidhja kryesore PostgreSQL / Prisma.",
    icon: Database,
  },
  authentication: {
    title: "Authentication",
    description: "Konfigurimi bazë i sesioneve dhe autentikimit.",
    icon: KeyRound,
  },
  email: {
    title: "Email",
    description: "Brevo dhe adresa e dërguesit.",
    icon: Mail,
  },
  storage: {
    title: "Storage",
    description: "Supabase Storage privat për dokumentet.",
    icon: HardDrive,
  },
  cron: {
    title: "Cron Jobs",
    description: "Mbrojtja e scheduled maintenance endpoints.",
    icon: TimerReset,
  },
};

function StatusBadge({ status }) {
  const config = STATUS_STYLES[status] || STATUS_STYLES.warning;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${config.badge}`}
    >
      {config.label}
    </span>
  );
}

export default async function SystemHealthPage() {
  const health = await getSystemHealth();
  const overall = STATUS_STYLES[health.status] || STATUS_STYLES.warning;
  const OverallIcon = overall.icon;

  return (
    <div className="space-y-5 lg:space-y-7">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold text-blue-600 sm:text-sm">
            Platform Admin
          </p>

          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:mt-2 sm:text-3xl">
            System Health
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
            Kontrollo gjendjen e databazës, autentikimit, email-it, storage-it,
            cron jobs dhe runtime-it pa ekspozuar sekrete.
          </p>
        </div>

        <Link
          href="/admin/system-health"
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 lg:h-11"
        >
          <RefreshCw size={16} />
          Rifresko
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:rounded-3xl lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 ${overall.iconClass}`}
            >
              <OverallIcon size={22} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Gjendja e përgjithshme
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">
                AutoFlow {overall.label}
              </h2>
            </div>
          </div>

          <StatusBadge status={health.status} />
        </div>

        <p className="mt-4 text-xs text-slate-500 sm:text-sm">
          Kontrolli i fundit:{" "}
          {new Intl.DateTimeFormat("sq-AL", {
            dateStyle: "medium",
            timeStyle: "medium",
            timeZone: "Europe/Tirane",
          }).format(new Date(health.checkedAt))}
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Object.entries(health.checks).map(([key, check]) => {
          const meta = CHECK_META[key];
          const Icon = meta.icon;
          const style = STATUS_STYLES[check.status] || STATUS_STYLES.warning;

          return (
            <article
              key={key}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
                  <Icon size={19} />
                </div>
                <StatusBadge status={check.status} />
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-950">
                {meta.title}
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                {meta.description}
              </p>

              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <p className={`text-xs font-semibold sm:text-sm ${style.iconClass}`}>
                  {check.message}
                </p>
                {typeof check.latencyMs === "number" ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Latency: {check.latencyMs} ms
                  </p>
                ) : null}
                {check.detail ? (
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {check.detail}
                  </p>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Server size={19} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">Runtime</h2>
              <p className="text-xs text-slate-500">Informacion jo-sensitive i deployment-it.</p>
            </div>
          </div>

          <dl className="mt-4 divide-y divide-slate-100 text-sm">
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-slate-500">Service</dt>
              <dd className="font-semibold text-slate-800">{health.runtime.service}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-slate-500">Environment</dt>
              <dd className="font-semibold text-slate-800">{health.runtime.environment}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-slate-500">Node</dt>
              <dd className="font-semibold text-slate-800">{health.runtime.node}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-slate-500">Release</dt>
              <dd className="max-w-[60%] truncate font-mono text-xs font-semibold text-slate-800">
                {health.runtime.release || "N/A"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Activity size={19} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">Health endpoints</h2>
              <p className="text-xs text-slate-500">Endpoint-et operative të platformës.</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {Object.entries(health.endpoints).map(([name, path]) => (
              <div
                key={name}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
              >
                <span className="text-xs font-semibold capitalize text-slate-600 sm:text-sm">
                  {name.replaceAll(/([A-Z])/g, " $1")}
                </span>
                <code className="max-w-[65%] truncate text-xs text-slate-700">{path}</code>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
