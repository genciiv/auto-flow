import { ArrowDownAZ, Grid2X2 } from "lucide-react";

import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import MarketplaceEmpty from "@/components/public-marketplace/MarketplaceEmpty";
import MarketplaceGrid from "@/components/public-marketplace/MarketplaceGrid";
import MarketplaceHero from "@/components/public-marketplace/MarketplaceHero";
import MarketplacePagination from "@/components/public-marketplace/MarketplacePagination";

import { getPublicMarketplaceListings } from "@/services/public-marketplace-service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marketplace AutoFlow | Makina, pjesë dhe shërbime",
  description:
    "Shfleto makina, motorë, pjesë këmbimi, aksesorë dhe shërbime automobilistike nga bizneset e AutoFlow.",
};

const sortOptions = [
  {
    value: "NEWEST",
    label: "Më të rejat",
  },
  {
    value: "OLDEST",
    label: "Më të vjetrat",
  },
  {
    value: "PRICE_HIGH",
    label: "Çmimi: më i larti",
  },
  {
    value: "PRICE_LOW",
    label: "Çmimi: më i ulti",
  },
];

function createSortHref({ sort, search, type, city }) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (type) {
    params.set("type", type);
  }

  if (city) {
    params.set("city", city);
  }

  if (sort && sort !== "NEWEST") {
    params.set("sort", sort);
  }

  const query = params.toString();

  return query ? `/marketplace?${query}` : "/marketplace";
}

export default async function PublicMarketplacePage({ searchParams }) {
  const params = await searchParams;

  const search = typeof params?.search === "string" ? params.search : "";

  const type = typeof params?.type === "string" ? params.type : "";

  const city = typeof params?.city === "string" ? params.city : "";

  const sort = typeof params?.sort === "string" ? params.sort : "NEWEST";

  const page = typeof params?.page === "string" ? params.page : "1";

  const { listings, pagination, filters } = await getPublicMarketplaceListings({
    search,
    type,
    city,
    sort,
    page,
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <MarketplaceHero
        search={filters.search}
        type={filters.type}
        city={filters.city}
        sort={filters.sort}
      />

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Grid2X2 size={18} className="text-blue-600" />

              <h2 className="text-lg font-bold text-slate-950">Publikimet</h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              U gjetën{" "}
              <span className="font-bold text-slate-950">
                {pagination.totalCount}
              </span>{" "}
              publikime.
            </p>
          </div>

          <form
            action="/marketplace"
            method="GET"
            className="flex items-center gap-3"
          >
            {filters.search ? (
              <input type="hidden" name="search" value={filters.search} />
            ) : null}

            {filters.type ? (
              <input type="hidden" name="type" value={filters.type} />
            ) : null}

            {filters.city ? (
              <input type="hidden" name="city" value={filters.city} />
            ) : null}

            <div className="relative">
              <ArrowDownAZ
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                name="sort"
                defaultValue={filters.sort}
                aria-label="Rendit publikimet"
                className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-blue-600"
            >
              Rendit
            </button>
          </form>
        </div>

        {listings.length > 0 ? (
          <>
            <MarketplaceGrid listings={listings} />

            <MarketplacePagination pagination={pagination} filters={filters} />
          </>
        ) : (
          <MarketplaceEmpty />
        )}
      </section>

      <Footer />
    </main>
  );
}
