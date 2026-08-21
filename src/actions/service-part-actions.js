"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { createActionError } from "@/lib/errors";
import {
  addMoney,
  divideMoney,
  multiplyMoney,
  toMoney,
  toQuantity,
} from "@/lib/money";
import { PERMISSIONS } from "@/lib/permissions";
import { assertServiceBillingEditable } from "@/lib/service-billing-guard";
import { recalculateServiceTotal } from "@/lib/service-total";
import { runSerializableServicePartTransaction } from "@/lib/service-part-stock";
import {
  getFirstValidationMessage,
  validateFormData,
  validateObject,
} from "@/lib/validation";
import { addPartToServiceSchema } from "@/schemas/inventory-schema";
import { notifyLowStock } from "@/services/operational-notification-service";

const removePartUsageSchema = z.object({
  usageId: z
    .string()
    .trim()
    .min(1, "Pjesa e përdorur nuk u identifikua."),
});

function refreshServicePartPages(serviceId = null) {
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/inventory/movements");
  revalidatePath("/dashboard/workspace");
  revalidatePath("/dashboard");

  if (serviceId) {
    revalidatePath(`/dashboard/services/${serviceId}`);
  }
}

async function getEditableService(
  transaction,
  context,
  serviceId,
) {
  const service = await transaction.serviceRecord.findFirst({
    where: {
      id: serviceId,
      businessId: context.businessId,
      ...(context.businessRole === "MECHANIC"
        ? { assignedUserId: context.userId }
        : {}),
    },
    select: {
      id: true,
      status: true,
      invoice: {
        select: {
          id: true,
          number: true,
        },
      },
    },
  });

  if (!service) {
    throw createActionError(
      "Shërbimi nuk u gjet ose nuk të është caktuar.",
    );
  }

  return assertServiceBillingEditable(service);
}

