"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";
import {
  getFirstValidationMessage,
  validateFormData,
  validateObject,
} from "@/lib/validation";
import {
  createCustomerSchema,
  deleteCustomerSchema,
  updateCustomerSchema,
} from "@/schemas/customer-schema";
import { logCreate, logDelete, logUpdate } from "@/services/audit-events";

function getCustomerAuditValues(customer) {
  if (!customer) {
    return null;
  }

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    city: customer.city,
  };
}

export async function createCustomer(formData) {
  const context = await requireBusinessActionPermission(
    PERMISSIONS.CUSTOMERS_CREATE,
  );

  const { businessId } = context;

  const validationResult = validateFormData(createCustomerSchema, formData);

  if (!validationResult.success) {
    throw new Error(
      getFirstValidationMessage(
        validationResult.error,
        "Të dhënat e klientit nuk janë të vlefshme.",
      ),
    );
  }

  const { name, phone, email, city } = validationResult.data;

  await db.$transaction(async (transaction) => {
    const customer = await transaction.customer.create({
      data: {
        businessId,
        name,
        phone,
        email,
        city,
      },

      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        city: true,
      },
    });

    await logCreate({
      context,
      entityType: "CUSTOMER",
      entityId: customer.id,
      title: `U krijua klienti ${customer.name}`,
      description: `Klienti "${customer.name}" u regjistrua në sistem.`,
      newValues: getCustomerAuditValues(customer),

      metadata: {
        source: "customer-actions",
        operation: "createCustomer",
      },

      database: transaction,
    });
  });

  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard");
}

export async function updateCustomer(formData) {
  const context = await requireBusinessActionPermission(
    PERMISSIONS.CUSTOMERS_UPDATE,
  );

  const { businessId } = context;

  const validationResult = validateFormData(updateCustomerSchema, formData);

  if (!validationResult.success) {
    throw new Error(
      getFirstValidationMessage(
        validationResult.error,
        "Të dhënat e klientit nuk janë të vlefshme.",
      ),
    );
  }

  const { id, name, phone, email, city } = validationResult.data;

  const existingCustomer = await db.customer.findFirst({
    where: {
      id,
      businessId,
    },

    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      city: true,
    },
  });

  if (!existingCustomer) {
    throw new Error("Klienti nuk u gjet.");
  }

  await db.$transaction(async (transaction) => {
    const updatedCustomer = await transaction.customer.update({
      where: {
        id: existingCustomer.id,
      },

      data: {
        name,
        phone,
        email,
        city,
      },

      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        city: true,
      },
    });

    await logUpdate({
      context,
      entityType: "CUSTOMER",
      entityId: updatedCustomer.id,
      title: `U përditësua klienti ${updatedCustomer.name}`,
      description: `Të dhënat e klientit "${updatedCustomer.name}" u përditësuan.`,
      oldValues: getCustomerAuditValues(existingCustomer),
      newValues: getCustomerAuditValues(updatedCustomer),

      metadata: {
        source: "customer-actions",
        operation: "updateCustomer",
      },

      database: transaction,
    });
  });

  revalidatePath("/dashboard/customers");
  revalidatePath(`/dashboard/customers/${existingCustomer.id}`);
  revalidatePath("/dashboard");
}

export async function deleteCustomer(customerId) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.CUSTOMERS_DELETE,
    );

    const { businessId } = context;

    const validationResult = validateObject(deleteCustomerSchema, {
      customerId,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "ID e klientit mungon.",
        ),
      };
    }

    const validatedCustomerId = validationResult.data.customerId;

    const customer = await db.customer.findFirst({
      where: {
        id: validatedCustomerId,
        businessId,
      },

      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        city: true,

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

    await db.$transaction(async (transaction) => {
      await transaction.customer.delete({
        where: {
          id: customer.id,
        },
      });

      await logDelete({
        context,
        entityType: "CUSTOMER",
        entityId: customer.id,
        title: `U fshi klienti ${customer.name}`,
        description: `Klienti "${customer.name}" u fshi nga sistemi.`,
        oldValues: getCustomerAuditValues(customer),

        metadata: {
          source: "customer-actions",
          operation: "deleteCustomer",
        },

        database: transaction,
      });
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
