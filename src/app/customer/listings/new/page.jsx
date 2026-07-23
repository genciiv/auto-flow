import Link from "next/link";
import { ArrowLeft, Save, Send } from "lucide-react";
import MarketplaceImageUpload from "@/components/marketplace/MarketplaceImageUpload";
import { createCustomerMarketplaceListing } from "@/app/customer/listings/actions";
import { requireCustomerContext } from "@/lib/customer-context";
import { db } from "@/lib/db";
const TYPES = [
  ["VEHICLE", "Makinë"],
  ["MOTORCYCLE", "Motor"],
  ["PART", "Pjesë këmbimi"],
  ["ACCESSORY", "Aksesor"],
  ["SERVICE", "Shërbim"],
  ["OTHER", "Tjetër"],
];
function F({ label, name, type = "text", value, min, max, required = false }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={value || ""}
        min={min}
        max={max}
        required={required}
        className="h-12 w-full rounded-2xl border border-slate-200 px-4"
      />
    </label>
  );
}
export default async function NewCustomerListingPage() {
  const { profileId } = await requireCustomerContext();
  const p = await db.customerProfile.findUnique({
    where: { id: profileId },
    select: {
      city: true,
      address: true,
      phone: true,
      user: { select: { email: true } },
    },
  });
  return (
    <form action={createCustomerMarketplaceListing} className="space-y-7">
      <div className="flex items-end justify-between">
        <div>
          <Link
            href="/customer/listings"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"
          >
            <ArrowLeft size={17} />
            Kthehu
          </Link>
          <h1 className="mt-5 text-3xl font-bold">Publikim i ri</h1>
        </div>
        <div className="flex gap-3">
          <button
            name="status"
            value="DRAFT"
            className="inline-flex h-11 items-center gap-2 rounded-xl border px-5 font-bold"
          >
            <Save size={17} />
            Ruaj draft
          </button>
          <button
            name="status"
            value="PUBLISHED"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 font-bold text-white"
          >
            <Send size={17} />
            Publiko
          </button>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <div className="space-y-6">
          <section className="grid gap-5 rounded-3xl border bg-white p-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <F label="Titulli" name="title" required />
            </div>
            <label>
              <span className="mb-2 block text-sm font-semibold">Lloji</span>
              <select
                name="type"
                className="h-12 w-full rounded-2xl border px-4"
              >
                {TYPES.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <F label="Kategoria" name="category" />
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold">
                Përshkrimi
              </span>
              <textarea
                name="description"
                rows={6}
                className="w-full rounded-2xl border px-4 py-3"
              />
            </label>
          </section>
          <MarketplaceImageUpload />
          <section className="grid gap-5 rounded-3xl border bg-white p-6 md:grid-cols-2">
            {[
              ["Marka", "brand"],
              ["Modeli", "model"],
              ["Karburanti", "fuelType"],
              ["Transmisioni", "transmission"],
              ["Motori", "engine"],
              ["Ngjyra", "color"],
              ["VIN", "vin"],
            ].map(([l, n]) => (
              <F key={n} label={l} name={n} />
            ))}
            <F
              label="Viti"
              name="productionYear"
              type="number"
              min="1900"
              max="2100"
            />
            <F label="Kilometrat" name="mileage" type="number" min="0" />
          </section>
        </div>
        <div className="space-y-6">
          <section className="space-y-5 rounded-3xl border bg-white p-6">
            <F
              label="Çmimi (ALL)"
              name="price"
              type="number"
              min="0"
              required
            />
            <F label="Sasia" name="stock" type="number" min="0" />
            <label>
              <span className="mb-2 block text-sm font-semibold">Gjendja</span>
              <select
                name="condition"
                className="h-12 w-full rounded-2xl border px-4"
              >
                <option value="">E paspecifikuar</option>
                <option value="NEW">E re</option>
                <option value="USED">E përdorur</option>
                <option value="REFURBISHED">E rikondicionuar</option>
              </select>
            </label>
            <label className="flex gap-3 rounded-2xl bg-slate-50 p-4">
              <input type="checkbox" name="isNegotiable" />
              Çmimi i negociueshëm
            </label>
          </section>
          <section className="space-y-5 rounded-3xl border bg-white p-6">
            <F label="Qyteti" name="city" value={p?.city} />
            <F label="Adresa" name="address" value={p?.address} />
            <F label="Telefoni" name="phone" value={p?.phone} />
            <F label="Email" name="email" type="email" value={p?.user?.email} />
          </section>
        </div>
      </div>
    </form>
  );
}
