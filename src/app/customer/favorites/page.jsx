import Link from "next/link";

import { Heart, ShoppingCart } from "lucide-react";

import MarketplaceGrid from "@/components/public-marketplace/MarketplaceGrid";
import { requireCustomerContext } from "@/lib/customer-context";
import { db } from "@/lib/db";

export const metadata = {
  title: "Favoritet | AutoFlow",
};

export default async function CustomerFavoritesPage() {
  const { profileId } = await requireCustomerContext();

  const profile = await db.customerProfile.findUnique({
    where: {
      id: profileId,
    },
    select: {
      userId: true,
    },
  });

  const favorites = profile?.userId
    ? await db.marketplaceFavorite.findMany({
        where: {
          userId: profile.userId,
          listing: {
            status: "PUBLISHED",
          },
        },
        include: {
          listing: {
            include: {
              images: {
                orderBy: {
                  position: "asc",
                },
                take: 1,
              },
              business: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  currency: true,
                },
              },
              sellerUser: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  const listings = favorites.map((favorite) => ({
    ...favorite.listing,
    isFavorite: true,
  }));

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
        <div className="relative">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-red-500/15 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                <Heart size={14} />
                Marketplace
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Favoritet
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Publikimet që ke ruajtur për t&apos;i parë ose kontaktuar më
                vonë.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <p className="text-xs font-semibold text-slate-400">
                Të ruajtura
              </p>

              <p className="mt-1 text-2xl font-black text-white">
                {listings.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {listings.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Heart size={29} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-950">
            Nuk ke ruajtur ende publikime
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Kliko zemrën te një makinë, pjesë, aksesor ose shërbim në
            Marketplace.
          </p>

          <Link
            href="/marketplace"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-blue-600"
          >
            <ShoppingCart size={17} />
            Eksploro Marketplace
          </Link>
        </section>
      ) : (
        <MarketplaceGrid listings={listings} />
      )}
    </div>
  );
}
