"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";
import {
  getFirstValidationMessage,
  validateFormData,
  validateObject,
} from "@/lib/validation";
import { logStatusChange, logUpdate } from "@/services/audit-events";
import {
  notifyAssignedMechanic,
  notifyServiceReadyForPickup,
  notifyServiceWaitingForParts,
} from "@/services/operational-notification-service";

const SERVICE_STATUSES = [
  "DRAFT",
  "PENDING",
  "IN_PROGRESS",
  "WAITING_FOR_PARTS",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "DELIVERED",
  "CANCELLED",
];

const TRANSITIONS = {
  DRAFT: ["PENDING", "CANCELLED"],
  PENDING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: [
    "WAITING_FOR_PARTS",
    "READY_FOR_PICKUP",
    "COMPLETED",
    "CANCELLED",
  ],
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

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => value || null);

const checkboxSchema = z.preprocess(
  (value) => value === "on" || value === "true" || value === true,
  z.boolean(),
);

const updateServiceWorkflowSchema = z.object({
  serviceId: z.string().trim().min(1, "ID e urdhër-punës mungon."),

  assignedUserId: optionalTextSchema,

  diagnosis: optionalTextSchema,

  internalNotes: optionalTextSchema,

  customerApprovalRequired: checkboxSchema,

  customerApproved: checkboxSchema,
});

const transitionServiceSchema = z.object({
  serviceId: z.string().trim().min(1, "ID e urdhër-punës mungon."),

  toStatus: z.enum(SERVICE_STATUSES, {
    error: "Statusi i ri nuk është i vlefshëm.",
  }),

  note: optionalTextSchema,
});

function refreshServicePages(serviceId) {
  revalidatePath("/dashboard/services");
  revalidatePath(`/dashboard/services/${serviceId}`);
  revalidatePath("/dashboard");
}

function failure(message, fieldErrors = undefined) {
  return {
    success: false,
    message,
    ...(fieldErrors ? { fieldErrors } : {}),
  };
}

function getErrorMessage(error, fallbackMessage) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

