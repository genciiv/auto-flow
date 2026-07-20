import Link from "next/link";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import BusinessStatusButton from "@/components/admin/businesses/BusinessStatusButton";
import { getBusinesses } from "@/services/admin/business-service";

function formatDate(date) {
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function createPageUrl({ search, status, city, page }) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (status && status !== "all") {
    params.set("status", status);
  }

  if (city && city !== "all") {
    params.set("city", city);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/admin/businesses?${query}` : "/admin/businesses";
}

export default async function BusinessesPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const data = await getBusinesses({
    search: resolvedSearchParams?.search || "",
    status: resolvedSearchParams?.status || "all",
    city: resolvedSearchParams?.city || "all",
    page: resolvedSearchParams?.page || 1,
  });

  const { businesses, cities, filters, pagination } = data;

  const previousPageUrl = createPageUrl({
    ...filters,
    page: Math.max(1, pagination.currentPage - 1),
  });

  const nextPageUrl = createPageUrl({
    ...filters,
    page: Math.min(pagination.totalPages, pagination.currentPage + 1),
  });

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-semibold text-blue-600">Platform Admin</p>

        <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Bizneset
            </h1>

            <p className="mt-2 text-slate-500">
              Menaxho të gjitha bizneset e regjistruara në AutoFlow.
            </p>
          </div>

          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
            {pagination.totalItems} biznese
          </div>
        </div>
      </div>

      <form
        method="GET"
        className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto]">
          <label className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              name="search"
              defaultValue={filters.search}
              placeholder="Kërko biznes, owner, email..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <select
            name="status"
            defaultValue={filters.status}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">Të gjitha statuset</option>

            <option value="active">Vetëm aktive</option>

            <option value="inactive">Vetëm joaktive</option>
          </select>

          <select
            name="city"
            defaultValue={filters.city}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">Të gjitha qytetet</option>

            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <SlidersHorizontal size={17} />
            Filtro
          </button>
        </div>

        {(filters.search ||
          filters.status !== "all" ||
          filters.city !== "all") && (
          <div className="mt-4">
            <Link
              href="/admin/businesses"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Pastro filtrat
            </Link>
          </div>
        )}
      </form>

      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        {businesses.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
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
                      Statistika
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Statusi
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Regjistruar
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Veprime
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {businesses.map((business) => {
                    const owner = business.users[0]?.user;

                    return (
                      <tr
                        key={business.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-5">
                          <Link
                            href={`/admin/businesses/${business.id}`}
                            className="flex items-center gap-3"
                          >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                              <Building2 size={20} />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-950 hover:text-blue-600">
                                {business.name}
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                {business.city || "Qyteti i pacaktuar"}
                              </p>
                            </div>
                          </Link>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-slate-800">
                            {owner?.name || "Pa pronar"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {owner?.email || "—"}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-700">
                            {business.phone || "—"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {business.email || "—"}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-700">
                            {business._count.customers} klientë
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {business._count.vehicles} automjete ·{" "}
                            {business._count.services} shërbime
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              business.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {business.isActive ? "Aktiv" : "Joaktiv"}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-500">
                          {formatDate(business.createdAt)}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/businesses/${business.id}`}
                              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              Shiko
                            </Link>

                            <BusinessStatusButton
                              businessId={business.id}
                              isActive={business.isActive}
                              compact
                            />
                          </div>
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
                  {pagination.currentPage}
                </span>{" "}
                nga{" "}
                <span className="font-semibold text-slate-800">
                  {pagination.totalPages}
                </span>
              </p>

              <div className="flex items-center gap-2">
                {pagination.currentPage > 1 ? (
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

                {pagination.currentPage < pagination.totalPages ? (
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
              <Building2 size={25} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-950">
              Nuk u gjet asnjë biznes
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Ndrysho kërkimin ose filtrat dhe provo përsëri.
            </p>

            <Link
              href="/admin/businesses"
              className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Pastro filtrat
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
