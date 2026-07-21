import CreatePartModal from "@/components/inventory/CreatePartModal";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InventoryStats from "@/components/inventory/InventoryStats";
import InventoryTable from "@/components/inventory/InventoryTable";

import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export default async function InventoryPage() {
  const { businessId, businessRole } = await requireBusinessPermission(
    PERMISSIONS.INVENTORY_VIEW,
  );

  const parts = await db.part.findMany({
    where: {
      businessId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalParts = parts.length;

  const lowStock = parts.filter((part) => {
    return Number(part.stock || 0) <= Number(part.minStock || 0);
  }).length;

  const totalStock = parts.reduce((sum, part) => {
    return sum + Number(part.stock || 0);
  }, 0);

  const inventoryValue = parts.reduce((sum, part) => {
    return sum + Number(part.stock || 0) * Number(part.buyPrice || 0);
  }, 0);

  const stats = {
    totalParts,
    lowStock,
    totalStock,
    inventoryValue,
  };

  const canCreatePart = hasPermission(
    businessRole,
    PERMISSIONS.INVENTORY_CREATE,
  );

  const canUpdatePart = hasPermission(
    businessRole,
    PERMISSIONS.INVENTORY_UPDATE,
  );

  const canDeletePart = hasPermission(
    businessRole,
    PERMISSIONS.INVENTORY_DELETE,
  );

  const canManageStock = hasPermission(
    businessRole,
    PERMISSIONS.INVENTORY_MANAGE_STOCK,
  );

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
              Menaxho pjesët, stokun, furnitorët dhe vlerën e inventarit.
            </p>
          </div>

          {canCreatePart ? (
            <CreatePartModal canManageStock={canManageStock} />
          ) : null}
        </div>

        <InventoryStats stats={stats} />

        <InventoryTable
          parts={parts}
          canUpdatePart={canUpdatePart}
          canDeletePart={canDeletePart}
          canManageStock={canManageStock}
        />
      </div>
    </DashboardLayout>
  );
}
