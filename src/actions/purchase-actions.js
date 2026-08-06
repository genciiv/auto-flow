"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { createAuditLog } from "@/services/audit-log-service";
import { PERMISSIONS } from "@/lib/permissions";
import {
  getFirstValidationMessage,
  validateFormData,
  validateObject,
} from "@/lib/validation";
import {
  createPurchaseOrderSchema,
  deletePurchaseOrderSchema,
  updatePurchaseOrderSchema,
  updatePurchaseStatusSchema,
} from "@/schemas/purchase-schema";

import { createActionError } from "@/lib/errors";
function refreshPurchasePages() {
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

export async function createPurchaseOrder(formData) {
  try {
    const { businessId, userId } = await requireBusinessActionPermission(
      PERMISSIONS.PURCHASES_CREATE,
    );

    const validationResult = validateFormData(
      createPurchaseOrderSchema,
      formData,
    );

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Porosia nuk mund të krijohej.",
        ),
      };
    }

    const { supplier, status, total, notes } = validationResult.data;

    const purchase = await db.purchaseOrder.create({
      data: {
        businessId,
        supplier,
        status,
        total,
        notes,
      },
    });

    await createAuditLog({
      businessId,
      userId,
      action: "CREATE",
      entityType: "PURCHASE_ORDER",
      entityId: purchase.id,
      title: "U krijua porosia e furnizimit",
      description: `Porosia për ${supplier} u krijua me status ${status}.`,
      newValues: { supplier, status, total, notes },
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
      message: getErrorMessage(error, "Porosia nuk mund të krijohej."),
    };
  }
}

export async function updatePurchaseOrder(formData) {
  try {
    const { businessId, userId } = await requireBusinessActionPermission(
      PERMISSIONS.PURCHASES_UPDATE,
    );

    const validationResult = validateFormData(
      updatePurchaseOrderSchema,
      formData,
    );

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Porosia nuk mund të përditësohej.",
        ),
      };
    }

    const { id, supplier, status, total, notes } = validationResult.data;

    const purchase = await db.purchaseOrder.findFirst({
      where: {
        id,
        businessId,
      },

      select: {
        id: true,
        supplier: true,
        status: true,
        total: true,
        notes: true,
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
        notes,
      },
    });

    await createAuditLog({
      businessId,
      userId,
      action: "UPDATE",
      entityType: "PURCHASE_ORDER",
      entityId: purchase.id,
      title: "U përditësua porosia e furnizimit",
      oldValues: purchase,
      newValues: { supplier, status, total, notes },
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
      message: getErrorMessage(error, "Porosia nuk mund të përditësohej."),
    };
  }
}

export async function updatePurchaseStatus(purchaseId, status) {
  try {
    const { businessId, userId } = await requireBusinessActionPermission(
      PERMISSIONS.PURCHASES_UPDATE,
    );

    const validationResult = validateObject(updatePurchaseStatusSchema, {
      purchaseId,
      status,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Statusi i zgjedhur nuk është i vlefshëm.",
        ),
      };
    }

    const { purchaseId: validatedPurchaseId, status: validatedStatus } =
      validationResult.data;

    const purchase = await db.purchaseOrder.findFirst({
      where: {
        id: validatedPurchaseId,
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
        status: validatedStatus,
      },
    });

    await createAuditLog({
      businessId,
      userId,
      action: "STATUS_CHANGE",
      entityType: "PURCHASE_ORDER",
      entityId: purchase.id,
      title: "U ndryshua statusi i porosisë",
      oldValues: { status: purchase.status },
      newValues: { status: validatedStatus },
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
      message: getErrorMessage(error, "Statusi nuk mund të përditësohej."),
    };
  }
}

export async function deletePurchaseOrder(purchaseId) {
  try {
    const { businessId, userId } = await requireBusinessActionPermission(
      PERMISSIONS.PURCHASES_DELETE,
    );

    const validationResult = validateObject(deletePurchaseOrderSchema, {
      purchaseId,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "ID e porosisë mungon.",
        ),
      };
    }

    const validatedPurchaseId = validationResult.data.purchaseId;

    const purchase = await db.purchaseOrder.findFirst({
      where: {
        id: validatedPurchaseId,
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

      const deletedPurchase = await transaction.purchaseOrder.deleteMany({
        where: {
          id: purchase.id,
          businessId,

          status: {
            not: "RECEIVED",
          },
        },
      });

      if (deletedPurchase.count !== 1) {
        throw createActionError(
          "Porosia është ndryshuar ose është marrë ndërkohë në magazinë.",
        );
      }
    });

    await createAuditLog({
      businessId,
      userId,
      action: "DELETE",
      entityType: "PURCHASE_ORDER",
      entityId: purchase.id,
      title: "U fshi porosia e furnizimit",
      oldValues: purchase,
      metadata: { deletedItems: purchase._count.items },
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
      message: getErrorMessage(error, "Porosia nuk mund të fshihej."),
    };
  }
}
