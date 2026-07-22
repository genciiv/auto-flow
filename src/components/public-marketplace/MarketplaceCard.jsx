import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Fuel,
  Gauge,
  MapPin,
  Package,
  Settings2,
} from "lucide-react";

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
    VEHICLE: "Makinë",
    MOTORCYCLE: "Motor",
    PART: "Pjesë këmbimi",
    ACCESSORY: "Aksesor",
    SERVICE: "Shërbim",
    OTHER: "Tjetër",
  };

  return labels[type] || "Publikim";
}

function getSellerName(listing) {
  if (listing.business?.name) {
    return listing.business.name;
  }

  if (listing.sellerUser?.name) {
    return listing.sellerUser.name;
  }

  return "Shitës privat";
}

function getLocation(listing) {
  return (
    listing.city || listing.business?.city || "Vendndodhje e paspecifikuar"
  );
}

export default function MarketplaceCard({ listing }) {
  const coverImage = listing.images?.[0]?.url;
  const sellerName = getSellerName(listing);
  const location = getLocation(listing);

  const currency = listing.business?.currency || "ALL";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60">
      <Link
        href={`/marketplace/${listing.slug}`}
        className="relative block aspect-[16/11] overflow-hidden bg-slate-100"
      >
        {coverImage ? (
          <img
            src={coverImage}
            alt={listing.images?.[0]?.alt || listing.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
            <Package size={42} strokeWidth={1.5} />
            <span className="text-xs font-semibold">Pa fotografi</span>
          </div>
        )}

        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">
            {getTypeLabel(listing.type)}
          </span>
        </div>

        {listing.isFeatured ? (
          <div className="absolute right-4 top-4">
            <span className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
              I veçuar
            </span>
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div>
          <Link href={`/marketplace/${listing.slug}`} className="block">
            <h2 className="line-clamp-2 text-lg font-bold leading-6 text-slate-950 transition group-hover:text-blue-600">
              {listing.title}
            </h2>
          </Link>

          <div className="mt-3 flex flex-wrap gap-2">
            {listing.productionYear ? (
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {listing.productionYear}
              </span>
            ) : null}

            {listing.condition ? (
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {listing.condition}
              </span>
            ) : null}

            {listing.isNegotiable ? (
              <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                I negociueshëm
              </span>
            ) : null}
          </div>
        </div>

        {listing.type === "VEHICLE" || listing.type === "MOTORCYCLE" ? (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {listing.mileage ? (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Gauge size={15} className="text-slate-400" />
                {new Intl.NumberFormat("sq-AL").format(listing.mileage)} km
              </div>
            ) : null}

            {listing.fuelType ? (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Fuel size={15} className="text-slate-400" />
                {listing.fuelType}
              </div>
            ) : null}

            {listing.transmission ? (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Settings2 size={15} className="text-slate-400" />
                {listing.transmission}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 border-t border-slate-100 pt-5">
          <p className="text-2xl font-bold tracking-tight text-slate-950">
            {formatCurrency(listing.price, currency)}
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Building2 size={16} className="shrink-0 text-blue-600" />

            <span className="truncate font-semibold">{sellerName}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin size={16} className="shrink-0 text-slate-400" />

            <span className="truncate">{location}</span>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <Link
            href={`/marketplace/${listing.slug}`}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
          >
            Shiko detajet
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}
