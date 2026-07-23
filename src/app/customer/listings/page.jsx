import Link from "next/link";
import {
  Eye,
  Heart,
  ImageIcon,
  MessageSquareText,
  Package,
  Plus,
  ShoppingBag,
} from "lucide-react";
import CustomerListingActions from "@/components/customer/CustomerListingActions";
import { requireCustomerContext } from "@/lib/customer-context";
import { db } from "@/lib/db";
import {
  changeCustomerListingStatus,
  deleteCustomerMarketplaceListing,
} from "@/app/customer/listings/actions";
export const metadata = { title: "Publikimet e mia | AutoFlow" };
const money = (v) =>
  `${new Intl.NumberFormat("sq-AL", { maximumFractionDigits: 0 }).format(Number(v || 0))} Lek`;
const status = (s) =>
  ({
    DRAFT: ["Draft", "bg-amber-50 text-amber-700"],
    PUBLISHED: ["Publikuar", "bg-blue-50 text-blue-700"],
    SOLD: ["Shitur", "bg-emerald-50 text-emerald-700"],
    ARCHIVED: ["Arkivuar", "bg-slate-100 text-slate-600"],
  })[s] || ["Draft", "bg-amber-50 text-amber-700"];
export default async function CustomerListingsPage() {
  const { profileId } = await requireCustomerContext();
  const p = await db.customerProfile.findUnique({
    where: { id: profileId },
    select: { userId: true },
  });
  const listings = p?.userId
    ? await db.marketplaceListing.findMany({
        where: { sellerType: "USER", sellerUserId: p.userId },
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          _count: { select: { favorites: true, inquiries: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const stats = {
    total: listings.length,
    published: listings.filter((x) => x.status === "PUBLISHED").length,
    sold: listings.filter((x) => x.status === "SOLD").length,
    inquiries: listings.reduce((s, x) => s + x._count.inquiries, 0),
  };
  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] bg-slate-950 px-8 py-9 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-300">
              Marketplace privat
            </p>
            <h1 className="mt-4 text-4xl font-bold">Publikimet e mia</h1>
            <p className="mt-3 text-slate-300">
              Krijo dhe menaxho makina, motorë, pjesë ose aksesorë.
            </p>
          </div>
          <Link
            href="/customer/listings/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-950"
          >
            <Plus size={17} />
            Publikim i ri
          </Link>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Gjithsej", stats.total, Package],
          ["Publikuar", stats.published, Eye],
          ["Shitur", stats.sold, ShoppingBag],
          ["Kërkesa", stats.inquiries, MessageSquareText],
        ].map(([l, v, I]) => (
          <div key={l} className="rounded-3xl border bg-white p-5">
            <I className="text-blue-600" />
            <p className="mt-4 text-xs font-bold uppercase text-slate-400">
              {l}
            </p>
            <p className="text-3xl font-black">{v}</p>
          </div>
        ))}
      </section>
      {listings.length === 0 ? (
        <section className="rounded-3xl border border-dashed bg-white py-16 text-center">
          <Package className="mx-auto text-slate-300" />
          <h2 className="mt-4 font-bold">Nuk ke krijuar ende publikime</h2>
          <Link
            href="/customer/listings/new"
            className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
          >
            Krijo publikimin e parë
          </Link>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((x) => {
            const [label, cls] = status(x.status),
              img = x.images[0]?.url;
            return (
              <article
                key={x.id}
                className="overflow-hidden rounded-3xl border bg-white"
              >
                <div className="relative aspect-[16/10] bg-slate-100">
                  {img ? (
                    <img
                      src={img}
                      alt={x.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="text-slate-300" />
                    </div>
                  )}
                  <div className="absolute right-3 top-3">
                    <CustomerListingActions
                      listing={x}
                      changeStatusAction={changeCustomerListingStatus}
                      deleteAction={deleteCustomerMarketplaceListing}
                    />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between gap-3">
                    <h2 className="font-bold">{x.title}</h2>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}
                    >
                      {label}
                    </span>
                  </div>
                  <p className="mt-3 text-xl font-black">{money(x.price)}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <Heart size={14} />
                      <b>{x._count.favorites}</b>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <MessageSquareText size={14} />
                      <b>{x._count.inquiries}</b>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
