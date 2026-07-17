"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

const VALID_STATUSES = ["PENDING", "ORDERED", "CANCELLED"];

function refreshPurchasePages() {
  revalidatePath("/dashboard/purchases");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
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
    const supplier = formData.get("supplier")?.trim();
    const status = formData.get("status") || "PENDING";
    const notes = formData.get("notes")?.trim();
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

    const business = await db.business.findFirst({
      select: {
        id: true,
      },
    });

    if (!business) {
      return {
        success: false,
        message: "Nuk u gjet biznes aktiv.",
      };
    }

    await db.purchaseOrder.create({
      data: {
        businessId: business.id,
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
      message: error.message || "Porosia nuk mund të krijohej.",
    };
  }
}

export async function updatePurchaseOrder(formData) {
  try {
    const id = formData.get("id");
    const supplier = formData.get("supplier")?.trim();
    const status = formData.get("status");
    const notes = formData.get("notes")?.trim();
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

    const purchase = await db.purchaseOrder.findUnique({
      where: {
        id,
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
        id,
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
      message: error.message || "Porosia nuk mund të përditësohej.",
    };
  }
}

export async function updatePurchaseStatus(purchaseId, status) {
  try {
    if (!purchaseId) {
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

    const purchase = await db.purchaseOrder.findUnique({
      where: {
        id: purchaseId,
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
        id: purchaseId,
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
    if (!purchaseId) {
      return {
        success: false,
        message: "ID e porosisë mungon.",
      };
    }

    const purchase = await db.purchaseOrder.findUnique({
      where: {
        id: purchaseId,
      },
      include: {
        items: true,
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

    if (purchase.items.length > 0) {
      return {
        success: false,
        message:
          "Porosia nuk mund të fshihet sepse përmban artikuj. Hiqi fillimisht artikujt nga porosia.",
      };
    }

    await db.purchaseOrder.delete({
      where: {
        id: purchaseId,
      },
    });

    refreshPurchasePages();

    return {
      success: true,
      message: "Porosia u fshi me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë fshirjes së porosisë:", error);

    return {
      success: false,
      message:
        "Porosia nuk mund të fshihet sepse është e lidhur me të dhëna të tjera.",
    };
  }
}
