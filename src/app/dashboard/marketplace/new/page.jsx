import Link from "next/link";
import { ArrowLeft, Save, Send } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MarketplaceImageUpload from "@/components/marketplace/MarketplaceImageUpload";
import {
  requireBusinessActionPermission,
  requireBusinessPermission,
} from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";

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

const VALID_TYPES = LISTING_TYPES.map((type) => type.value);

function getString(formData, field) {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getOptionalString(formData, field) {
  const value = getString(formData, field);

  return value || null;
}

function getOptionalInteger(formData, field) {
  const value = getString(formData, field);

  if (!value) {
    return null;
  }

  const number = Number.parseInt(value, 10);

  return Number.isInteger(number) ? number : null;
}

function createSlug(title) {
  const normalizedTitle = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return `${normalizedTitle || "publikim"}-${suffix}`;
}

async function createMarketplaceListing(formData) {
  "use server";

  const { businessId } = await requireBusinessActionPermission(
    PERMISSIONS.MARKETPLACE_MANAGE,
  );

  const title = getString(formData, "title");
  const description = getOptionalString(formData, "description");
  const requestedType = getString(formData, "type");
  const priceValue = getString(formData, "price");
  const requestedStatus = getString(formData, "status");

  if (title.length < 3) {
    throw new Error("Titulli duhet të ketë të paktën 3 karaktere.");
  }

  if (!VALID_TYPES.includes(requestedType)) {
    throw new Error("Lloji i publikimit nuk është i vlefshëm.");
  }

  const price = Number(priceValue);

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Vendos një çmim të vlefshëm.");
  }

  const status = requestedStatus === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  const listing = await db.marketplaceListing.create({
    data: {
      sellerType: "BUSINESS",
      businessId,

      type: requestedType,
      status,

      title,
      slug: createSlug(title),
      description,

      price,
      isNegotiable: formData.get("isNegotiable") === "on",

      category: getOptionalString(formData, "category"),
      condition: getOptionalString(formData, "condition"),

      city: getOptionalString(formData, "city"),
      address: getOptionalString(formData, "address"),

      phone: getOptionalString(formData, "phone"),
      email: getOptionalString(formData, "email"),

      brand: getOptionalString(formData, "brand"),
      model: getOptionalString(formData, "model"),
      productionYear: getOptionalInteger(formData, "productionYear"),
      mileage: getOptionalInteger(formData, "mileage"),
      fuelType: getOptionalString(formData, "fuelType"),
      transmission: getOptionalString(formData, "transmission"),
      engine: getOptionalString(formData, "engine"),
      color: getOptionalString(formData, "color"),
      vin: getOptionalString(formData, "vin"),

      stock: getOptionalInteger(formData, "stock"),

      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
    select: {
      id: true,
    },
  });

  revalidatePath("/dashboard/marketplace");

  redirect(`/dashboard/marketplace/${listing.id}`);
}

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
        defaultValue={defaultValue || ""}
        required={required}
        min={min}
        max={max}
        step={step}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

export default async function NewMarketplaceListingPage() {
  const { business } = await requireBusinessPermission(
    PERMISSIONS.MARKETPLACE_MANAGE,
  );

  return (
    <DashboardLayout>
      <form action={createMarketplaceListing}>
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

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Publikim i ri
              </h1>

              <p className="mt-2 text-slate-500">
                Shto një produkt, pjesë, automjet ose shërbim në Marketplace.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                name="status"
                value="DRAFT"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Save size={18} />
                Ruaj draft
              </button>

              <button
                type="submit"
                name="status"
                value="PUBLISHED"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                <Send size={18} />
                Publiko
              </button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-6">
              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  title="Informacioni bazë"
                  description="Të dhënat kryesore që do të shfaqen në Marketplace."
                />

                <div className="grid gap-5 p-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Field
                      label="Titulli"
                      name="title"
                      placeholder="P.sh. BMW 320d 2018"
                      required
                    />
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Lloji i publikimit
                      <span className="ml-1 text-red-500">*</span>
                    </span>

                    <select
                      name="type"
                      defaultValue="PART"
                      required
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
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
                    placeholder="P.sh. Vajra, Frena, Makina"
                  />

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Përshkrimi
                    </span>

                    <textarea
                      name="description"
                      rows={6}
                      placeholder="Përshkruaj produktin, automjetin ose shërbimin..."
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                    />
                  </label>
                </div>
              </section>

              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  title="Të dhënat e automjetit"
                  description="Plotësoji kur publikimi është makinë ose motor."
                />

                <div className="grid gap-5 p-6 md:grid-cols-2">
                  <Field label="Marka" name="brand" placeholder="P.sh. BMW" />

                  <Field label="Modeli" name="model" placeholder="P.sh. 320d" />

                  <Field
                    label="Viti i prodhimit"
                    name="productionYear"
                    type="number"
                    placeholder="2018"
                    min="1900"
                    max="2100"
                  />

                  <Field
                    label="Kilometrat"
                    name="mileage"
                    type="number"
                    placeholder="145000"
                    min="0"
                  />

                  <Field
                    label="Karburanti"
                    name="fuelType"
                    placeholder="P.sh. Naftë"
                  />

                  <Field
                    label="Transmisioni"
                    name="transmission"
                    placeholder="P.sh. Automatik"
                  />

                  <Field
                    label="Motori"
                    name="engine"
                    placeholder="P.sh. 2.0 TDI"
                  />

                  <Field
                    label="Ngjyra"
                    name="color"
                    placeholder="P.sh. E zezë"
                  />

                  <MarketplaceImageUpload />

                  <div className="md:col-span-2">
                    <Field
                      label="VIN"
                      name="vin"
                      placeholder="Numri i shasisë"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  title="Çmimi dhe stoku"
                  description="Përcakto çmimin dhe disponueshmërinë."
                />

                <div className="space-y-5 p-6">
                  <Field
                    label={`Çmimi (${business?.currency || "ALL"})`}
                    name="price"
                    type="number"
                    placeholder="0"
                    required
                    min="0"
                    step="0.01"
                  />

                  <Field
                    label="Sasia në stok"
                    name="stock"
                    type="number"
                    placeholder="P.sh. 10"
                    min="0"
                  />

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Gjendja
                    </span>

                    <select
                      name="condition"
                      defaultValue=""
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
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
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />

                    <span>
                      <span className="block text-sm font-semibold text-slate-800">
                        Çmimi i negociueshëm
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Vizitorët do të shohin se çmimi mund të negociohet.
                      </span>
                    </span>
                  </label>
                </div>
              </section>

              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  title="Vendndodhja"
                  description="Ku ndodhet produkti ose automjeti?"
                />

                <div className="space-y-5 p-6">
                  <Field
                    label="Qyteti"
                    name="city"
                    placeholder="P.sh. Fier"
                    defaultValue={business?.city}
                  />

                  <Field
                    label="Adresa"
                    name="address"
                    placeholder="Adresa e plotë"
                    defaultValue={business?.address}
                  />
                </div>
              </section>

              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  title="Kontakti"
                  description="Të dhënat që do të përdorin personat e interesuar."
                />

                <div className="space-y-5 p-6">
                  <Field
                    label="Telefoni"
                    name="phone"
                    type="tel"
                    placeholder="+355..."
                    defaultValue={business?.phone}
                  />

                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="email@biznesi.al"
                    defaultValue={business?.email}
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
