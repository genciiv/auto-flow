"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  FileClock,
  Filter,
  PencilLine,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import AuditActionBadge, {
  getAuditActionLabel,
} from "@/components/audit/AuditActionBadge";
import AuditEntityBadge, {
  getAuditEntityLabel,
} from "@/components/audit/AuditEntityBadge";

const ACTION_OPTIONS = [
  {
    value: "",
    label: "Të gjitha veprimet",
  },
  {
    value: "CREATE",
    label: "Krijim",
  },
  {
    value: "UPDATE",
    label: "Përditësim",
  },
  {
    value: "DELETE",
    label: "Fshirje",
  },
  {
    value: "RESTORE",
    label: "Rikthim",
  },
  {
    value: "STATUS_CHANGE",
    label: "Ndryshim statusi",
  },
  {
    value: "PAYMENT",
    label: "Pagesë",
  },
  {
    value: "EXPORT",
    label: "Eksport",
  },
  {
    value: "IMPORT",
    label: "Import",
  },
  {
    value: "LOGIN",
    label: "Hyrje",
  },
  {
    value: "LOGOUT",
    label: "Dalje",
  },
  {
    value: "CUSTOM",
    label: "Veprim tjetër",
  },
];

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatShortDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Po" : "Jo";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function getActorName(log) {
  return log.user?.name || log.user?.email || "Sistemi";
}

