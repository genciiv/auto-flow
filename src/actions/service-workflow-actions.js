"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";
import { logStatusChange, logUpdate } from "@/services/audit-events";
import {
  notifyAssignedMechanic,
  notifyServiceReadyForPickup,
  notifyServiceWaitingForParts,
} from "@/services/operational-notification-service";

const TRANSITIONS = {
  DRAFT: ["PENDING", "CANCELLED"],
  PENDING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["WAITING_FOR_PARTS", "READY_FOR_PICKUP", "COMPLETED", "CANCELLED"],
  WAITING_FOR_PARTS: ["IN_PROGRESS", "READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["COMPLETED", "DELIVERED", "IN_PROGRESS"],
  COMPLETED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const LABELS = {
  DRAFT: "Draft",
  PENDING: "Në pritje",
  IN_PROGRESS: "Në proces",
  WAITING_FOR_PARTS: "Në pritje të pjesëve",
  READY_FOR_PICKUP: "Gati për dorëzim",
  COMPLETED: "Përfunduar",
  DELIVERED: "Dorëzuar",
  CANCELLED: "Anuluar",
};

function clean(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function refresh(serviceId) {
  revalidatePath("/dashboard/services");
  revalidatePath(`/dashboard/services/${serviceId}`);
  revalidatePath("/dashboard");
}

export async function updateServiceWorkflowAction(formData) {
  try {
    const context = await requireBusinessActionPermission(PERMISSIONS.SERVICES_UPDATE);
    const { businessId, userId, businessRole } = context;
    const serviceId = clean(formData.get("serviceId"));
    const assignedUserId = clean(formData.get("assignedUserId"));
    const diagnosis = clean(formData.get("diagnosis"));
    const internalNotes = clean(formData.get("internalNotes"));
    const customerApprovalRequired = formData.get("customerApprovalRequired") === "on";
    const customerApproved = formData.get("customerApproved") === "on";

    if (!serviceId) return { success: false, message: "ID e urdhër-punës mungon." };

    const service = await db.serviceRecord.findFirst({
      where: { id: serviceId, businessId },
      select: { id: true, title: true, assignedUserId: true, diagnosis: true, internalNotes: true, customerApprovalRequired: true, customerApprovedAt: true, vehicle: { select: { plate: true } } },
    });
    if (!service) return { success: false, message: "Urdhër-puna nuk u gjet." };

    if (businessRole === "MECHANIC" && service.assignedUserId !== userId) {
      return { success: false, message: "Mund të përditësosh vetëm punët që të janë caktuar." };
    }

    if (businessRole === "MECHANIC" && assignedUserId !== service.assignedUserId) {
      return { success: false, message: "Mekaniku nuk mund të ndryshojë caktimin e punës." };
    }

    if (assignedUserId) {
      const member = await db.businessUser.findFirst({
        where: { businessId, userId: assignedUserId, isActive: true },
        select: { id: true },
      });
      if (!member) return { success: false, message: "Punonjësi i zgjedhur nuk është aktiv në këtë biznes." };
    }

    const updated = await db.serviceRecord.update({
      where: { id: service.id },
      data: {
        assignedUserId,
        diagnosis,
        internalNotes,
        customerApprovalRequired: businessRole === "MECHANIC" ? service.customerApprovalRequired : customerApprovalRequired,
        customerApprovedAt: businessRole === "MECHANIC"
          ? service.customerApprovedAt
          : customerApprovalRequired && customerApproved
            ? (service.customerApprovedAt || new Date())
            : null,
      },
    });

    if (assignedUserId && assignedUserId !== service.assignedUserId) {
      await notifyAssignedMechanic({
        businessId,
        mechanicUserId: assignedUserId,
        serviceId: service.id,
        serviceTitle: service.title,
        plate: service.vehicle?.plate || null,
      });
    }

    await logUpdate({
      context,
      entityType: "SERVICE",
      entityId: service.id,
      title: `U përditësua urdhër-puna ${service.title}`,
      description: "U përditësuan diagnoza, shënimet, mekaniku ose miratimi i klientit.",
      oldValues: service,
      newValues: updated,
      metadata: { source: "service-workflow-actions", operation: "updateServiceWorkflowAction", changedById: userId },
    });

    refresh(service.id);
    return { success: true, message: "Urdhër-puna u përditësua me sukses." };
  } catch (error) {
    console.error("[updateServiceWorkflowAction]", error);
    return { success: false, message: "Urdhër-puna nuk mund të përditësohej." };
  }
}

export async function transitionServiceAction(serviceId, toStatus, note = null) {
  try {
    const context = await requireBusinessActionPermission(PERMISSIONS.SERVICES_UPDATE);
    const { businessId, userId, businessRole } = context;
    const target = clean(toStatus);
    const service = await db.serviceRecord.findFirst({
      where: { id: clean(serviceId), businessId },
      include: { vehicle: { select: { plate: true } } },
    });
    if (!service) return { success: false, message: "Urdhër-puna nuk u gjet." };
    if (businessRole === "MECHANIC" && service.assignedUserId !== userId) {
      return { success: false, message: "Mund të ndryshosh vetëm statusin e punëve që të janë caktuar." };
    }
    if (!target || !TRANSITIONS[service.status]?.includes(target)) {
      return { success: false, message: `Kalimi nga “${LABELS[service.status]}” në “${LABELS[target] || target}” nuk lejohet.` };
    }
    if (target === "IN_PROGRESS" && service.customerApprovalRequired && !service.customerApprovedAt) {
      return { success: false, message: "Nevojitet miratimi i klientit përpara fillimit të punës." };
    }

    const timestamps = {};
    if (target === "IN_PROGRESS" && !service.startedAt) timestamps.startedAt = new Date();
    if (target === "READY_FOR_PICKUP") timestamps.readyAt = new Date();
    if (target === "COMPLETED") timestamps.completedAt = new Date();
    if (target === "DELIVERED") timestamps.deliveredAt = new Date();

    await db.$transaction(async (tx) => {
      await tx.serviceRecord.update({ where: { id: service.id }, data: { status: target, ...timestamps } });
      await tx.serviceStatusHistory.create({
        data: { serviceId: service.id, changedById: userId, fromStatus: service.status, toStatus: target, note: clean(note) },
      });
      await logStatusChange({
        context,
        entityType: "SERVICE",
        entityId: service.id,
        title: `Ndryshoi statusi i urdhër-punës ${service.title}`,
        description: `Statusi ndryshoi nga “${LABELS[service.status]}” në “${LABELS[target]}”.`,
        oldStatus: service.status,
        newStatus: target,
        metadata: { source: "service-workflow-actions", operation: "transitionServiceAction", vehiclePlate: service.vehicle?.plate || null },
        database: tx,
      });
      if (target === "WAITING_FOR_PARTS") {
        await notifyServiceWaitingForParts({
          database: tx,
          businessId,
          serviceId: service.id,
          serviceTitle: service.title,
          plate: service.vehicle?.plate || null,
        });
      }
      if (target === "READY_FOR_PICKUP") {
        await notifyServiceReadyForPickup({
          database: tx,
          businessId,
          serviceId: service.id,
          serviceTitle: service.title,
          plate: service.vehicle?.plate || null,
        });
      }
      if (["READY_FOR_PICKUP", "COMPLETED", "DELIVERED"].includes(target)) {
        await tx.notification.create({
          data: {
            businessId,
            title: LABELS[target],
            message: `${service.title} (${service.vehicle?.plate || "automjeti"}) është ${LABELS[target].toLowerCase()}.`,
            type: "INFO",
            entityType: "SERVICE",
            entityId: service.id,
          },
        });
      }
    });

    refresh(service.id);
    return { success: true, message: `Statusi u ndryshua në “${LABELS[target]}”.` };
  } catch (error) {
    console.error("[transitionServiceAction]", error);
    return { success: false, message: "Statusi nuk mund të ndryshohej." };
  }
}
