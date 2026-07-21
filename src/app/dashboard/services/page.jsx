import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CreateServiceModal from "@/components/services/CreateServiceModal";
import ServiceStats from "@/components/services/ServiceStats";
import ServicesTable from "@/components/services/ServicesTable";

import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export default async function ServicesPage() {
  const { businessId, businessRole } = await requireBusinessPermission(
    PERMISSIONS.SERVICES_VIEW,
  );

  const [services, vehicles, parts] = await Promise.all([
    db.serviceRecord.findMany({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        vehicle: {
          include: {
            customer: true,
          },
        },
        business: true,
        partsUsed: {
          where: {
            part: {
              businessId,
            },
          },
          include: {
            part: true,
          },
        },
      },
    }),

    db.vehicle.findMany({
      where: {
        businessId,
      },
      orderBy: {
        plate: "asc",
      },
    }),

    db.part.findMany({
      where: {
        businessId,
      },
      orderBy: {
        name: "asc",
      },
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

  const totalRevenue = services.reduce((sum, service) => {
    return sum + Number(service.total ?? 0);
  }, 0);

  const stats = {
    activeServices,
    pendingServices,
    completedServices,
    totalRevenue,
  };

  const canCreateService = hasPermission(
    businessRole,
    PERMISSIONS.SERVICES_CREATE,
  );

  const canUpdateService = hasPermission(
    businessRole,
    PERMISSIONS.SERVICES_UPDATE,
  );

  const canDeleteService = hasPermission(
    businessRole,
    PERMISSIONS.SERVICES_DELETE,
  );

  const canManageServiceParts = hasPermission(
    businessRole,
    PERMISSIONS.SERVICES_MANAGE_PARTS,
  );

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
              Menaxho riparimet, statuset dhe punët aktive.
            </p>
          </div>

          {canCreateService ? <CreateServiceModal vehicles={vehicles} /> : null}
        </div>

        <ServiceStats stats={stats} />

        <ServicesTable
          services={services}
          vehicles={vehicles}
          parts={parts}
          canUpdateService={canUpdateService}
          canDeleteService={canDeleteService}
          canManageServiceParts={canManageServiceParts}
        />
      </div>
    </DashboardLayout>
  );
}
