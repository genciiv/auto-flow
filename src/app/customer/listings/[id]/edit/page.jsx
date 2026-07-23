import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import CustomerMarketplaceImageManager from "@/components/customer/CustomerMarketplaceImageManager";
import { updateCustomerMarketplaceListing } from "@/app/customer/listings/actions";
import { requireCustomerContext } from "@/lib/customer-context";
import { db } from "@/lib/db";
const TYPES = [
    ["VEHICLE", "Makinë"],
    ["MOTORCYCLE", "Motor"],
    ["PART", "Pjesë"],
    ["ACCESSORY", "Aksesor"],
    ["SERVICE", "Shërbim"],
    ["OTHER", "Tjetër"],
  ],
  STATUSES = [
    ["DRAFT", "Draft"],
    ["PUBLISHED", "Publikuar"],
    ["SOLD", "Shitur"],
    ["ARCHIVED", "Arkivuar"],
  ];
function F({ label, name, type = "text", value, min, max }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={value ?? ""}
        min={min}
        max={max}
        className="h-12 w-full rounded-2xl border px-4"
      />
    </label>
  );
}
export default async function EditPage({ params }) {
  const { profileId } = await requireCustomerContext();
  const p = await db.customerProfile.findUnique({
    where: { id: profileId },
    select: { userId: true },
  });
  const { id } = await params;
  const x = p?.userId
    ? await db.marketplaceListing.findFirst({
        where: { id, sellerType: "USER", sellerUserId: p.userId },
        include: { images: { orderBy: { position: "asc" } } },
      })
    : null;
  if (!x) notFound();
  return (
    <form action={updateCustomerMarketplaceListing} className="space-y-7">
      <input type="hidden" name="listingId" value={x.id} />
      <div className="flex items-end justify-between">
        <div>
          <Link
            href="/customer/listings"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"
          >
            <ArrowLeft size={17} />
            Kthehu
          </Link>
          <h1 className="mt-5 text-3xl font-bold">Ndrysho publikimin</h1>
        </div>
        <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 font-bold text-white">
          <Save size={17} />
          Ruaj
        </button>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <section className="grid gap-5 rounded-3xl border bg-white p-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <F label="Titulli" name="title" value={x.title} />
          </div>
          <label>
            <span className="mb-2 block text-sm font-semibold">Lloji</span>
            <select
              name="type"
              defaultValue={x.type}
              className="h-12 w-full rounded-2xl border px-4"
            >
              {TYPES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">Statusi</span>
            <select
              name="status"
              defaultValue={x.status}
              className="h-12 w-full rounded-2xl border px-4"
            >
              {STATUSES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold">Përshkrimi</span>
            <textarea
              name="description"
              rows={6}
              defaultValue={x.description || ""}
              className="w-full rounded-2xl border px-4 py-3"
            />
          </label>
          {[
            ["Kategoria", "category"],
            ["Marka", "brand"],
            ["Modeli", "model"],
            ["Karburanti", "fuelType"],
            ["Transmisioni", "transmission"],
            ["Motori", "engine"],
            ["Ngjyra", "color"],
            ["VIN", "vin"],
            ["Qyteti", "city"],
            ["Adresa", "address"],
            ["Telefoni", "phone"],
            ["Email", "email"],
          ].map(([l, n]) => (
            <F key={n} label={l} name={n} value={x[n]} />
          ))}
          <F label="Çmimi" name="price" type="number" value={x.price} />
          <F
            label="Viti"
            name="productionYear"
            type="number"
            value={x.productionYear}
          />
          <F
            label="Kilometrat"
            name="mileage"
            type="number"
            value={x.mileage}
          />
          <F label="Sasia" name="stock" type="number" value={x.stock} />
          <label>
            <span className="mb-2 block text-sm font-semibold">Gjendja</span>
            <select
              name="condition"
              defaultValue={x.condition || ""}
              className="h-12 w-full rounded-2xl border px-4"
            >
              <option value="">E paspecifikuar</option>
              <option value="NEW">E re</option>
              <option value="USED">E përdorur</option>
              <option value="REFURBISHED">E rikondicionuar</option>
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
            <input
              type="checkbox"
              name="isNegotiable"
              defaultChecked={x.isNegotiable}
            />
            Çmimi i negociueshëm
          </label>
        </section>
        <CustomerMarketplaceImageManager existingImages={x.images} />
      </div>
    </form>
  );
}
