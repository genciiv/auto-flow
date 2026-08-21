import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Boxes,
  Car,
  CheckCircle2,
  Clock3,
  FileWarning,
  Gauge,
  Users,
  Wrench,
} from "lucide-react";

import {
  formatCurrency,
  formatNumber,
} from "@/lib/formatters";

function formatPercent(value) {
  const numeric = Number(value || 0);
  const prefix = numeric > 0 ? "+" : "";

  return `${prefix}${numeric
    .toFixed(1)
    .replace(".0", "")}%`;
}

function MetricCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  href,
}) {
  const positive =
    Number(change || 0) >= 0;

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <Icon size={21} />
        </div>

        {change !== null &&
        change !== undefined ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
              positive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {positive ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}

            {formatPercent(change)}
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-[1.7rem] font-black tracking-tight text-slate-950">
        {value}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-400">
          {subtitle}
        </p>

        <ArrowRight
          size={15}
          className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
        />
      </div>
    </Link>
  );
}

function RevenueProfitChart({ months }) {
  const maxValue = Math.max(
    1,
    ...months.flatMap((month) => [
      month.revenue,
      month.expenses,
    ]),
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            6 muajt e fundit
          </p>

          <h2 className="mt-2 text-xl font-black text-slate-950">
            Arkëtime kundrejt daljeve të arkës
          </h2>
        </div>

        <div className="flex gap-4 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            Arkëtime
          </span>

          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            Dalje të arkës
          </span>
        </div>
      </div>

      <div className="mt-8 grid h-64 grid-cols-6 gap-3 sm:gap-5">
        {months.map((month) => {
          const revenueHeight = Math.max(
            3,
            (month.revenue / maxValue) * 100,
          );

          const expenseHeight = Math.max(
            3,
            (month.expenses / maxValue) * 100,
          );

          return (
            <div
              key={month.key}
              className="flex min-w-0 flex-col items-center"
            >
              <div className="flex h-52 w-full items-end justify-center gap-1.5">
                <div
                  title={`${month.label}: ${formatCurrency(
                    month.revenue,
                  )}`}
                  className="w-2/5 rounded-t-xl bg-blue-600 transition hover:bg-blue-700"
                  style={{
                    height: `${revenueHeight}%`,
                  }}
                />

                <div
                  title={`${month.label}: ${formatCurrency(
                    month.expenses,
                  )}`}
                  className="w-2/5 rounded-t-xl bg-slate-300 transition hover:bg-slate-400"
                  style={{
                    height: `${expenseHeight}%`,
                  }}
                />
              </div>

              <span className="mt-3 truncate text-xs font-bold text-slate-500">
                {month.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ServicePipeline({
  statuses,
  total,
}) {
  const config = [
    [
      "PENDING",
      "Në pritje",
      "bg-amber-500",
    ],
    [
      "IN_PROGRESS",
      "Në proces",
      "bg-blue-600",
    ],
    [
      "WAITING_FOR_PARTS",
      "Në pritje të pjesëve",
      "bg-violet-500",
    ],
    [
      "READY_FOR_PICKUP",
      "Gati për tërheqje",
      "bg-emerald-500",
    ],
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Operacionet
          </p>

          <h2 className="mt-2 text-xl font-black text-slate-950">
            Gjendja e urdhër-punëve
          </h2>
        </div>

        <Link
          href="/dashboard/services"
          className="text-sm font-bold text-blue-600 hover:text-blue-700"
        >
          Shiko të gjitha
        </Link>
      </div>

      <div className="mt-7 space-y-5">
        {config.map(
          ([key, label, barClass]) => {
            const value = Number(
              statuses[key] || 0,
            );

            const width =
              total > 0
                ? Math.max(
                    3,
                    (value / total) * 100,
                  )
                : 3;

            return (
              <div key={key}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-700">
                    {label}
                  </span>

                  <span className="text-sm font-black text-slate-950">
                    {value}
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${barClass}`}
                    style={{
                      width: `${width}%`,
                    }}
                  />
                </div>
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}

function MechanicsTable({ mechanics }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Ekipi teknik
          </p>

          <h2 className="mt-2 text-xl font-black text-slate-950">
            Performanca e mekanikëve
          </h2>
        </div>

        <Link
          href="/dashboard/staff"
          className="text-sm font-bold text-blue-600"
        >
          Menaxho stafin
        </Link>
      </div>

      {mechanics.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">
          Nuk ka ende mekanikë me punë të
          caktuara.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3.5">
                  Mekaniku
                </th>
                <th className="px-4 py-3.5">
                  Aktive
                </th>
                <th className="px-4 py-3.5">
                  Përfunduara
                </th>
                <th className="px-4 py-3.5">
                  Të ardhura
                </th>
                <th className="px-6 py-3.5">
                  Norma e përfundimit
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {mechanics.map((mechanic) => (
                <tr
                  key={mechanic.id}
                  className="text-sm text-slate-700"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-950">
                      {mechanic.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {mechanic.email}
                    </p>
                  </td>

                  <td className="px-4 py-4 font-bold">
                    {mechanic.active}
                  </td>

                  <td className="px-4 py-4 font-bold">
                    {mechanic.completed}
                  </td>

                  <td className="px-4 py-4 font-bold">
                    {formatCurrency(
                      mechanic.revenue,
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${mechanic.completionRate}%`,
                          }}
                        />
                      </div>

                      <span className="text-xs font-bold text-slate-500">
                        {mechanic.completionRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AlertsPanel({ data }) {
  const alerts = [
    {
      label: "Fatura të papaguara",
      value: data.unpaidInvoices,
      detail: formatCurrency(
        data.receivables,
      ),
      href: "/dashboard/invoices",
      icon: FileWarning,
      danger:
        data.unpaidInvoices > 0,
    },
    {
      label: "Pjesë nën minimum",
      value: data.lowStock,
      detail: "Kërkojnë furnizim",
      href: "/dashboard/inventory",
      icon: Boxes,
      danger: data.lowStock > 0,
    },
    {
      label: "Punë të bllokuara",
      value: data.waitingForParts,
      detail:
        "Në pritje të pjesëve",
      href: "/dashboard/services",
      icon: Clock3,
      danger:
        data.waitingForParts > 0,
    },
    {
      label: "Gati për dorëzim",
      value: data.readyForPickup,
      detail: "Kontakto klientët",
      href: "/dashboard/services",
      icon: CheckCircle2,
      danger: false,
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
        Kërkojnë vëmendje
      </p>

      <h2 className="mt-2 text-xl font-black text-slate-950">
        Sinjalizime operative
      </h2>

      <div className="mt-6 space-y-3">
        {alerts.map((alert) => {
          const Icon = alert.icon;

          return (
            <Link
              key={alert.label}
              href={alert.href}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/40"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  alert.danger
                    ? "bg-red-50 text-red-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                <Icon size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">
                  {alert.label}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {alert.detail}
                </p>
              </div>

              <span className="text-lg font-black text-slate-950">
                {alert.value}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function TopCustomers({ customers }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Klientët
          </p>

          <h2 className="mt-2 text-xl font-black text-slate-950">
            Klientët kryesorë
          </h2>
        </div>

        <Link
          href="/dashboard/customers"
          className="text-sm font-bold text-blue-600"
        >
          Shiko listën
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {customers.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Nuk ka ende të dhëna.
          </p>
        ) : (
          customers.map(
            (customer, index) => (
              <div
                key={customer.id}
                className="flex items-center gap-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-500">
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {customer.name}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {customer.services} shërbime
                    {" · "}
                    {customer.vehicles} automjete
                  </p>
                </div>

                <span className="text-sm font-black text-slate-950">
                  {formatCurrency(
                    customer.revenue,
                  )}
                </span>
              </div>
            ),
          )
        )}
      </div>
    </section>
  );
}

export default function ExecutiveDashboard({
  data,
  businessName,
  role,
}) {
  const isOwner = role === "OWNER";

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            <Gauge size={14} />
            Dashboard ekzekutiv
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {isOwner
              ? "Pamja e pronarit"
              : "Pamja e menaxherit"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Kontrolli i financave,
            operacioneve dhe ekipit për{" "}
            {businessName || "biznesin"}.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/finance/reports"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Banknote size={17} />
            Raportet
          </Link>

          <Link
            href="/dashboard/services"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <Wrench size={17} />
            Urdhër-punët
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Të arkëtuara këtë muaj"
          value={formatCurrency(
            data.currentRevenue,
          )}
          subtitle={`Rezultati i arkës: ${formatCurrency(
            data.currentCashResult,
          )}`}
          change={data.revenueChange}
          icon={Banknote}
          href="/dashboard/finance"
        />

        <MetricCard
          title="Fitimi operativ"
          value={formatCurrency(
            data.currentProfit,
          )}
          subtitle={`COGS: ${formatCurrency(
            data.currentCogs,
          )} · Shp. operative: ${formatCurrency(
            data.currentExpenses,
          )}`}
          change={data.profitChange}
          icon={Gauge}
          href="/dashboard/finance"
        />

        <MetricCard
          title="Shërbime këtë muaj"
          value={formatNumber(
            data.currentServices,
          )}
          subtitle={`${data.completedServices} të përfunduara`}
          change={data.serviceChange}
          icon={Wrench}
          href="/dashboard/services"
        />

        <MetricCard
          title="Vlera e inventarit"
          value={formatCurrency(
            data.inventoryValue,
          )}
          subtitle={`${data.lowStock} artikuj me stok të ulët`}
          change={null}
          icon={Boxes}
          href="/dashboard/inventory"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <RevenueProfitChart
          months={data.months}
        />

        <AlertsPanel data={data} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ServicePipeline
          statuses={data.serviceStatuses}
          total={data.activeServiceTotal}
        />

        <TopCustomers
          customers={data.topCustomers}
        />
      </div>

      <MechanicsTable
        mechanics={data.mechanics}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/customers"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200"
        >
          <Users
            className="text-blue-600"
            size={21}
          />

          <p className="mt-4 text-2xl font-black text-slate-950">
            {formatNumber(
              data.totalCustomers,
            )}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            Klientë gjithsej
          </p>
        </Link>

        <Link
          href="/dashboard/vehicles"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200"
        >
          <Car
            className="text-blue-600"
            size={21}
          />

          <p className="mt-4 text-2xl font-black text-slate-950">
            {formatNumber(
              data.totalVehicles,
            )}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            Automjete gjithsej
          </p>
        </Link>

        <Link
          href="/dashboard/invoices"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200"
        >
          <AlertTriangle
            className="text-amber-600"
            size={21}
          />

          <p className="mt-4 text-2xl font-black text-slate-950">
            {formatCurrency(
              data.receivables,
            )}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            Detyrime nga klientët
          </p>
        </Link>
      </div>
    </div>
  );
}
