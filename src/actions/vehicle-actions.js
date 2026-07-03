"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function createVehicle(formData) {
  const customerId = formData.get("customerId");
  const plate = formData.get("plate");
  const brand = formData.get("brand");
  const model = formData.get("model");
  const year = formData.get("year");
  const vin = formData.get("vin");

  if (!plate || !brand) {
    throw new Error("Targa dhe marka janë të detyrueshme");
  }

  const business = await db.business.findFirst();

  if (!business) {
    throw new Error("Nuk u gjet biznes aktiv");
  }

  await db.vehicle.create({
    data: {
      businessId: business.id,
      customerId: customerId || null,
      plate,
      brand,
      model: model || null,
      year: year ? Number(year) : null,
      vin: vin || null,
    },
  });

  revalidatePath("/dashboard/vehicles");
}