export async function addPartToService(formData) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.SERVICES_MANAGE_PARTS,
    );

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

    await runSerializableServicePartTransaction(
      db,
      async (transaction) => {
        const service = await getEditableService(
          transaction,
          context,
          serviceId,
        );

        const part = await transaction.part.findFirst({
          where: {
            id: partId,
            businessId: context.businessId,
          },
          select: {
            id: true,
            name: true,
            stock: true,
            buyPrice: true,
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
          requestedQuantity.lte(0) ||
          currentStock.lt(requestedQuantity)
        ) {
          throw createActionError(
            `Nuk ka stok të mjaftueshëm për pjesën "${part.name}".`,
          );
        }

        const unitPrice = toMoney(part.sellPrice ?? 0);
        const costUnitPrice = toMoney(part.buyPrice ?? 0);

        if (unitPrice.lt(0)) {
          throw createActionError(
            "Çmimi i shitjes së pjesës nuk është i vlefshëm.",
          );
        }

        if (costUnitPrice.lt(0)) {
          throw createActionError(
            "Kostoja e blerjes së pjesës nuk është e vlefshme.",
          );
        }

        const total = multiplyMoney(
          unitPrice,
          requestedQuantity,
        );

        const costTotal = multiplyMoney(
          costUnitPrice,
          requestedQuantity,
        );

        const existingUsage =
          await transaction.servicePartUsage.findUnique({
            where: {
              serviceId_partId: {
                serviceId: service.id,
                partId: part.id,
              },
            },
            select: {
              quantity: true,
              costTotal: true,
            },
          });

        const combinedQuantity = existingUsage
          ? toQuantity(existingUsage.quantity).plus(
              requestedQuantity,
            )
          : requestedQuantity;

        const combinedCostTotal = existingUsage
          ? addMoney(existingUsage.costTotal, costTotal)
          : costTotal;

        const combinedCostUnitPrice = divideMoney(
          combinedCostTotal,
          combinedQuantity,
        );

        const stockUpdate = await transaction.part.updateMany({
          where: {
            id: part.id,
            businessId: context.businessId,
            stock: currentStock,
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

        await transaction.servicePartUsage.upsert({
          where: {
            serviceId_partId: {
              serviceId: service.id,
              partId: part.id,
            },
          },
          create: {
            serviceId: service.id,
            partId: part.id,
            quantity: requestedQuantity,
            unitPrice,
            total,
            costUnitPrice,
            costTotal,
          },
          update: {
            quantity: {
              increment: requestedQuantity,
            },
            total: {
              increment: total,
            },
            costUnitPrice: combinedCostUnitPrice,
            costTotal: combinedCostTotal,
          },
        });

        const stockAfter =
          currentStock.minus(requestedQuantity);

        await transaction.inventoryMovement.create({
          data: {
            businessId: context.businessId,
            partId: part.id,
            serviceId: service.id,
            userId: context.userId,
            type: "SERVICE_OUT",
            quantity: requestedQuantity,
            stockBefore: currentStock,
            stockAfter,
            note: `Pjesë e përdorur në urdhër-punë nga ${
              context.user.name || context.user.email
            }`,
          },
        });

        await recalculateServiceTotal(transaction, service.id);

        const minStock = toQuantity(part.minStock ?? 0);

        if (stockAfter.lte(minStock)) {
          await notifyLowStock({
            database: transaction,
            businessId: context.businessId,
            partId: part.id,
            partName: part.name,
            stock: stockAfter,
            minStock,
          });
        }
      },
    );

    refreshServicePartPages(serviceId);

    return {
      success: true,
      message: "Pjesa iu shtua shërbimit me sukses.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Pjesa nuk mund t'i shtohej shërbimit.",
    };
  }
}

export async function removePartFromServiceAction(
  usageId,
) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.SERVICES_MANAGE_PARTS,
    );

    const validationResult = validateObject(
      removePartUsageSchema,
      { usageId },
    );

    if (!validationResult.success) {
      throw createActionError(
        getFirstValidationMessage(
          validationResult.error,
          "Pjesa e përdorur nuk u identifikua.",
        ),
      );
    }

    let serviceId = null;

    await runSerializableServicePartTransaction(
      db,
      async (transaction) => {
        const usage =
          await transaction.servicePartUsage.findFirst({
            where: {
              id: validationResult.data.usageId,
              service: {
                businessId: context.businessId,
              },
            },
            include: {
              part: {
                select: {
                  id: true,
                  name: true,
                  stock: true,
                },
              },
              service: {
                select: {
                  id: true,
                  status: true,
                  assignedUserId: true,
                  invoice: {
                    select: {
                      id: true,
                      number: true,
                    },
                  },
                },
              },
            },
          });

        if (!usage) {
          throw createActionError(
            "Pjesa e përdorur nuk u gjet.",
          );
        }

        if (
          context.businessRole === "MECHANIC" &&
          usage.service.assignedUserId !== context.userId
        ) {
          throw createActionError(
            "Nuk mund të ndryshosh pjesët e një mekaniku tjetër.",
          );
        }

        assertServiceBillingEditable(usage.service);
        serviceId = usage.service.id;

        const stockBefore = toQuantity(usage.part.stock);
        const returnedQuantity = toQuantity(usage.quantity);
        const stockAfter = stockBefore.plus(returnedQuantity);

        const usageDelete =
          await transaction.servicePartUsage.deleteMany({
            where: {
              id: usage.id,
              serviceId,
              partId: usage.part.id,
            },
          });

        if (usageDelete.count !== 1) {
          throw createActionError(
            "Pjesa është hequr ndërkohë. Rifresko faqen dhe provo përsëri.",
          );
        }

        const stockReturn = await transaction.part.updateMany({
          where: {
            id: usage.part.id,
            businessId: context.businessId,
            stock: stockBefore,
          },
          data: {
            stock: {
              increment: returnedQuantity,
            },
          },
        });

        if (stockReturn.count !== 1) {
          throw createActionError(
            "Stoku ndryshoi ndërkohë. Rifresko faqen dhe provo përsëri.",
          );
        }

        await transaction.inventoryMovement.create({
          data: {
            businessId: context.businessId,
            partId: usage.part.id,
            serviceId,
            userId: context.userId,
            type: "SERVICE_RETURN",
            quantity: returnedQuantity,
            stockBefore,
            stockAfter,
            note: `Pjesa "${usage.part.name}" u kthye në stok pas heqjes nga urdhër-puna.`,
          },
        });

        await recalculateServiceTotal(transaction, serviceId);
      },
    );

    refreshServicePartPages(serviceId);

    return {
      success: true,
      message:
        "Pjesa u hoq nga shërbimi dhe u kthye në stok.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Pjesa nuk u hoq nga shërbimi.",
    };
  }
}