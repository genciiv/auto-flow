import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VehicleStats from "@/components/vehicles/VehicleStats";
import VehicleFilters from "@/components/vehicles/VehicleFilters";
import VehiclesTable from "@/components/vehicles/VehiclesTable";

export default function VehiclesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Vehicles</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Automjetet
            </h1>
            <p className="mt-2 text-slate-500">
              Menaxho automjetet, historikun e serviseve dhe klientët e lidhur.
            </p>
          </div>

          <button className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
            Shto automjet
          </button>
        </div>

        <VehicleStats />
        <VehicleFilters />
        <VehiclesTable />
      </div>
    </DashboardLayout>
  );
}
