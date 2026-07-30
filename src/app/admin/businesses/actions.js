"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth-guard";
import { getFirstValidationMessage, validateObject } from "@/lib/validation";
import { changeBusinessStatusSchema } from "@/schemas/admin-business-schema";
import {
  getBusinessById,
  updateBusinessStatus,
} from "@/services/admin/business-service";

import { createActionError } from "@/lib/errors";
function revalidateBusinessPages(businessId) {
  revalidatePath("/admin");
  revalidatePath("/admin/businesses");
  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/payments");
}

export async function changeBusinessStatusAction(businessId, isActive) {
  await requirePlatformAdmin();

  const validationResult = validateObject(changeBusinessStatusSchema, {
    businessId,
    isActive,
  });

  if (!validationResult.success) {
    throw createActionError(
      getFirstValidationMessage(
        validationResult.error,
        "Të dhënat për ndryshimin e statusit janë të pavlefshme.",
      ),
    );
  }

  const { businessId: validatedBusinessId, isActive: validatedStatus } =
    validationResult.data;

  const existingBusiness = await getBusinessById(validatedBusinessId);

  if (!existingBusiness) {
    throw createActionError("Biznesi nuk u gjet.");
  }

  if (existingBusiness.isActive === validatedStatus) {
    revalidateBusinessPages(validatedBusinessId);

    return {
      success: true,
      isActive: existingBusiness.isActive,
      message: existingBusiness.isActive
        ? "Biznesi është tashmë aktiv."
        : "Biznesi është tashmë joaktiv.",
    };
  }

  const business = await updateBusinessStatus({
    businessId: validatedBusinessId,
    isActive: validatedStatus,
  });

  revalidateBusinessPages(validatedBusinessId);

  return {
    success: true,
    isActive: business.isActive,
    message: business.isActive
      ? "Biznesi u aktivizua me sukses."
      : "Biznesi u çaktivizua me sukses.",
  };
}
