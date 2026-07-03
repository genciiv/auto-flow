"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function addPurchaseItem(formData) {
  const purchaseOrderId = formData.get("purchaseOrderId");
  const name = formData.get("name");
  const quantity = Number(formData.get("quantity") || 1);
  const unitPrice = Number(formData.get("unitPrice") || 0);

  if (!purchaseOrderId || !name) {
    throw new Error("Porosia dhe emri i artikullit janë të detyrueshme");
  }

  await db.purchaseOrderItem.create({
    data: {
      purchaseOrderId,
      name,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    },
  });

  const items = await db.purchaseOrderItem.findMany({
    where: { purchaseOrderId },
  });

  const newTotal = items.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0,
  );

  await db.purchaseOrder.update({
    where: { id: purchaseOrderId },
    data: { total: newTotal },
  });

  revalidatePath("/dashboard/purchases");
}

export async function receivePurchaseOrder(purchaseOrderId) {
  const purchase = await db.purchaseOrder.findUnique({
    where: { id: purchaseOrderId },
    include: { items: true },
  });

  if (!purchase) {
    throw new Error("Porosia nuk u gjet");
  }

  const business = await db.business.findFirst();

  if (!business) {
    throw new Error("Nuk u gjet biznes aktiv");
  }

  for (const item of purchase.items) {
    const existingPart = await db.part.findFirst({
      where: {
        businessId: business.id,
        name: item.name,
      },
    });

    if (existingPart) {
      await db.part.update({
        where: { id: existingPart.id },
        data: {
          stock: existingPart.stock + item.quantity,
        },
      });
    } else {
      await db.part.create({
        data: {
          businessId: business.id,
          name: item.name,
          stock: item.quantity,
          minStock: 0,
          buyPrice: item.unitPrice,
          sellPrice: item.unitPrice,
          supplier: purchase.supplier,
        },
      });
    }
  }

  await db.purchaseOrder.update({
    where: { id: purchaseOrderId },
    data: {
      status: "RECEIVED",
    },
  });

  revalidatePath("/dashboard/purchases");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
}
