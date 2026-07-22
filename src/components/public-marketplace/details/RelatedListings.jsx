import Link from "next/link";
import { ArrowRight } from "lucide-react";

import MarketplaceGrid from "@/components/public-marketplace/MarketplaceGrid";

export default function RelatedListings({ listings }) {
  if (!listings || listings.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Mund të të interesojnë
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Publikime të ngjashme
          </h2>
        </div>

        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
        >
          Shiko të gjitha
          <ArrowRight size={17} />
        </Link>
      </div>

      <MarketplaceGrid listings={listings} />
    </section>
  );
}
