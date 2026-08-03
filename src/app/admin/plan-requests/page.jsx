import Link from "next/link";
import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Clock3,
  Search,
  XCircle,
} from "lucide-react";

import {
  approvePlanRequestAction,
  markPlanRequestPaidAction,
  rejectPlanRequestAction,
} from "./actions";
import { getSubscriptionPlanRequests } from "@/services/admin/subscription-plan-request-service";

function formatLek(value) {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "ALL",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("sq-AL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const STATUS = {
  PENDING: {
    label: "Në pritje",
    className: "bg-amber-50 text-amber-700",
  },
  APPROVED: {
    label: "Aprovuar",
    className: "bg-blue-50 text-blue-700",
  },
  REJECTED: {
    label: "Refuzuar",
    className: "bg-red-50 text-red-700",
  },
  PAID: {
    label: "Paguar / Aktiv",
    className: "bg-emerald-50 text-emerald-700",
  },
};

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

export default async function PlanRequestsPage({ searchParams }) {
  const params = await searchParams;
  const data = await getSubscriptionPlanRequests({
    status: params?.status || "all",
    search: params?.search || "",
    page: params?.page || 1,
  });

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-semibold text-blue-600">Platform Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Kërkesat e planeve
        </h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Shqyrto kërkesat e bizneseve, konfirmo pagesën dhe aktivizo planin pa
          humbur historikun.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <CountCard
          title="Në pritje"
          value={data.counts.pending}
          description="Presin shqyrtim"
          icon={Clock3}
        />
        <CountCard
          title="Të aprovuara"
          value={data.counts.approved}
          description="Presin pagesën"
          icon={CheckCircle2}
        />
        <CountCard
          title="Të refuzuara"
          value={data.counts.rejected}
          description="Kërkesa të mbyllura"
          icon={XCircle}
        />
        <CountCard
          title="Të aktivizuara"
          value={data.counts.paid}
          description="Pagesa të konfirmuara"
          icon={BadgeCheck}
        />
      </div>

      <form
        method="GET"
        className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
          <label className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              name="search"
              type="search"
              defaultValue={data.filters.search}
              placeholder="Kërko biznes, email ose plan..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <select
            name="status"
            defaultValue={data.filters.status}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">Të gjitha statuset</option>
            <option value="PENDING">Në pritje</option>
            <option value="APPROVED">Aprovuar</option>
            <option value="REJECTED">Refuzuar</option>
            <option value="PAID">Paguar / Aktiv</option>
          </select>

          <button className="h-12 rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white hover:bg-slate-800">
            Filtro
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {data.requests.length ? (
          data.requests.map((request) => {
            const status = STATUS[request.status] || STATUS.PENDING;

            return (
              <article
                key={request.id}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-950">
                        {request.business.name}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                      <p>
                        <span className="font-semibold text-slate-900">
                          Plani:
                        </span>{" "}
                        {request.requestedPlan.name}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">
                          Çmimi:
                        </span>{" "}
                        {formatLek(request.requestedPrice)}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">
                          Kërkuesi:
                        </span>{" "}
                        {request.requestedBy.name}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">
                          Data:
                        </span>{" "}
                        {formatDate(request.createdAt)}
                      </p>
                    </div>

                    <p className="text-sm text-slate-500">
                      Nga plani:{" "}
                      <strong className="text-slate-700">
                        {request.currentPlanName || "Pa plan aktiv"}
                      </strong>
                    </p>

                    {request.rejectionReason ? (
                      <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">
                        <strong>Arsyeja:</strong> {request.rejectionReason}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex w-full flex-col gap-3 xl:w-[340px]">
                    {request.status === "PENDING" ? (
                      <>
                        <form action={approvePlanRequestAction}>
                          <input type="hidden" name="requestId" value={request.id} />
                          <input
                            name="notes"
                            placeholder="Shënim opsional..."
                            className="mb-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
                          />
                          <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700">
                            <CheckCircle2 size={17} />
                            Aprovo kërkesën
                          </button>
                        </form>

                        <form action={rejectPlanRequestAction}>
                          <input type="hidden" name="requestId" value={request.id} />
                          <input
                            name="reason"
                            required
                            minLength={3}
                            placeholder="Arsyeja e refuzimit..."
                            className="mb-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-red-400"
                          />
                          <button className="h-11 w-full rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 hover:bg-red-100">
                            Refuzo
                          </button>
                        </form>
                      </>
                    ) : null}

                    {request.status === "APPROVED" ? (
                      <form action={markPlanRequestPaidAction}>
                        <input type="hidden" name="requestId" value={request.id} />
                        <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700">
                          <Banknote size={18} />
                          Konfirmo pagesën dhe aktivizo
                        </button>
                      </form>
                    ) : null}

                    {request.subscriptionId ? (
                      <Link
                        href={`/admin/subscriptions/${request.subscriptionId}`}
                        className="text-center text-sm font-bold text-blue-600 hover:text-blue-700"
                      >
                        Shiko abonimin e krijuar
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg font-bold text-slate-900">
              Nuk ka kërkesa për këtë filtër
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Kërkesat e reja do të shfaqen këtu sapo një biznes të zgjedhë një
              plan tjetër.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
