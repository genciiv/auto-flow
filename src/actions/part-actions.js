"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";

function refreshInventoryPages() {
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/purchases");
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

    const code = getFormString(formData, "code").toUpperCase();

    const name = getFormString(formData, "name");
    const category = getFormString(formData, "category");
    const supplier = getFormString(formData, "supplier");

    if (!name) {
      return {
        success: false,
        message: "Emri i pjesës është i detyrueshëm.",
      };
    }

    const stock = parseNonNegativeNumber(formData.get("stock"), "Stoku");

    const minStock = parseNonNegativeNumber(
      formData.get("minStock"),
      "Minimumi i stokut",
    );

    const buyPrice = parseNonNegativeNumber(
      formData.get("buyPrice"),
      "Çmimi i blerjes",
    );

    const sellPrice = parseNonNegativeNumber(
      formData.get("sellPrice"),
      "Çmimi i shitjes",
    );

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
        code: code || null,
        name,
        category: category || null,
        supplier: supplier || null,
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

    const id = getFormString(formData, "id");

    const code = getFormString(formData, "code").toUpperCase();

    const name = getFormString(formData, "name");
    const category = getFormString(formData, "category");
    const supplier = getFormString(formData, "supplier");

    if (!id) {
      return {
        success: false,
        message: "ID e pjesës mungon.",
      };
    }

    if (!name) {
      return {
        success: false,
        message: "Emri i pjesës është i detyrueshëm.",
      };
    }

    const stock = parseNonNegativeNumber(formData.get("stock"), "Stoku");

    const minStock = parseNonNegativeNumber(
      formData.get("minStock"),
      "Minimumi i stokut",
    );

    const buyPrice = parseNonNegativeNumber(
      formData.get("buyPrice"),
      "Çmimi i blerjes",
    );

    const sellPrice = parseNonNegativeNumber(
      formData.get("sellPrice"),
      "Çmimi i shitjes",
    );

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
        code: code || null,
        name,
        category: category || null,
        supplier: supplier || null,
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

    if (!partId || typeof partId !== "string") {
      return {
        success: false,
        message: "ID e pjesës mungon.",
      };
    }

    const part = await db.part.findFirst({
      where: {
        id: partId,
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
