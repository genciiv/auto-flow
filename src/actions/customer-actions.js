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

export async function updateCustomer(formData) {
  const id = formData.get("id");
  const name = formData.get("name");
  const phone = formData.get("phone");
  const email = formData.get("email");
  const city = formData.get("city");

  if (!id || !name) {
    throw new Error("ID dhe emri janë të detyrueshëm");
  }

  await db.customer.update({
    where: { id },
    data: {
      name,
      phone: phone || null,
      email: email || null,
      city: city || null,
    },
  });

  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard");
}

export async function deleteCustomer(customerId) {
  try {
    if (!customerId) {
      return {
        success: false,
        message: "ID e klientit mungon.",
      };
    }

    const customer = await db.customer.findUnique({
      where: {
        id: customerId,
      },
      include: {
        vehicles: true,
      },
    });

    if (!customer) {
      return {
        success: false,
        message: "Klienti nuk u gjet.",
      };
    }

    if (customer.vehicles.length > 0) {
      return {
        success: false,
        message:
          "Ky klient nuk mund të fshihet sepse ka automjete të regjistruara.",
      };
    }

    await db.customer.delete({
      where: {
        id: customerId,
      },
    });

    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Klienti u fshi me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë fshirjes së klientit:", error);

    return {
      success: false,
      message:
        "Klienti nuk mund të fshihet sepse është i lidhur me të dhëna të tjera.",
    };
  }
}
