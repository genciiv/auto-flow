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

  const clientVehicles = JSON.parse(
    JSON.stringify(vehicles),
  );

  const clientCustomers = JSON.parse(
    JSON.stringify(customers),
  );

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
      latestService.status === "DELIVERED" ||
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
      <div className="af-page-stack">
        <div className="af-page-header">
          <div>
            <p className="af-page-eyebrow">Automjetet</p>

            <h1 className="af-page-title">
              Automjetet
            </h1>

            <p className="af-page-description">
              Menaxho automjetet, pronarët dhe historikun e shërbimeve.
            </p>
          </div>

          {canCreateVehicle ? (
            <CreateVehicleModal customers={clientCustomers} />
          ) : null}
        </div>

        <VehicleStats stats={stats} />

        <VehiclesTable
          vehicles={clientVehicles}
          customers={clientCustomers}
          canUpdateVehicle={canUpdateVehicle}
          canDeleteVehicle={canDeleteVehicle}
        />
      </div>
    </DashboardLayout>
  );
}
