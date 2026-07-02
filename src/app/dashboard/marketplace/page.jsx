import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MarketplaceStats from "@/components/marketplace/MarketplaceStats";
import MarketplaceFilters from "@/components/marketplace/MarketplaceFilters";
import MarketplaceGrid from "@/components/marketplace/MarketplaceGrid";

export default function MarketplacePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Marketplace</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Marketplace
            </h1>
            <p className="mt-2 text-slate-500">
              Menaxho pjesë këmbimi, makina, motorë, vegla dhe produkte për
              shitje.
            </p>
          </div>

          <button className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
            Shto produkt
          </button>
        </div>

        <MarketplaceStats />
        <MarketplaceFilters />
        <MarketplaceGrid />
      </div>
    </DashboardLayout>
  );
}
