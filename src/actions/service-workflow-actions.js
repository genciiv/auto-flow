"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { AppError, ERROR_CODES } from "@/lib/errors";
import { PERMISSIONS } from "@/lib/permissions";
import {
  assertServiceReadyToClose,
  assertServiceTransitionAllowed,
  getServiceTransitionTimestamps,
  runSerializableServiceWorkflow,
  SERVICE_STATUS_LABELS as LABELS,
  SERVICE_WORKFLOW_STATUSES as SERVICE_STATUSES,
} from "@/lib/service-workflow";
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

const optionalTextSchema = z
  .string()
  .trim()
  .max(5000, "Teksti është shumë i gjatë.")
  .transform((value) => value || null);

const updateServiceWorkflowSchema = z.object({
  serviceId: z.string().trim().min(1, "ID e urdhër-punës mungon."),
  assignedUserId: optionalTextSchema,
  description: optionalTextSchema,
  diagnosis: optionalTextSchema,
  internalNotes: optionalTextSchema,
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
  revalidatePath("/dashboard/my-work");
  revalidatePath("/dashboard/workspace");
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
  return error instanceof Error ? error.message : fallbackMessage;
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
      description,
      diagnosis,
      internalNotes,
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
        description: true,
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
          role: "MECHANIC",
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      if (!member) {
        return failure("Mekaniku i zgjedhur nuk është aktiv në këtë biznes.");
      }
    }

    const updated = await db.serviceRecord.update({
      where: {
        id: service.id,
      },
      data: {
        assignedUserId,
        description,
        diagnosis,
        internalNotes,
        customerApprovalRequired: false,
        customerApprovedAt: null,
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
      title: `U përditësua Job Card ${service.title}`,
      description:
        "U përditësuan problemi i raportuar, diagnoza, shënimet ose mekaniku.",
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
      message: "Job Card u përditësua me sukses.",
    };
  } catch (error) {
    console.error("[updateServiceWorkflowAction]", error);

    return failure(getErrorMessage(error, "Job Card nuk mund të përditësohej."));
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

    const result = await runSerializableServiceWorkflow(
      db,
      async (transaction) => {
        const service = await transaction.serviceRecord.findFirst({
          where: {
            id: validatedServiceId,
            businessId,
          },
          include: {
            vehicle: {
              select: { plate: true },
            },
            _count: {
              select: {
                laborItems: true,
                partsUsed: true,
              },
            },
          },
        });

        if (!service) {
          throw new AppError({
            code: ERROR_CODES.NOT_FOUND,
            message: "Urdhër-puna nuk u gjet.",
            status: 404,
          });
        }

        if (businessRole === "MECHANIC" && service.assignedUserId !== userId) {
          throw new AppError({
            code: ERROR_CODES.FORBIDDEN,
            message:
              "Mund të ndryshosh vetëm statusin e punëve që të janë caktuar.",
            status: 403,
          });
        }

        if (service.status === target) {
          return { service, changed: false };
        }

        assertServiceTransitionAllowed(service.status, target);
        assertServiceReadyToClose(service, target);

        const now = new Date();
        const timestamps = getServiceTransitionTimestamps(
          service,
          target,
          now,
        );

        const claimed = await transaction.serviceRecord.updateMany({
          where: {
            id: service.id,
            businessId,
            status: service.status,
          },
          data: {
            status: target,
            customerApprovalRequired: false,
            customerApprovedAt: null,
            ...timestamps,
          },
        });

        if (claimed.count !== 1) {
          const current = await transaction.serviceRecord.findFirst({
            where: { id: service.id, businessId },
            select: { status: true },
          });

          if (current?.status === target) {
            return { service: { ...service, status: target }, changed: false };
          }

          throw new AppError({
            code: ERROR_CODES.CONFLICT,
            message:
              "Statusi ndryshoi ndërkohë. Rifresko faqen dhe provo përsëri.",
            status: 409,
          });
        }

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
            note: validatedNote,
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

        return { service: { ...service, status: target }, changed: true };
      },
    );

    refreshServicePages(validatedServiceId);

    return {
      success: true,
      message: result.changed
        ? `Statusi u ndryshua në “${LABELS[target]}”.`
        : `Statusi është tashmë “${LABELS[target]}”.`,
    };
  } catch (error) {
    console.error("[transitionServiceAction]", error);

    return failure(getErrorMessage(error, "Statusi nuk mund të ndryshohej."));
  }
}
