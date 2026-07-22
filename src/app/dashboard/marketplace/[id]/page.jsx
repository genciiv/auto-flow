import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  Edit3,
  Mail,
  MapPin,
  Package,
  Phone,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function formatCurrency(value, currency = "ALL") {
  const amount = Number(value || 0);

  if (currency === "EUR") {
    return new Intl.NumberFormat("sq-AL", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return `${new Intl.NumberFormat("sq-AL", {
    maximumFractionDigits: 0,
  }).format(amount)} Lek`;
}

function formatDate(value) {
  if (!value) {
    return "Pa datë";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getTypeLabel(type) {
  const labels = {
    VEHICLE: "Makinë",
    MOTORCYCLE: "Motor",
    PART: "Pjesë këmbimi",
    ACCESSORY: "Aksesor",
    SERVICE: "Shërbim",
    OTHER: "Tjetër",
  };

  return labels[type] || "Publikim";
}

function getStatusDetails(status) {
  const statuses = {
    PUBLISHED: {
      label: "Publikuar",
      className: "bg-emerald-50 text-emerald-700",
    },
    DRAFT: {
      label: "Draft",
      className: "bg-amber-50 text-amber-700",
    },
    SOLD: {
      label: "Shitur",
      className: "bg-blue-50 text-blue-700",
    },
    ARCHIVED: {
      label: "Arkivuar",
      className: "bg-slate-100 text-slate-600",
    },
    REJECTED: {
      label: "Refuzuar",
      className: "bg-red-50 text-red-700",
    },
  };

  return (
    statuses[status] || {
      label: status,
      className: "bg-slate-100 text-slate-600",
    }
  );
}

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="flex items-start justify-between gap-6 border-b border-slate-100 py-4 last:border-b-0">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>

      <dd className="text-right text-sm font-semibold text-slate-950">
        {value}
      </dd>
    </div>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div className="border-b border-slate-200 px-6 py-5">
      <h2 className="text-base font-bold text-slate-950">{title}</h2>

      {description ? (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

export default async function MarketplaceListingDetailsPage({ params }) {
  const { businessId, businessRole, business } =
    await requireBusinessPermission(PERMISSIONS.MARKETPLACE_VIEW);

  const routeParams = await params;
  const listingId = routeParams?.id;

  if (!listingId) {
    notFound();
  }

  const listing = await db.marketplaceListing.findFirst({
    where: {
      id: listingId,
      businessId,
    },
    include: {
      images: {
        orderBy: {
          position: "asc",
        },
      },
      inquiries: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  const canManage = hasPermission(businessRole, PERMISSIONS.MARKETPLACE_MANAGE);

  const status = getStatusDetails(listing.status);
  const currency = business?.currency || "ALL";
  const coverImage = listing.images?.[0]?.url;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/dashboard/marketplace"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Kthehu te Marketplace
            </Link>

            <p className="mt-5 text-sm font-semibold text-blue-600">
              Marketplace
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                {listing.title}
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
              >
                {status.label}
              </span>
            </div>

            <p className="mt-2 text-slate-500">
              {listing.category || getTypeLabel(listing.type)}
            </p>
          </div>

          {canManage ? (
            <Link
              href={`/dashboard/marketplace/${listing.id}/edit`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <Edit3 size={18} />
              Edito publikimin
            </Link>
          ) : null}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="relative min-h-[420px] bg-slate-100">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={listing.title}
                    className="h-full min-h-[420px] w-full object-cover"
                  />
                ) : (
                  <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-slate-400">
                    <Package size={42} strokeWidth={1.5} />
                    <span className="text-sm font-semibold">Pa fotografi</span>
                  </div>
                )}
              </div>

              {listing.images.length > 1 ? (
                <div className="grid grid-cols-3 gap-3 border-t border-slate-200 p-4 sm:grid-cols-4">
                  {listing.images.slice(1).map((image) => (
                    <div
                      key={image.id}
                      className="aspect-square overflow-hidden rounded-2xl bg-slate-100"
                    >
                      <img
                        src={image.url}
                        alt={image.alt || listing.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Përshkrimi"
                description="Informacioni i plotë i publikimit."
              />

              <div className="p-6">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                  {listing.description || "Nuk ka përshkrim të shtuar."}
                </p>
              </div>
            </section>

            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Detajet"
                description="Të dhënat teknike dhe informacioni i produktit."
              />

              <dl className="px-6">
                <DetailRow label="Lloji" value={getTypeLabel(listing.type)} />
                <DetailRow label="Kategoria" value={listing.category} />
                <DetailRow label="Gjendja" value={listing.condition} />
                <DetailRow
                  label="Stoku"
                  value={
                    listing.stock !== null && listing.stock !== undefined
                      ? `${listing.stock}`
                      : null
                  }
                />
                <DetailRow label="Marka" value={listing.brand} />
                <DetailRow label="Modeli" value={listing.model} />
                <DetailRow
                  label="Viti i prodhimit"
                  value={listing.productionYear}
                />
                <DetailRow
                  label="Kilometrat"
                  value={
                    listing.mileage
                      ? `${new Intl.NumberFormat("sq-AL").format(
                          listing.mileage,
                        )} km`
                      : null
                  }
                />
                <DetailRow label="Karburanti" value={listing.fuelType} />
                <DetailRow label="Transmisioni" value={listing.transmission} />
                <DetailRow label="Motori" value={listing.engine} />
                <DetailRow label="Ngjyra" value={listing.color} />
                <DetailRow label="VIN" value={listing.vin} />
              </dl>
            </section>
          </div>

          <div className="space-y-6">
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Çmimi"
                description="Vlera aktuale e publikimit."
              />

              <div className="p-6">
                <p className="text-3xl font-bold tracking-tight text-slate-950">
                  {formatCurrency(listing.price, currency)}
                </p>

                {listing.isNegotiable ? (
                  <p className="mt-2 text-sm font-semibold text-blue-600">
                    Çmimi është i negociueshëm
                  </p>
                ) : null}
              </div>
            </section>

            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Vendndodhja"
                description="Ku ndodhet produkti ose automjeti."
              />

              <div className="space-y-4 p-6">
                {listing.city ? (
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {listing.city}
                      </p>

                      {listing.address ? (
                        <p className="mt-1 text-sm text-slate-500">
                          {listing.address}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Vendndodhja nuk është specifikuar.
                  </p>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Kontakti"
                description="Të dhënat e kontaktit për këtë publikim."
              />

              <div className="space-y-4 p-6">
                {listing.phone ? (
                  <a
                    href={`tel:${listing.phone}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <Phone size={18} className="text-blue-600" />

                    <span className="text-sm font-semibold text-slate-800">
                      {listing.phone}
                    </span>
                  </a>
                ) : null}

                {listing.email ? (
                  <a
                    href={`mailto:${listing.email}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <Mail size={18} className="text-blue-600" />

                    <span className="break-all text-sm font-semibold text-slate-800">
                      {listing.email}
                    </span>
                  </a>
                ) : null}

                {!listing.phone && !listing.email ? (
                  <p className="text-sm text-slate-500">
                    Nuk ka të dhëna kontakti.
                  </p>
                ) : null}
              </div>
            </section>

            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <SectionHeader title="Informacioni i publikimit" />

              <div className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <CalendarDays size={18} className="text-blue-600" />

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Krijuar më
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {formatDate(listing.createdAt)}
                    </p>
                  </div>
                </div>

                {listing.publishedAt ? (
                  <div className="flex items-center gap-3">
                    <Car size={18} className="text-blue-600" />

                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Publikuar më
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-950">
                        {formatDate(listing.publishedAt)}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
