"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { createActionError } from "@/lib/errors";
import {
  multiplyMoney,
  toMoney,
  toQuantity,
} from "@/lib/money";
import { PERMISSIONS } from "@/lib/permissions";
import {
  getFirstValidationMessage,
  validateFormData,
} from "@/lib/validation";
import { addPartToServiceSchema } from "@/schemas/inventory-schema";
import { notifyLowStock } from "@/services/operational-notification-service";

function refreshServicePartPages(serviceId = null) {
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");

  if (serviceId) {
    revalidatePath(`/dashboard/services/${serviceId}`);
  }
}

export async function addPartToService(formData) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.SERVICES_MANAGE_PARTS,
    );

    const {
      businessId,
      businessRole,
      userId,
    } = context;

    const validationResult = validateFormData(
      addPartToServiceSchema,
      formData,
    );

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Shërbimi, pjesa dhe sasia janë të detyrueshme.",
        ),
      };
    }

    const {
      serviceId,
      partId,
      quantity,
    } = validationResult.data;

    await db.$transaction(async (transaction) => {
      const service = await transaction.serviceRecord.findFirst({
        where: {
          id: serviceId,
          businessId,

          ...(businessRole === "MECHANIC"
            ? {
                assignedUserId: userId,
              }
            : {}),
        },

        select: {
          id: true,
          status: true,
        },
      });

      if (!service) {
        throw createActionError("Shërbimi nuk u gjet.");
      }

      if (service.status === "COMPLETED") {
        throw createActionError(
          "Nuk mund të shtohen pjesë në një shërbim të përfunduar.",
        );
      }

      if (service.status === "CANCELLED") {
        throw createActionError(
          "Nuk mund të shtohen pjesë në një shërbim të anuluar.",
        );
      }

      const part = await transaction.part.findFirst({
        where: {
          id: partId,
          businessId,
        },

        select: {
          id: true,
          name: true,
          stock: true,
          sellPrice: true,
          minStock: true,
        },
      });

      if (!part) {
        throw createActionError("Pjesa nuk u gjet.");
      }

      const currentStock = toQuantity(part.stock);

      const requestedQuantity = toQuantity(quantity);

      if (
        currentStock.lt(0) ||
        requestedQuantity.lte(0) ||
        currentStock.lt(requestedQuantity)
      ) {
        throw createActionError(
          `Nuk ka stok të mjaftueshëm për pjesën "${part.name}".`,
        );
      }

      const unitPrice = toMoney(part.sellPrice ?? 0);

      if (unitPrice.lt(0)) {
        throw createActionError(
          "Çmimi i shitjes së pjesës nuk është i vlefshëm.",
        );
      }

      const total = multiplyMoney(
        unitPrice,
        requestedQuantity,
      );

      const stockUpdate = await transaction.part.updateMany({
        where: {
          id: part.id,
          businessId,

          stock: {
            gte: requestedQuantity,
          },
        },

        data: {
          stock: {
            decrement: requestedQuantity,
          },
        },
      });

      if (stockUpdate.count !== 1) {
        throw createActionError(
          "Stoku ka ndryshuar. Nuk ka më sasi të mjaftueshme.",
        );
      }

      const existingUsage =
        await transaction.servicePartUsage.findUnique({
          where: {
            serviceId_partId: {
              serviceId: service.id,
              partId: part.id,
            },
          },
        });

      if (existingUsage) {
        await transaction.servicePartUsage.update({
          where: {
            id: existingUsage.id,
          },

          data: {
            quantity: {
              increment: requestedQuantity,
            },

            total: {
              increment: total,
            },
          },
        });
      } else {
        await transaction.servicePartUsage.create({
          data: {
            serviceId: service.id,
            partId: part.id,
            quantity: requestedQuantity,
            unitPrice,
            total,
          },
        });
      }

      const stockAfter = currentStock.minus(requestedQuantity);

      await transaction.inventoryMovement.create({
        data: {
          businessId,
          partId: part.id,
          serviceId: service.id,
          userId,
          type: "SERVICE_OUT",
          quantity: requestedQuantity,
          stockBefore: currentStock,
          stockAfter,

          note:
            `Pjesë e përdorur në urdhër-punë nga ${
              context.user.name || context.user.email
            }`,
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

      const minStock = toQuantity(part.minStock ?? 0);

      if (stockAfter.lte(minStock)) {
        await notifyLowStock({
          database: transaction,
          businessId,
          partId: part.id,
          partName: part.name,
          stock: stockAfter,
          minStock,
        });
      }
    });

    refreshServicePartPages(serviceId);

    return {
      success: true,
      message: "Pjesa iu shtua shërbimit me sukses.",
    };
  } catch (error) {
    console.error(
      "Gabim gjatë shtimit të pjesës në shërbim:",
      error,
    );

    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Pjesa nuk mund t'i shtohej shërbimit.",
    };
  }
}
