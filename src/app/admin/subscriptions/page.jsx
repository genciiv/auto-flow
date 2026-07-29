import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  Search,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";

import { getSubscriptions } from "@/services/admin/subscription-service";

function formatDate(date) {
  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatPrice(price) {
  return new Intl.NumberFormat("sq-AL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(price || 0));
}

function getRemainingDays(endDate) {
  const now = new Date();
  const end = new Date(endDate);

  const difference = end.getTime() - now.getTime();
  const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

  return Math.max(0, days);
}

function getStatusConfig(status) {
  const configs = {
    TRIALING: {
      label: "Trial",
      className: "bg-violet-50 text-violet-700",
    },
    ACTIVE: {
      label: "Aktiv",
      className: "bg-emerald-50 text-emerald-700",
    },
    PAST_DUE: {
      label: "Pagesë e vonuar",
      className: "bg-amber-50 text-amber-700",
    },
    CANCELLED: {
      label: "Anuluar",
      className: "bg-red-50 text-red-700",
    },
    EXPIRED: {
      label: "Skaduar",
      className: "bg-slate-100 text-slate-700",
    },
  };

  return (
    configs[status] || {
      label: status,
      className: "bg-slate-100 text-slate-700",
    }
  );
}

function createPageUrl({ search, status, billingInterval, page }) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (status && status !== "all") {
    params.set("status", status);
  }

  if (billingInterval && billingInterval !== "all") {
    params.set("billingInterval", billingInterval);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/admin/subscriptions?${query}` : "/admin/subscriptions";
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

export default async function SubscriptionsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const data = await getSubscriptions({
    search: resolvedSearchParams?.search || "",
    status: resolvedSearchParams?.status || "all",
    billingInterval: resolvedSearchParams?.billingInterval || "all",
    page: resolvedSearchParams?.page || 1,
  });

  const { subscriptions, counts, filters, pagination } = data;

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
            Abonimet
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Menaxho trial-et, abonimet aktive, skadimet dhe rinovimet e
            bizneseve.
          </p>
        </div>

        <Link
          href="/admin/subscriptions/new"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Aktivizo abonim
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <CountCard
          title="Trial aktive"
          value={counts.trialing}
          description="Biznese në provë falas"
          icon={Clock3}
        />

        <CountCard
          title="Abonime aktive"
          value={counts.active}
          description="Plane me pagesë aktive"
          icon={CheckCircle2}
        />

        <CountCard
          title="Të skaduara"
          value={counts.expired}
          description="Abonime të përfunduara"
          icon={CalendarClock}
        />

        <CountCard
          title="Të anuluara"
          value={counts.cancelled}
          description="Abonime të mbyllura"
          icon={XCircle}
        />
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
              placeholder="Kërko biznes, email ose plan..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <select
            name="status"
            defaultValue={filters.status}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">Të gjitha statuset</option>
            <option value="TRIALING">Trial</option>
            <option value="ACTIVE">Aktive</option>
            <option value="PAST_DUE">Pagesë e vonuar</option>
            <option value="CANCELLED">Të anuluara</option>
            <option value="EXPIRED">Të skaduara</option>
          </select>

          <select
            name="billingInterval"
            defaultValue={filters.billingInterval}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">Të gjitha periudhat</option>
            <option value="MONTHLY">Mujore</option>
            <option value="YEARLY">Vjetore</option>
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
        filters.status !== "all" ||
        filters.billingInterval !== "all" ? (
          <Link
            href="/admin/subscriptions"
            className="mt-4 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Pastro filtrat
          </Link>
        ) : null}
      </form>

      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        {subscriptions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Biznesi
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Plani
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Periudha
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Çmimi
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Statusi
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Përfundon
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Pagesat
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Veprime
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {subscriptions.map((subscription) => {
                    const status = getStatusConfig(subscription.status);

                    const remainingDays = getRemainingDays(
                      subscription.currentPeriodEnd,
                    );

                    return (
                      <tr
                        key={subscription.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-5">
                          <Link
                            href={`/admin/businesses/${subscription.business.id}`}
                            className="font-semibold text-slate-950 transition hover:text-blue-600"
                          >
                            {subscription.business.name}
                          </Link>

                          <p className="mt-1 text-xs text-slate-500">
                            {subscription.business.email || "Pa email"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {subscription.business.city || "Qyteti i pacaktuar"}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-slate-800">
                            {subscription.plan.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {subscription.plan.slug}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-700">
                            {subscription.billingInterval === "YEARLY"
                              ? "Vjetore"
                              : "Mujore"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(subscription.currentPeriodStart)} —{" "}
                            {formatDate(subscription.currentPeriodEnd)}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-slate-800">
                            {formatPrice(subscription.price)} Lekë
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-700">
                            {formatDate(subscription.currentPeriodEnd)}
                          </p>

                          <p
                            className={`mt-1 text-xs ${
                              remainingDays <= 3
                                ? "font-semibold text-red-600"
                                : "text-slate-500"
                            }`}
                          >
                            {remainingDays > 0
                              ? `${remainingDays} ditë të mbetura`
                              : "Periudha ka përfunduar"}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-slate-800">
                            {subscription._count.payments}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            pagesa të regjistruara
                          </p>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/admin/subscriptions/${subscription.id}`}
                            className="inline-flex rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            Menaxho
                          </Link>
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
              <CalendarClock size={25} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-950">
              Nuk u gjet asnjë abonim
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Aktivizo një abonim të ri ose ndrysho kërkimin dhe filtrat.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/admin/subscriptions/new"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={16} />
                Aktivizo abonim
              </Link>

              {filters.search ||
              filters.status !== "all" ||
              filters.billingInterval !== "all" ? (
                <Link
                  href="/admin/subscriptions"
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