function getInitials(name) {
  const normalizedName = String(name || "Sistemi").trim();

  return normalizedName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getJsonEntries(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  return Object.entries(value);
}

function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>

          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            {Number(value || 0).toLocaleString("sq-AL")}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function JsonSection({ title, value, emptyText }) {
  const entries = getJsonEntries(value);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-black text-slate-950">{title}</h3>

      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">{emptyText}</p>
      ) : (
        <div className="mt-4 divide-y divide-slate-100">
          {entries.map(([key, item]) => (
            <div
              key={key}
              className="grid gap-2 py-3 sm:grid-cols-[160px_minmax(0,1fr)]"
            >
              <p className="break-words text-xs font-bold uppercase tracking-wide text-slate-400">
                {key}
              </p>

              {typeof item === "object" && item !== null ? (
                <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-2xl bg-slate-50 p-3 text-xs leading-6 text-slate-700">
                  {formatValue(item)}
                </pre>
              ) : (
                <p className="break-words text-sm font-medium text-slate-700">
                  {formatValue(item)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function DetailsDrawer({ log, onClose }) {
  if (!log) {
    return null;
  }

  const actorName = getActorName(log);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Mbyll detajet"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
      />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-slate-200 bg-slate-50 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Detajet e aktivitetit
            </p>

            <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
              {log.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">
          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <AuditActionBadge action={log.action} />

              <AuditEntityBadge entityType={log.entityType} />
            </div>

            {log.description ? (
              <p className="mt-5 text-sm leading-7 text-slate-600">
                {log.description}
              </p>
            ) : null}

            <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Përdoruesi
                </p>

                <p className="mt-2 text-sm font-bold text-slate-900">
                  {actorName}
                </p>

                {log.user?.email ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {log.user.email}
                  </p>
                ) : null}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Data dhe ora
                </p>

                <p className="mt-2 text-sm font-bold text-slate-900">
                  {formatDateTime(log.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Entiteti
                </p>

                <p className="mt-2 text-sm font-bold text-slate-900">
                  {getAuditEntityLabel(log.entityType)}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Entity ID
                </p>

                <p className="mt-2 break-all text-sm font-bold text-slate-900">
                  {log.entityId || "—"}
                </p>
              </div>
            </div>
          </section>

          <JsonSection
            title="Vlerat e mëparshme"
            value={log.oldValues}
            emptyText="Nuk ka vlera të mëparshme për këtë aktivitet."
          />

          <JsonSection
            title="Vlerat e reja"
            value={log.newValues}
            emptyText="Nuk ka vlera të reja për këtë aktivitet."
          />

          <JsonSection
            title="Metadata"
            value={log.metadata}
            emptyText="Nuk ka metadata shtesë."
          />
        </div>
      </aside>
    </div>
  );
}

export default function AuditLogClient({
  logs,
  pagination,
  stats,
  users,
  entityTypes,
  filters,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedLog, setSelectedLog] = useState(null);
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [isPending, startTransition] = useTransition();

  const hasFilters = Boolean(
    filters.search || filters.action || filters.entityType || filters.userId,
  );

  const resultLabel = useMemo(() => {
    if (pagination.total === 1) {
      return "1 aktivitet";
    }

    return `${pagination.total.toLocaleString("sq-AL")} aktivitete`;
  }, [pagination.total]);

  function updateQuery(values, resetPage = true) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(values).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    if (resetPage) {
      params.delete("page");
    }

    const query = params.toString();
    const nextUrl = query
      ? `/dashboard/audit-log?${query}`
      : "/dashboard/audit-log";

    startTransition(() => {
      router.push(nextUrl);
    });
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    updateQuery({
      search: searchValue.trim(),
    });
  }

  function clearFilters() {
    setSearchValue("");

    startTransition(() => {
      router.push("/dashboard/audit-log");
    });
  }

  function changePage(page) {
    updateQuery(
      {
        page,
      },
      false,
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Security &amp; Activity
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Audit Log
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Shiko historikun e veprimeve, ndryshimeve dhe aktiviteteve të
            përdoruesve brenda biznesit.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
          <ShieldCheck size={16} />
          Regjistrim aktiv
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Gjithsej"
          value={stats.totalEvents}
          description="Të gjitha aktivitetet"
          icon={Activity}
        />

        <StatCard
          title="Përditësime"
          value={stats.updateEvents}
          description="Ndryshime të regjistruara"
          icon={PencilLine}
        />

        <StatCard
          title="Fshirje"
          value={stats.deleteEvents}
          description="Veprime fshirjeje"
          icon={Trash2}
        />

        <StatCard
          title="Pagesa"
          value={stats.paymentEvents}
          description="Aktivitete financiare"
          icon={CircleDollarSign}
        />

        <StatCard
          title="Status"
          value={stats.statusChangeEvents}
          description="Ndryshime statusi"
          icon={RotateCcw}
        />
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />

            <h2 className="text-base font-black text-slate-950">
              Filtrat e aktivitetit
            </h2>
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(260px,1.6fr)_repeat(3,minmax(160px,1fr))_auto]">
            <form onSubmit={handleSearchSubmit} className="relative min-w-0">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Kërko aktivitet, përdorues ose entitet..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-24 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />

              <button
                type="submit"
                disabled={isPending}
                className="absolute right-1.5 top-1.5 h-9 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                Kërko
              </button>
            </form>

            <select
              value={filters.action}
              onChange={(event) =>
                updateQuery({
                  action: event.target.value,
                })
              }
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              {ACTION_OPTIONS.map((option) => (
                <option
                  key={option.value || "all-actions"}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filters.entityType}
              onChange={(event) =>
                updateQuery({
                  entityType: event.target.value,
                })
              }
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              <option value="">Të gjitha modulet</option>

              {entityTypes.map((entityType) => (
                <option key={entityType} value={entityType}>
                  {getAuditEntityLabel(entityType)}
                </option>
              ))}
            </select>

            <select
              value={filters.userId}
              onChange={(event) =>
                updateQuery({
                  userId: event.target.value,
                })
              }
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              <option value="">Të gjithë përdoruesit</option>

              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                disabled={isPending}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 disabled:opacity-60"
              >
                <X size={17} />
                Pastro
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm font-bold text-slate-700">{resultLabel}</p>

          {isPending ? (
            <p className="text-xs font-semibold text-blue-600">
              Duke ngarkuar...
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Renditur nga aktiviteti më i fundit
            </p>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
              <FileClock size={28} />
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-950">
              Nuk u gjet asnjë aktivitet
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Ndrysho filtrat ose kryej një veprim të ri në platformë që të
              regjistrohet në Audit Log.
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Pastro filtrat
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Data
                    </th>

                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Përdoruesi
                    </th>

                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Veprimi
                    </th>

                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Moduli
                    </th>

                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-400">
                      Aktiviteti
                    </th>

                    <th className="w-16 px-6 py-4" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => {
                    const actorName = getActorName(log);

                    return (
                      <tr
                        key={log.id}
                        className="group transition hover:bg-slate-50/80"
                      >
                        <td className="whitespace-nowrap px-6 py-5">
                          <p className="text-sm font-bold text-slate-900">
                            {formatShortDate(log.createdAt)}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatTime(log.createdAt)}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex min-w-[180px] items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xs font-black text-blue-700">
                              {getInitials(actorName)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {actorName}
                              </p>

                              <p className="mt-1 truncate text-xs text-slate-400">
                                {log.user?.email || "Veprim nga sistemi"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <AuditActionBadge action={log.action} />
                        </td>

                        <td className="px-6 py-5">
                          <AuditEntityBadge entityType={log.entityType} />
                        </td>

                        <td className="max-w-md px-6 py-5">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {log.title}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {log.description ||
                              `${getAuditActionLabel(
                                log.action,
                              )} në modulin ${getAuditEntityLabel(
                                log.entityType,
                              )}.`}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            aria-label="Shiko detajet"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 lg:hidden">
              {logs.map((log) => {
                const actorName = getActorName(log);

                return (
                  <button
                    key={log.id}
                    type="button"
                    onClick={() => setSelectedLog(log)}
                    className="block w-full p-5 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-black text-slate-950">
                          {log.title}
                        </p>

                        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                          <UserRound size={14} />
                          {actorName}
                        </p>
                      </div>

                      <ChevronRight
                        size={18}
                        className="shrink-0 text-slate-400"
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <AuditActionBadge action={log.action} />

                      <AuditEntityBadge entityType={log.entityType} />
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
                      <CalendarDays size={14} />
                      {formatDateTime(log.createdAt)}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-slate-500">
                Faqja{" "}
                <span className="font-black text-slate-900">
                  {pagination.page}
                </span>{" "}
                nga{" "}
                <span className="font-black text-slate-900">
                  {pagination.totalPages}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!pagination.hasPreviousPage || isPending}
                  onClick={() => changePage(pagination.page - 1)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft size={17} />
                  Mbrapa
                </button>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage || isPending}
                  onClick={() => changePage(pagination.page + 1)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Para
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <DetailsDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}
