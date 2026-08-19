"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { createActionError } from "@/lib/errors";
import {
  getPaidAndRemaining,
  nextInvoiceNumberInTransaction,
  runSerializableInvoiceTransaction,
} from "@/lib/invoice-financial-safety";
import {
  addMoney,
  formatMoney,
  isMoneyGreaterThan,
  moneyToString,
  subtractMoney,
  toMoney,
} from "@/lib/money";
import { PERMISSIONS } from "@/lib/permissions";
import { recalculateServiceTotal } from "@/lib/service-total";
import {
  getFirstValidationMessage,
  validateFormData,
  validateObject,
} from "@/lib/validation";
import {
  logCreate,
  logPayment,
} from "@/services/audit-events";
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
  amount: z
    .string()
    .trim()
    .min(1, "Shuma e pagesës është e detyrueshme.")
    .refine(
      (value) => /^-?\d+(?:[.,]\d+)?$/.test(value),
      "Shuma e pagesës nuk është e vlefshme.",
    )
    .transform((value) => toMoney(value))
    .refine(
      (value) => value.gt(0),
      "Shuma e pagesës duhet të jetë më e madhe se zero.",
    ),
  method: z.preprocess(
    (value) => {
      const normalized = String(value ?? "")
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");

      const aliases = {
        CASH: "CASH",
        PARA_NE_DORE: "CASH",
        CASH_PAYMENT: "CASH",
        BANK: "BANK_TRANSFER",
        BANK_TRANSFER: "BANK_TRANSFER",
        TRANSFERTE_BANKARE: "BANK_TRANSFER",
        CARD: "CARD",
        KARTE: "CARD",
        PAYPAL: "PAYPAL",
        OTHER: "OTHER",
        TJETER: "OTHER",
      };

      return aliases[normalized] || normalized || "CASH";
    },
    z.enum(
      ["CASH", "BANK_TRANSFER", "CARD", "PAYPAL", "OTHER"],
      {
        error: "Metoda e pagesës nuk është e vlefshme.",
      },
    ),
  ),
  reference: z.preprocess(
    (value) => String(value ?? "").trim(),
    z
      .string()
      .transform((value) => value || null),
  ),
  notes: z.preprocess(
    (value) => String(value ?? "").trim(),
    z
      .string()
      .transform((value) => value || null),
  ),
});

function getActionValidationError(
  validationResult,
  fallbackMessage,
) {
  return createActionError(
    getFirstValidationMessage(
      validationResult.error,
      fallbackMessage,
    ),
  );
}

