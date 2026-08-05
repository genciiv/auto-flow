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
  validateObject,
} from "@/lib/validation";
import {
  addPurchaseItemSchema,
  receivePurchaseOrderSchema,
} from "@/schemas/purchase-schema";

function refreshPurchaseItemPages() {
  revalidatePath("/dashboard/purchases");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
}

function getErrorMessage(error, fallbackMessage) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export async function addPurchaseItem(formData) {
  try {
    const { businessId } = await requireBusinessActionPermission(
      PERMISSIONS.PURCHASES_UPDATE,
    );

    const validationResult = validateFormData(
      addPurchaseItemSchema,
      formData,
    );

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Artikulli nuk mund të shtohej.",
        ),
      };
    }

    const {
      purchaseOrderId,
      name,
      quantity,
      unitPrice,
    } = validationResult.data;

    const decimalUnitPrice = toMoney(unitPrice);
    const itemTotal = multiplyMoney(quantity, decimalUnitPrice);

    await db.$transaction(async (transaction) => {
      const purchase = await transaction.purchaseOrder.findFirst({
        where: {
          id: purchaseOrderId,
          businessId,
        },

        select: {
          id: true,
          status: true,
        },
      });

      if (!purchase) {
        throw createActionError("Porosia nuk u gjet.");
      }

      if (purchase.status === "RECEIVED") {
        throw createActionError(
          "Nuk mund të shtohen artikuj sepse porosia është marrë në magazinë.",
        );
      }

      if (purchase.status === "CANCELLED") {
        throw createActionError(
          "Nuk mund të shtohen artikuj në një porosi të anuluar.",
        );
      }

      await transaction.purchaseOrderItem.create({
        data: {
          purchaseOrderId: purchase.id,
          name,
          quantity,
          unitPrice: decimalUnitPrice,
          total: itemTotal,
        },
      });

      const totals = await transaction.purchaseOrderItem.aggregate({
        where: {
          purchaseOrderId: purchase.id,
        },

        _sum: {
          total: true,
        },
      });

      await transaction.purchaseOrder.update({
        where: {
          id: purchase.id,
        },

        data: {
          total: toMoney(totals._sum.total ?? 0),
        },
      });
    });

    refreshPurchaseItemPages();

    return {
      success: true,
      message: "Artikulli u shtua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë shtimit të artikullit:", error);

    return {
      success: false,
      message: getErrorMessage(
        error,
        "Artikulli nuk mund të shtohej.",
      ),
    };
  }
}

export async function receivePurchaseOrder(purchaseOrderId) {
  try {
    const purchaseContext = await requireBusinessActionPermission(
      PERMISSIONS.PURCHASES_RECEIVE,
    );

    const stockContext = await requireBusinessActionPermission(
      PERMISSIONS.INVENTORY_MANAGE_STOCK,
    );

    const { businessId } = purchaseContext;

    if (stockContext.businessId !== businessId) {
      return {
        success: false,
        message: "Biznesi aktiv nuk përputhet me magazinën.",
      };
    }

    const validationResult = validateObject(
      receivePurchaseOrderSchema,
      {
        purchaseOrderId,
      },
    );

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "ID e porosisë mungon.",
        ),
      };
    }

    const validatedPurchaseOrderId =
      validationResult.data.purchaseOrderId;

    await db.$transaction(async (transaction) => {
      const purchase = await transaction.purchaseOrder.findFirst({
        where: {
          id: validatedPurchaseOrderId,
          businessId,
        },

        include: {
          items: true,
        },
      });

      if (!purchase) {
        throw createActionError("Porosia nuk u gjet.");
      }

      if (purchase.status === "RECEIVED") {
        throw createActionError(
          "Kjo porosi është marrë më parë në magazinë.",
        );
      }

      if (purchase.status === "CANCELLED") {
        throw createActionError(
          "Një porosi e anuluar nuk mund të merret në magazinë.",
        );
      }

      if (purchase.items.length === 0) {
        throw createActionError(
          "Porosia nuk ka artikuj për t'u futur në magazinë.",
        );
      }

      const receivedUpdate =
        await transaction.purchaseOrder.updateMany({
          where: {
            id: purchase.id,
            businessId,

            status: {
              in: ["PENDING", "ORDERED"],
            },
          },

          data: {
            status: "RECEIVED",
          },
        });

      if (receivedUpdate.count !== 1) {
        throw createActionError(
          "Porosia është ndryshuar ose është marrë më parë në magazinë.",
        );
      }

      for (const item of purchase.items) {
        const itemName = String(item.name || "").trim();

        if (!itemName) {
          throw createActionError(
            "Një nga artikujt e porosisë nuk ka emër të vlefshëm.",
          );
        }

        const quantity = toQuantity(item.quantity);
        const unitPrice = toMoney(item.unitPrice ?? 0);

        if (quantity.lte(0)) {
          throw createActionError(
            `Sasia e artikullit "${itemName}" nuk është e vlefshme.`,
          );
        }

        if (unitPrice.lt(0)) {
          throw createActionError(
            `Çmimi i artikullit "${itemName}" nuk është i vlefshëm.`,
          );
        }

        const existingPart = await transaction.part.findFirst({
          where: {
            businessId,
            name: itemName,
          },

          select: {
            id: true,
          },
        });

        if (existingPart) {
          await transaction.part.updateMany({
            where: {
              id: existingPart.id,
              businessId,
            },

            data: {
              stock: {
                increment: quantity,
              },

              buyPrice: unitPrice,
              supplier: purchase.supplier,
            },
          });
        } else {
          await transaction.part.create({
            data: {
              businessId,
              name: itemName,
              stock: quantity,
              minStock: 0,
              buyPrice: unitPrice,
              sellPrice: unitPrice,
              supplier: purchase.supplier,
            },
          });
        }
      }
    });

    refreshPurchaseItemPages();

    return {
      success: true,
      message: "Porosia u fut në magazinë me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë marrjes së porosisë:", error);

    return {
      success: false,
      message: getErrorMessage(
        error,
        "Porosia nuk mund të merrej në magazinë.",
      ),
    };
  }
}
