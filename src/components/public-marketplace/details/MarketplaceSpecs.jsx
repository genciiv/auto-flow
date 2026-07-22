import { Boxes, CarFront, ClipboardList } from "lucide-react";

function SpecificationRow({ label, value }) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-6 border-b border-slate-100 py-4 last:border-b-0">
      <span className="text-sm font-medium text-slate-500">{label}</span>

      <span className="text-right text-sm font-bold text-slate-950">
        {value}
      </span>
    </div>
  );
}

export default function MarketplaceSpecs({ listing }) {
  const isVehicle = listing.type === "VEHICLE" || listing.type === "MOTORCYCLE";

  const formattedMileage =
    listing.mileage !== null && listing.mileage !== undefined
      ? `${new Intl.NumberFormat("sq-AL").format(listing.mileage)} km`
      : null;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {isVehicle ? <CarFront size={20} /> : <ClipboardList size={20} />}
        </div>

        <h2 className="text-xl font-bold text-slate-950">
          {isVehicle ? "Specifikimet e automjetit" : "Detajet e publikimit"}
        </h2>
      </div>

      <div className="mt-5 grid gap-x-10 md:grid-cols-2">
        {isVehicle ? (
          <>
            <div>
              <SpecificationRow label="Marka" value={listing.brand} />

              <SpecificationRow label="Modeli" value={listing.model} />

              <SpecificationRow
                label="Viti i prodhimit"
                value={listing.productionYear}
              />

              <SpecificationRow label="Kilometra" value={formattedMileage} />

              <SpecificationRow label="Ngjyra" value={listing.color} />
            </div>

            <div>
              <SpecificationRow label="Karburanti" value={listing.fuelType} />

              <SpecificationRow
                label="Transmisioni"
                value={listing.transmission}
              />

              <SpecificationRow label="Motori" value={listing.engine} />

              <SpecificationRow label="VIN" value={listing.vin} />

              <SpecificationRow label="Gjendja" value={listing.condition} />
            </div>
          </>
        ) : (
          <>
            <div>
              <SpecificationRow label="Lloji" value={listing.type} />

              <SpecificationRow label="Kategoria" value={listing.category} />

              <SpecificationRow label="Gjendja" value={listing.condition} />
            </div>

            <div>
              <SpecificationRow label="Sasia në stok" value={listing.stock} />

              <SpecificationRow label="Qyteti" value={listing.city} />

              <SpecificationRow label="Adresa" value={listing.address} />
            </div>
          </>
        )}
      </div>

      {!isVehicle &&
      !listing.category &&
      !listing.condition &&
      listing.stock === null ? (
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          <Boxes size={18} />
          Nuk janë shtuar specifika të tjera.
        </div>
      ) : null}
    </section>
  );
}
