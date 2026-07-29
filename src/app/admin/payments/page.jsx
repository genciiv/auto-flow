import Link from "next/link";
import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";

import { getPayments } from "@/services/admin/payment-service";

function formatDate(date) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatPrice(value, currency = "ALL") {
  const amount = new Intl.NumberFormat("sq-AL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

  return currency === "ALL" ? `${amount} Lekë` : `${amount} ${currency}`;
}

function getStatusConfig(status) {
  const configs = {
    PENDING: {
      label: "Në pritje",
      className: "bg-amber-50 text-amber-700",
    },
    PAID: {
      label: "E paguar",
      className: "bg-emerald-50 text-emerald-700",
    },
    FAILED: {
      label: "E dështuar",
      className: "bg-red-50 text-red-700",
    },
    REFUNDED: {
      label: "E rimbursuar",
      className: "bg-violet-50 text-violet-700",
    },
  };

  return (
    configs[status] || {
      label: status,
      className: "bg-slate-100 text-slate-700",
    }
  );
}

function getMethodLabel(method) {
  const labels = {
    CASH: "Cash",
    BANK_TRANSFER: "Transfertë bankare",
    CARD: "Kartë",
    OTHER: "Tjetër",
  };

  return labels[method] || method;
}

function createPageUrl({ search, status, method, page }) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (status && status !== "all") {
    params.set("status", status);
  }

  if (method && method !== "all") {
    params.set("method", method);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/admin/payments?${query}` : "/admin/payments";
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

export default async function PaymentsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const data = await getPayments({
    search: resolvedSearchParams?.search || "",
    status: resolvedSearchParams?.status || "all",
    method: resolvedSearchParams?.method || "all",
    page: resolvedSearchParams?.page || 1,
  });

  const { payments, counts, totals, filters, pagination } = data;

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
            Pagesat
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Menaxho pagesat cash, transfertat bankare dhe pagesat e lidhura me
            abonimet e bizneseve.
          </p>
        </div>

        <Link
          href="/admin/payments/new"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Regjistro pagesë
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <CountCard
          title="Të ardhura"
          value={formatPrice(totals.revenue)}
          description="Pagesa të konfirmuara"
          icon={CircleDollarSign}
        />

        <CountCard
          title="Të paguara"
          value={counts.paid}
          description="Pagesa të përfunduara"
          icon={CheckCircle2}
        />

        <CountCard
          title="Në pritje"
          value={counts.pending}
          description="Presin konfirmim"
          icon={Clock3}
        />

        <CountCard
          title="Të dështuara"
          value={counts.failed}
          description="Pagesa të pasuksesshme"
          icon={XCircle}
        />

        <CountCard
          title="Të rimbursuara"
          value={counts.refunded}
          description="Pagesa të kthyera"
          icon={RotateCcw}
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
              placeholder="Kërko biznes, plan, referencë..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <select
            name="status"
            defaultValue={filters.status}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">Të gjitha statuset</option>
            <option value="PENDING">Në pritje</option>
            <option value="PAID">Të paguara</option>
            <option value="FAILED">Të dështuara</option>
            <option value="REFUNDED">Të rimbursuara</option>
          </select>

          <select
            name="method"
            defaultValue={filters.method}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">Të gjitha metodat</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Transfertë bankare</option>
            <option value="CARD">Kartë</option>
            <option value="OTHER">Tjetër</option>
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
        filters.method !== "all" ? (
          <Link
            href="/admin/payments"
            className="mt-4 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Pastro filtrat
          </Link>
        ) : null}
      </form>

      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        {payments.length > 0 ? (
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
                      Shuma
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Metoda
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Statusi
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Data
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Referenca
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Veprime
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => {
                    const status = getStatusConfig(payment.status);

                    return (
                      <tr
                        key={payment.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-5">
                          <Link
                            href={`/admin/businesses/${payment.business.id}`}
                            className="font-semibold text-slate-950 transition hover:text-blue-600"
                          >
                            {payment.business.name}
                          </Link>

                          <p className="mt-1 text-xs text-slate-500">
                            {payment.business.email || "Pa email"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {payment.business.city || "Qyteti i pacaktuar"}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-slate-800">
                            {payment.subscription?.plan?.name || "Pa abonim"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {payment.subscription
                              ? payment.subscription.billingInterval ===
                                "YEARLY"
                                ? "Faturim vjetor"
                                : "Faturim mujor"
                              : "Pagesë e palidhur"}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-slate-950">
                            {formatPrice(payment.amount, payment.currency)}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            {payment.method === "CASH" ? (
                              <Banknote size={16} className="text-slate-400" />
                            ) : (
                              <ReceiptText
                                size={16}
                                className="text-slate-400"
                              />
                            )}

                            {getMethodLabel(payment.method)}
                          </div>
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
                            {formatDate(payment.paidAt || payment.createdAt)}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {payment.paidAt
                              ? "Data e pagesës"
                              : "Data e regjistrimit"}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="max-w-[180px] truncate text-sm text-slate-700">
                            {payment.reference || "—"}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/admin/payments/${payment.id}`}
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
              <ReceiptText size={25} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-950">
              Nuk u gjet asnjë pagesë
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Regjistro pagesën e parë ose ndrysho kërkimin dhe filtrat.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/admin/payments/new"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={16} />
                Regjistro pagesë
              </Link>

              {filters.search ||
              filters.status !== "all" ||
              filters.method !== "all" ? (
                <Link
                  href="/admin/payments"
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
