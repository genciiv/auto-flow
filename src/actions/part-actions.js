"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

function refreshInventoryPages() {
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/purchases");
  revalidatePath("/dashboard");
}

function parseNonNegativeNumber(value, fieldName) {
  const number = value === null || value === "" ? 0 : Number(value);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${fieldName} duhet të jetë numër pozitiv.`);
  }

  return number;
}

export async function createPart(formData) {
  try {
    const code = formData.get("code")?.trim();
    const name = formData.get("name")?.trim();
    const category = formData.get("category")?.trim();
    const supplier = formData.get("supplier")?.trim();

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

    if (code) {
      const existingPart = await db.part.findFirst({
        where: {
          businessId: business.id,
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
        businessId: business.id,
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
      message: error.message || "Pjesa nuk mund të krijohej.",
    };
  }
}

export async function updatePart(formData) {
  try {
    const id = formData.get("id");
    const code = formData.get("code")?.trim();
    const name = formData.get("name")?.trim();
    const category = formData.get("category")?.trim();
    const supplier = formData.get("supplier")?.trim();

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

    const part = await db.part.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        businessId: true,
      },
    });

    if (!part) {
      return {
        success: false,
        message: "Pjesa nuk u gjet.",
      };
    }

    if (code) {
      const duplicatePart = await db.part.findFirst({
        where: {
          businessId: part.businessId,
          code,
          NOT: {
            id,
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
        id,
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
      message: error.message || "Pjesa nuk mund të përditësohej.",
    };
  }
}

export async function deletePart(partId) {
  try {
    if (!partId) {
      return {
        success: false,
        message: "ID e pjesës mungon.",
      };
    }

    const part = await db.part.findUnique({
      where: {
        id: partId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!part) {
      return {
        success: false,
        message: "Pjesa nuk u gjet.",
      };
    }

    const [serviceUsageCount, purchaseUsageCount, movementCount] =
      await Promise.all([
        db.serviceRecordPart.count({
          where: {
            partId,
          },
        }),

        db.purchaseOrderItem.count({
          where: {
            partId,
          },
        }),

        db.stockMovement.count({
          where: {
            partId,
          },
        }),
      ]);

    if (serviceUsageCount > 0) {
      return {
        success: false,
        message:
          "Pjesa nuk mund të fshihet sepse është përdorur në një shërbim.",
      };
    }

    if (purchaseUsageCount > 0) {
      return {
        success: false,
        message:
          "Pjesa nuk mund të fshihet sepse është përdorur në një porosi blerjeje.",
      };
    }

    if (movementCount > 0) {
      return {
        success: false,
        message:
          "Pjesa nuk mund të fshihet sepse ka historik lëvizjesh në magazinë.",
      };
    }

    await db.part.delete({
      where: {
        id: partId,
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
      message:
        "Pjesa nuk mund të fshihet sepse është e lidhur me të dhëna të tjera.",
    };
  }
}
