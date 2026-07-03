"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function addPartToService(formData) {
  const serviceId = formData.get("serviceId");
  const partId = formData.get("partId");
  const quantity = Number(formData.get("quantity") || 1);

  if (!serviceId || !partId || quantity < 1) {
    throw new Error("Shërbimi, pjesa dhe sasia janë të detyrueshme");
  }

  const part = await db.part.findUnique({
    where: { id: partId },
  });

  if (!part) {
    throw new Error("Pjesa nuk u gjet");
  }

  if (part.stock < quantity) {
    throw new Error("Nuk ka stok të mjaftueshëm");
  }

  const unitPrice = Number(part.sellPrice || 0);
  const total = quantity * unitPrice;

  await db.servicePartUsage.create({
    data: {
      serviceId,
      partId,
      quantity,
      unitPrice,
      total,
    },
  });

  await db.part.update({
    where: { id: partId },
    data: {
      stock: part.stock - quantity,
    },
  });

  await db.serviceRecord.update({
    where: { id: serviceId },
    data: {
      total: {
        increment: total,
      },
    },
  });

  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
}
