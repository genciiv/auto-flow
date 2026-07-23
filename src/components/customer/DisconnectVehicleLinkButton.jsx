"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireBusinessContext } from "@/lib/business-context";

async function getBusinessClaim(claimId, businessId) {
  return db.vehicleClaim.findFirst({
    where: {
      id: claimId,
      vehicle: {
        businessId,
      },
    },
    select: {
      id: true,
      status: true,
      vehicleId: true,
      customerVehicleId: true,
    },
  });
}

function refreshPaths(customerVehicleId) {
  revalidatePath("/dashboard/vehicle-claims");
  revalidatePath("/customer/dashboard");
  revalidatePath("/customer/services");
  revalidatePath("/customer/vehicles");
  revalidatePath(`/customer/vehicles/${customerVehicleId}`);
  revalidatePath(`/customer/vehicles/${customerVehicleId}/claim`);
}

export async function approveVehicleClaim(claimId) {
  const { businessId } = await requireBusinessContext();

  if (!claimId) {
    return {
      success: false,
      message: "Kërkesa nuk u gjet.",
    };
  }

  const claim = await getBusinessClaim(claimId, businessId);

  if (!claim) {
    return {
      success: false,
      message: "Kjo kërkesë nuk ekziston ose nuk i përket biznesit tuaj.",
    };
  }

  if (claim.status !== "PENDING") {
    return {
      success: false,
      message:
        claim.status === "APPROVED"
          ? "Kjo kërkesë është aprovuar më parë."
          : "Vetëm kërkesat në pritje mund të aprovohen.",
    };
  }

  await db.$transaction(async (tx) => {
    await tx.customerVehicleLink.upsert({
      where: {
        customerVehicleId_vehicleId: {
          customerVehicleId: claim.customerVehicleId,
          vehicleId: claim.vehicleId,
        },
      },
      update: {
        isActive: true,
        linkedAt: new Date(),
        unlinkedAt: null,
      },
      create: {
        customerVehicleId: claim.customerVehicleId,
        vehicleId: claim.vehicleId,
        isActive: true,
      },
    });

    await tx.vehicleClaim.update({
      where: {
        id: claim.id,
      },
      data: {
        status: "APPROVED",
        rejectionReason: null,
        reviewedAt: new Date(),
      },
    });
  });

  refreshPaths(claim.customerVehicleId);

  return {
    success: true,
    message: "Kërkesa u aprovua dhe automjeti u lidh me servisin.",
  };
}

export async function rejectVehicleClaim(claimId, formData) {
  const { businessId } = await requireBusinessContext();

  if (!claimId) {
    return {
      success: false,
      message: "Kërkesa nuk u gjet.",
    };
  }

  const rejectionReason = String(formData.get("rejectionReason") || "").trim();

  if (rejectionReason.length < 3) {
    return {
      success: false,
      message: "Arsyeja e refuzimit duhet të ketë të paktën 3 karaktere.",
    };
  }

  if (rejectionReason.length > 500) {
    return {
      success: false,
      message: "Arsyeja e refuzimit nuk duhet të kalojë 500 karaktere.",
    };
  }

  const claim = await getBusinessClaim(claimId, businessId);

  if (!claim) {
    return {
      success: false,
      message: "Kjo kërkesë nuk ekziston ose nuk i përket biznesit tuaj.",
    };
  }

  if (claim.status !== "PENDING") {
    return {
      success: false,
      message: "Vetëm kërkesat në pritje mund të refuzohen.",
    };
  }

  await db.vehicleClaim.update({
    where: {
      id: claim.id,
    },
    data: {
      status: "REJECTED",
      rejectionReason,
      reviewedAt: new Date(),
    },
  });

  refreshPaths(claim.customerVehicleId);

  return {
    success: true,
    message: "Kërkesa u refuzua.",
  };
}
