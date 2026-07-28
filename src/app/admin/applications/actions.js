"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth-guard";
import { authTokenService } from "@/lib/auth-tokens";
import { AUTH_TOKEN_TYPES } from "@/lib/auth-tokens/auth-token-types";
import {
  accountActivationTemplate,
  businessApprovedTemplate,
  EMAIL_CONFIG,
  sendEmail,
} from "@/lib/email";
import {
  approveApplication,
  getApplicationActivationDetails,
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

function formatRetryTime(seconds) {
  if (seconds < 60) {
    return `${seconds} sekonda`;
  }

  const minutes = Math.ceil(seconds / 60);

  return minutes === 1 ? "1 minutë" : `${minutes} minuta`;
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
  let createdToken = null;

  try {
    if (result.activationRequired) {
      createdToken = await authTokenService.createAccountActivationToken(
        result.ownerUser.id,
      );

      const activationUrl =
        `${EMAIL_CONFIG.appUrl}/activate-account?token=` +
        encodeURIComponent(createdToken);

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

    if (createdToken) {
      try {
        await authTokenService.revokePlainToken(
          createdToken,
          AUTH_TOKEN_TYPES.ACCOUNT_ACTIVATION,
        );
      } catch (revokeError) {
        console.error(
          "Token-i i aktivizimit nuk mund të revokohej:",
          revokeError,
        );
      }
    }

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

export async function resendActivationEmailAction(applicationId) {
  await requirePlatformAdmin();

  if (!applicationId) {
    throw new Error("ID-ja e aplikimit mungon.");
  }

  const result = await getApplicationActivationDetails(applicationId);

  if (!result.ownerUser.isActive) {
    throw new Error("Llogaria e pronarit është çaktivizuar.");
  }

  if (!result.activationRequired) {
    throw new Error(
      "Llogaria e pronarit është aktivizuar dhe nuk ka nevojë për email të ri.",
    );
  }

  const resendCheck = await authTokenService.canResendAccountActivation(
    result.ownerUser.id,
  );

  if (!resendCheck.allowed) {
    throw new Error(
      `Prit ${formatRetryTime(
        resendCheck.retryAfterSeconds,
      )} para se ta ridërgosh përsëri.`,
    );
  }

  let token = null;

  try {
    token = await authTokenService.createAccountActivationToken(
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
  } catch (error) {
    console.error("Ridërgimi i email-it të aktivizimit dështoi:", error);

    if (token) {
      try {
        await authTokenService.revokePlainToken(
          token,
          AUTH_TOKEN_TYPES.ACCOUNT_ACTIVATION,
        );
      } catch (revokeError) {
        console.error(
          "Token-i i padërguar nuk mund të revokohej:",
          revokeError,
        );
      }
    }

    throw new Error(
      "Email-i i aktivizimit nuk mund të dërgohej. Provo përsëri.",
    );
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);

  return {
    success: true,
    ownerEmail: result.ownerUser.email,
    businessName: result.business.name,
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
