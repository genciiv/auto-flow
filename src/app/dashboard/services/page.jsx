import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ServiceStats from "@/components/services/ServiceStats";
import ServiceFilters from "@/components/services/ServiceFilters";
import ServicesTable from "@/components/services/ServicesTable";
import CreateServiceModal from "@/components/services/CreateServiceModal";
import { db } from "@/lib/db";

export default async function ServicesPage() {
  const [services, vehicles, parts] = await Promise.all([
    db.serviceRecord.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: true,
        business: true,
        partsUsed: {
          include: {
            part: true,
          },
        },
      },
    }),

    db.vehicle.findMany({
      orderBy: { plate: "asc" },
    }),

    db.part.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

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

          <CreateServiceModal vehicles={vehicles} />
        </div>

        <ServiceStats stats={stats} />
        <ServiceFilters />
        <ServicesTable services={services} parts={parts} />
      </div>
    </DashboardLayout>
  );
}
