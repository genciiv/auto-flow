import {
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  Hash,
  Link2,
  MessageSquare,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VehicleClaimActions from "@/components/dashboard/VehicleClaimActions";
import { db } from "@/lib/db";
import { requireBusinessContext } from "@/lib/business-context";

import { approveVehicleClaim, rejectVehicleClaim } from "./actions";

export const metadata = {
  title: "Kërkesat për lidhje | AutoFlow",
};

function formatDate(value) {
  if (!value) {
    return "Nuk është vendosur";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusConfig(status) {
  if (status === "APPROVED") {
    return {
      label: "Aprovuar",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    };
  }

  if (status === "REJECTED") {
    return {
      label: "Refuzuar",
      className: "border-red-200 bg-red-50 text-red-700",
      icon: XCircle,
    };
  }

  return {
    label: "Në pritje",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock3,
  };
}

export default async function VehicleClaimsPage({ searchParams }) {
  const { businessId } = await requireBusinessContext();
  const resolvedSearchParams = await searchParams;

  const requestedStatus = String(
    resolvedSearchParams?.status || "ALL",
  ).toUpperCase();

  const allowedStatuses = ["ALL", "PENDING", "APPROVED", "REJECTED"];

  const status = allowedStatuses.includes(requestedStatus)
    ? requestedStatus
    : "ALL";

  const where = {
    vehicle: {
      businessId,
    },
  };

  if (status !== "ALL") {
    where.status = status;
  }

  const [claims, pendingCount, approvedCount, rejectedCount] =
    await Promise.all([
      db.vehicleClaim.findMany({
        where,
        include: {
          customerVehicle: {
            include: {
              profile: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
          vehicle: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: [
          {
            status: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
      }),

      db.vehicleClaim.count({
        where: {
          status: "PENDING",
          vehicle: {
            businessId,
          },
        },
      }),

      db.vehicleClaim.count({
        where: {
          status: "APPROVED",
          vehicle: {
            businessId,
          },
        },
      }),

      db.vehicleClaim.count({
        where: {
          status: "REJECTED",
          vehicle: {
            businessId,
          },
        },
      }),
    ]);

  const filters = [
    {
      label: "Të gjitha",
      value: "ALL",
      count: pendingCount + approvedCount + rejectedCount,
    },
    {
      label: "Në pritje",
      value: "PENDING",
      count: pendingCount,
    },
    {
      label: "Të aprovuara",
      value: "APPROVED",
      count: approvedCount,
    },
    {
      label: "Të refuzuara",
      value: "REJECTED",
      count: rejectedCount,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
          <div className="relative">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                  <Link2 size={14} />
                  Lidhja e automjeteve
                </div>

                <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                  Kërkesat e klientëve
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  Aprovo vetëm kërkesat e klientëve që zotërojnë ose përdorin
                  automjetet e regjistruara në servisin tuaj.
                </p>
              </div>

              <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <ShieldCheck size={22} className="text-blue-300" />

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Në pritje për shqyrtim
                  </p>

                  <p className="text-xl font-black text-white">
                    {pendingCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <Clock3 size={22} className="text-amber-600" />

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-amber-700">
              Në pritje
            </p>

            <p className="mt-1 text-3xl font-black text-amber-950">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
            <CheckCircle2 size={22} className="text-emerald-600" />

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-emerald-700">
              Të aprovuara
            </p>

            <p className="mt-1 text-3xl font-black text-emerald-950">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
            <XCircle size={22} className="text-red-600" />

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-red-700">
              Të refuzuara
            </p>

            <p className="mt-1 text-3xl font-black text-red-950">
              {rejectedCount}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const isActive = status === filter.value;

              const href =
                filter.value === "ALL"
                  ? "/dashboard/vehicle-claims"
                  : `/dashboard/vehicle-claims?status=${filter.value}`;

              return (
                <a
                  key={filter.value}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    isActive
                      ? "bg-slate-950 text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {filter.label}

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {filter.count}
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {claims.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Link2 size={25} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-950">
              Nuk ka kërkesa
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Nuk u gjet asnjë kërkesë për lidhjen e automjeteve me filtrin e
              zgjedhur.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            {claims.map((claim) => {
              const statusConfig = getStatusConfig(claim.status);
              const StatusIcon = statusConfig.icon;

              const portalVehicleTitle = [
                claim.customerVehicle.brand,
                claim.customerVehicle.model,
              ]
                .filter(Boolean)
                .join(" ");

              const workshopVehicleTitle = [
                claim.vehicle.brand,
                claim.vehicle.model,
              ]
                .filter(Boolean)
                .join(" ");

              const customerName =
                [
                  claim.customerVehicle.profile.firstName,
                  claim.customerVehicle.profile.lastName,
                ]
                  .filter(Boolean)
                  .join(" ") ||
                claim.customerVehicle.profile.user.name ||
                "Klient AutoFlow";

              const approveAction = async () => {
                "use server";

                return approveVehicleClaim(claim.id);
              };

              const rejectAction = async (previousState, formData) => {
                "use server";

                return rejectVehicleClaim(claim.id, formData);
              };

              return (
                <article
                  key={claim.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-5 border-b border-slate-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-950">
                          {portalVehicleTitle}
                        </h2>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusConfig.className}`}
                        >
                          <StatusIcon size={14} />
                          {statusConfig.label}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-black tracking-[0.14em] text-blue-600">
                        {claim.customerVehicle.plate}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <CalendarDays size={15} />
                      {formatDate(claim.createdAt)}
                    </div>
                  </div>

                  <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Klienti
                        </p>

                        <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                              <UserRound size={19} />
                            </div>

                            <div>
                              <p className="font-bold text-slate-950">
                                {customerName}
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                {claim.customerVehicle.profile.user.email}
                              </p>

                              {claim.customerVehicle.profile.phone ||
                              claim.customerVehicle.profile.user.phone ? (
                                <p className="mt-1 text-sm text-slate-500">
                                  {claim.customerVehicle.profile.phone ||
                                    claim.customerVehicle.profile.user.phone}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Automjeti në portal
                        </p>

                        <div className="mt-3 rounded-2xl border border-slate-200 p-4">
                          <div className="flex items-start gap-3">
                            <CarFront
                              size={20}
                              className="mt-0.5 text-blue-600"
                            />

                            <div className="space-y-1">
                              <p className="font-bold text-slate-950">
                                {portalVehicleTitle}
                              </p>

                              <p className="flex items-center gap-2 text-sm text-slate-500">
                                <Hash size={14} />
                                {claim.customerVehicle.plate}
                              </p>

                              {claim.customerVehicle.vin ? (
                                <p className="text-sm text-slate-500">
                                  VIN: {claim.customerVehicle.vin}
                                </p>
                              ) : null}

                              {claim.customerVehicle.year ? (
                                <p className="text-sm text-slate-500">
                                  Viti: {claim.customerVehicle.year}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Automjeti në servis
                        </p>

                        <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                          <div className="flex items-start gap-3">
                            <CarFront
                              size={20}
                              className="mt-0.5 text-blue-600"
                            />

                            <div className="space-y-1">
                              <p className="font-bold text-slate-950">
                                {workshopVehicleTitle}
                              </p>

                              <p className="flex items-center gap-2 text-sm font-bold text-blue-700">
                                <Hash size={14} />
                                {claim.vehicle.plate}
                              </p>

                              {claim.vehicle.vin ? (
                                <p className="text-sm text-slate-600">
                                  VIN: {claim.vehicle.vin}
                                </p>
                              ) : null}

                              {claim.vehicle.customer ? (
                                <p className="text-sm text-slate-600">
                                  Klienti i regjistruar:{" "}
                                  <span className="font-bold">
                                    {claim.vehicle.customer.name}
                                  </span>
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>

                      {claim.customerMessage ? (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Mesazhi i klientit
                          </p>

                          <div className="mt-3 flex gap-3 rounded-2xl bg-slate-50 p-4">
                            <MessageSquare
                              size={18}
                              className="mt-0.5 shrink-0 text-slate-500"
                            />

                            <p className="text-sm leading-6 text-slate-600">
                              {claim.customerMessage}
                            </p>
                          </div>
                        </div>
                      ) : null}

                      {claim.status === "PENDING" ? (
                        <VehicleClaimActions
                          claimId={claim.id}
                          approveAction={approveAction}
                          rejectAction={rejectAction}
                        />
                      ) : null}

                      {claim.status === "REJECTED" && claim.rejectionReason ? (
                        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                            Arsyeja e refuzimit
                          </p>

                          <p className="mt-2 text-sm leading-6 text-red-800">
                            {claim.rejectionReason}
                          </p>
                        </div>
                      ) : null}

                      {claim.reviewedAt ? (
                        <p className="text-xs font-semibold text-slate-400">
                          Shqyrtuar më: {formatDate(claim.reviewedAt)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
