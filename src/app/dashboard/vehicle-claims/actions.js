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

export async function approveVehicleClaim(claimId, previousState, formData) {
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

  if (claim.status === "APPROVED") {
    return {
      success: false,
      message: "Kjo kërkesë është aprovuar më parë.",
    };
  }

  await db.vehicleClaim.update({
    where: {
      id: claim.id,
    },
    data: {
      status: "APPROVED",
      rejectionReason: null,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/dashboard/vehicle-claims");
  revalidatePath("/customer/vehicles");
  revalidatePath(`/customer/vehicles/${claim.customerVehicleId}`);
  revalidatePath(`/customer/vehicles/${claim.customerVehicleId}/claim`);

  return {
    success: true,
    message: "Kërkesa u aprovua me sukses.",
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

  if (claim.status === "REJECTED") {
    return {
      success: false,
      message: "Kjo kërkesë është refuzuar më parë.",
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

  revalidatePath("/dashboard/vehicle-claims");
  revalidatePath("/customer/vehicles");
  revalidatePath(`/customer/vehicles/${claim.customerVehicleId}`);
  revalidatePath(`/customer/vehicles/${claim.customerVehicleId}/claim`);

  return {
    success: true,
    message: "Kërkesa u refuzua.",
  };
}
