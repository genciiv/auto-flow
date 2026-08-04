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
import { logCreate, logDelete } from "@/services/audit-events";

const requiredIdSchema = z
  .string()
  .trim()
  .min(1, "Identifikuesi është i detyrueshëm.");

const addLaborItemSchema = z.object({
  serviceId: requiredIdSchema,

  description: z
    .string()
    .trim()
    .min(1, "Përshkrimi i punës është i detyrueshëm."),

  quantity: z.preprocess(
    (value) => {
      if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
      ) {
        return 1;
      }

      return value;
    },
    z.coerce
      .number({
        error: "Sasia nuk është e vlefshme.",
      })
      .finite("Sasia nuk është e vlefshme.")
      .positive("Sasia duhet të jetë më e madhe se zero."),
  ),

  unitPrice: z.preprocess(
    (value) => {
      if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
      ) {
        return 0;
      }

      return value;
    },
    z.coerce
      .number({
        error: "Çmimi nuk është i vlefshëm.",
      })
      .finite("Çmimi nuk është i vlefshëm.")
      .min(0, "Çmimi nuk mund të jetë negativ."),
  ),
});

const removeLaborItemSchema = z.object({
  itemId: requiredIdSchema,
});

function getActionValidationError(validationResult, fallbackMessage) {
  return createActionError(
    getFirstValidationMessage(validationResult.error, fallbackMessage),
  );
}

function refreshServicePages(serviceId) {
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
        ? {
            assignedUserId: context.userId,
          }
        : {}),
    },
    select: {
      id: true,
      status: true,
      total: true,
    },
  });

  if (!service) {
    throw createActionError("Urdhër-puna nuk u gjet ose nuk të është caktuar.");
  }

  if (["COMPLETED", "DELIVERED", "CANCELLED"].includes(service.status)) {
    throw createActionError(
      "Kjo urdhër-punë është mbyllur dhe nuk mund të ndryshohet.",
    );
  }

  return service;
}

export async function addLaborItemAction(formData) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.SERVICES_UPDATE,
    );

    const validationResult = validateFormData(addLaborItemSchema, formData);

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Të dhënat e punës nuk janë të vlefshme.",
        ),
        fieldErrors: validationResult.fieldErrors,
      };
    }

    const { serviceId, description, quantity, unitPrice } =
      validationResult.data;

    const total = quantity * unitPrice;

    await db.$transaction(async (transaction) => {
      const service = await assertServiceAccess(
        transaction,
        context,
        serviceId,
      );

      const item = await transaction.serviceLaborItem.create({
        data: {
          serviceId,
          createdById: context.userId,
          description,
          quantity,
          unitPrice,
          total,
        },
      });

      await transaction.serviceRecord.update({
        where: {
          id: service.id,
        },
        data: {
          total: {
            increment: total,
          },
        },
      });

      await logCreate({
        context,
        entityType: "SERVICE_LABOR_ITEM",
        entityId: item.id,
        title: `U shtua puna: ${description}`,
        description: `${
          context.user.name || "Përdoruesi"
        } shtoi ${quantity} × ${unitPrice} Lek në urdhër-punë.`,
        newValues: {
          serviceId,
          description,
          quantity,
          unitPrice,
          total,
        },
        database: transaction,
      });
    });

    refreshServicePages(serviceId);

    return {
      success: true,
      message: "Puna u regjistrua me sukses.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Puna nuk u regjistrua.",
    };
  }
}

export async function removeLaborItemAction(itemId) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.SERVICES_UPDATE,
    );

    const validationResult = validateObject(removeLaborItemSchema, {
      itemId,
    });

    if (!validationResult.success) {
      throw getActionValidationError(
        validationResult,
        "Rreshti i punës nuk u identifikua.",
      );
    }

    const validatedItemId = validationResult.data.itemId;

    let serviceId = null;

    await db.$transaction(async (transaction) => {
      const item = await transaction.serviceLaborItem.findFirst({
        where: {
          id: validatedItemId,
          service: {
            businessId: context.businessId,
          },
        },
        include: {
          service: {
            select: {
              id: true,
              assignedUserId: true,
              status: true,
            },
          },
        },
      });

      if (!item) {
        throw createActionError("Rreshti i punës nuk u gjet.");
      }

      if (
        context.businessRole === "MECHANIC" &&
        item.service.assignedUserId !== context.userId
      ) {
        throw createActionError(
          "Nuk mund të ndryshosh punën e një mekaniku tjetër.",
        );
      }

      if (
        ["COMPLETED", "DELIVERED", "CANCELLED"].includes(item.service.status)
      ) {
        throw createActionError("Urdhër-puna është mbyllur.");
      }

      serviceId = item.service.id;

      await transaction.serviceLaborItem.delete({
        where: {
          id: item.id,
        },
      });

      await transaction.serviceRecord.update({
        where: {
          id: serviceId,
        },
        data: {
          total: {
            decrement: item.total,
          },
        },
      });

      await logDelete({
        context,
        entityType: "SERVICE_LABOR_ITEM",
        entityId: item.id,
        title: `U hoq puna: ${item.description}`,
        description: "Një rresht pune u hoq nga urdhër-puna.",
        oldValues: {
          serviceId,
          description: item.description,
          total: item.total,
        },
        database: transaction,
      });
    });

    refreshServicePages(serviceId);

    return {
      success: true,
      message: "Puna u hoq.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Puna nuk u hoq.",
    };
  }
}
