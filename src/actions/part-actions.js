"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";
import {
  getFirstValidationMessage,
  validateFormData,
  validateObject,
} from "@/lib/validation";
import {
  createPartSchema,
  deletePartSchema,
  updatePartSchema,
} from "@/schemas/inventory-schema";

function refreshInventoryPages() {
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/purchases");
  revalidatePath("/dashboard");
}

function getErrorMessage(error, fallbackMessage) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export async function createPart(formData) {
  try {
    const { businessId } = await requireBusinessActionPermission(
      PERMISSIONS.INVENTORY_CREATE,
    );

    const validationResult = validateFormData(createPartSchema, formData);

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Pjesa nuk mund të krijohej.",
        ),
      };
    }

    const {
      code,
      name,
      category,
      supplier,
      stock,
      minStock,
      buyPrice,
      sellPrice,
    } = validationResult.data;

    if (stock > 0) {
      const stockContext = await requireBusinessActionPermission(
        PERMISSIONS.INVENTORY_MANAGE_STOCK,
      );

      if (stockContext.businessId !== businessId) {
        return {
          success: false,
          message: "Biznesi aktiv nuk përputhet me inventarin.",
        };
      }
    }

    if (code) {
      const existingPart = await db.part.findFirst({
        where: {
          businessId,
          code,
        },

        select: {
          id: true,
        },
      });

      if (existingPart) {
        return {
          success: false,
          message: "Ekziston një pjesë tjetër me këtë kod.",
        };
      }
    }

    await db.part.create({
      data: {
        businessId,
        code,
        name,
        category,
        supplier,
        stock,
        minStock,
        buyPrice,
        sellPrice,
      },
    });

    refreshInventoryPages();

    return {
      success: true,
      message: "Pjesa u shtua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë krijimit të pjesës:", error);

    return {
      success: false,
      message: getErrorMessage(error, "Pjesa nuk mund të krijohej."),
    };
  }
}

export async function updatePart(formData) {
  try {
    const { businessId } = await requireBusinessActionPermission(
      PERMISSIONS.INVENTORY_UPDATE,
    );

    const validationResult = validateFormData(updatePartSchema, formData);

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "Pjesa nuk mund të përditësohej.",
        ),
      };
    }

    const {
      id,
      code,
      name,
      category,
      supplier,
      stock,
      minStock,
      buyPrice,
      sellPrice,
    } = validationResult.data;

    const part = await db.part.findFirst({
      where: {
        id,
        businessId,
      },

      select: {
        id: true,
        stock: true,
      },
    });

    if (!part) {
      return {
        success: false,
        message: "Pjesa nuk u gjet.",
      };
    }

    const currentStock = Number(part.stock || 0);

    if (stock !== currentStock) {
      const stockContext = await requireBusinessActionPermission(
        PERMISSIONS.INVENTORY_MANAGE_STOCK,
      );

      if (stockContext.businessId !== businessId) {
        return {
          success: false,
          message: "Biznesi aktiv nuk përputhet me inventarin.",
        };
      }
    }

    if (code) {
      const duplicatePart = await db.part.findFirst({
        where: {
          businessId,
          code,

          NOT: {
            id: part.id,
          },
        },

        select: {
          id: true,
        },
      });

      if (duplicatePart) {
        return {
          success: false,
          message: "Ekziston një pjesë tjetër me këtë kod.",
        };
      }
    }

    await db.part.update({
      where: {
        id: part.id,
      },

      data: {
        code,
        name,
        category,
        supplier,
        stock,
        minStock,
        buyPrice,
        sellPrice,
      },
    });

    refreshInventoryPages();

    return {
      success: true,
      message: "Pjesa u përditësua me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë përditësimit të pjesës:", error);

    return {
      success: false,
      message: getErrorMessage(error, "Pjesa nuk mund të përditësohej."),
    };
  }
}

export async function deletePart(partId) {
  try {
    const { businessId } = await requireBusinessActionPermission(
      PERMISSIONS.INVENTORY_DELETE,
    );

    const validationResult = validateObject(deletePartSchema, {
      partId,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: getFirstValidationMessage(
          validationResult.error,
          "ID e pjesës mungon.",
        ),
      };
    }

    const validatedPartId = validationResult.data.partId;

    const part = await db.part.findFirst({
      where: {
        id: validatedPartId,
        businessId,
      },

      select: {
        id: true,
        name: true,
        code: true,
        stock: true,

        _count: {
          select: {
            serviceUsages: true,
          },
        },
      },
    });

    if (!part) {
      return {
        success: false,
        message: "Pjesa nuk u gjet.",
      };
    }

    if (part._count.serviceUsages > 0) {
      return {
        success: false,
        message:
          "Pjesa nuk mund të fshihet sepse është përdorur në një ose më shumë shërbime.",
      };
    }

    if (Number(part.stock || 0) > 0) {
      return {
        success: false,
        message:
          "Pjesa nuk mund të fshihet ndërkohë që ka stok. Vendose stokun në zero fillimisht.",
      };
    }

    await db.part.delete({
      where: {
        id: part.id,
      },
    });

    refreshInventoryPages();

    return {
      success: true,
      message: "Pjesa u fshi me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë fshirjes së pjesës:", error);

    return {
      success: false,
      message: getErrorMessage(error, "Pjesa nuk mund të fshihej."),
    };
  }
}
