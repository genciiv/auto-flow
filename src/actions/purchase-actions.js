"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";

const VALID_STATUSES = ["PENDING", "ORDERED", "CANCELLED"];

function refreshPurchasePages() {
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

function parseNonNegativeNumber(value, fieldName) {
  const number = value === null || value === "" ? 0 : Number(value);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${fieldName} duhet të jetë numër pozitiv.`);
  }

  return number;
}

export async function createPurchaseOrder(formData) {
  try {
    const { businessId } = await requireBusinessContext();

    const supplier = getFormString(formData, "supplier");
    const status = getFormString(formData, "status") || "PENDING";
    const notes = getFormString(formData, "notes");

    const total = parseNonNegativeNumber(
      formData.get("total"),
      "Totali i porosisë",
    );

    if (!supplier) {
      return {
        success: false,
        message: "Furnitori është i detyrueshëm.",
      };
    }

    if (!VALID_STATUSES.includes(status)) {
      return {
        success: false,
        message: "Statusi i zgjedhur nuk është i vlefshëm.",
      };
    }

    await db.purchaseOrder.create({
      data: {
        businessId,
        supplier,
        status,
        total,
        notes: notes || null,
      },
    });

    refreshPurchasePages();

    return {
      success: true,
      message: "Porosia u krijua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë krijimit të porosisë:", error);

    return {
      success: false,
      message: error?.message || "Porosia nuk mund të krijohej.",
    };
  }
}

export async function updatePurchaseOrder(formData) {
  try {
    const { businessId } = await requireBusinessContext();

    const id = getFormString(formData, "id");
    const supplier = getFormString(formData, "supplier");
    const status = getFormString(formData, "status");
    const notes = getFormString(formData, "notes");

    const total = parseNonNegativeNumber(
      formData.get("total"),
      "Totali i porosisë",
    );

    if (!id) {
      return {
        success: false,
        message: "ID e porosisë mungon.",
      };
    }

    if (!supplier) {
      return {
        success: false,
        message: "Furnitori është i detyrueshëm.",
      };
    }

    if (!VALID_STATUSES.includes(status)) {
      return {
        success: false,
        message:
          "Statusi nuk është i vlefshëm. Porosia merret në magazinë vetëm nga butoni përkatës.",
      };
    }

    const purchase = await db.purchaseOrder.findFirst({
      where: {
        id,
        businessId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!purchase) {
      return {
        success: false,
        message: "Porosia nuk u gjet.",
      };
    }

    if (purchase.status === "RECEIVED") {
      return {
        success: false,
        message: "Porosia është marrë në magazinë dhe nuk mund të editohet më.",
      };
    }

    await db.purchaseOrder.update({
      where: {
        id: purchase.id,
      },
      data: {
        supplier,
        status,
        total,
        notes: notes || null,
      },
    });

    refreshPurchasePages();

    return {
      success: true,
      message: "Porosia u përditësua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë përditësimit të porosisë:", error);

    return {
      success: false,
      message: error?.message || "Porosia nuk mund të përditësohej.",
    };
  }
}

export async function updatePurchaseStatus(purchaseId, status) {
  try {
    const { businessId } = await requireBusinessContext();

    if (!purchaseId || typeof purchaseId !== "string") {
      return {
        success: false,
        message: "ID e porosisë mungon.",
      };
    }

    if (!VALID_STATUSES.includes(status)) {
      return {
        success: false,
        message: "Statusi i zgjedhur nuk është i vlefshëm.",
      };
    }

    const purchase = await db.purchaseOrder.findFirst({
      where: {
        id: purchaseId,
        businessId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!purchase) {
      return {
        success: false,
        message: "Porosia nuk u gjet.",
      };
    }

    if (purchase.status === "RECEIVED") {
      return {
        success: false,
        message:
          "Statusi i një porosie të marrë në magazinë nuk mund të ndryshohet.",
      };
    }

    await db.purchaseOrder.update({
      where: {
        id: purchase.id,
      },
      data: {
        status,
      },
    });

    refreshPurchasePages();

    return {
      success: true,
      message: "Statusi u përditësua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë ndryshimit të statusit:", error);

    return {
      success: false,
      message: "Statusi nuk mund të përditësohej.",
    };
  }
}

export async function deletePurchaseOrder(purchaseId) {
  try {
    const { businessId } = await requireBusinessContext();

    if (!purchaseId || typeof purchaseId !== "string") {
      return {
        success: false,
        message: "ID e porosisë mungon.",
      };
    }

    const purchase = await db.purchaseOrder.findFirst({
      where: {
        id: purchaseId,
        businessId,
      },
      select: {
        id: true,
        supplier: true,
        status: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!purchase) {
      return {
        success: false,
        message: "Porosia nuk u gjet.",
      };
    }

    if (purchase.status === "RECEIVED") {
      return {
        success: false,
        message:
          "Porosia nuk mund të fshihet sepse është marrë në magazinë dhe stoku është përditësuar.",
      };
    }

    await db.$transaction(async (transaction) => {
      await transaction.purchaseOrderItem.deleteMany({
        where: {
          purchaseOrderId: purchase.id,
        },
      });

      await transaction.purchaseOrder.delete({
        where: {
          id: purchase.id,
        },
      });
    });

    refreshPurchasePages();

    return {
      success: true,
      message:
        purchase._count.items > 0
          ? `Porosia dhe ${purchase._count.items} artikujt e saj u fshinë me sukses.`
          : "Porosia u fshi me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë fshirjes së porosisë:", error);

    return {
      success: false,
      message: error?.message || "Porosia nuk mund të fshihej.",
    };
  }
}
