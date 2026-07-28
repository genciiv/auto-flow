"use server";

import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { authTokenService } from "@/lib/auth-tokens";
import {
  EMAIL_CONFIG,
  emailVerificationTemplate,
  sendEmail,
} from "@/lib/email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

export async function registerAction(previousState, formData) {
  const name = String(formData.get("name") ?? "").trim();

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const phone = normalizePhone(formData.get("phone"));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!name || !email || !password || !confirmPassword) {
    return {
      error: "Plotëso të gjitha fushat e detyrueshme.",
      success: false,
    };
  }

  if (name.length < 2) {
    return {
      error: "Emri duhet të ketë të paktën 2 karaktere.",
      success: false,
    };
  }

  if (name.length > 100) {
    return {
      error: "Emri është shumë i gjatë.",
      success: false,
    };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return {
      error: "Vendos një adresë email-i të vlefshme.",
      success: false,
    };
  }

  if (phone && phone.length < 6) {
    return {
      error: "Numri i telefonit nuk është i vlefshëm.",
      success: false,
    };
  }

  if (password.length < 8) {
    return {
      error: "Password-i duhet të ketë të paktën 8 karaktere.",
      success: false,
    };
  }

  if (password.length > 100) {
    return {
      error: "Password-i është shumë i gjatë.",
      success: false,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Password-et nuk përputhen.",
      success: false,
    };
  }

  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      emailVerified: true,
    },
  });

  if (existingUser) {
    return {
      error: existingUser.emailVerified
        ? "Ekziston tashmë një llogari me këtë adresë email-i."
        : "Kjo llogari ekziston, por email-i nuk është verifikuar.",
      success: false,
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let user;

  try {
    user = await db.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        globalRole: "CUSTOMER",
        isActive: true,
        emailVerified: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return {
        error: "Ekziston tashmë një llogari me këtë adresë email-i.",
        success: false,
      };
    }

    console.error("Gabim gjatë regjistrimit:", error);

    return {
      error: "Nuk ishte e mundur të krijohej llogaria. Provo përsëri.",
      success: false,
    };
  }

  try {
    const verificationToken =
      await authTokenService.createEmailVerificationToken(user.id);

    const verificationUrl =
      `${EMAIL_CONFIG.appUrl}/verify-email?token=` +
      encodeURIComponent(verificationToken);

    const html = emailVerificationTemplate({
      name: user.name,
      verificationUrl,
    });

    await sendEmail({
      to: user.email,
      subject: "Verifiko adresën tënde të email-it",
      html,
    });

    return {
      error: null,
      success: true,
      message:
        "Llogaria u krijua. Kontrollo email-in për të verifikuar llogarinë.",
    };
  } catch (error) {
    console.error("Gabim gjatë dërgimit të email-it të verifikimit:", error);

    return {
      error:
        "Llogaria u krijua, por email-i i verifikimit nuk u dërgua. Provo përsëri pas pak.",
      success: false,
    };
  }
}
