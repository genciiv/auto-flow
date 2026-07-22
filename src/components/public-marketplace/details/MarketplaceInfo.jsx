import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Fuel,
  Gauge,
  MapPin,
  MessageCircle,
  Settings2,
  Tag,
} from "lucide-react";

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

function getSellerName(listing) {
  return listing.business?.name || listing.sellerUser?.name || "Shitës privat";
}

function getPhone(listing) {
  return (
    listing.phone || listing.business?.phone || listing.sellerUser?.phone || ""
  );
}

export default function MarketplaceInfo({ listing }) {
  const currency = listing.business?.currency || "ALL";
  const sellerName = getSellerName(listing);
  const phone = getPhone(listing);

  const location =
    listing.city || listing.business?.city || "Vendndodhje e paspecifikuar";

  const isVehicle = listing.type === "VEHICLE" || listing.type === "MOTORCYCLE";

  return (
    <aside className="lg:sticky lg:top-28">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            {getTypeLabel(listing.type)}
          </span>

          {listing.isFeatured ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
              <BadgeCheck size={14} />I veçuar
            </span>
          ) : null}

          {listing.condition ? (
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              {listing.condition}
            </span>
          ) : null}
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {listing.title}
        </h1>

        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <MapPin size={17} className="text-blue-600" />
          {location}
        </div>

        <div className="mt-6 border-y border-slate-100 py-6">
          <p className="text-3xl font-bold tracking-tight text-slate-950">
            {formatCurrency(listing.price, currency)}
          </p>

          {listing.isNegotiable ? (
            <p className="mt-2 text-sm font-semibold text-blue-600">
              Çmimi është i negociueshëm
            </p>
          ) : null}
        </div>

        {isVehicle ? (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {listing.productionYear ? (
              <div className="rounded-2xl bg-slate-50 p-4">
                <CalendarDays size={18} className="text-blue-600" />

                <p className="mt-2 text-xs font-medium text-slate-500">Viti</p>

                <p className="mt-1 font-bold text-slate-950">
                  {listing.productionYear}
                </p>
              </div>
            ) : null}

            {listing.mileage !== null && listing.mileage !== undefined ? (
              <div className="rounded-2xl bg-slate-50 p-4">
                <Gauge size={18} className="text-blue-600" />

                <p className="mt-2 text-xs font-medium text-slate-500">
                  Kilometra
                </p>

                <p className="mt-1 font-bold text-slate-950">
                  {new Intl.NumberFormat("sq-AL").format(listing.mileage)} km
                </p>
              </div>
            ) : null}

            {listing.fuelType ? (
              <div className="rounded-2xl bg-slate-50 p-4">
                <Fuel size={18} className="text-blue-600" />

                <p className="mt-2 text-xs font-medium text-slate-500">
                  Karburanti
                </p>

                <p className="mt-1 font-bold text-slate-950">
                  {listing.fuelType}
                </p>
              </div>
            ) : null}

            {listing.transmission ? (
              <div className="rounded-2xl bg-slate-50 p-4">
                <Settings2 size={18} className="text-blue-600" />

                <p className="mt-2 text-xs font-medium text-slate-500">
                  Transmisioni
                </p>

                <p className="mt-1 font-bold text-slate-950">
                  {listing.transmission}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {listing.category ? (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                  <Tag size={16} />
                  Kategoria
                </span>

                <span className="text-sm font-bold text-slate-950">
                  {listing.category}
                </span>
              </div>
            ) : null}

            {listing.stock !== null && listing.stock !== undefined ? (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">Në stok</span>

                <span className="text-sm font-bold text-slate-950">
                  {listing.stock}
                </span>
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <Building2 size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">
                Publikuar nga
              </p>

              <p className="truncate font-bold text-slate-950">{sellerName}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <Link
            href="#kontakti"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <MessageCircle size={18} />
            Kërko informacion
          </Link>

          {phone ? (
            <a
              href={`tel:${phone}`}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Telefono: {phone}
            </a>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
