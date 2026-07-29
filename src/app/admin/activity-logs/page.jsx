import Link from "next/link";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Database,
  FileClock,
  Search,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import {
  getActivityLogFilterOptions,
  getPlatformActivityLogs,
} from "@/services/admin/activity-log-service";

const ACTION_LABELS = {
  CREATE: "Krijim",
  UPDATE: "Përditësim",
  DELETE: "Fshirje",
  RESTORE: "Rikthim",
  STATUS_CHANGE: "Ndryshim statusi",
  LOGIN: "Hyrje",
  LOGOUT: "Dalje",
  EXPORT: "Eksport",
  IMPORT: "Import",
  PAYMENT: "Pagesë",
  CUSTOM: "Veprim tjetër",
};

const ENTITY_LABELS = {
  BUSINESS_APPLICATION: "Aplikim biznesi",
  BUSINESS: "Biznes",
  PLAN: "Plan",
  SUBSCRIPTION: "Abonim",
  PAYMENT: "Pagesë",
  PLATFORM_SETTING: "Cilësime platforme",
  USER: "Përdorues",
  VEHICLE: "Automjet",
  CUSTOMER: "Klient",
  SERVICE: "Shërbim",
  APPOINTMENT: "Termin",
  INVOICE: "Faturë",
  MARKETPLACE_LISTING: "Marketplace",
};

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getActionConfig(action) {
  const configurations = {
    CREATE: {
      label: ACTION_LABELS.CREATE,
      className: "bg-emerald-50 text-emerald-700",
    },
    UPDATE: {
      label: ACTION_LABELS.UPDATE,
      className: "bg-blue-50 text-blue-700",
    },
    DELETE: {
      label: ACTION_LABELS.DELETE,
      className: "bg-red-50 text-red-700",
    },
    RESTORE: {
      label: ACTION_LABELS.RESTORE,
      className: "bg-violet-50 text-violet-700",
    },
    STATUS_CHANGE: {
      label: ACTION_LABELS.STATUS_CHANGE,
      className: "bg-amber-50 text-amber-700",
    },
    LOGIN: {
      label: ACTION_LABELS.LOGIN,
      className: "bg-cyan-50 text-cyan-700",
    },
    LOGOUT: {
      label: ACTION_LABELS.LOGOUT,
      className: "bg-slate-100 text-slate-700",
    },
    EXPORT: {
      label: ACTION_LABELS.EXPORT,
      className: "bg-indigo-50 text-indigo-700",
    },
    IMPORT: {
      label: ACTION_LABELS.IMPORT,
      className: "bg-fuchsia-50 text-fuchsia-700",
    },
    PAYMENT: {
      label: ACTION_LABELS.PAYMENT,
      className: "bg-emerald-50 text-emerald-700",
    },
    CUSTOM: {
      label: ACTION_LABELS.CUSTOM,
      className: "bg-slate-100 text-slate-700",
    },
  };

  return (
    configurations[action] || {
      label: action,
      className: "bg-slate-100 text-slate-700",
    }
  );
}

function getEntityLabel(entityType) {
  return ENTITY_LABELS[entityType] || entityType;
}

