"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth-guard";
import {
  approveApplication,
  rejectApplication,
} from "@/services/admin/application-service";

function getAdminUserId(adminResult) {
  return (
    adminResult?.id ||
    adminResult?.user?.id ||
    adminResult?.session?.user?.id ||
    null
  );
}

export async function approveApplicationAction(applicationId) {
  const admin = await requirePlatformAdmin();

  if (!applicationId) {
    throw new Error("ID-ja e aplikimit mungon.");
  }

  const result = await approveApplication({
    applicationId,
    reviewedById: getAdminUserId(admin),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/admin/businesses");

  return {
    success: true,
    businessId: result.business.id,
    ownerEmail: result.ownerUser.email,
    temporaryPassword: result.temporaryPassword,
  };
}

export async function rejectApplicationAction(applicationId, rejectionReason) {
  const admin = await requirePlatformAdmin();

  if (!applicationId) {
    throw new Error("ID-ja e aplikimit mungon.");
  }

  if (!rejectionReason || rejectionReason.trim().length < 3) {
    throw new Error("Vendos një arsye për refuzimin.");
  }

  await rejectApplication({
    applicationId,
    reviewedById: getAdminUserId(admin),
    rejectionReason,
  });

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);

  return {
    success: true,
  };
}
