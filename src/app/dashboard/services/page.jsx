import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ServiceStats from "@/components/services/ServiceStats";
import ServiceFilters from "@/components/services/ServiceFilters";
import ServicesTable from "@/components/services/ServicesTable";

export default function ServicesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Services</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Shërbimet
            </h1>
            <p className="mt-2 text-slate-500">
              Menaxho riparimet, statuset, mekanikët dhe punët aktive.
            </p>
          </div>

          <button className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
            Krijo shërbim
          </button>
        </div>

        <ServiceStats />
        <ServiceFilters />
        <ServicesTable />
      </div>
    </DashboardLayout>
  );
}