function stringifyJson(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function createPageUrl({ search, action, entityType, page }) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (action && action !== "all") {
    params.set("action", action);
  }

  if (entityType && entityType !== "all") {
    params.set("entityType", entityType);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/admin/activity-logs?${query}` : "/admin/activity-logs";
}

function SummaryCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={19} />
      </div>

      <p className="mt-5 text-sm text-slate-500">{title}</p>

      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function JsonDetails({ oldValues, newValues, metadata }) {
  const oldValuesText = stringifyJson(oldValues);
  const newValuesText = stringifyJson(newValues);
  const metadataText = stringifyJson(metadata);

  if (!oldValuesText && !newValuesText && !metadataText) {
    return <span className="text-xs text-slate-400">Pa detaje</span>;
  }

  return (
    <details className="group">
      <summary className="cursor-pointer list-none text-xs font-semibold text-blue-600 hover:text-blue-700">
        Shiko detajet
      </summary>

      <div className="mt-3 w-[340px] max-w-[70vw] space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left shadow-lg">
        {oldValuesText ? (
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Vlerat e mëparshme
            </p>

            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-white p-3 text-[11px] leading-5 text-slate-700 ring-1 ring-slate-200">
              {oldValuesText}
            </pre>
          </div>
        ) : null}

        {newValuesText ? (
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Vlerat e reja
            </p>

            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-white p-3 text-[11px] leading-5 text-slate-700 ring-1 ring-slate-200">
              {newValuesText}
            </pre>
          </div>
        ) : null}

        {metadataText ? (
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Metadata
            </p>

            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-white p-3 text-[11px] leading-5 text-slate-700 ring-1 ring-slate-200">
              {metadataText}
            </pre>
          </div>
        ) : null}
      </div>
    </details>
  );
}

export const metadata = {
  title: "Aktiviteti i Platformës | AutoFlow",
  description:
    "Shiko veprimet administrative dhe ndryshimet e kryera në AutoFlow.",
};

export default async function ActivityLogsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const search =
    typeof resolvedSearchParams?.search === "string"
      ? resolvedSearchParams.search
      : "";

  const action =
    typeof resolvedSearchParams?.action === "string" &&
    resolvedSearchParams.action !== "all"
      ? resolvedSearchParams.action
      : undefined;

  const entityType =
    typeof resolvedSearchParams?.entityType === "string" &&
    resolvedSearchParams.entityType !== "all"
      ? resolvedSearchParams.entityType
      : undefined;

  const page = resolvedSearchParams?.page || 1;

  const [data, filterOptions] = await Promise.all([
    getPlatformActivityLogs({
      search,
      action,
      entityType,
      page,
      limit: 25,
    }),

    getActivityLogFilterOptions(),
  ]);

  const { logs, pagination } = data;

  const filters = {
    search: search.trim(),
    action: action || "all",
    entityType: entityType || "all",
  };

  const previousPageUrl = createPageUrl({
    ...filters,
    page: Math.max(1, pagination.page - 1),
  });

  const nextPageUrl = createPageUrl({
    ...filters,
    page: Math.min(pagination.totalPages, pagination.page + 1),
  });

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-semibold text-blue-600">Platform Admin</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Aktiviteti i platformës
        </h1>

        <p className="mt-2 max-w-3xl text-slate-500">
          Monitoro ndryshimet administrative, pagesat, abonimet, aplikimet dhe
          aktivitetin e bizneseve.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Gjithsej veprime"
          value={pagination.total}
          description="Log-e që përputhen me filtrat"
          icon={Activity}
        />

        <SummaryCard
          title="Në këtë faqe"
          value={logs.length}
          description="Veprime të shfaqura aktualisht"
          icon={FileClock}
        />

        <SummaryCard
          title="Module"
          value={filterOptions.entityTypes.length}
          description="Lloje të ndryshme entitetesh"
          icon={Database}
        />

        <SummaryCard
          title="Faqja aktuale"
          value={`${pagination.page}/${pagination.totalPages}`}
          description="Navigimi i rezultateve"
          icon={Clock3}
        />
      </div>

      <form
        method="GET"
        className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_240px_auto]">
          <label className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              name="search"
              defaultValue={filters.search}
              placeholder="Kërko titull, admin, biznes ose modul..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <select
            name="action"
            defaultValue={filters.action}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">Të gjitha veprimet</option>

            {filterOptions.actions.map((actionOption) => (
              <option key={actionOption} value={actionOption}>
                {ACTION_LABELS[actionOption] || actionOption}
              </option>
            ))}
          </select>

          <select
            name="entityType"
            defaultValue={filters.entityType}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">Të gjitha modulet</option>

            {filterOptions.entityTypes.map((entityOption) => (
              <option key={entityOption} value={entityOption}>
                {getEntityLabel(entityOption)}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <SlidersHorizontal size={17} />
            Filtro
          </button>
        </div>

        {filters.search ||
        filters.action !== "all" ||
        filters.entityType !== "all" ? (
          <Link
            href="/admin/activity-logs"
            className="mt-4 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Pastro filtrat
          </Link>
        ) : null}
      </form>

      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        {logs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1300px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Veprimi
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Përshkrimi
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Moduli
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Administratori
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Biznesi
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Data
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Detaje
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => {
                    const actionConfig = getActionConfig(log.action);

                    return (
                      <tr
                        key={log.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${actionConfig.className}`}
                          >
                            {actionConfig.label}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <p className="max-w-[300px] text-sm font-semibold text-slate-950">
                            {log.title}
                          </p>

                          <p className="mt-1 max-w-[320px] text-xs leading-5 text-slate-500">
                            {log.description || "Pa përshkrim shtesë"}
                          </p>

                          {log.entityId ? (
                            <p className="mt-2 max-w-[280px] truncate font-mono text-[10px] text-slate-400">
                              ID: {log.entityId}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-6 py-5">
                          <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Database size={16} className="text-slate-400" />

                            {getEntityLabel(log.entityType)}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          {log.user ? (
                            <div className="flex items-start gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <UserRound size={16} />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {log.user.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {log.user.email}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm font-semibold text-slate-700">
                                Sistem
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Veprim automatik
                              </p>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          {log.business ? (
                            <Link
                              href={`/admin/businesses/${log.business.id}`}
                              className="text-sm font-semibold text-slate-800 transition hover:text-blue-600"
                            >
                              {log.business.name}
                            </Link>
                          ) : (
                            <div>
                              <p className="text-sm font-semibold text-slate-600">
                                Platforma
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Pa biznes specifik
                              </p>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Clock3 size={16} className="text-slate-400" />

                            {formatDateTime(log.createdAt)}
                          </div>
                        </td>

                        <td className="relative px-6 py-5 text-right">
                          <JsonDetails
                            oldValues={log.oldValues}
                            newValues={log.newValues}
                            metadata={log.metadata}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-6 py-5 sm:flex-row">
              <p className="text-sm text-slate-500">
                Faqja{" "}
                <span className="font-semibold text-slate-800">
                  {pagination.page}
                </span>{" "}
                nga{" "}
                <span className="font-semibold text-slate-800">
                  {pagination.totalPages}
                </span>
                {" · "}
                {pagination.total} veprime gjithsej
              </p>

              <div className="flex items-center gap-2">
                {pagination.page > 1 ? (
                  <Link
                    href={previousPageUrl}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <ChevronLeft size={16} />
                    Para
                  </Link>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-slate-100 px-4 py-2 text-sm font-semibold text-slate-300">
                    <ChevronLeft size={16} />
                    Para
                  </span>
                )}

                {pagination.page < pagination.totalPages ? (
                  <Link
                    href={nextPageUrl}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Tjetër
                    <ChevronRight size={16} />
                  </Link>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-slate-100 px-4 py-2 text-sm font-semibold text-slate-300">
                    Tjetër
                    <ChevronRight size={16} />
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileClock size={25} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-950">
              Nuk u gjet asnjë aktivitet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Ndrysho kërkimin dhe filtrat ose kryej një veprim të ri në
              Platform Admin.
            </p>

            {filters.search ||
            filters.action !== "all" ||
            filters.entityType !== "all" ? (
              <Link
                href="/admin/activity-logs"
                className="mt-5 inline-flex rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Pastro filtrat
              </Link>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
