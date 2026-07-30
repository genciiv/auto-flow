"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireCustomerContext } from "@/lib/customer-context";
import { getFirstValidationMessage, validateObject } from "@/lib/validation";
import { disconnectVehicleLinkSchema } from "@/schemas/customer-vehicle-schema";

function revalidateCustomerVehicleLinkPages(customerVehicleId) {
  revalidatePath("/customer/dashboard");
  revalidatePath("/customer/services");
  revalidatePath("/customer/vehicles");

  revalidatePath(`/customer/vehicles/${customerVehicleId}`);

  revalidatePath(`/customer/vehicles/${customerVehicleId}/claim`);
}

export async function disconnectCustomerVehicleLink(linkId) {
  try {
    const { profileId } = await requireCustomerContext();

    const validationResult = validateObject(disconnectVehicleLinkSchema, {
      linkId,
    });

    if (!validationResult.success) {
      return {
        success: false,

        message: getFirstValidationMessage(
          validationResult.error,
          "Lidhja nuk u gjet.",
        ),
      };
    }

    const validatedLinkId = validationResult.data.linkId;

    const link = await db.customerVehicleLink.findFirst({
      where: {
        id: validatedLinkId,
        isActive: true,

        customerVehicle: {
          profileId,
        },
      },

      select: {
        id: true,
        customerVehicleId: true,
      },
    });

    if (!link) {
      return {
        success: false,

        message: "Kjo lidhje nuk ekziston ose është shkëputur më parë.",
      };
    }

    await db.customerVehicleLink.update({
      where: {
        id: link.id,
      },

      data: {
        isActive: false,
        unlinkedAt: new Date(),
      },
    });

    revalidateCustomerVehicleLinkPages(link.customerVehicleId);

    return {
      success: true,

      message: "Automjeti u shkëput nga servisi.",
    };
  } catch (error) {
    console.error("Gabim gjatë shkëputjes së automjetit:", error);

    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Automjeti nuk mund të shkëputej nga servisi.",
    };
  }
}