export async function updateServiceWorkflowAction(formData) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.SERVICES_UPDATE,
    );

    const validationResult = validateFormData(
      updateServiceWorkflowSchema,
      formData,
    );

    if (!validationResult.success) {
      return failure(
        getFirstValidationMessage(
          validationResult.error,
          "Të dhënat e urdhër-punës nuk janë të vlefshme.",
        ),
        validationResult.fieldErrors,
      );
    }

    const {
      serviceId,
      assignedUserId,
      diagnosis,
      internalNotes,
      customerApprovalRequired,
      customerApproved,
    } = validationResult.data;

    const { businessId, userId, businessRole } = context;

    const service = await db.serviceRecord.findFirst({
      where: {
        id: serviceId,
        businessId,
      },
      select: {
        id: true,
        title: true,
        assignedUserId: true,
        diagnosis: true,
        internalNotes: true,
        customerApprovalRequired: true,
        customerApprovedAt: true,
        vehicle: {
          select: {
            plate: true,
          },
        },
      },
    });

    if (!service) {
      return failure("Urdhër-puna nuk u gjet.");
    }

    if (businessRole === "MECHANIC" && service.assignedUserId !== userId) {
      return failure("Mund të përditësosh vetëm punët që të janë caktuar.");
    }

    if (
      businessRole === "MECHANIC" &&
      assignedUserId !== service.assignedUserId
    ) {
      return failure("Mekaniku nuk mund të ndryshojë caktimin e punës.");
    }

    if (assignedUserId) {
      const member = await db.businessUser.findFirst({
        where: {
          businessId,
          userId: assignedUserId,
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      if (!member) {
        return failure("Punonjësi i zgjedhur nuk është aktiv në këtë biznes.");
      }
    }

    const updated = await db.serviceRecord.update({
      where: {
        id: service.id,
      },
      data: {
        assignedUserId,
        diagnosis,
        internalNotes,

        customerApprovalRequired:
          businessRole === "MECHANIC"
            ? service.customerApprovalRequired
            : customerApprovalRequired,

        customerApprovedAt:
          businessRole === "MECHANIC"
            ? service.customerApprovedAt
            : customerApprovalRequired && customerApproved
              ? service.customerApprovedAt || new Date()
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
      description:
        "U përditësuan diagnoza, shënimet, mekaniku ose miratimi i klientit.",
      oldValues: service,
      newValues: updated,
      metadata: {
        source: "service-workflow-actions",
        operation: "updateServiceWorkflowAction",
        changedById: userId,
      },
    });

    refreshServicePages(service.id);

    return {
      success: true,
      message: "Urdhër-puna u përditësua me sukses.",
    };
  } catch (error) {
    console.error("[updateServiceWorkflowAction]", error);

    return failure(
      getErrorMessage(error, "Urdhër-puna nuk mund të përditësohej."),
    );
  }
}

export async function transitionServiceAction(
  serviceId,
  toStatus,
  note = null,
) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.SERVICES_UPDATE,
    );

    const validationResult = validateObject(transitionServiceSchema, {
      serviceId,
      toStatus,
      note,
    });

    if (!validationResult.success) {
      return failure(
        getFirstValidationMessage(
          validationResult.error,
          "Të dhënat e ndryshimit të statusit nuk janë të vlefshme.",
        ),
        validationResult.fieldErrors,
      );
    }

    const {
      serviceId: validatedServiceId,
      toStatus: target,
      note: validatedNote,
    } = validationResult.data;

    const { businessId, userId, businessRole } = context;

    const service = await db.serviceRecord.findFirst({
      where: {
        id: validatedServiceId,
        businessId,
      },
      include: {
        vehicle: {
          select: {
            plate: true,
          },
        },
      },
    });

    if (!service) {
      return failure("Urdhër-puna nuk u gjet.");
    }

    if (businessRole === "MECHANIC" && service.assignedUserId !== userId) {
      return failure(
        "Mund të ndryshosh vetëm statusin e punëve që të janë caktuar.",
      );
    }

    if (!TRANSITIONS[service.status]?.includes(target)) {
      return failure(
        `Kalimi nga “${LABELS[service.status]}” në “${LABELS[target]}” nuk lejohet.`,
      );
    }

    if (
      target === "IN_PROGRESS" &&
      service.customerApprovalRequired &&
      !service.customerApprovedAt
    ) {
      return failure(
        "Nevojitet miratimi i klientit përpara fillimit të punës.",
      );
    }

    const timestamps = {};

    if (target === "IN_PROGRESS" && !service.startedAt) {
      timestamps.startedAt = new Date();
    }

    if (target === "READY_FOR_PICKUP") {
      timestamps.readyAt = new Date();
    }

    if (target === "COMPLETED") {
      timestamps.completedAt = new Date();
    }

    if (target === "DELIVERED") {
      timestamps.deliveredAt = new Date();
    }

    await db.$transaction(async (transaction) => {
      await transaction.serviceRecord.update({
        where: {
          id: service.id,
        },
        data: {
          status: target,
          ...timestamps,
        },
      });

      await transaction.serviceStatusHistory.create({
        data: {
          serviceId: service.id,
          changedById: userId,
          fromStatus: service.status,
          toStatus: target,
          note: validatedNote,
        },
      });

      await logStatusChange({
        context,
        entityType: "SERVICE",
        entityId: service.id,
        title: `Ndryshoi statusi i urdhër-punës ${service.title}`,
        description: `Statusi ndryshoi nga “${LABELS[service.status]}” në “${LABELS[target]}”.`,
        oldStatus: service.status,
        newStatus: target,
        metadata: {
          source: "service-workflow-actions",
          operation: "transitionServiceAction",
          vehiclePlate: service.vehicle?.plate || null,
        },
        database: transaction,
      });

      if (target === "WAITING_FOR_PARTS") {
        await notifyServiceWaitingForParts({
          database: transaction,
          businessId,
          serviceId: service.id,
          serviceTitle: service.title,
          plate: service.vehicle?.plate || null,
        });
      }

      if (target === "READY_FOR_PICKUP") {
        await notifyServiceReadyForPickup({
          database: transaction,
          businessId,
          serviceId: service.id,
          serviceTitle: service.title,
          plate: service.vehicle?.plate || null,
        });
      }

      if (["READY_FOR_PICKUP", "COMPLETED", "DELIVERED"].includes(target)) {
        await transaction.notification.create({
          data: {
            businessId,
            title: LABELS[target],
            message: `${service.title} (${
              service.vehicle?.plate || "automjeti"
            }) është ${LABELS[target].toLowerCase()}.`,
            type: "INFO",
            entityType: "SERVICE",
            entityId: service.id,
          },
        });
      }
    });

    refreshServicePages(service.id);

    return {
      success: true,
      message: `Statusi u ndryshua në “${LABELS[target]}”.`,
    };
  } catch (error) {
    console.error("[transitionServiceAction]", error);

    return failure(getErrorMessage(error, "Statusi nuk mund të ndryshohej."));
  }
}
