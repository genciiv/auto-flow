import {
  Activity,
  Banknote,
  Building2,
  ChartNoAxesCombined,
  CircleDollarSign,
  CreditCard,
  Gauge,
  Percent,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { getAnalytics } from "@/services/admin/analytics-service";

function formatPrice(value) {
  return new Intl.NumberFormat("sq-AL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatPercentage(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function MetricCard({ title, value, description, icon: Icon, trend }) {
  const isPositive = Number(trend || 0) >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={19} />
        </div>

        {trend !== undefined ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              isPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <TrendIcon size={13} />
            {Math.abs(Number(trend || 0)).toFixed(1)}%
          </span>
        ) : null}
      </div>

      <p className="mt-5 text-sm text-slate-500">{title}</p>

      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>

      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function ProgressMetric({ title, value, description, icon: Icon }) {
  const safeValue = Math.min(100, Math.max(0, Number(value || 0)));

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={19} />
        </div>

        <span className="text-lg font-bold text-slate-950">
          {formatPercentage(safeValue)}
        </span>
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-800">{title}</p>

      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}

function getMaxValue(items, key) {
  return Math.max(1, ...items.map((item) => Number(item[key] || 0)));
}

function getTotalPlanSubscriptions(planPerformance) {
  return planPerformance.reduce((total, item) => total + item.subscriptions, 0);
}

export default async function AnalyticsPage() {
  const data = await getAnalytics();

  const { summary, monthlyGrowth, planPerformance } = data;

  const maxBusinesses = getMaxValue(monthlyGrowth, "businesses");

  const maxRevenue = getMaxValue(monthlyGrowth, "revenue");

  const totalPlanSubscriptions = getTotalPlanSubscriptions(planPerformance);

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">Platform Admin</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Analitika
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Monitoro rritjen e platformës, konvertimin e abonimeve dhe
            performancën financiare.
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <ChartNoAxesCombined size={23} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Biznese totale"
          value={summary.totalBusinesses}
          description={`${summary.activeBusinesses} biznese janë aktive`}
          icon={Building2}
        />

        <MetricCard
          title="Biznese këtë muaj"
          value={summary.currentMonthBusinesses}
          description={`${summary.previousMonthBusinesses} muajin e kaluar`}
          icon={Users}
          trend={summary.businessGrowth}
        />

        <MetricCard
          title="Të ardhura këtë muaj"
          value={`${formatPrice(summary.currentMonthRevenue)} Lekë`}
          description={`${formatPrice(
            summary.previousMonthRevenue,
          )} Lekë muajin e kaluar`}
          icon={Banknote}
          trend={summary.revenueGrowth}
        />

        <MetricCard
          title="Të ardhura totale"
          value={`${formatPrice(summary.totalRevenue)} Lekë`}
          description="Nga të gjitha pagesat e konfirmuara"
          icon={CircleDollarSign}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <ProgressMetric
          title="Biznese aktive"
          value={summary.activeBusinessRate}
          description="Përqindja e bizneseve me status aktiv"
          icon={Activity}
        />

        <ProgressMetric
          title="Konvertimi trial"
          value={summary.trialConversionRate}
          description="Përqindja e abonimeve që janë kthyer në plane me pagesë"
          icon={Percent}
        />

        <MetricCard
          title="Abonime aktive"
          value={summary.activeSubscriptions}
          description={`${summary.trialSubscriptions} trial dhe ${summary.expiredSubscriptions} të skaduara`}
          icon={CreditCard}
        />

        <MetricCard
          title="Të ardhura mesatare"
          value={`${formatPrice(
            summary.averageRevenuePerActiveSubscription,
          )} Lekë`}
          description="Mesatarja mujore për abonim aktiv"
          icon={Gauge}
        />
      </div>

      <div className="grid gap-7 xl:grid-cols-2">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Rritja e bizneseve
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Bizneset e reja gjatë 6 muajve të fundit.
            </p>
          </div>

          <div className="mt-8">
            <div className="flex h-72 items-end gap-4">
              {monthlyGrowth.map((item) => {
                const height = Math.max(
                  8,
                  (Number(item.businesses || 0) / maxBusinesses) * 230,
                );

                return (
                  <div
                    key={item.month}
                    className="flex min-w-0 flex-1 flex-col items-center"
                  >
                    <div className="group relative flex h-60 w-full items-end">
                      <div
                        className="w-full rounded-t-xl bg-blue-500 transition hover:bg-blue-600"
                        style={{
                          height: `${height}px`,
                        }}
                      />

                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-lg group-hover:block">
                        {item.businesses} biznese
                      </div>
                    </div>

                    <p className="mt-3 text-xs font-medium text-slate-500">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Të ardhurat mujore
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Pagesat e konfirmuara gjatë 6 muajve të fundit.
            </p>
          </div>

          <div className="mt-8">
            <div className="flex h-72 items-end gap-4">
              {monthlyGrowth.map((item) => {
                const height = Math.max(
                  8,
                  (Number(item.revenue || 0) / maxRevenue) * 230,
                );

                return (
                  <div
                    key={item.month}
                    className="flex min-w-0 flex-1 flex-col items-center"
                  >
                    <div className="group relative flex h-60 w-full items-end">
                      <div
                        className="w-full rounded-t-xl bg-slate-800 transition hover:bg-slate-950"
                        style={{
                          height: `${height}px`,
                        }}
                      />

                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-lg group-hover:block">
                        {formatPrice(item.revenue)} Lekë
                      </div>
                    </div>

                    <p className="mt-3 text-xs font-medium text-slate-500">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-950">
            Performanca e planeve
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Numri i abonimeve dhe vlera e kontraktuar për çdo plan.
          </p>
        </div>

        {planPerformance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Plani
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Statusi
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Abonimet
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Përqindja
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Vlera e kontraktuar
                  </th>
                </tr>
              </thead>

              <tbody>
                {planPerformance.map((item) => {
                  const percentage =
                    totalPlanSubscriptions > 0
                      ? Math.round(
                          (item.subscriptions / totalPlanSubscriptions) * 100,
                        )
                      : 0;

                  return (
                    <tr
                      key={item.planId}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-950">
                          {item.planName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {item.planSlug}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            item.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.isActive ? "Aktiv" : "Joaktiv"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-slate-800">
                        {item.subscriptions}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>

                          <span className="text-xs font-semibold text-slate-600">
                            {percentage}%
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-right text-sm font-bold text-slate-950">
                        {formatPrice(item.contractedValue)} Lekë
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-14 text-center text-sm text-slate-500">
            Nuk ka të dhëna për planet.
          </div>
        )}
      </section>
    </div>
  );
}
