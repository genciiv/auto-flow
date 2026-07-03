"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function createService(formData) {
  const vehicleId = formData.get("vehicleId");
  const title = formData.get("title");
  const description = formData.get("description");
  const status = formData.get("status");
  const total = formData.get("total");

  if (!vehicleId || !title) {
    throw new Error("Automjeti dhe titulli janë të detyrueshme");
  }

  const business = await db.business.findFirst();

  if (!business) {
    throw new Error("Nuk u gjet biznes aktiv");
  }

  const vehicle = await db.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      customer: true,
    },
  });

  if (!vehicle) {
    throw new Error("Automjeti nuk u gjet");
  }

  await db.serviceRecord.create({
    data: {
      businessId: business.id,
      vehicleId: vehicle.id,
      customerId: vehicle.customer?.id || null,
      title,
      description: description || null,
      status: status || "PENDING",
      total: total ? Number(total) : 0,
    },
  });

  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/vehicles");
  revalidatePath("/dashboard");
}
