import Link from "next/link";
import { Package } from "lucide-react";

import MarketplaceProductActions from "@/components/marketplace/MarketplaceProductActions";

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

function getTypeLabel(type) {
  const labels = {
    VEHICLE: "Makina",
    MOTORCYCLE: "Moto",
    PART: "Pjesë",
    ACCESSORY: "Aksesorë",
    SERVICE: "Shërbime",
    OTHER: "Të tjera",
  };

  return labels[type] || "Produkt";
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

function getStockLabel(listing) {
  if (listing.type === "VEHICLE" || listing.type === "MOTORCYCLE") {
    const details = [];

    if (listing.productionYear) {
      details.push(listing.productionYear);
    }

    if (listing.mileage) {
      details.push(
        `${new Intl.NumberFormat("sq-AL").format(listing.mileage)} km`,
      );
    }

    return details.length > 0 ? details.join(" · ") : "1 në shitje";
  }

  if (listing.stock !== null && listing.stock !== undefined) {
    return `${listing.stock} në stok`;
  }

  return "Stoku i paspecifikuar";
}

function EmptyMarketplace({ canManage }) {
  return (
    <div className="col-span-full rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Package size={25} />
      </div>

      <h2 className="mt-5 text-lg font-bold text-slate-950">
        Nuk ka publikime
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Nuk u gjet asnjë produkt ose automjet që përputhet me kërkimin dhe
        filtrat e zgjedhur.
      </p>

      {canManage ? (
        <Link
          href="/dashboard/marketplace/new"
          className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
        >
          Publikim i ri
        </Link>
      ) : null}
    </div>
  );
}

export default function MarketplaceGrid({
  listings = [],
  currency = "ALL",
  canManage = false,
}) {
  if (listings.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <EmptyMarketplace canManage={canManage} />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => {
        const status = getStatusDetails(listing.status);
        const image = listing.images?.[0]?.url;

        return (
          <div
            key={listing.id}
            className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
          >
            <div className="relative h-48 overflow-hidden bg-slate-100">
              {image ? (
                <img
                  src={image}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-sm font-semibold text-slate-400">
                  <Package size={28} strokeWidth={1.6} />
                  Pa fotografi
                </div>
              )}

              <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                {listing.category || getTypeLabel(listing.type)}
              </div>

              <div className="absolute right-4 top-4">
                <MarketplaceProductActions listingId={listing.id} />
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-slate-950">
                    {listing.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {getStockLabel(listing)}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                >
                  {status.label}
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xl font-bold text-slate-950">
                    {formatCurrency(listing.price, currency)}
                  </p>

                  {listing.isNegotiable ? (
                    <p className="mt-1 text-xs font-medium text-blue-600">
                      I negociueshëm
                    </p>
                  ) : null}
                </div>

                <Link
                  href={`/dashboard/marketplace/${listing.id}`}
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
                >
                  Shiko
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
