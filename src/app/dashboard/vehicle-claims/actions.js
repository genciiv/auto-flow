"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";

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

function revalidateClaimPaths(claim) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/vehicle-claims");
  revalidatePath("/customer/dashboard");
  revalidatePath("/customer/services");
  revalidatePath("/customer/vehicles");
  revalidatePath(`/customer/vehicles/${claim.customerVehicleId}`);
  revalidatePath(`/customer/vehicles/${claim.customerVehicleId}/claim`);
}

export async function approveVehicleClaim(
  claimId,
  previousState = null,
  formData = null,
) {
  try {
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

    await db.$transaction(async (tx) => {
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
    });

    revalidateClaimPaths(claim);

    return {
      success: true,
      message: "Kërkesa u aprovua dhe automjeti u lidh me klientin.",
    };
  } catch (error) {
    console.error("Gabim gjatë aprovimit të kërkesës:", error);

    return {
      success: false,
      message:
        error?.message || "Kërkesa nuk mund të aprovohej. Provo përsëri.",
    };
  }
}

export async function rejectVehicleClaim(claimId, formData) {
  try {
    const { businessId } = await requireBusinessContext();

    if (!claimId) {
      return {
        success: false,
        message: "Kërkesa nuk u gjet.",
      };
    }

    const rejectionReason = String(
      formData?.get("rejectionReason") || "",
    ).trim();

    if (!rejectionReason) {
      return {
        success: false,
        message: "Shkruaj arsyen e refuzimit.",
      };
    }

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

    await db.$transaction(async (tx) => {
      await tx.vehicleClaim.update({
        where: {
          id: claim.id,
        },
        data: {
          status: "REJECTED",
          rejectionReason,
          reviewedAt: new Date(),
        },
      });

      await tx.customerVehicleLink.updateMany({
        where: {
          customerVehicleId: claim.customerVehicleId,
          vehicleId: claim.vehicleId,
          isActive: true,
        },
        data: {
          isActive: false,
          unlinkedAt: new Date(),
        },
      });
    });

    revalidateClaimPaths(claim);

    return {
      success: true,
      message: "Kërkesa u refuzua.",
    };
  } catch (error) {
    console.error("Gabim gjatë refuzimit të kërkesës:", error);

    return {
      success: false,
      message:
        error?.message || "Kërkesa nuk mund të refuzohej. Provo përsëri.",
    };
  }
}
