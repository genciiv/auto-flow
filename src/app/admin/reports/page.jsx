import Link from "next/link";
import {
  Banknote,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileBarChart,
  LineChart,
  ReceiptText,
  RefreshCw,
  Users,
} from "lucide-react";

import { getReports } from "@/services/admin/report-service";

function formatPrice(value) {
  return new Intl.NumberFormat("sq-AL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

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

function getMethodLabel(method) {
  const labels = {
    CASH: "Cash",
    BANK_TRANSFER: "Transfertë bankare",
    CARD: "Kartë",
    OTHER: "Tjetër",
  };

  return labels[method] || method;
}

function getMethodIcon(method) {
  if (method === "CASH") {
    return Banknote;
  }

  if (method === "CARD") {
    return CreditCard;
  }

  return ReceiptText;
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

function getMaxRevenue(revenueSeries) {
  return Math.max(1, ...revenueSeries.map((item) => Number(item.revenue || 0)));
}

function getTotalSubscriptions(subscriptionsByPlan) {
  return subscriptionsByPlan.reduce(
    (total, item) => total + item.subscriptions,
    0,
  );
}

export default async function ReportsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const data = await getReports({
    startDate: resolvedSearchParams?.startDate || "",
    endDate: resolvedSearchParams?.endDate || "",
  });

  const {
    filters,
    summary,
    revenueSeries,
    revenueByMethod,
    subscriptionsByPlan,
    recentPaidPayments,
  } = data;

  const maxRevenue = getMaxRevenue(revenueSeries);
  const totalSubscriptions = getTotalSubscriptions(subscriptionsByPlan);

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">Platform Admin</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Raportet
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Analizo të ardhurat, pagesat, abonimet dhe aktivitetin e bizneseve
            në AutoFlow.
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <FileBarChart size={23} />
        </div>
      </div>

      <form
        method="GET"
        className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto]">
          <label>
            <span className="text-sm font-semibold text-slate-700">
              Nga data
            </span>

            <input
              type="date"
              name="startDate"
              defaultValue={filters.startDate}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label>
            <span className="text-sm font-semibold text-slate-700">
              Deri më
            </span>

            <input
              type="date"
              name="endDate"
              defaultValue={filters.endDate}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 self-end rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <LineChart size={17} />
            Gjenero raportin
          </button>

          <Link
            href="/admin/reports"
            className="inline-flex h-12 items-center justify-center gap-2 self-end rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            30 ditët e fundit
          </Link>
        </div>
      </form>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Të ardhura"
          value={`${formatPrice(summary.revenue)} Lekë`}
          description="Pagesa të konfirmuara në periudhë"
          icon={Banknote}
        />

        <SummaryCard
          title="Pagesa të paguara"
          value={summary.paidPayments}
          description="Transaksione të përfunduara"
          icon={CheckCircle2}
        />

        <SummaryCard
          title="Pagesa në pritje"
          value={summary.pendingPayments}
          description="Presin konfirmim"
          icon={Clock3}
        />

        <SummaryCard
          title="Biznese të reja"
          value={summary.newBusinesses}
          description="Regjistruar në periudhën e zgjedhur"
          icon={Building2}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Abonime aktive"
          value={summary.activeSubscriptions}
          description="Plane me pagesë aktive"
          icon={CreditCard}
        />

        <SummaryCard
          title="Trial aktive"
          value={summary.trialSubscriptions}
          description="Biznese në provë falas"
          icon={CalendarDays}
        />

        <SummaryCard
          title="Abonime të skaduara"
          value={summary.expiredSubscriptions}
          description="Periudha të përfunduara"
          icon={RefreshCw}
        />

        <SummaryCard
          title="Biznese aktive"
          value={summary.activeBusinesses}
          description="Me akses aktiv në platformë"
          icon={Users}
        />
      </div>

      <div className="grid gap-7 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Të ardhurat ditore
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Vlera e pagesave të konfirmuara për çdo ditë.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {filters.startDate} — {filters.endDate}
            </span>
          </div>

          <div className="mt-8 overflow-x-auto">
            <div className="flex min-w-[720px] items-end gap-2">
              {revenueSeries.map((item) => {
                const height = Math.max(
                  4,
                  (Number(item.revenue || 0) / maxRevenue) * 220,
                );

                return (
                  <div
                    key={item.date}
                    className="flex min-w-0 flex-1 flex-col items-center"
                  >
                    <div className="group relative flex h-60 w-full items-end">
                      <div
                        className="w-full rounded-t-lg bg-blue-500/85 transition hover:bg-blue-600"
                        style={{
                          height: `${height}px`,
                        }}
                      />

                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-lg group-hover:block">
                        {formatPrice(item.revenue)} Lekë
                      </div>
                    </div>

                    <p className="mt-3 rotate-[-45deg] whitespace-nowrap text-[10px] text-slate-400">
                      {item.date.slice(5)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {summary.revenue === 0 ? (
            <div className="mt-8 rounded-2xl bg-slate-50 px-5 py-4 text-center text-sm text-slate-500">
              Nuk ka pagesa të konfirmuara në periudhën e zgjedhur.
            </div>
          ) : null}
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Të ardhurat sipas metodës
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Shpërndarja e pagesave të konfirmuara.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {revenueByMethod.length > 0 ? (
              revenueByMethod.map((item) => {
                const Icon = getMethodIcon(item.method);

                const percentage =
                  summary.revenue > 0
                    ? Math.round((item.revenue / summary.revenue) * 100)
                    : 0;

                return (
                  <div
                    key={item.method}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                          <Icon size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {getMethodLabel(item.method)}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {item.count} pagesa
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-950">
                          {formatPrice(item.revenue)} Lekë
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {percentage}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                Nuk ka të ardhura për këtë periudhë.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-7 xl:grid-cols-2">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Abonimet sipas planit
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Shpërndarja e abonimeve aktive, trial dhe me pagesë të vonuar.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {subscriptionsByPlan.length > 0 ? (
              subscriptionsByPlan.map((item) => {
                const percentage =
                  totalSubscriptions > 0
                    ? Math.round(
                        (item.subscriptions / totalSubscriptions) * 100,
                      )
                    : 0;

                return (
                  <div
                    key={item.planId}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {item.planName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {item.planSlug}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-950">
                          {item.subscriptions}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {percentage}% e totalit
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                Nuk ka abonime aktive.
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-950">
              Pagesat e fundit
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Pagesat e konfirmuara gjatë periudhës.
            </p>
          </div>

          {recentPaidPayments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentPaidPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center"
                >
                  <div>
                    <Link
                      href={`/admin/payments/${payment.id}`}
                      className="font-semibold text-slate-950 transition hover:text-blue-600"
                    >
                      {payment.business.name}
                    </Link>

                    <p className="mt-1 text-sm text-slate-500">
                      {payment.subscription?.plan?.name || "Pa plan"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {payment.business.city || "Qyteti i pacaktuar"} ·{" "}
                      {formatDate(payment.paidAt)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-bold text-slate-950">
                      {formatPrice(payment.amount)} Lekë
                    </p>

                    <p className="mt-1 text-xs font-semibold text-emerald-600">
                      E paguar
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-14 text-center text-sm text-slate-500">
              Nuk ka pagesa të konfirmuara në këtë periudhë.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
