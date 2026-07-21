"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";

function refreshPurchaseItemPages() {
  revalidatePath("/dashboard/purchases");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
}

function getFormString(formData, fieldName) {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function parsePositiveNumber(value, fieldName) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(`${fieldName} duhet të jetë më i madh se zero.`);
  }

  return number;
}

function parseNonNegativeNumber(value, fieldName) {
  const number = value === null || value === "" ? 0 : Number(value);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${fieldName} duhet të jetë numër pozitiv.`);
  }

  return number;
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

    const purchaseOrderId = getFormString(formData, "purchaseOrderId");

    const name = getFormString(formData, "name");

    if (!purchaseOrderId || !name) {
      return {
        success: false,
        message: "Porosia dhe emri i artikullit janë të detyrueshme.",
      };
    }

    const quantity = parsePositiveNumber(
      formData.get("quantity") || 1,
      "Sasia",
    );

    const unitPrice = parseNonNegativeNumber(
      formData.get("unitPrice"),
      "Çmimi për njësi",
    );

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
        throw new Error("Porosia nuk u gjet.");
      }

      if (purchase.status === "RECEIVED") {
        throw new Error(
          "Nuk mund të shtohen artikuj sepse porosia është marrë në magazinë.",
        );
      }

      if (purchase.status === "CANCELLED") {
        throw new Error(
          "Nuk mund të shtohen artikuj në një porosi të anuluar.",
        );
      }

      await transaction.purchaseOrderItem.create({
        data: {
          purchaseOrderId: purchase.id,
          name,
          quantity,
          unitPrice,
          total: quantity * unitPrice,
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
          total: Number(totals._sum.total ?? 0),
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
      message: getErrorMessage(error, "Artikulli nuk mund të shtohej."),
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

    if (!purchaseOrderId || typeof purchaseOrderId !== "string") {
      return {
        success: false,
        message: "ID e porosisë mungon.",
      };
    }

    await db.$transaction(async (transaction) => {
      const purchase = await transaction.purchaseOrder.findFirst({
        where: {
          id: purchaseOrderId,
          businessId,
        },
        include: {
          items: true,
        },
      });

      if (!purchase) {
        throw new Error("Porosia nuk u gjet.");
      }

      if (purchase.status === "RECEIVED") {
        throw new Error("Kjo porosi është marrë më parë në magazinë.");
      }

      if (purchase.status === "CANCELLED") {
        throw new Error("Një porosi e anuluar nuk mund të merret në magazinë.");
      }

      if (purchase.items.length === 0) {
        throw new Error("Porosia nuk ka artikuj për t'u futur në magazinë.");
      }

      /*
       * Ky updateMany e rezervon porosinë për marrje.
       * Nëse dy kërkesa provojnë njëkohësisht, vetëm njëra kalon.
       * Nëse ndonjë veprim më poshtë dështon, transaction e kthen
       * edhe statusin në gjendjen e mëparshme.
       */
      const receivedUpdate = await transaction.purchaseOrder.updateMany({
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
        throw new Error(
          "Porosia është ndryshuar ose është marrë më parë në magazinë.",
        );
      }

      for (const item of purchase.items) {
        const itemName = String(item.name || "").trim();

        if (!itemName) {
          throw new Error(
            "Një nga artikujt e porosisë nuk ka emër të vlefshëm.",
          );
        }

        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice ?? 0);

        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new Error(
            `Sasia e artikullit "${itemName}" nuk është e vlefshme.`,
          );
        }

        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
          throw new Error(
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
