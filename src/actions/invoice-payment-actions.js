"use server";

import { revalidatePath } from "next/cache";
import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { createActionError } from "@/lib/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { logCreate, logPayment } from "@/services/audit-events";
import { notifyPartialPayment } from "@/services/operational-notification-service";

async function nextInvoiceNumber(transaction, businessId) {
  const year = new Date().getFullYear();
  const count = await transaction.invoice.count({ where: { businessId, number: { startsWith: `INV-${year}-` } } });
  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function createInvoiceFromServiceAction(serviceId) {
  try {
    const context = await requireBusinessActionPermission(PERMISSIONS.INVOICES_CREATE);
    let invoice;
    await db.$transaction(async (transaction) => {
      const service = await transaction.serviceRecord.findFirst({
        where: { id: serviceId, businessId: context.businessId },
        include: { invoice: true, laborItems: true, partsUsed: { include: { part: true } } },
      });
      if (!service) throw createActionError("Urdhër-puna nuk u gjet.");
      if (service.invoice) throw createActionError(`Ekziston tashmë fatura ${service.invoice.number}.`);
      if (!["READY_FOR_PICKUP", "COMPLETED", "DELIVERED"].includes(service.status)) {
        throw createActionError("Fatura krijohet pasi puna të jetë gati për dorëzim.");
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
              ...service.laborItems.map((item) => ({ type: "LABOR", description: item.description, quantity: item.quantity, unitPrice: item.unitPrice, total: item.total })),
              ...service.partsUsed.map((usage) => ({ type: "PART", description: usage.part.name, quantity: usage.quantity, unitPrice: usage.unitPrice, total: usage.total })),
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
        newValues: { serviceId, total: service.total, number },
        database: transaction,
      });
    });
    revalidatePath(`/dashboard/services/${serviceId}`);
    revalidatePath(`/dashboard/invoices/${invoice.id}`);
    revalidatePath("/dashboard/invoices");
    return { success: true, message: `Fatura ${invoice.number} u krijua.`, invoiceId: invoice.id };
  } catch (error) {
    return { success: false, message: error?.message || "Fatura nuk u krijua." };
  }
}

export async function recordCustomerPaymentAction(formData) {
  try {
    const context = await requireBusinessActionPermission(PERMISSIONS.INVOICES_MARK_PAID);
    const invoiceId = String(formData.get("invoiceId") || "").trim();
    const amount = Number(formData.get("amount"));
    const method = String(formData.get("method") || "CASH");
    const reference = String(formData.get("reference") || "").trim() || null;
    const notes = String(formData.get("notes") || "").trim() || null;
    if (!invoiceId || !Number.isFinite(amount) || amount <= 0) throw createActionError("Shuma e pagesës nuk është e vlefshme.");

    await db.$transaction(async (transaction) => {
      const invoice = await transaction.invoice.findFirst({
        where: { id: invoiceId, businessId: context.businessId },
        include: { customerPayments: true },
      });
      if (!invoice) throw createActionError("Fatura nuk u gjet.");
      const paid = invoice.customerPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const remaining = Math.max(Number(invoice.total) - paid, 0);
      if (amount > remaining + 0.001) throw createActionError(`Pagesa tejkalon detyrimin e mbetur (${remaining.toFixed(0)} Lek).`);
      await transaction.customerPayment.create({
        data: { businessId: context.businessId, invoiceId, recordedById: context.userId, amount, method, reference, notes },
      });
      const newPaid = paid + amount;
      await transaction.invoice.update({ where: { id: invoiceId }, data: { status: newPaid + 0.001 >= Number(invoice.total) ? "PAID" : "UNPAID" } });
      const remainingAfter = Math.max(Number(invoice.total) - newPaid, 0);
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
        metadata: { method, reference, remainingAfter: Math.max(Number(invoice.total) - newPaid, 0) },
        database: transaction,
      });
    });
    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard/workspace");
    return { success: true, message: "Pagesa u regjistrua me sukses." };
  } catch (error) {
    return { success: false, message: error?.message || "Pagesa nuk u regjistrua." };
  }
}
