"use server";

import { revalidatePath } from "next/cache";

import {
  actionFailure,
  actionSuccess,
  errorFailure,
  validationFailure,
} from "@/lib/action-result";
import { requirePlatformAdmin } from "@/lib/auth-guard";
import { authTokenService } from "@/lib/auth-tokens";
import { AUTH_TOKEN_TYPES } from "@/lib/auth-tokens/auth-token-types";
import {
  accountActivationTemplate,
  businessApprovedTemplate,
  EMAIL_CONFIG,
  sendEmail,
} from "@/lib/email";
import { ERROR_CODES, logServerError } from "@/lib/errors";
import { validateObject } from "@/lib/validation";
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
  return validateObject(applicationIdObjectSchema, {
    applicationId,
  });
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
  } catch (error) {
    logServerError(errorContext, error);
  }
}

function getServiceErrorCode(error, fallbackCode) {
  if (
    error?.code === "P2025" ||
    error?.message?.toLowerCase?.().includes("nuk u gjet")
  ) {
    return ERROR_CODES.APPLICATION_NOT_FOUND;
  }

  if (
    error?.message?.toLowerCase?.().includes("është aprovuar") ||
    error?.message?.toLowerCase?.().includes("është refuzuar") ||
    error?.message?.toLowerCase?.().includes("nuk është në pritje")
  ) {
    return ERROR_CODES.APPLICATION_ALREADY_PROCESSED;
  }

  return fallbackCode;
}

export async function approveApplicationAction(applicationId) {
  const idValidation = validateApplicationId(applicationId);

  if (!idValidation.success) {
    return validationFailure(idValidation.error, {
      message: "ID-ja e aplikimit nuk është e vlefshme.",
    });
  }

  const validatedApplicationId = idValidation.data.applicationId;

  try {
    const admin = await requirePlatformAdmin();

    const result = await approveApplication({
      applicationId: validatedApplicationId,

      reviewedById: getAdminUserId(admin),
    });

    let activationEmailSent = false;
    let emailError = null;
    let emailErrorCode = null;
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
      logServerError("approveApplicationAction:sendOwnerEmail", error, {
        applicationId: validatedApplicationId,

        businessId: result.business.id,

        ownerUserId: result.ownerUser.id,
      });

      await revokeActivationToken(
        createdToken,
        "approveApplicationAction:revokeActivationToken",
      );

      emailErrorCode = ERROR_CODES.ACTIVATION_EMAIL_SEND_FAILED;

      emailError = "Biznesi u krijua, por email-i nuk u dërgua.";
    }

    revalidateApplicationPages(validatedApplicationId, result.business.id);

    /*
     * Aprovimi konsiderohet sukses edhe kur email-i
     * dështon, sepse biznesi dhe përdoruesi janë krijuar.
     */
    return actionSuccess({
      code: emailErrorCode,

      message: activationEmailSent
        ? "Aplikimi u aprovua me sukses."
        : "Aplikimi u aprovua, por email-i nuk u dërgua.",

      data: {
        businessId: result.business.id,

        ownerEmail: result.ownerUser.email,

        activationRequired: result.activationRequired,

        activationEmailSent,
        emailError,
      },
    });
  } catch (error) {
    logServerError("approveApplicationAction", error, {
      applicationId: validatedApplicationId,
    });

    return errorFailure(error, {
      fallbackCode: getServiceErrorCode(
        error,
        ERROR_CODES.APPLICATION_APPROVAL_FAILED,
      ),

      fallbackMessage: "Aplikimi nuk mund të aprovohej. Provo përsëri.",
    });
  }
}

export async function resendActivationEmailAction(applicationId) {
  const idValidation = validateApplicationId(applicationId);

  if (!idValidation.success) {
    return validationFailure(idValidation.error, {
      message: "ID-ja e aplikimit nuk është e vlefshme.",
    });
  }

  const validatedApplicationId = idValidation.data.applicationId;

  try {
    await requirePlatformAdmin();

    const result = await getApplicationActivationDetails(
      validatedApplicationId,
    );

    if (!result.ownerUser.isActive) {
      return actionFailure({
        code: ERROR_CODES.ACCOUNT_INACTIVE,

        message: "Llogaria e pronarit është çaktivizuar.",
      });
    }

    if (!result.business.isActive) {
      return actionFailure({
        code: ERROR_CODES.BUSINESS_INACTIVE,

        message: "Biznesi i aprovuar është i çaktivizuar.",
      });
    }

    if (!result.activationRequired) {
      return actionFailure({
        code: ERROR_CODES.ACTIVATION_NOT_REQUIRED,

        message:
          "Llogaria e pronarit është aktivizuar dhe nuk ka nevojë për email të ri.",
      });
    }

    const resendCheck = await authTokenService.canResendAccountActivation(
      result.ownerUser.id,
    );

    if (!resendCheck.allowed) {
      return actionFailure({
        code: ERROR_CODES.ACTIVATION_EMAIL_RATE_LIMITED,

        message: `Prit ${formatRetryTime(
          resendCheck.retryAfterSeconds,
        )} para se ta ridërgosh përsëri.`,

        data: {
          retryAfterSeconds: resendCheck.retryAfterSeconds,
        },
      });
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
      logServerError("resendActivationEmailAction:sendEmail", error, {
        applicationId: validatedApplicationId,

        ownerUserId: result.ownerUser.id,
      });

      await revokeActivationToken(
        token,
        "resendActivationEmailAction:revokeActivationToken",
      );

      return actionFailure({
        code: ERROR_CODES.ACTIVATION_EMAIL_SEND_FAILED,

        message: "Email-i i aktivizimit nuk mund të dërgohej. Provo përsëri.",
      });
    }

    revalidateApplicationPages(validatedApplicationId, result.business.id);

    return actionSuccess({
      message: "Email-i i aktivizimit u ridërgua me sukses.",

      data: {
        ownerEmail: result.ownerUser.email,

        businessName: result.business.name,
      },
    });
  } catch (error) {
    logServerError("resendActivationEmailAction", error, {
      applicationId: validatedApplicationId,
    });

    return errorFailure(error, {
      fallbackCode: getServiceErrorCode(
        error,
        ERROR_CODES.ACTIVATION_EMAIL_SEND_FAILED,
      ),

      fallbackMessage:
        "Email-i i aktivizimit nuk mund të dërgohej. Provo përsëri.",
    });
  }
}

export async function rejectApplicationAction(applicationId, rejectionReason) {
  const validationResult = validateObject(rejectAdminApplicationSchema, {
    applicationId,
    rejectionReason,
  });

  if (!validationResult.success) {
    return validationFailure(validationResult.error, {
      message: "Të dhënat e refuzimit nuk janë të vlefshme.",
    });
  }

  const {
    applicationId: validatedApplicationId,
    rejectionReason: validatedReason,
  } = validationResult.data;

  try {
    const admin = await requirePlatformAdmin();

    await rejectApplication({
      applicationId: validatedApplicationId,

      reviewedById: getAdminUserId(admin),

      rejectionReason: validatedReason,
    });

    revalidateApplicationPages(validatedApplicationId);

    return actionSuccess({
      message: "Aplikimi u refuzua me sukses.",
    });
  } catch (error) {
    logServerError("rejectApplicationAction", error, {
      applicationId: validatedApplicationId,
    });

    return errorFailure(error, {
      fallbackCode: getServiceErrorCode(
        error,
        ERROR_CODES.APPLICATION_REJECTION_FAILED,
      ),

      fallbackMessage: "Aplikimi nuk mund të refuzohej. Provo përsëri.",
    });
  }
}
