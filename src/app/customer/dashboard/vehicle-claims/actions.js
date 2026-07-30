"use server";

import { revalidatePath } from "next/cache";

import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";
import { getFirstValidationMessage, validateObject } from "@/lib/validation";
import {
  approveBusinessVehicleClaimSchema,
  rejectBusinessVehicleClaimSchema,
} from "@/schemas/business-vehicle-claim-schema";

import { createActionError } from "@/lib/errors";
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
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/vehicle-claims");

  revalidatePath("/customer/dashboard");
  revalidatePath("/customer/services");
  revalidatePath("/customer/vehicles");

  revalidatePath(`/customer/vehicles/${customerVehicleId}`);

  revalidatePath(`/customer/vehicles/${customerVehicleId}/claim`);
}

function getErrorMessage(error, fallbackMessage) {
  return error instanceof Error ? error.message : fallbackMessage;
}

export async function approveVehicleClaim(claimId) {
  try {
    const { businessId } = await requireBusinessContext();

    const validationResult = validateObject(approveBusinessVehicleClaimSchema, {
      claimId,
    });

    if (!validationResult.success) {
      return {
        success: false,

        message: getFirstValidationMessage(
          validationResult.error,
          "Kërkesa nuk u gjet.",
        ),
      };
    }

    const validatedClaimId = validationResult.data.claimId;

    const claim = await getBusinessClaim(validatedClaimId, businessId);

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

    const reviewedAt = new Date();

    await db.$transaction(async (transaction) => {
      const updatedClaim = await transaction.vehicleClaim.updateMany({
        where: {
          id: claim.id,
          status: "PENDING",
        },

        data: {
          status: "APPROVED",
          rejectionReason: null,
          reviewedAt,
        },
      });

      if (updatedClaim.count !== 1) {
        throw createActionError(
          "Kërkesa është përpunuar ndërkohë nga një përdorues tjetër.",
        );
      }

      await transaction.customerVehicleLink.upsert({
        where: {
          customerVehicleId_vehicleId: {
            customerVehicleId: claim.customerVehicleId,

            vehicleId: claim.vehicleId,
          },
        },

        update: {
          isActive: true,
          linkedAt: reviewedAt,
          unlinkedAt: null,
        },

        create: {
          customerVehicleId: claim.customerVehicleId,

          vehicleId: claim.vehicleId,
          isActive: true,
          linkedAt: reviewedAt,
        },
      });
    });

    refreshPaths(claim.customerVehicleId);

    return {
      success: true,
      message: "Kërkesa u aprovua dhe automjeti u lidh me servisin.",
    };
  } catch (error) {
    console.error("Gabim gjatë aprovimit të kërkesës:", error);

    return {
      success: false,

      message: getErrorMessage(
        error,
        "Kërkesa nuk mund të aprovohej. Provo përsëri.",
      ),
    };
  }
}

export async function rejectVehicleClaim(claimId, formData) {
  try {
    const { businessId } = await requireBusinessContext();

    const validationResult = validateObject(rejectBusinessVehicleClaimSchema, {
      claimId,

      rejectionReason:
        formData instanceof FormData ? formData.get("rejectionReason") : "",
    });

    if (!validationResult.success) {
      return {
        success: false,

        message: getFirstValidationMessage(
          validationResult.error,
          "Kontrollo të dhënat e refuzimit.",
        ),
      };
    }

    const { claimId: validatedClaimId, rejectionReason } =
      validationResult.data;

    const claim = await getBusinessClaim(validatedClaimId, businessId);

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
          claim.status === "REJECTED"
            ? "Kjo kërkesë është refuzuar më parë."
            : "Vetëm kërkesat në pritje mund të refuzohen.",
      };
    }

    const reviewedAt = new Date();

    await db.$transaction(async (transaction) => {
      const updatedClaim = await transaction.vehicleClaim.updateMany({
        where: {
          id: claim.id,
          status: "PENDING",
        },

        data: {
          status: "REJECTED",
          rejectionReason,
          reviewedAt,
        },
      });

      if (updatedClaim.count !== 1) {
        throw createActionError(
          "Kërkesa është përpunuar ndërkohë nga një përdorues tjetër.",
        );
      }

      await transaction.customerVehicleLink.updateMany({
        where: {
          customerVehicleId: claim.customerVehicleId,

          vehicleId: claim.vehicleId,
          isActive: true,
        },

        data: {
          isActive: false,
          unlinkedAt: reviewedAt,
        },
      });
    });

    refreshPaths(claim.customerVehicleId);

    return {
      success: true,
      message: "Kërkesa u refuzua.",
    };
  } catch (error) {
    console.error("Gabim gjatë refuzimit të kërkesës:", error);

    return {
      success: false,

      message: getErrorMessage(
        error,
        "Kërkesa nuk mund të refuzohej. Provo përsëri.",
      ),
    };
  }
}
