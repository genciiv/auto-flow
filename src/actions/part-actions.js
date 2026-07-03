"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function createPart(formData) {
  const code = formData.get("code");
  const name = formData.get("name");
  const category = formData.get("category");
  const supplier = formData.get("supplier");
  const stock = formData.get("stock");
  const minStock = formData.get("minStock");
  const buyPrice = formData.get("buyPrice");
  const sellPrice = formData.get("sellPrice");

  if (!name) {
    throw new Error("Emri i pjesës është i detyrueshëm");
  }

  const business = await db.business.findFirst();

  if (!business) {
    throw new Error("Nuk u gjet biznes aktiv");
  }

  await db.part.create({
    data: {
      businessId: business.id,
      code: code || null,
      name,
      category: category || null,
      supplier: supplier || null,
      stock: stock ? Number(stock) : 0,
      minStock: minStock ? Number(minStock) : 0,
      buyPrice: buyPrice ? Number(buyPrice) : 0,
      sellPrice: sellPrice ? Number(sellPrice) : 0,
    },
  });

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
}
