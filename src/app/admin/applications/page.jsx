import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Search,
  XCircle,
} from "lucide-react";

import { getApplications } from "@/services/admin/application-service";

function formatDate(date) {
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function statusConfig(status) {
  const configs = {
    PENDING: {
      label: "Në pritje",
      className: "bg-amber-50 text-amber-700",
    },
    APPROVED: {
      label: "Aprovuar",
      className: "bg-emerald-50 text-emerald-700",
    },
    REJECTED: {
      label: "Refuzuar",
      className: "bg-red-50 text-red-700",
    },
  };

  return (
    configs[status] || {
      label: status,
      className: "bg-slate-100 text-slate-700",
    }
  );
}

function createPageUrl({ search, status, page }) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (status && status !== "all") {
    params.set("status", status);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/admin/applications?${query}` : "/admin/applications";
}

function CountCard({ title, value, icon: Icon, description }) {
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

export default async function ApplicationsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const data = await getApplications({
    search: resolvedSearchParams?.search || "",
    status: resolvedSearchParams?.status || "all",
    page: resolvedSearchParams?.page || 1,
  });

  const { applications, counts, filters, pagination } = data;

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-semibold text-blue-600">Platform Admin</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Aplikimet
        </h1>

        <p className="mt-2 text-slate-500">
          Shqyrto dhe menaxho kërkesat e bizneseve për t&apos;u bashkuar me
          AutoFlow.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <CountCard
          title="Në pritje"
          value={counts.pending}
          description="Presin për shqyrtim"
          icon={Clock3}
        />

        <CountCard
          title="Të aprovuara"
          value={counts.approved}
          description="Biznese të krijuara"
          icon={CheckCircle2}
        />

        <CountCard
          title="Të refuzuara"
          value={counts.rejected}
          description="Aplikime të refuzuara"
          icon={XCircle}
        />
      </div>

      <form
        method="GET"
        className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_240px_auto]">
          <label className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              name="search"
              defaultValue={filters.search}
              placeholder="Kërko biznes, pronar, email..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <select
            name="status"
            defaultValue={filters.status}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">Të gjitha statuset</option>

            <option value="PENDING">Në pritje</option>

            <option value="APPROVED">Të aprovuara</option>

            <option value="REJECTED">Të refuzuara</option>
          </select>

          <button
            type="submit"
            className="h-12 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Filtro
          </button>
        </div>

        {(filters.search || filters.status !== "all") && (
          <Link
            href="/admin/applications"
            className="mt-4 inline-flex text-sm font-semibold text-blue-600"
          >
            Pastro filtrat
          </Link>
        )}
      </form>

      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        {applications.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Biznesi
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Pronari
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Kontakti
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Statusi
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Data
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Veprime
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => {
                    const status = statusConfig(application.status);

                    return (
                      <tr
                        key={application.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-slate-950">
                            {application.businessName}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {application.city}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-slate-800">
                            {application.ownerName}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-700">
                            {application.email}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {application.phone}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-500">
                          {formatDate(application.createdAt)}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/admin/applications/${application.id}`}
                            className="inline-flex rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            Shiko
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-5">
              <p className="text-sm text-slate-500">
                Faqja {pagination.currentPage} nga {pagination.totalPages}
              </p>

              <div className="flex gap-2">
                {pagination.currentPage > 1 ? (
                  <Link
                    href={createPageUrl({
                      ...filters,
                      page: pagination.currentPage - 1,
                    })}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    <ChevronLeft size={16} />
                    Para
                  </Link>
                ) : null}

                {pagination.currentPage < pagination.totalPages ? (
                  <Link
                    href={createPageUrl({
                      ...filters,
                      page: pagination.currentPage + 1,
                    })}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Tjetër
                    <ChevronRight size={16} />
                  </Link>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="px-6 py-20 text-center">
            <FileText size={34} className="mx-auto text-slate-300" />

            <h2 className="mt-5 text-lg font-bold text-slate-950">
              Nuk u gjet asnjë aplikim
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Aplikimet e reja do të shfaqen këtu.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
