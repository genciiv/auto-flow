import MarketplaceCard from "@/components/public-marketplace/MarketplaceCard";

export default function MarketplaceGrid({ listings }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => (
        <MarketplaceCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
