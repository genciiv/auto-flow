"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function createInvoice(formData) {
  const customerId = formData.get("customerId");
  const vehicleId = formData.get("vehicleId");
  const serviceId = formData.get("serviceId");
  const number = formData.get("number");
  const status = formData.get("status");
  const total = formData.get("total");

  if (!number || !total) {
    throw new Error("Numri i faturës dhe totali janë të detyrueshme");
  }

  const business = await db.business.findFirst();

  if (!business) {
    throw new Error("Nuk u gjet biznes aktiv");
  }

  await db.invoice.create({
    data: {
      businessId: business.id,
      customerId: customerId || null,
      vehicleId: vehicleId || null,
      serviceId: serviceId || null,
      number,
      status: status || "DRAFT",
      total: Number(total),
    },
  });

  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard");
}
