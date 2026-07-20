"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";

function refreshServicePartPages(serviceId = null) {
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");

  if (serviceId) {
    revalidatePath(`/dashboard/services/${serviceId}`);
  }
}

function getRequiredString(formData, fieldName) {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function parsePositiveInteger(value, fieldName) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 1) {
    throw new Error(
      `${fieldName} duhet të jetë numër i plotë më i madh se zero.`,
    );
  }

  return number;
}

export async function addPartToService(formData) {
  try {
    const { businessId } = await requireBusinessContext();

    const serviceId = getRequiredString(formData, "serviceId");
    const partId = getRequiredString(formData, "partId");

    const quantity = parsePositiveInteger(
      formData.get("quantity") || 1,
      "Sasia",
    );

    if (!serviceId || !partId) {
      return {
        success: false,
        message: "Shërbimi, pjesa dhe sasia janë të detyrueshme.",
      };
    }

    await db.$transaction(async (transaction) => {
      const service = await transaction.serviceRecord.findFirst({
        where: {
          id: serviceId,
          businessId,
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (!service) {
        throw new Error("Shërbimi nuk u gjet.");
      }

      if (service.status === "COMPLETED") {
        throw new Error(
          "Nuk mund të shtohen pjesë në një shërbim të përfunduar.",
        );
      }

      if (service.status === "CANCELLED") {
        throw new Error("Nuk mund të shtohen pjesë në një shërbim të anuluar.");
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
        },
      });

      if (!part) {
        throw new Error("Pjesa nuk u gjet.");
      }

      if (Number(part.stock) < quantity) {
        throw new Error(
          `Nuk ka stok të mjaftueshëm për pjesën "${part.name}".`,
        );
      }

      const unitPrice = Number(part.sellPrice || 0);

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new Error("Çmimi i shitjes së pjesës nuk është i vlefshëm.");
      }

      const total = quantity * unitPrice;

      const stockUpdate = await transaction.part.updateMany({
        where: {
          id: part.id,
          businessId,
          stock: {
            gte: quantity,
          },
        },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });

      if (stockUpdate.count !== 1) {
        throw new Error("Stoku ka ndryshuar. Nuk ka më sasi të mjaftueshme.");
      }

      await transaction.servicePartUsage.create({
        data: {
          serviceId: service.id,
          partId: part.id,
          quantity,
          unitPrice,
          total,
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
    });

    refreshServicePartPages(serviceId);

    return {
      success: true,
      message: "Pjesa iu shtua shërbimit me sukses.",
    };
  } catch (error) {
    console.error("Gabim gjatë shtimit të pjesës në shërbim:", error);

    return {
      success: false,
      message: error?.message || "Pjesa nuk mund t'i shtohej shërbimit.",
    };
  }
}
