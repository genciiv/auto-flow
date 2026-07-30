"use server";

import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { authTokenService } from "@/lib/auth-tokens";
import {
  EMAIL_CONFIG,
  emailChangeVerificationTemplate,
  sendEmail,
} from "@/lib/email";
import { getFirstValidationMessage, validateFormData } from "@/lib/validation";
import { customerEmailChangeSchema } from "@/schemas/customer-profile-schema";

const initialState = {
  error: null,
  success: false,
  message: null,
};

function getValidationResponse(error) {
  return {
    ...initialState,

    error: getFirstValidationMessage(error, "Kontrollo të dhënat e vendosura."),
  };
}

function formatRetryMinutes(seconds) {
  const normalizedSeconds = Math.max(1, Number(seconds) || 1);

  return Math.max(1, Math.ceil(normalizedSeconds / 60));
}

export async function requestEmailChangeAction(previousState, formData) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      ...initialState,
      error: "Sesioni yt ka skaduar. Hyr përsëri.",
    };
  }

  const validationResult = validateFormData(
    customerEmailChangeSchema,
    formData,
  );

  if (!validationResult.success) {
    return getValidationResponse(validationResult.error);
  }

  const { newEmail, currentPassword } = validationResult.data;

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },

    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive || !user.passwordHash) {
    return {
      ...initialState,
      error: "Llogaria nuk mund të përpunohej.",
    };
  }

  const currentEmail = user.email.trim().toLowerCase();

  if (newEmail === currentEmail) {
    return {
      ...initialState,

      error: "Email-i i ri duhet të jetë ndryshe nga email-i aktual.",
    };
  }

  const passwordIsValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash,
  );

  if (!passwordIsValid) {
    return {
      ...initialState,
      error: "Password-i aktual është i pasaktë.",
    };
  }

  const existingUser = await db.user.findUnique({
    where: {
      email: newEmail,
    },

    select: {
      id: true,
    },
  });

  if (existingUser) {
    return {
      ...initialState,

      error: "Ekziston tashmë një llogari me këtë adresë email-i.",
    };
  }

  const resendStatus = await authTokenService.canResendEmailChange(user.id);

  if (!resendStatus.allowed) {
    const minutes = formatRetryMinutes(resendStatus.retryAfterSeconds);

    return {
      ...initialState,

      error: `Prit edhe rreth ${minutes} ${
        minutes === 1 ? "minutë" : "minuta"
      } para se të kërkosh një email tjetër.`,
    };
  }

  try {
    const token = await authTokenService.createEmailChangeToken(
      user.id,
      newEmail,
      user.email,
    );

    const verificationUrl =
      `${EMAIL_CONFIG.appUrl}/verify-email-change?token=` +
      encodeURIComponent(token);

    const html = emailChangeVerificationTemplate({
      name: user.name,
      newEmail,
      verificationUrl,
    });

    await sendEmail({
      to: newEmail,
      subject: "Konfirmo email-in e ri",
      html,
    });

    return {
      error: null,
      success: true,

      message:
        "Linku i konfirmimit u dërgua te email-i i ri. Kontrollo Inbox, Spam dhe Promotions.",
    };
  } catch (error) {
    console.error("Gabim gjatë kërkesës për ndryshimin e email-it:", error);

    return {
      ...initialState,

      error: "Kërkesa nuk mund të përpunohej. Provo përsëri.",
    };
  }
}
