"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth-guard";
import { authTokenService } from "@/lib/auth-tokens";
import {
  accountActivationTemplate,
  businessApprovedTemplate,
  EMAIL_CONFIG,
  sendEmail,
} from "@/lib/email";
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

  let activationEmailSent = false;
  let emailError = null;

  try {
    if (result.activationRequired) {
      const token = await authTokenService.createAccountActivationToken(
        result.ownerUser.id,
      );

      const activationUrl =
        `${EMAIL_CONFIG.appUrl}/activate-account?token=` +
        encodeURIComponent(token);

      const html = accountActivationTemplate({
        name: result.ownerUser.name,
        businessName: result.business.name,
        activationUrl,
      });

      await sendEmail({
        to: result.ownerUser.email,
        subject: "Aktivizo llogarinë tënde",
        html,
      });
    } else {
      const dashboardUrl = `${EMAIL_CONFIG.appUrl}/dashboard`;

      const html = businessApprovedTemplate({
        name: result.ownerUser.name,
        businessName: result.business.name,
        dashboardUrl,
      });

      await sendEmail({
        to: result.ownerUser.email,
        subject: "Biznesi yt u aprovua",
        html,
      });
    }

    activationEmailSent = true;
  } catch (error) {
    console.error(
      "Biznesi u krijua, por email-i i pronarit nuk u dërgua:",
      error,
    );

    emailError = "Biznesi u krijua, por email-i nuk u dërgua.";
  }

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/admin/businesses");

  return {
    success: true,
    businessId: result.business.id,
    ownerEmail: result.ownerUser.email,
    activationRequired: result.activationRequired,
    activationEmailSent,
    emailError,
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
