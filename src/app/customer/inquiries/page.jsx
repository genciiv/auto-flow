import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  Inbox,
  Link2,
  MessageSquareText,
  Search,
  Store,
  XCircle,
} from "lucide-react";

import CustomerVehicleClaimActions from "@/components/customer/CustomerVehicleClaimActions";
import { requireCustomerContext } from "@/lib/customer-context";
import { db } from "@/lib/db";

export const metadata = {
  title: "Kërkesat e mia | AutoFlow",
};

function formatDate(value) {
  return new Intl.DateTimeFormat("sq-AL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusConfig(status) {
  if (status === "APPROVED") {
    return {
      label: "Aprovuar",
      icon: CheckCircle2,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (status === "REJECTED") {
    return {
      label: "Refuzuar",
      icon: XCircle,
      className: "border-red-200 bg-red-50 text-red-700",
    };
  }

  return {
    label: "Në pritje",
    icon: Clock3,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  };
}

function normalizeFilter(value, allowed, fallback) {
  const normalized = String(value || fallback).toUpperCase();
  return allowed.includes(normalized) ? normalized : fallback;
}

export default async function CustomerInquiriesPage({ searchParams }) {
  const { profileId } = await requireCustomerContext();
  const resolvedSearchParams = await searchParams;

  const type = normalizeFilter(
    resolvedSearchParams?.type,
    ["ALL", "VEHICLE", "MARKETPLACE"],
    "ALL",
  );

  const status = normalizeFilter(
    resolvedSearchParams?.status,
    ["ALL", "PENDING", "APPROVED", "REJECTED"],
    "ALL",
  );

  const profile = await db.customerProfile.findUnique({
    where: { id: profileId },
    select: { userId: true },
  });

  const [
    vehicleClaims,
    marketplaceInquiries,
    allVehicleClaimsCount,
    pendingCount,
    approvedCount,
    rejectedCount,
    marketplaceCount,
  ] = await Promise.all([
    type === "MARKETPLACE"
      ? []
      : db.vehicleClaim.findMany({
          where: {
            customerVehicle: { profileId },
            ...(status !== "ALL" ? { status } : {}),
          },
          include: {
            customerVehicle: {
              select: {
                id: true,
                plate: true,
                brand: true,
                model: true,
                year: true,
                vin: true,
              },
            },
            vehicle: {
              select: {
                id: true,
                plate: true,
                brand: true,
                model: true,
                year: true,
                business: {
                  select: {
                    id: true,
                    name: true,
                    city: true,
                    address: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),

    type === "VEHICLE" || !profile?.userId
      ? []
      : db.marketplaceInquiry.findMany({
          where: { senderUserId: profile.userId },
          select: {
            id: true,
            message: true,
            createdAt: true,
            listing: {
              select: {
                id: true,
                title: true,
                slug: true,
                city: true,
                business: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                sellerUser: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),

    db.vehicleClaim.count({
      where: { customerVehicle: { profileId } },
    }),

    db.vehicleClaim.count({
      where: {
        status: "PENDING",
        customerVehicle: { profileId },
      },
    }),

    db.vehicleClaim.count({
      where: {
        status: "APPROVED",
        customerVehicle: { profileId },
      },
    }),

    db.vehicleClaim.count({
      where: {
        status: "REJECTED",
        customerVehicle: { profileId },
      },
    }),

    profile?.userId
      ? db.marketplaceInquiry.count({
          where: { senderUserId: profile.userId },
        })
      : 0,
  ]);

  const totalVisible = vehicleClaims.length + marketplaceInquiries.length;

  function buildHref(nextType, nextStatus = status) {
    const params = new URLSearchParams();

    if (nextType !== "ALL") params.set("type", nextType);
    if (nextStatus !== "ALL" && nextType !== "MARKETPLACE") {
      params.set("status", nextStatus);
    }

    const query = params.toString();
    return query ? `/customer/inquiries?${query}` : "/customer/inquiries";
  }

  const typeFilters = [
    {
      label: "Të gjitha",
      value: "ALL",
      count: allVehicleClaimsCount + marketplaceCount,
    },
    {
      label: "Lidhjet me serviset",
      value: "VEHICLE",
      count: allVehicleClaimsCount,
    },
    {
      label: "Marketplace",
      value: "MARKETPLACE",
      count: marketplaceCount,
    },
  ];

  const statusFilters = [
    { label: "Të gjitha statuset", value: "ALL", count: allVehicleClaimsCount },
    { label: "Në pritje", value: "PENDING", count: pendingCount },
    { label: "Aprovuara", value: "APPROVED", count: approvedCount },
    { label: "Refuzuara", value: "REJECTED", count: rejectedCount },
  ];

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
        <div className="relative">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                <Inbox size={14} />
                Portali i klientit
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Kërkesat e mia
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Shiko kërkesat për lidhjen e makinave me serviset dhe mesazhet
                që ke dërguar në Marketplace.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <p className="text-xs font-semibold text-slate-400">
                Gjithsej kërkesa
              </p>

              <p className="mt-1 text-2xl font-black text-white">
                {allVehicleClaimsCount + marketplaceCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((filter) => {
            const isActive = type === filter.value;

            return (
              <Link
                key={filter.value}
                href={buildHref(filter.value, "ALL")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  isActive
                    ? "bg-slate-950 text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {filter.label}
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                  {filter.count}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {type !== "MARKETPLACE" ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => {
              const isActive = status === filter.value;

              return (
                <Link
                  key={filter.value}
                  href={buildHref(type, filter.value)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {filter.label}
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                    {filter.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {totalVisible === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Search size={25} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-950">
            Nuk u gjet asnjë kërkesë
          </h2>
        </section>
      ) : (
        <div className="space-y-5">
          {vehicleClaims.map((claim) => {
            const statusConfig = getStatusConfig(claim.status);
            const StatusIcon = statusConfig.icon;

            const customerVehicleTitle = [
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

            return (
              <article
                key={`vehicle-${claim.id}`}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Link2 size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Lidhje me servis
                      </p>

                      <h2 className="mt-1 text-lg font-bold text-slate-950">
                        {customerVehicleTitle}
                      </h2>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusConfig.className}`}
                    >
                      <StatusIcon size={14} />
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <CalendarDays size={15} />
                    {formatDate(claim.createdAt)}
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Makina ime
                    </p>

                    <div className="mt-3 flex items-start gap-3">
                      <CarFront size={19} className="mt-0.5 text-blue-600" />

                      <div>
                        <p className="font-bold text-slate-950">
                          {customerVehicleTitle}
                        </p>

                        <p className="mt-1 text-sm font-black tracking-wider text-blue-600">
                          {claim.customerVehicle.plate}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
                      Servisi
                    </p>

                    <div className="mt-3 flex items-start gap-3">
                      <Store size={19} className="mt-0.5 text-blue-600" />

                      <div>
                        <p className="font-bold text-slate-950">
                          {claim.vehicle.business.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          {workshopVehicleTitle} · {claim.vehicle.plate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {claim.status === "REJECTED" && claim.rejectionReason ? (
                  <div className="mx-5 mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 sm:mx-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                      Arsyeja e refuzimit
                    </p>

                    <p className="mt-2 text-sm leading-6 text-red-800">
                      {claim.rejectionReason}
                    </p>
                  </div>
                ) : null}

                <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                  <CustomerVehicleClaimActions
                    claimId={claim.id}
                    customerVehicleId={claim.customerVehicle.id}
                    status={claim.status}
                  />
                </div>
              </article>
            );
          })}

          {marketplaceInquiries.map((inquiry) => {
            const sellerName =
              inquiry.listing.business?.name ||
              inquiry.listing.sellerUser?.name ||
              "Shitës AutoFlow";

            return (
              <article
                key={`marketplace-${inquiry.id}`}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <MessageSquareText size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Kërkesë Marketplace
                      </p>

                      <h2 className="mt-1 text-lg font-bold text-slate-950">
                        {inquiry.listing.title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <CalendarDays size={15} />
                    {formatDate(inquiry.createdAt)}
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.42fr_1fr]">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Marrësi
                    </p>

                    <p className="mt-3 font-bold text-slate-950">
                      {sellerName}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Mesazhi im
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {inquiry.message}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-100 px-5 py-4 sm:px-6">
                  <Link
                    href={`/marketplace/${inquiry.listing.slug}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-blue-600"
                  >
                    Shiko publikimin
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
