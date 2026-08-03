"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { createActionError } from "@/lib/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { logCreate, logDelete } from "@/services/audit-events";

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function refresh(serviceId) {
  revalidatePath(`/dashboard/services/${serviceId}`);
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/my-work");
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/workspace");
}

async function assertServiceAccess(transaction, context, serviceId) {
  const service = await transaction.serviceRecord.findFirst({
    where: {
      id: serviceId,
      businessId: context.businessId,
      ...(context.businessRole === "MECHANIC"
        ? { assignedUserId: context.userId }
        : {}),
    },
    select: { id: true, status: true, total: true },
  });

  if (!service) throw createActionError("Urdhër-puna nuk u gjet ose nuk të është caktuar.");
  if (["COMPLETED", "DELIVERED", "CANCELLED"].includes(service.status)) {
    throw createActionError("Kjo urdhër-punë është mbyllur dhe nuk mund të ndryshohet.");
  }
  return service;
}

export async function addLaborItemAction(formData) {
  try {
    const context = await requireBusinessActionPermission(PERMISSIONS.SERVICES_UPDATE);
    const serviceId = String(formData.get("serviceId") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const quantity = numberValue(formData.get("quantity"), 1);
    const unitPrice = numberValue(formData.get("unitPrice"), 0);

    if (!serviceId || !description) throw createActionError("Përshkrimi i punës është i detyrueshëm.");
    if (quantity <= 0 || unitPrice < 0) throw createActionError("Sasia dhe çmimi nuk janë të vlefshme.");

    const total = quantity * unitPrice;
    await db.$transaction(async (transaction) => {
      const service = await assertServiceAccess(transaction, context, serviceId);
      const item = await transaction.serviceLaborItem.create({
        data: { serviceId, createdById: context.userId, description, quantity, unitPrice, total },
      });
      await transaction.serviceRecord.update({ where: { id: service.id }, data: { total: { increment: total } } });
      await logCreate({
        context,
        entityType: "SERVICE_LABOR_ITEM",
        entityId: item.id,
        title: `U shtua puna: ${description}`,
        description: `${context.user.name || "Përdoruesi"} shtoi ${quantity} × ${unitPrice} Lek në urdhër-punë.`,
        newValues: { serviceId, description, quantity, unitPrice, total },
        database: transaction,
      });
    });
    refresh(serviceId);
    return { success: true, message: "Puna u regjistrua me sukses." };
  } catch (error) {
    return { success: false, message: error?.message || "Puna nuk u regjistrua." };
  }
}

export async function removeLaborItemAction(itemId) {
  try {
    const context = await requireBusinessActionPermission(PERMISSIONS.SERVICES_UPDATE);
    let serviceId = null;
    await db.$transaction(async (transaction) => {
      const item = await transaction.serviceLaborItem.findFirst({
        where: { id: itemId, service: { businessId: context.businessId } },
        include: { service: { select: { id: true, assignedUserId: true, status: true } } },
      });
      if (!item) throw createActionError("Rreshti i punës nuk u gjet.");
      if (context.businessRole === "MECHANIC" && item.service.assignedUserId !== context.userId) {
        throw createActionError("Nuk mund të ndryshosh punën e një mekaniku tjetër.");
      }
      if (["COMPLETED", "DELIVERED", "CANCELLED"].includes(item.service.status)) {
        throw createActionError("Urdhër-puna është mbyllur.");
      }
      serviceId = item.service.id;
      await transaction.serviceLaborItem.delete({ where: { id: item.id } });
      await transaction.serviceRecord.update({ where: { id: serviceId }, data: { total: { decrement: item.total } } });
      await logDelete({
        context,
        entityType: "SERVICE_LABOR_ITEM",
        entityId: item.id,
        title: `U hoq puna: ${item.description}`,
        description: "Një rresht pune u hoq nga urdhër-puna.",
        oldValues: { serviceId, description: item.description, total: item.total },
        database: transaction,
      });
    });
    refresh(serviceId);
    return { success: true, message: "Puna u hoq." };
  } catch (error) {
    return { success: false, message: error?.message || "Puna nuk u hoq." };
  }
}
