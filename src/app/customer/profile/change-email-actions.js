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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestEmailChangeAction(previousState, formData) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: "Sesioni yt ka skaduar. Hyr përsëri.",
      success: false,
      message: null,
    };
  }

  const newEmail = String(formData.get("newEmail") ?? "")
    .trim()
    .toLowerCase();

  const currentPassword = String(formData.get("currentPassword") ?? "");

  if (!newEmail || !currentPassword) {
    return {
      error: "Plotëso email-in e ri dhe password-in aktual.",
      success: false,
      message: null,
    };
  }

  if (!EMAIL_PATTERN.test(newEmail)) {
    return {
      error: "Vendos një adresë email-i të vlefshme.",
      success: false,
      message: null,
    };
  }

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
      error: "Llogaria nuk mund të përpunohej.",
      success: false,
      message: null,
    };
  }

  if (newEmail === user.email.toLowerCase()) {
    return {
      error: "Email-i i ri duhet të jetë ndryshe nga email-i aktual.",
      success: false,
      message: null,
    };
  }

  const passwordIsValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash,
  );

  if (!passwordIsValid) {
    return {
      error: "Password-i aktual është i pasaktë.",
      success: false,
      message: null,
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
      error: "Ekziston tashmë një llogari me këtë adresë email-i.",
      success: false,
      message: null,
    };
  }

  const resendStatus = await authTokenService.canResendEmailChange(user.id);

  if (!resendStatus.allowed) {
    const minutes = Math.max(1, Math.ceil(resendStatus.retryAfterSeconds / 60));

    return {
      error: `Prit edhe rreth ${minutes} minutë para se të kërkosh një email tjetër.`,
      success: false,
      message: null,
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
      error: "Kërkesa nuk mund të përpunohej. Provo përsëri.",
      success: false,
      message: null,
    };
  }
}
