"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";

function getOptionalFormValue(formData, fieldName) {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue || null;
}

function validateEmail(email) {
  if (!email) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createCustomer(formData) {
  const { businessId } = await requireBusinessActionPermission(
    PERMISSIONS.CUSTOMERS_CREATE,
  );

  const name = getOptionalFormValue(formData, "name");
  const phone = getOptionalFormValue(formData, "phone");
  const email = getOptionalFormValue(formData, "email");
  const city = getOptionalFormValue(formData, "city");

  if (!name) {
    throw new Error("Emri është i detyrueshëm.");
  }

  if (!validateEmail(email)) {
    throw new Error("Adresa e email-it nuk është e vlefshme.");
  }

  await db.customer.create({
    data: {
      businessId,
      name,
      phone,
      email,
      city,
    },
  });

  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard");
}

export async function updateCustomer(formData) {
  const { businessId } = await requireBusinessActionPermission(
    PERMISSIONS.CUSTOMERS_UPDATE,
  );

  const id = getOptionalFormValue(formData, "id");
  const name = getOptionalFormValue(formData, "name");
  const phone = getOptionalFormValue(formData, "phone");
  const email = getOptionalFormValue(formData, "email");
  const city = getOptionalFormValue(formData, "city");

  if (!id) {
    throw new Error("ID e klientit mungon.");
  }

  if (!name) {
    throw new Error("Emri është i detyrueshëm.");
  }

  if (!validateEmail(email)) {
    throw new Error("Adresa e email-it nuk është e vlefshme.");
  }

  const customer = await db.customer.findFirst({
    where: {
      id,
      businessId,
    },
    select: {
      id: true,
    },
  });

  if (!customer) {
    throw new Error("Klienti nuk u gjet.");
  }

  await db.customer.update({
    where: {
      id: customer.id,
    },
    data: {
      name,
      phone,
      email,
      city,
    },
  });

  revalidatePath("/dashboard/customers");
  revalidatePath(`/dashboard/customers/${customer.id}`);
  revalidatePath("/dashboard");
}

export async function deleteCustomer(customerId) {
  try {
    const { businessId } = await requireBusinessActionPermission(
      PERMISSIONS.CUSTOMERS_DELETE,
    );

    if (!customerId || typeof customerId !== "string") {
      return {
        success: false,
        message: "ID e klientit mungon.",
      };
    }

    const customer = await db.customer.findFirst({
      where: {
        id: customerId,
        businessId,
      },
      select: {
        id: true,
        _count: {
          select: {
            vehicles: true,
            invoices: true,
            appointments: true,
          },
        },
      },
    });

    if (!customer) {
      return {
        success: false,
        message: "Klienti nuk u gjet.",
      };
    }

    const serviceRecordsCount = await db.serviceRecord.count({
      where: {
        businessId,
        customerId: customer.id,
      },
    });

    if (customer._count.vehicles > 0) {
      return {
        success: false,
        message:
          "Ky klient nuk mund të fshihet sepse ka automjete të regjistruara.",
      };
    }

    if (customer._count.invoices > 0) {
      return {
        success: false,
        message:
          "Ky klient nuk mund të fshihet sepse ka fatura të regjistruara.",
      };
    }

    if (serviceRecordsCount > 0) {
      return {
        success: false,
        message:
          "Ky klient nuk mund të fshihet sepse ka shërbime të regjistruara.",
      };
    }

    if (customer._count.appointments > 0) {
      return {
        success: false,
        message:
          "Ky klient nuk mund të fshihet sepse ka termine të regjistruara.",
      };
    }

    await db.customer.delete({
      where: {
        id: customer.id,
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

    if (
      error instanceof Error &&
      error.message === "Nuk keni leje për të kryer këtë veprim."
    ) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message:
        "Klienti nuk mund të fshihet sepse është i lidhur me të dhëna të tjera.",
    };
  }
}
