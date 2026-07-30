"use server";

import bcrypt from "bcryptjs";

import { authTokenService } from "@/lib/auth-tokens";
import { db } from "@/lib/db";
import {
  EMAIL_CONFIG,
  emailVerificationTemplate,
  sendEmail,
} from "@/lib/email";
import { getFirstValidationMessage, validateFormData } from "@/lib/validation";
import { registerSchema } from "@/schemas/auth-schema";

const initialRegisterState = {
  error: null,
  success: false,
};

export async function registerAction(previousState, formData) {
  const validationResult = validateFormData(registerSchema, formData);

  if (!validationResult.success) {
    return {
      ...initialRegisterState,
      error: getFirstValidationMessage(
        validationResult.error,
        "Të dhënat e regjistrimit nuk janë të vlefshme.",
      ),
    };
  }

  const { name, email, phone, password } = validationResult.data;

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
