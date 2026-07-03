"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function createCustomer(formData) {
  const name = formData.get("name");
  const phone = formData.get("phone");
  const email = formData.get("email");
  const city = formData.get("city");

  if (!name) {
    throw new Error("Emri është i detyrueshëm");
  }

  const business = await db.business.findFirst();

  if (!business) {
    throw new Error("Nuk u gjet biznes aktiv");
  }

  await db.customer.create({
    data: {
      businessId: business.id,
      name,
      phone: phone || null,
      email: email || null,
      city: city || null,
    },
  });

  revalidatePath("/dashboard/customers");
}
