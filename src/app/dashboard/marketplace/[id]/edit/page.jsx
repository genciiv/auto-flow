import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { notFound } from "next/navigation";

import { updateMarketplaceListing } from "@/actions/marketplace-actions";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MarketplaceEditImages from "@/components/marketplace/MarketplaceEditImages";

import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const LISTING_TYPES = [
  {
    value: "VEHICLE",
    label: "Makinë",
  },
  {
    value: "MOTORCYCLE",
    label: "Motor",
  },
  {
    value: "PART",
    label: "Pjesë këmbimi",
  },
  {
    value: "ACCESSORY",
    label: "Aksesor",
  },
  {
    value: "SERVICE",
    label: "Shërbim",
  },
  {
    value: "OTHER",
    label: "Tjetër",
  },
];

const LISTING_STATUSES = [
  {
    value: "DRAFT",
    label: "Draft",
  },
  {
    value: "PUBLISHED",
    label: "Publikuar",
  },
  {
    value: "SOLD",
    label: "Shitur",
  },
  {
    value: "ARCHIVED",
    label: "Arkivuar",
  },
];

function SectionHeader({ title, description }) {
  return (
    <div className="border-b border-slate-200 px-6 py-5">
      <h2 className="text-base font-bold text-slate-950">{title}</h2>

      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  required = false,
  min,
  max,
  step,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        required={required}
        min={min}
        max={max}
        step={step}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

export default async function EditMarketplaceListingPage({ params }) {
  const { businessId, business } = await requireBusinessPermission(
    PERMISSIONS.MARKETPLACE_MANAGE,
  );

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
    },
  });

  if (!listing) {
    notFound();
  }

  return (
    <DashboardLayout>
      <form action={updateMarketplaceListing}>
        <input type="hidden" name="listingId" value={listing.id} />

        <div className="space-y-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href={`/dashboard/marketplace/${listing.id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
              >
                <ArrowLeft size={17} />
                Kthehu te publikimi
              </Link>

              <p className="mt-5 text-sm font-semibold text-blue-600">
                Marketplace
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Edito publikimin
              </h1>

              <p className="mt-2 text-slate-500">
                Përditëso informacionin, statusin dhe fotografitë e publikimit.
              </p>
            </div>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <Save size={18} />
              Ruaj ndryshimet
            </button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-6">
              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  title="Informacioni bazë"
                  description="Të dhënat kryesore të publikimit."
                />

                <div className="grid gap-5 p-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Field
                      label="Titulli"
                      name="title"
                      defaultValue={listing.title}
                      required
                    />
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Lloji i publikimit
                    </span>

                    <select
                      name="type"
                      defaultValue={listing.type}
                      required
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                    >
                      {LISTING_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <Field
                    label="Kategoria"
                    name="category"
                    defaultValue={listing.category}
                    placeholder="P.sh. Vajra, Frena, Makina"
                  />

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Përshkrimi
                    </span>

                    <textarea
                      name="description"
                      rows={6}
                      defaultValue={listing.description || ""}
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                    />
                  </label>
                </div>
              </section>

              <MarketplaceEditImages existingImages={listing.images} />

              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  title="Të dhënat e automjetit"
                  description="Plotësoji vetëm për makinë ose motor."
                />

                <div className="grid gap-5 p-6 md:grid-cols-2">
                  <Field
                    label="Marka"
                    name="brand"
                    defaultValue={listing.brand}
                  />

                  <Field
                    label="Modeli"
                    name="model"
                    defaultValue={listing.model}
                  />

                  <Field
                    label="Viti i prodhimit"
                    name="productionYear"
                    type="number"
                    min="1900"
                    max="2100"
                    defaultValue={listing.productionYear}
                  />

                  <Field
                    label="Kilometrat"
                    name="mileage"
                    type="number"
                    min="0"
                    defaultValue={listing.mileage}
                  />

                  <Field
                    label="Karburanti"
                    name="fuelType"
                    defaultValue={listing.fuelType}
                  />

                  <Field
                    label="Transmisioni"
                    name="transmission"
                    defaultValue={listing.transmission}
                  />

                  <Field
                    label="Motori"
                    name="engine"
                    defaultValue={listing.engine}
                  />

                  <Field
                    label="Ngjyra"
                    name="color"
                    defaultValue={listing.color}
                  />

                  <div className="md:col-span-2">
                    <Field label="VIN" name="vin" defaultValue={listing.vin} />
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  title="Statusi"
                  description="Kontrollo gjendjen e publikimit."
                />

                <div className="p-6">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Statusi
                    </span>

                    <select
                      name="status"
                      defaultValue={
                        listing.status === "REJECTED" ? "DRAFT" : listing.status
                      }
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                    >
                      {LISTING_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>

              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  title="Çmimi dhe stoku"
                  description="Përditëso çmimin dhe disponueshmërinë."
                />

                <div className="space-y-5 p-6">
                  <Field
                    label={`Çmimi (${business?.currency || "ALL"})`}
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    defaultValue={listing.price}
                  />

                  <Field
                    label="Sasia në stok"
                    name="stock"
                    type="number"
                    min="0"
                    defaultValue={listing.stock}
                  />

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Gjendja
                    </span>

                    <select
                      name="condition"
                      defaultValue={listing.condition || ""}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                    >
                      <option value="">E paspecifikuar</option>
                      <option value="NEW">E re</option>
                      <option value="USED">E përdorur</option>
                      <option value="REFURBISHED">E rikondicionuar</option>
                    </select>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <input
                      type="checkbox"
                      name="isNegotiable"
                      defaultChecked={listing.isNegotiable}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600"
                    />

                    <span className="text-sm font-semibold text-slate-800">
                      Çmimi i negociueshëm
                    </span>
                  </label>
                </div>
              </section>

              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  title="Vendndodhja"
                  description="Ku ndodhet publikimi?"
                />

                <div className="space-y-5 p-6">
                  <Field
                    label="Qyteti"
                    name="city"
                    defaultValue={listing.city}
                  />

                  <Field
                    label="Adresa"
                    name="address"
                    defaultValue={listing.address}
                  />
                </div>
              </section>

              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  title="Kontakti"
                  description="Të dhënat për personat e interesuar."
                />

                <div className="space-y-5 p-6">
                  <Field
                    label="Telefoni"
                    name="phone"
                    type="tel"
                    defaultValue={listing.phone}
                  />

                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    defaultValue={listing.email}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
