import CreatePartModal from "@/components/inventory/CreatePartModal";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InventoryStats from "@/components/inventory/InventoryStats";
import InventoryTable from "@/components/inventory/InventoryTable";

import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";

export default async function InventoryPage() {
  const { businessId } = await requireBusinessContext();

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

          <CreatePartModal />
        </div>

        <InventoryStats stats={stats} />

        <InventoryTable parts={parts} />
      </div>
    </DashboardLayout>
  );
}
