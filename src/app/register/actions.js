"use server";

import bcrypt from "bcryptjs";

import {
  actionFailure,
  actionSuccess,
  errorFailure,
  validationFailure,
} from "@/lib/action-result";
import { authTokenService } from "@/lib/auth-tokens";
import { db } from "@/lib/db";
import {
  EMAIL_CONFIG,
  emailVerificationTemplate,
  sendEmail,
} from "@/lib/email";
import { ERROR_CODES, logServerError } from "@/lib/errors";
import { validateFormData } from "@/lib/validation";
import { registerSchema } from "@/schemas/auth-schema";

function registrationFailure({ code, message, fieldErrors = {}, data = null }) {
  return actionFailure({
    code,
    message,
    fieldErrors,
    data,
  });
}

export async function registerAction(previousState, formData) {
  const validationResult = validateFormData(registerSchema, formData);

  if (!validationResult.success) {
    return validationFailure(validationResult.error, {
      message: "Të dhënat e regjistrimit nuk janë të vlefshme.",
    });
  }

  const { name, email, phone, password } = validationResult.data;

  try {
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
      if (existingUser.emailVerified) {
        return registrationFailure({
          code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
          message: "Ekziston tashmë një llogari me këtë adresë email-i.",
          fieldErrors: {
            email: ["Ekziston tashmë një llogari me këtë adresë email-i."],
          },
        });
      }

      return registrationFailure({
        code: ERROR_CODES.EMAIL_NOT_VERIFIED,
        message: "Kjo llogari ekziston, por email-i nuk është verifikuar.",
        fieldErrors: {
          email: ["Kjo llogari ekziston, por email-i nuk është verifikuar."],
        },
        data: {
          email,
        },
      });
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
        return registrationFailure({
          code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
          message: "Ekziston tashmë një llogari me këtë adresë email-i.",
          fieldErrors: {
            email: ["Ekziston tashmë një llogari me këtë adresë email-i."],
          },
        });
      }

      logServerError("registerAction:createUser", error);

      return errorFailure(error, {
        fallbackCode: ERROR_CODES.REGISTRATION_FAILED,

        fallbackMessage:
          "Nuk ishte e mundur të krijohej llogaria. Provo përsëri.",
      });
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

      return actionSuccess({
        message:
          "Llogaria u krijua. Kontrollo email-in për të verifikuar llogarinë.",

        data: {
          userId: user.id,
          email: user.email,
          verificationEmailSent: true,
        },
      });
    } catch (error) {
      logServerError("registerAction:sendVerificationEmail", error, {
        userId: user.id,
      });

      /*
       * Llogaria është krijuar. Nuk e fshijmë përdoruesin
       * vetëm sepse shërbimi i email-it dështoi.
       * Përdoruesi mund të përdorë resend-verification.
       */
      return registrationFailure({
        code: ERROR_CODES.EMAIL_VERIFICATION_SEND_FAILED,

        message:
          "Llogaria u krijua, por email-i i verifikimit nuk u dërgua. Provo ta ridërgosh pas pak.",

        data: {
          userId: user.id,
          email: user.email,
          accountCreated: true,
          verificationEmailSent: false,
        },
      });
    }
  } catch (error) {
    logServerError("registerAction", error);

    return errorFailure(error, {
      fallbackCode: ERROR_CODES.REGISTRATION_FAILED,

      fallbackMessage:
        "Nuk ishte e mundur të përfundohej regjistrimi. Provo përsëri.",
    });
  }
}
