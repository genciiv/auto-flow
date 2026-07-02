import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PurchaseStats from "@/components/purchases/PurchaseStats";
import PurchaseFilters from "@/components/purchases/PurchaseFilters";
import PurchasesTable from "@/components/purchases/PurchasesTable";

export default function PurchasesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Purchases</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Porositë
            </h1>
            <p className="mt-2 text-slate-500">
              Menaxho blerjet, furnitorët, porositë e pjesëve dhe statuset.
            </p>
          </div>

          <button className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
            Krijo porosi
          </button>
        </div>

        <PurchaseStats />
        <PurchaseFilters />
        <PurchasesTable />
      </div>
    </DashboardLayout>
  );
}
