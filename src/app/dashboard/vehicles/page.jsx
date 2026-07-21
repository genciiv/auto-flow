import CreateVehicleModal from "@/components/vehicles/CreateVehicleModal";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VehicleStats from "@/components/vehicles/VehicleStats";
import VehiclesTable from "@/components/vehicles/VehiclesTable";

import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export default async function VehiclesPage() {
  const { businessId, businessRole } = await requireBusinessPermission(
    PERMISSIONS.VEHICLES_VIEW,
  );

  const [vehicles, customers] = await Promise.all([
    db.vehicle.findMany({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        customer: true,
        services: {
          where: {
            businessId,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    }),

    db.customer.findMany({
      where: {
        businessId,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const totalVehicles = vehicles.length;

  const vehiclesInService = vehicles.filter((vehicle) => {
    return vehicle.services.some((service) => service.status === "IN_PROGRESS");
  }).length;

  const pendingVehicles = vehicles.filter((vehicle) => {
    return vehicle.services.some((service) => service.status === "PENDING");
  }).length;

  const activeVehicles = vehicles.filter((vehicle) => {
    const latestService = vehicle.services[0];

    return (
      !latestService ||
      latestService.status === "COMPLETED" ||
      latestService.status === "CANCELLED"
    );
  }).length;

  const stats = {
    totalVehicles,
    activeVehicles,
    vehiclesInService,
    pendingVehicles,
  };

  const canCreateVehicle = hasPermission(
    businessRole,
    PERMISSIONS.VEHICLES_CREATE,
  );

  const canUpdateVehicle = hasPermission(
    businessRole,
    PERMISSIONS.VEHICLES_UPDATE,
  );

  const canDeleteVehicle = hasPermission(
    businessRole,
    PERMISSIONS.VEHICLES_DELETE,
  );

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
              Menaxho automjetet, pronarët dhe historikun e shërbimeve.
            </p>
          </div>

          {canCreateVehicle ? (
            <CreateVehicleModal customers={customers} />
          ) : null}
        </div>

        <VehicleStats stats={stats} />

        <VehiclesTable
          vehicles={vehicles}
          customers={customers}
          canUpdateVehicle={canUpdateVehicle}
          canDeleteVehicle={canDeleteVehicle}
        />
      </div>
    </DashboardLayout>
  );
}
