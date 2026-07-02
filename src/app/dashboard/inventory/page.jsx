import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InventoryStats from "@/components/inventory/InventoryStats";
import InventoryFilters from "@/components/inventory/InventoryFilters";
import InventoryTable from "@/components/inventory/InventoryTable";

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Inventory</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Magazina
            </h1>
            <p className="mt-2 text-slate-500">
              Menaxho pjesët, stokun, çmimet, furnitorët dhe sinjalizimet.
            </p>
          </div>

          <button className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
            Shto pjesë
          </button>
        </div>

        <InventoryStats />
        <InventoryFilters />
        <InventoryTable />
      </div>
    </DashboardLayout>
  );
}
