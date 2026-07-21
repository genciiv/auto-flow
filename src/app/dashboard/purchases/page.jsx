import CreatePurchaseModal from "@/components/purchases/CreatePurchaseModal";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PurchaseStats from "@/components/purchases/PurchaseStats";
import PurchasesTable from "@/components/purchases/PurchasesTable";

import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export default async function PurchasesPage() {
  const { businessId, businessRole } = await requireBusinessPermission(
    PERMISSIONS.PURCHASES_VIEW,
  );

  const purchases = await db.purchaseOrder.findMany({
    where: {
      businessId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: true,
      business: true,
    },
  });

  const totalOrders = purchases.length;

  const pendingOrders = purchases.filter(
    (purchase) => purchase.status === "PENDING",
  ).length;

  const orderedOrders = purchases.filter(
    (purchase) => purchase.status === "ORDERED",
  ).length;

  const receivedOrders = purchases.filter(
    (purchase) => purchase.status === "RECEIVED",
  ).length;

  const totalValue = purchases.reduce((sum, purchase) => {
    return sum + Number(purchase.total ?? 0);
  }, 0);

  const stats = {
    totalOrders,
    pendingOrders,
    orderedOrders,
    receivedOrders,
    totalValue,
  };

  const canCreatePurchase = hasPermission(
    businessRole,
    PERMISSIONS.PURCHASES_CREATE,
  );

  const canUpdatePurchase = hasPermission(
    businessRole,
    PERMISSIONS.PURCHASES_UPDATE,
  );

  const canDeletePurchase = hasPermission(
    businessRole,
    PERMISSIONS.PURCHASES_DELETE,
  );

  const canReceivePurchase =
    hasPermission(businessRole, PERMISSIONS.PURCHASES_RECEIVE) &&
    hasPermission(businessRole, PERMISSIONS.INVENTORY_MANAGE_STOCK);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Purchases</p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Porositë
            </h1>

            <p className="mt-2 text-slate-500">
              Menaxho blerjet, furnitorët, porositë e pjesëve dhe statuset.
            </p>
          </div>

          {canCreatePurchase ? <CreatePurchaseModal /> : null}
        </div>

        <PurchaseStats stats={stats} />

        <PurchasesTable
          purchases={purchases}
          canUpdatePurchase={canUpdatePurchase}
          canDeletePurchase={canDeletePurchase}
          canReceivePurchase={canReceivePurchase}
        />
      </div>
    </DashboardLayout>
  );
}
