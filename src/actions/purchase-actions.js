"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function createPurchaseOrder(formData) {
  const supplier = formData.get("supplier");
  const status = formData.get("status");
  const total = formData.get("total");
  const notes = formData.get("notes");

  if (!supplier) {
    throw new Error("Furnitori është i detyrueshëm");
  }

  const business = await db.business.findFirst();

  if (!business) {
    throw new Error("Nuk u gjet biznes aktiv");
  }

  await db.purchaseOrder.create({
    data: {
      businessId: business.id,
      supplier,
      status: status || "PENDING",
      total: total ? Number(total) : 0,
      notes: notes || null,
    },
  });

  revalidatePath("/dashboard/purchases");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
}
