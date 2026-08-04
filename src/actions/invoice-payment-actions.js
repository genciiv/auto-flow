"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { createActionError } from "@/lib/errors";
import { PERMISSIONS } from "@/lib/permissions";
import {
  getFirstValidationMessage,
  validateFormData,
  validateObject,
} from "@/lib/validation";
import { logCreate, logPayment } from "@/services/audit-events";
import { notifyPartialPayment } from "@/services/operational-notification-service";

const requiredIdSchema = z
  .string()
  .trim()
  .min(1, "Identifikuesi është i detyrueshëm.");

const createInvoiceFromServiceSchema = z.object({
  serviceId: requiredIdSchema,
});

const recordCustomerPaymentSchema = z.object({
  invoiceId: requiredIdSchema,
  amount: z.coerce
    .number({
      error: "Shuma e pagesës nuk është e vlefshme.",
    })
    .finite("Shuma e pagesës nuk është e vlefshme.")
    .positive("Shuma e pagesës duhet të jetë më e madhe se zero."),
  method: z
    .string()
    .trim()
    .transform((value) => value || "CASH"),
  reference: z
    .string()
    .trim()
    .transform((value) => value || null),
  notes: z
    .string()
    .trim()
    .transform((value) => value || null),
});

function getActionValidationError(validationResult, fallbackMessage) {
  return createActionError(
    getFirstValidationMessage(validationResult.error, fallbackMessage),
  );
}

async function nextInvoiceNumber(transaction, businessId) {
  const year = new Date().getFullYear();

  const count = await transaction.invoice.count({
    where: {
      businessId,
      number: {
        startsWith: `INV-${year}-`,
      },
    },
  });

  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function createInvoiceFromServiceAction(serviceId) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.INVOICES_CREATE,
    );

    const validationResult = validateObject(createInvoiceFromServiceSchema, {
      serviceId,
    });

    if (!validationResult.success) {
      throw getActionValidationError(
        validationResult,
        "Urdhër-puna nuk u identifikua.",
      );
    }

    const validatedServiceId = validationResult.data.serviceId;

    let invoice;

    await db.$transaction(async (transaction) => {
      const service = await transaction.serviceRecord.findFirst({
        where: {
          id: validatedServiceId,
          businessId: context.businessId,
        },
        include: {
          invoice: true,
          laborItems: true,
          partsUsed: {
            include: {
              part: true,
            },
          },
        },
      });

      if (!service) {
        throw createActionError("Urdhër-puna nuk u gjet.");
      }

      if (service.invoice) {
        throw createActionError(
          `Ekziston tashmë fatura ${service.invoice.number}.`,
        );
      }

      if (
        !["READY_FOR_PICKUP", "COMPLETED", "DELIVERED"].includes(service.status)
      ) {
        throw createActionError(
          "Fatura krijohet pasi puna të jetë gati për dorëzim.",
        );
      }

      const number = await nextInvoiceNumber(transaction, context.businessId);

      invoice = await transaction.invoice.create({
        data: {
          businessId: context.businessId,
          customerId: service.customerId,
          vehicleId: service.vehicleId,
          serviceId: service.id,
          number,
          status: service.total > 0 ? "UNPAID" : "DRAFT",
          total: service.total,
          items: {
            create: [
              ...service.laborItems.map((item) => ({
                type: "LABOR",
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
              })),
              ...service.partsUsed.map((usage) => ({
                type: "PART",
                description: usage.part.name,
                quantity: usage.quantity,
                unitPrice: usage.unitPrice,
                total: usage.total,
              })),
            ],
          },
        },
      });

      await logCreate({
        context,
        entityType: "INVOICE",
        entityId: invoice.id,
        title: `U krijua fatura ${number}`,
        description: "Fatura u gjenerua automatikisht nga urdhër-puna.",
        newValues: {
          serviceId: validatedServiceId,
          total: service.total,
          number,
        },
        database: transaction,
      });
    });

    revalidatePath(`/dashboard/services/${validatedServiceId}`);
    revalidatePath(`/dashboard/invoices/${invoice.id}`);
    revalidatePath("/dashboard/invoices");

    return {
      success: true,
      message: `Fatura ${invoice.number} u krijua.`,
      invoiceId: invoice.id,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Fatura nuk u krijua.",
    };
  }
}

export async function recordCustomerPaymentAction(formData) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.INVOICES_MARK_PAID,
    );

    const validationResult = validateFormData(
      recordCustomerPaymentSchema,
      formData,
    );

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Të dhënat e pagesës nuk janë të vlefshme.",
        ),
        fieldErrors: validationResult.fieldErrors,
      };
    }

    const { invoiceId, amount, method, reference, notes } =
      validationResult.data;

    await db.$transaction(async (transaction) => {
      const invoice = await transaction.invoice.findFirst({
        where: {
          id: invoiceId,
          businessId: context.businessId,
        },
        include: {
          customerPayments: true,
        },
      });

      if (!invoice) {
        throw createActionError("Fatura nuk u gjet.");
      }

      const paid = invoice.customerPayments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0,
      );

      const invoiceTotal = Number(invoice.total);
      const remaining = Math.max(invoiceTotal - paid, 0);

      if (amount > remaining + 0.001) {
        throw createActionError(
          `Pagesa tejkalon detyrimin e mbetur (${remaining.toFixed(0)} Lek).`,
        );
      }

      await transaction.customerPayment.create({
        data: {
          businessId: context.businessId,
          invoiceId,
          recordedById: context.userId,
          amount,
          method,
          reference,
          notes,
        },
      });

      const newPaid = paid + amount;
      const remainingAfter = Math.max(invoiceTotal - newPaid, 0);

      await transaction.invoice.update({
        where: {
          id: invoiceId,
        },
        data: {
          status: remainingAfter <= 0.001 ? "PAID" : "UNPAID",
        },
      });

      if (remainingAfter > 0.001) {
        await notifyPartialPayment({
          database: transaction,
          businessId: context.businessId,
          invoiceId,
          invoiceNumber: invoice.number,
          remaining: remainingAfter,
        });
      }

      await logPayment({
        context,
        entityType: "INVOICE",
        entityId: invoiceId,
        title: `U regjistrua pagesa ${amount.toFixed(0)} Lek`,
        description: `Pagesa u regjistrua me metodën ${method}.`,
        amount,
        metadata: {
          method,
          reference,
          remainingAfter,
        },
        database: transaction,
      });
    });

    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard/workspace");

    return {
      success: true,
      message: "Pagesa u regjistrua me sukses.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Pagesa nuk u regjistrua.",
    };
  }
}
