import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";

import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import MarketplaceGallery from "@/components/public-marketplace/details/MarketplaceGallery";
import MarketplaceInfo from "@/components/public-marketplace/details/MarketplaceInfo";
import MarketplaceDescription from "@/components/public-marketplace/details/MarketplaceDescription";
import MarketplaceSpecs from "@/components/public-marketplace/details/MarketplaceSpecs";
import MarketplaceBusinessCard from "@/components/public-marketplace/details/MarketplaceBusinessCard";
import RelatedListings from "@/components/public-marketplace/details/RelatedListings";

import { getPublicMarketplaceListingBySlug } from "@/services/public-marketplace-service";

export const dynamic = "force-dynamic";

function getTypeLabel(type) {
  const labels = {
    VEHICLE: "Makina",
    MOTORCYCLE: "Motorë",
    PART: "Pjesë këmbimi",
    ACCESSORY: "Aksesorë",
    SERVICE: "Shërbime",
    OTHER: "Të tjera",
  };

  return labels[type] || "Marketplace";
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;

  const result = await getPublicMarketplaceListingBySlug(resolvedParams.slug);

  if (!result) {
    return {
      title: "Publikimi nuk u gjet | AutoFlow",
      description: "Publikimi që po kërkon nuk është i disponueshëm.",
    };
  }

  const { listing } = result;
  const coverImage = listing.images?.[0]?.url;

  const description =
    listing.description?.slice(0, 155) ||
    `${listing.title} në Marketplace AutoFlow. Shiko detajet dhe kontakto shitësin.`;

  return {
    title: `${listing.title} | Marketplace AutoFlow`,
    description,
    openGraph: {
      title: listing.title,
      description,
      type: "website",
      images: coverImage
        ? [
            {
              url: coverImage,
              alt: listing.title,
            },
          ]
        : [],
    },
  };
}

export default async function MarketplaceListingPage({ params }) {
  const resolvedParams = await params;

  const result = await getPublicMarketplaceListingBySlug(resolvedParams.slug);

  if (!result) {
    notFound();
  }

  const { listing, relatedListings } = result;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6 lg:px-8">
          <nav className="flex min-w-0 items-center gap-2 overflow-hidden text-sm">
            <Link
              href="/"
              aria-label="Faqja kryesore"
              className="shrink-0 text-slate-400 transition hover:text-blue-600"
            >
              <Home size={16} />
            </Link>

            <ChevronRight size={15} className="shrink-0 text-slate-300" />

            <Link
              href="/marketplace"
              className="shrink-0 font-medium text-slate-500 transition hover:text-blue-600"
            >
              Marketplace
            </Link>

            <ChevronRight size={15} className="shrink-0 text-slate-300" />

            <Link
              href={`/marketplace?type=${listing.type}`}
              className="hidden shrink-0 font-medium text-slate-500 transition hover:text-blue-600 sm:block"
            >
              {getTypeLabel(listing.type)}
            </Link>

            <ChevronRight
              size={15}
              className="hidden shrink-0 text-slate-300 sm:block"
            />

            <span className="truncate font-semibold text-slate-950">
              {listing.title}
            </span>
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Link
          href="/marketplace"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-blue-600"
        >
          <ChevronLeft size={17} />
          Kthehu te Marketplace
        </Link>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <div className="min-w-0">
            <MarketplaceGallery images={listing.images} title={listing.title} />

            <div className="mt-8 space-y-6">
              <MarketplaceDescription description={listing.description} />

              <MarketplaceSpecs listing={listing} />

              <MarketplaceBusinessCard listing={listing} />
            </div>
          </div>

          <MarketplaceInfo listing={listing} />
        </div>

        <RelatedListings listings={relatedListings} />
      </section>

      <Footer />
    </main>
  );
}
