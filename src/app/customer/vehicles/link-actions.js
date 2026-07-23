"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireCustomerContext } from "@/lib/customer-context";

export async function disconnectCustomerVehicleLink(linkId) {
  const { profileId } = await requireCustomerContext();

  if (!linkId) {
    return {
      success: false,
      message: "Lidhja nuk u gjet.",
    };
  }

  const link = await db.customerVehicleLink.findFirst({
    where: {
      id: linkId,
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

  revalidatePath("/customer/dashboard");
  revalidatePath("/customer/services");
  revalidatePath("/customer/vehicles");
  revalidatePath(`/customer/vehicles/${link.customerVehicleId}`);
  revalidatePath(`/customer/vehicles/${link.customerVehicleId}/claim`);

  return {
    success: true,
    message: "Automjeti u shkëput nga servisi.",
  };
}
