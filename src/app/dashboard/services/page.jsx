import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CreateServiceModal from "@/components/services/CreateServiceModal";
import ServiceStats from "@/components/services/ServiceStats";
import ServicesTable from "@/components/services/ServicesTable";

import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import {
  addMoney,
  serializeMoney,
  toMoney,
} from "@/lib/money";
import {
  hasPermission,
  PERMISSIONS,
} from "@/lib/permissions";

export default async function ServicesPage() {
  const {
    businessId,
    businessRole,
    userId,
  } = await requireBusinessPermission(
    PERMISSIONS.SERVICES_VIEW,
  );

  const [services, vehicles, parts] =
    await Promise.all([
      db.serviceRecord.findMany({
        where: {
          businessId,
          ...(businessRole === "MECHANIC"
            ? {
                assignedUserId: userId,
              }
            : {}),
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
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
          invoice: {
            select: {
              id: true,
              number: true,
              status: true,
              total: true,
              customerPayments: {
                select: {
                  amount: true,
                },
              },
            },
          },
        },
      }),

      db.vehicle.findMany({
        where: {
          businessId,
          ...(businessRole === "MECHANIC"
            ? {
                services: {
                  some: {
                    businessId,
                    assignedUserId: userId,
                  },
                },
              }
            : {}),
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
    (service) =>
      service.status === "IN_PROGRESS",
  ).length;

  const pendingServices = services.filter(
    (service) => service.status === "PENDING",
  ).length;

  const completedServices = services.filter(
    (service) => service.status === "COMPLETED",
  ).length;

  const totalRevenue = services.reduce(
    (sum, service) =>
      addMoney(sum, service.total),
    toMoney(0),
  );

  const stats = {
    activeServices,
    pendingServices,
    completedServices,
    totalRevenue: serializeMoney(totalRevenue),
  };

  const serializableServices = JSON.parse(
    JSON.stringify(services),
  );

  const serializableVehicles = JSON.parse(
    JSON.stringify(vehicles),
  );

  const serializableParts = JSON.parse(
    JSON.stringify(parts),
  );

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
            <p className="text-sm font-semibold text-blue-600">
              Services
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Shërbimet
            </h1>

            <p className="mt-2 text-slate-500">
              {businessRole === "MECHANIC"
                ? "Shiko vetëm punët që të janë caktuar."
                : "Menaxho riparimet, statuset dhe punët aktive."}
            </p>
          </div>

          {canCreateService ? (
            <CreateServiceModal
              vehicles={serializableVehicles}
            />
          ) : null}
        </div>

        <ServiceStats stats={stats} />

        <ServicesTable
          services={serializableServices}
          vehicles={serializableVehicles}
          parts={serializableParts}
          canUpdateService={canUpdateService}
          canDeleteService={canDeleteService}
          canManageServiceParts={
            canManageServiceParts
          }
        />
      </div>
    </DashboardLayout>
  );
}