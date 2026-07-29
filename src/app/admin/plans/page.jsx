import Link from "next/link";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Layers3,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";

import PlanActions from "@/components/admin/plans/PlanActions";
import { getPlans } from "@/services/admin/plan-service";

function formatPrice(price) {
  return new Intl.NumberFormat("sq-AL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(price || 0));
}

function formatDate(date) {
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
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

  return query ? `/admin/plans?${query}` : "/admin/plans";
}

function CountCard({ title, value, description, icon: Icon }) {
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

function getFeatureCount(features) {
  return Array.isArray(features) ? features.length : 0;
}

function formatLimit(value) {
  return value === null || value === undefined ? "Pa limit" : value;
}

export default async function PlansPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const data = await getPlans({
    search: resolvedSearchParams?.search || "",
    status: resolvedSearchParams?.status || "all",
    page: resolvedSearchParams?.page || 1,
  });

  const { plans, counts, filters, pagination } = data;

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
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">Platform Admin</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Planet
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Menaxho planet, çmimet, limitet dhe veçoritë që u ofrohen bizneseve
            në AutoFlow.
          </p>
        </div>

        <Link
          href="/admin/plans/new"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Krijo plan
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <CountCard
          title="Totali i planeve"
          value={counts.total}
          description="Të gjitha planet"
          icon={Layers3}
        />

        <CountCard
          title="Plane aktive"
          value={counts.active}
          description="Të disponueshme për abonim"
          icon={BadgeCheck}
        />

        <CountCard
          title="Plane joaktive"
          value={counts.inactive}
          description="Nuk pranohen abonime të reja"
          icon={CircleDollarSign}
        />

        <CountCard
          title="Abonime aktive"
          value={counts.subscriptions}
          description="Trial dhe abonime me pagesë"
          icon={Users}
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
              placeholder="Kërko emër, slug ose përshkrim..."
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

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <SlidersHorizontal size={17} />
            Filtro
          </button>
        </div>

        {filters.search || filters.status !== "all" ? (
          <Link
            href="/admin/plans"
            className="mt-4 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Pastro filtrat
          </Link>
        ) : null}
      </form>

      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        {plans.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Plani
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Çmimi
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Limitet
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Veçoritë
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Abonime
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Statusi
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Krijuar
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Veprime
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {plans.map((plan) => {
                    const isFreeTrial = plan.slug === "free-trial";

                    return (
                      <tr
                        key={plan.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                              <Layers3 size={20} />
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-slate-950">
                                  {plan.name}
                                </p>

                                {plan.isRecommended ? (
                                  <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                                    I rekomanduar
                                  </span>
                                ) : null}

                                {isFreeTrial ? (
                                  <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                                    Trial 7 ditë
                                  </span>
                                ) : null}
                              </div>

                              <p className="mt-1 text-xs font-medium text-slate-400">
                                {plan.slug}
                              </p>

                              <p className="mt-2 max-w-xs text-sm leading-5 text-slate-500">
                                {plan.description || "Pa përshkrim"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-slate-800">
                            {formatPrice(plan.monthlyPrice)} Lekë/muaj
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatPrice(plan.yearlyPrice)} Lekë/vit
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-700">
                            {formatLimit(plan.maxUsers)} përdorues
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatLimit(plan.maxCustomers)} klientë ·{" "}
                            {formatLimit(plan.maxVehicles)} automjete
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-slate-700">
                            {getFeatureCount(plan.features)}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            veçori të përfshira
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-slate-800">
                            {plan._count.subscriptions}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            abonime gjithsej
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              plan.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {plan.isActive ? "Aktiv" : "Joaktiv"}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-500">
                          {formatDate(plan.createdAt)}
                        </td>

                        <td className="px-6 py-5">
                          <PlanActions
                            planId={plan.id}
                            slug={plan.slug}
                            isActive={plan.isActive}
                            isRecommended={plan.isRecommended}
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
              <Layers3 size={25} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-950">
              Nuk u gjet asnjë plan
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Krijo një plan të ri ose ndrysho kërkimin dhe filtrat.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/admin/plans/new"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={16} />
                Krijo plan
              </Link>

              {filters.search || filters.status !== "all" ? (
                <Link
                  href="/admin/plans"
                  className="inline-flex rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Pastro filtrat
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
