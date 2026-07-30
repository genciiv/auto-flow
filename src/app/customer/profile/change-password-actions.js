"use server";

import bcrypt from "bcryptjs";

import { auth, signOut } from "@/auth";
import {
  actionFailure,
  errorFailure,
  validationFailure,
} from "@/lib/action-result";
import { db } from "@/lib/db";
import { EMAIL_CONFIG, passwordChangedTemplate, sendEmail } from "@/lib/email";
import { ERROR_CODES, isNextRedirectError, logServerError } from "@/lib/errors";
import { validateFormData } from "@/lib/validation";
import { customerPasswordChangeSchema } from "@/schemas/customer-profile-schema";

export async function changePasswordAction(previousState, formData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return actionFailure({
        code: ERROR_CODES.UNAUTHENTICATED,
        message: "Sesioni yt ka skaduar. Hyr përsëri në llogari.",
      });
    }

    const validationResult = validateFormData(
      customerPasswordChangeSchema,
      formData,
    );

    if (!validationResult.success) {
      return validationFailure(validationResult.error, {
        message: "Kontrollo fushat e password-it.",
      });
    }

    const { currentPassword, newPassword } = validationResult.data;

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        passwordHash: true,
      },
    });

    if (!user || !user.isActive || !user.passwordHash) {
      return actionFailure({
        code: ERROR_CODES.ACCOUNT_INACTIVE,
        message: "Llogaria nuk mund të përpunohej.",
      });
    }

    const currentPasswordIsValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!currentPasswordIsValid) {
      return actionFailure({
        code: ERROR_CODES.INVALID_CREDENTIALS,
        message: "Password-i aktual është i pasaktë.",
        fieldErrors: {
          currentPassword: ["Password-i aktual është i pasaktë."],
        },
      });
    }

    const sameAsCurrentPassword = await bcrypt.compare(
      newPassword,
      user.passwordHash,
    );

    if (sameAsCurrentPassword) {
      return actionFailure({
        code: ERROR_CODES.CONFLICT,
        message: "Password-i i ri duhet të jetë ndryshe nga password-i aktual.",
        fieldErrors: {
          newPassword: [
            "Password-i i ri duhet të jetë ndryshe nga password-i aktual.",
          ],
        },
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    const now = new Date();

    await db.$transaction(async (transaction) => {
      await transaction.user.update({
        where: {
          id: user.id,
        },
        data: {
          passwordHash: newPasswordHash,
          sessionVersion: {
            increment: 1,
          },
        },
      });

      await transaction.authToken.updateMany({
        where: {
          userId: user.id,
          type: "PASSWORD_RESET",
          usedAt: null,
          revokedAt: null,
        },
        data: {
          revokedAt: now,
        },
      });
    });

    try {
      const loginUrl = `${EMAIL_CONFIG.appUrl}/login`;
      const html = passwordChangedTemplate({
        name: user.name,
        loginUrl,
      });

      await sendEmail({
        to: user.email,
        subject: "Password-i i llogarisë u ndryshua",
        html,
      });
    } catch (emailError) {
      logServerError(
        "changePasswordAction:notificationEmail",
        emailError,
        { userId: user.id },
      );
    }

    await signOut({
      redirectTo: "/login?passwordChanged=1",
    });
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }

    logServerError("changePasswordAction", error);

    return errorFailure(error, {
      fallbackCode: ERROR_CODES.AUTH_ERROR,
      fallbackMessage: "Password-i nuk mund të ndryshohej. Provo përsëri.",
    });
  }
}
