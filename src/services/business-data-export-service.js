import { db } from "@/lib/db";

function serializeValue(value) {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "bigint") return value.toString();
  if (typeof value?.toJSON === "function") return serializeValue(value.toJSON());
  if (Array.isArray(value)) return value.map(serializeValue);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, serializeValue(item)]),
    );
  }
  return value;
}

export async function buildBusinessDataExport(
  businessId,
  { database = db, generatedAt = new Date() } = {},
) {
  if (!businessId) throw new Error("Business ID mungon për eksportin.");

  const business = await database.business.findUnique({
    where: { id: businessId },
  });
  if (!business) throw new Error("Biznesi nuk u gjet.");

  const [
    users,
    customers,
    vehicles,
    services,
    appointments,
    parts,
    invoices,
    customerPayments,
    purchases,
    inventoryMovements,
    expenses,
    inventoryCounts,
    subscriptions,
    planRequests,
    conversations,
    notifications,
    auditLogs,
  ] = await Promise.all([
    database.businessUser.findMany({ where: { businessId }, include: { user: { select: { id: true, name: true, email: true, globalRole: true, createdAt: true } } } }),
    database.customer.findMany({ where: { businessId } }),
    database.vehicle.findMany({ where: { businessId } }),
    database.serviceRecord.findMany({ where: { businessId }, include: { laborItems: true, partsUsed: true, statusHistory: true } }),
    database.appointment.findMany({ where: { businessId } }),
    database.part.findMany({ where: { businessId } }),
    database.invoice.findMany({ where: { businessId }, include: { items: true } }),
    database.customerPayment.findMany({ where: { businessId } }),
    database.purchaseOrder.findMany({ where: { businessId }, include: { items: true } }),
    database.inventoryMovement.findMany({ where: { businessId } }),
    database.businessExpense.findMany({ where: { businessId } }),
    database.inventoryCount.findMany({ where: { businessId }, include: { items: true } }),
    database.subscription.findMany({ where: { businessId }, include: { plan: true } }),
    database.subscriptionPlanRequest.findMany({ where: { businessId } }),
    database.conversation.findMany({ where: { businessId }, include: { messages: true } }),
    database.notification.findMany({ where: { businessId } }),
    database.auditLog.findMany({ where: { businessId }, orderBy: { createdAt: "asc" } }),
  ]);

  return serializeValue({
    metadata: {
      format: "autoflow-business-export",
      version: 1,
      generatedAt,
      businessId,
    },
    business,
    users,
    customers,
    vehicles,
    services,
    appointments,
    parts,
    invoices,
    customerPayments,
    purchases,
    inventoryMovements,
    expenses,
    inventoryCounts,
    subscriptions,
    planRequests,
    conversations,
    notifications,
    auditLogs,
  });
}
