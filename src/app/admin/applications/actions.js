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
import { getFirstValidationMessage, validateObject } from "@/lib/validation";
import {
  applicationIdObjectSchema,
  rejectAdminApplicationSchema,
} from "@/schemas/admin-application-schema";
import {
  approveApplication,
  getApplicationActivationDetails,
  rejectApplication,
} from "@/services/admin/application-service";

function getAdminUserId(adminResult) {
  return (
    adminResult?.user?.id ||
    adminResult?.id ||
    adminResult?.session?.user?.id ||
    null
  );
}

function formatRetryTime(seconds) {
  const normalizedSeconds = Math.max(1, Number(seconds) || 1);

  if (normalizedSeconds < 60) {
    return `${normalizedSeconds} sekonda`;
  }

  const minutes = Math.ceil(normalizedSeconds / 60);

  return minutes === 1 ? "1 minutë" : `${minutes} minuta`;
}

function validateApplicationId(applicationId) {
  const validationResult = validateObject(applicationIdObjectSchema, {
    applicationId,
  });

  if (!validationResult.success) {
    throw new Error(
      getFirstValidationMessage(
        validationResult.error,
        "ID-ja e aplikimit mungon.",
      ),
    );
  }

  return validationResult.data.applicationId;
}

function revalidateApplicationPages(applicationId, businessId = null) {
  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/admin/businesses");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/activity-logs");

  if (businessId) {
    revalidatePath(`/admin/businesses/${businessId}`);
  }
}

async function revokeActivationToken(plainToken, errorContext) {
  if (!plainToken) {
    return;
  }

  try {
    await authTokenService.revokePlainToken(
      plainToken,
      AUTH_TOKEN_TYPES.ACCOUNT_ACTIVATION,
    );
  } catch (revokeError) {
    console.error(errorContext, revokeError);
  }
}

export async function approveApplicationAction(applicationId) {
  const admin = await requirePlatformAdmin();

  const validatedApplicationId = validateApplicationId(applicationId);

  const result = await approveApplication({
    applicationId: validatedApplicationId,
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

    await revokeActivationToken(
      createdToken,
      "Token-i i aktivizimit nuk mund të revokohej:",
    );

    emailError = "Biznesi u krijua, por email-i nuk u dërgua.";
  }

  revalidateApplicationPages(validatedApplicationId, result.business.id);

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

  const validatedApplicationId = validateApplicationId(applicationId);

  const result = await getApplicationActivationDetails(validatedApplicationId);

  if (!result.ownerUser.isActive) {
    throw new Error("Llogaria e pronarit është çaktivizuar.");
  }

  if (!result.business.isActive) {
    throw new Error("Biznesi i aprovuar është i çaktivizuar.");
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

    await revokeActivationToken(
      token,
      "Token-i i padërguar nuk mund të revokohej:",
    );

    throw new Error(
      "Email-i i aktivizimit nuk mund të dërgohej. Provo përsëri.",
    );
  }

  revalidateApplicationPages(validatedApplicationId, result.business.id);

  return {
    success: true,
    ownerEmail: result.ownerUser.email,
    businessName: result.business.name,
  };
}

export async function rejectApplicationAction(applicationId, rejectionReason) {
  const admin = await requirePlatformAdmin();

  const validationResult = validateObject(rejectAdminApplicationSchema, {
    applicationId,
    rejectionReason,
  });

  if (!validationResult.success) {
    throw new Error(
      getFirstValidationMessage(
        validationResult.error,
        "Të dhënat e refuzimit nuk janë të vlefshme.",
      ),
    );
  }

  const {
    applicationId: validatedApplicationId,
    rejectionReason: validatedReason,
  } = validationResult.data;

  await rejectApplication({
    applicationId: validatedApplicationId,
    reviewedById: getAdminUserId(admin),
    rejectionReason: validatedReason,
  });

  revalidateApplicationPages(validatedApplicationId);

  return {
    success: true,
    message: "Aplikimi u refuzua me sukses.",
  };
}
