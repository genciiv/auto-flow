"use server";

import { authTokenService } from "@/lib/auth-tokens";
import { db } from "@/lib/db";
import {
  EMAIL_CONFIG,
  emailVerificationTemplate,
  sendEmail,
} from "@/lib/email";
import { getFirstValidationMessage, validateFormData } from "@/lib/validation";
import { resendVerificationSchema } from "@/schemas/auth-schema";
import { protectPublicAction, rateLimitActionState } from "@/lib/public-action-protection";

const GENERIC_SUCCESS_MESSAGE =
  "Nëse ekziston një llogari e paverifikuar me këtë email, do të marrësh një link të ri.";

const initialResendVerificationState = {
  error: null,
  success: false,
  message: null,
};

export async function resendVerificationAction(previousState, formData) {
  const validationResult = validateFormData(resendVerificationSchema, formData);

  if (!validationResult.success) {
    return {
      ...initialResendVerificationState,
      error: getFirstValidationMessage(
        validationResult.error,
        "Vendos një adresë email-i të vlefshme.",
      ),
    };
  }

  const { email } = validationResult.data;

  try {
    await protectPublicAction("resendVerification", email);
  } catch (error) {
    return rateLimitActionState(error, initialResendVerificationState) ?? { ...initialResendVerificationState, error: "Kërkesa nuk mund të përpunohej." };
  }

  const user = await db.user.findUnique({
    where: {
      email,
    },

    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      isActive: true,
    },
  });

  /**
   * Nuk zbulojmë nëse email-i ekziston.
   * Kjo shmang kontrollimin masiv të adresave
   * të regjistruara në platformë.
   */
  if (!user) {
    return {
      error: null,
      success: true,
      message: GENERIC_SUCCESS_MESSAGE,
    };
  }

  if (!user.isActive) {
    return {
      error: "Kjo llogari është çaktivizuar. Kontakto mbështetjen e AutoFlow.",
      success: false,
      message: null,
    };
  }

  if (user.emailVerified) {
    return {
      error: null,
      success: true,
      message: "Ky email është verifikuar tashmë. Mund të hysh në llogari.",
    };
  }

  const resendStatus = await authTokenService.canResendEmailVerification(
    user.id,
  );

  if (!resendStatus.allowed) {
    const minutes = Math.max(1, Math.ceil(resendStatus.retryAfterSeconds / 60));

    return {
      error: `Prit edhe rreth ${minutes} minutë para se të kërkosh një link tjetër.`,
      success: false,
      message: null,
    };
  }

  try {
    const token = await authTokenService.createEmailVerificationToken(user.id);

    const verificationUrl =
      `${EMAIL_CONFIG.appUrl}/verify-email?token=` + encodeURIComponent(token);

    const html = emailVerificationTemplate({
      name: user.name,
      verificationUrl,
    });

    await sendEmail({
      to: user.email,
      subject: "Link i ri për verifikimin e email-it",
      html,
    });

    return {
      error: null,
      success: true,
      message:
        "Email-i i verifikimit u ridërgua. Kontrollo Inbox, Spam dhe Promotions.",
    };
  } catch (error) {
    console.error("Gabim gjatë ridërgimit të email-it të verifikimit:", error);

    return {
      error:
        "Email-i i verifikimit nuk mund të dërgohej. Provo përsëri pas pak.",
      success: false,
      message: null,
    };
  }
}