export async function createInvoiceFromServiceAction(
  serviceId,
) {
  try {
    const context =
      await requireBusinessActionPermission(
        PERMISSIONS.INVOICES_CREATE,
      );

    const validationResult = validateObject(
      createInvoiceFromServiceSchema,
      { serviceId },
    );

    if (!validationResult.success) {
      throw getActionValidationError(
        validationResult,
        "Urdhër-puna nuk u identifikua.",
      );
    }

    const validatedServiceId =
      validationResult.data.serviceId;

    let invoice;

    await runSerializableInvoiceTransaction(
      db,
      async (transaction) => {
      const service =
        await transaction.serviceRecord.findFirst({
          where: {
            id: validatedServiceId,
            businessId: context.businessId,
          },
          include: {
            invoice: true,
            laborItems: true,
            partsUsed: {
              include: { part: true },
            },
          },
        });

      if (!service) {
        throw createActionError(
          "Urdhër-puna nuk u gjet.",
        );
      }

      if (service.invoice) {
        throw createActionError(
          `Ekziston tashmë fatura ${service.invoice.number}.`,
        );
      }

      if (
        ![
          "READY_FOR_PICKUP",
          "COMPLETED",
          "DELIVERED",
        ].includes(service.status)
      ) {
        throw createActionError(
          "Fatura krijohet pasi puna të jetë gati për dorëzim.",
        );
      }

      const serviceTotal =
        await recalculateServiceTotal(
          transaction,
          service.id,
        );

      const number = await nextInvoiceNumberInTransaction(
        transaction,
        context.businessId,
      );

      invoice = await transaction.invoice.create({
        data: {
          businessId: context.businessId,
          customerId: service.customerId,
          vehicleId: service.vehicleId,
          serviceId: service.id,
          number,
          status: serviceTotal.gt(0)
            ? "UNPAID"
            : "DRAFT",
          subtotal: serviceTotal,
          discountAmount: 0,
          vatEnabled: false,
          vatRate: 0,
          vatAmount: 0,
          total: serviceTotal,
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
        description:
          "Fatura u gjenerua automatikisht nga urdhër-puna.",
        newValues: {
          serviceId: validatedServiceId,
          total: serviceTotal.toString(),
          number,
        },
        database: transaction,
      });
      },
    );

    revalidatePath(
      `/dashboard/services/${validatedServiceId}`,
    );
    revalidatePath(
      `/dashboard/invoices/${invoice.id}`,
    );
    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard/finance");

    return {
      success: true,
      message: `Fatura ${invoice.number} u krijua.`,
      invoiceId: invoice.id,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Fatura nuk u krijua.",
    };
  }
}

export async function recordCustomerPaymentAction(
  formData,
) {
  try {
    const context =
      await requireBusinessActionPermission(
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

    const {
      invoiceId,
      amount: paymentAmount,
      method,
      reference,
      notes,
    } = validationResult.data;

    let paymentResult;

    await runSerializableInvoiceTransaction(
      db,
      async (transaction) => {
      const invoice =
        await transaction.invoice.findFirst({
          where: {
            id: invoiceId,
            businessId: context.businessId,
          },
          include: {
            customerPayments: true,
          },
        });

      if (!invoice) {
        throw createActionError(
          "Fatura nuk u gjet.",
        );
      }

      const {
        total: invoiceTotal,
        paid,
        remaining,
      } = getPaidAndRemaining(invoice);

      if (reference) {
        const existingPayment =
          invoice.customerPayments.find(
            (payment) =>
              payment.reference === reference &&
              payment.method === method,
          );

        if (existingPayment) {
          if (!toMoney(existingPayment.amount).eq(paymentAmount)) {
            throw createActionError(
              "Kjo referencë pagese është përdorur me një shumë tjetër.",
            );
          }

          paymentResult = {
            duplicate: true,
            paymentId: existingPayment.id,
          };
          return;
        }
      }

      if (
        isMoneyGreaterThan(
          paymentAmount,
          remaining,
        )
      ) {
        throw createActionError(
          `Pagesa tejkalon detyrimin e mbetur (${formatMoney(
            remaining,
            {
              currency: "ALL",
              locale: "sq-AL",
            },
          )}).`,
        );
      }

      const createdPayment =
        await transaction.customerPayment.create({
        data: {
          businessId: context.businessId,
          invoiceId,
          recordedById: context.userId,
          amount: paymentAmount,
          method,
          reference,
          notes,
        },
      });

      const newPaid = addMoney(
        paid,
        paymentAmount,
      );

      const calculatedRemainingAfter =
        subtractMoney(invoiceTotal, newPaid);

      const remainingAfter =
        calculatedRemainingAfter.lt(0)
          ? toMoney(0)
          : calculatedRemainingAfter;

      const isPaid = remainingAfter.eq(0);

      await transaction.invoice.update({
        where: { id: invoiceId },
        data: {
          status: isPaid ? "PAID" : "UNPAID",
        },
      });

      if (!isPaid) {
        await notifyPartialPayment({
          database: transaction,
          businessId: context.businessId,
          invoiceId,
          invoiceNumber: invoice.number,
          remaining: moneyToString(
            remainingAfter,
          ),
        });
      }

      paymentResult = {
        duplicate: false,
        paymentId: createdPayment.id,
      };

      await logPayment({
        context,
        entityType: "INVOICE",
        entityId: invoiceId,
        title: `U regjistrua pagesa ${formatMoney(
          paymentAmount,
          {
            currency: "ALL",
            locale: "sq-AL",
          },
        )}`,
        description: `Pagesa u regjistrua me metodën ${method}.`,
        amount: moneyToString(paymentAmount),
        metadata: {
          method,
          reference,
          remainingAfter:
            moneyToString(remainingAfter),
        },
        database: transaction,
      });
      },
    );

    if (paymentResult?.duplicate) {
      return {
        success: true,
        message: "Kjo pagesë ishte regjistruar më parë.",
        duplicate: true,
      };
    }

    revalidatePath(
      `/dashboard/invoices/${invoiceId}`,
    );
    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard/workspace");
    revalidatePath("/dashboard/finance");

    return {
      success: true,
      message: "Pagesa u regjistrua me sukses.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Pagesa nuk u regjistrua.",
    };
  }
}
