import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ServiceStats from "@/components/services/ServiceStats";
import ServiceFilters from "@/components/services/ServiceFilters";
import ServicesTable from "@/components/services/ServicesTable";
import { db } from "@/lib/db";

export default async function ServicesPage() {
  const services = await db.serviceRecord.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vehicle: true,
      business: true,
    },
  });

  const activeServices = services.filter(
    (service) => service.status === "IN_PROGRESS",
  ).length;

  const pendingServices = services.filter(
    (service) => service.status === "PENDING",
  ).length;

  const completedServices = services.filter(
    (service) => service.status === "COMPLETED",
  ).length;

  const totalRevenue = services.reduce(
    (sum, service) => sum + Number(service.total || 0),
    0,
  );

  const stats = {
    activeServices,
    pendingServices,
    completedServices,
    totalRevenue,
  };

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

        <ServiceStats stats={stats} />
        <ServiceFilters />
        <ServicesTable services={services} />
      </div>
    </DashboardLayout>
  );
}
