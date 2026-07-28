"use server";

import { db } from "@/lib/db";
import { authTokenService } from "@/lib/auth-tokens";
import {
  EMAIL_CONFIG,
  emailVerificationTemplate,
  sendEmail,
} from "@/lib/email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function resendVerificationAction(previousState, formData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    return {
      error: "Vendos adresën e email-it.",
      success: false,
    };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return {
      error: "Vendos një adresë email-i të vlefshme.",
      success: false,
    };
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

  /*
   * Nuk zbulojmë nëse një email ekziston apo jo.
   * Kjo shmang kontrollimin masiv të adresave të regjistruara.
   */
  if (!user) {
    return {
      error: null,
      success: true,
      message:
        "Nëse ekziston një llogari e paverifikuar me këtë email, do të marrësh një link të ri.",
    };
  }

  if (!user.isActive) {
    return {
      error: "Kjo llogari është çaktivizuar. Kontakto mbështetjen e AutoFlow.",
      success: false,
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
    };
  }
}
