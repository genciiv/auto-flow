import { addMoney, toMoney } from "@/lib/money";

export function calculateServiceLinesTotal({
  laborItems = [],
  partsUsed = [],
}) {
  const laborTotal = laborItems.reduce(
    (sum, item) => addMoney(sum, item.total),
    toMoney(0),
  );

  return partsUsed.reduce(
    (sum, usage) => addMoney(sum, usage.total),
    laborTotal,
  );
}

export async function recalculateServiceTotal(transaction, serviceId) {
  const [labor, parts] = await Promise.all([
    transaction.serviceLaborItem.aggregate({
      where: { serviceId },
      _sum: { total: true },
    }),
    transaction.servicePartUsage.aggregate({
      where: { serviceId },
      _sum: { total: true },
    }),
  ]);

  const total = addMoney(labor._sum.total ?? 0, parts._sum.total ?? 0);

  await transaction.serviceRecord.update({
    where: { id: serviceId },
    data: { total },
  });

  return total;
}
