"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth-guard";
import { updateBusinessStatus } from "@/services/admin/business-service";

export async function changeBusinessStatusAction(businessId, isActive) {
  await requirePlatformAdmin();

  if (!businessId || typeof isActive !== "boolean") {
    throw new Error("Të dhënat për ndryshimin e statusit janë të pavlefshme.");
  }

  await updateBusinessStatus({
    businessId,
    isActive,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/businesses");
  revalidatePath(`/admin/businesses/${businessId}`);

  return {
    success: true,
  };
}
