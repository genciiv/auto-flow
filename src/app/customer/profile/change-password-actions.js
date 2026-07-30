"use server";

import bcrypt from "bcryptjs";

import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { EMAIL_CONFIG, passwordChangedTemplate, sendEmail } from "@/lib/email";
import { getFirstValidationMessage, validateFormData } from "@/lib/validation";
import { customerPasswordChangeSchema } from "@/schemas/customer-profile-schema";

const initialState = {
  error: null,
  success: false,
};

function getValidationResponse(error) {
  return {
    ...initialState,

    error: getFirstValidationMessage(error, "Kontrollo fushat e password-it."),
  };
}

export async function changePasswordAction(previousState, formData) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      ...initialState,

      error: "Sesioni yt ka skaduar. Hyr përsëri në llogari.",
    };
  }

  const validationResult = validateFormData(
    customerPasswordChangeSchema,
    formData,
  );

  if (!validationResult.success) {
    return getValidationResponse(validationResult.error);
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
    return {
      ...initialState,
      error: "Llogaria nuk mund të përpunohej.",
    };
  }

  const currentPasswordIsValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash,
  );

  if (!currentPasswordIsValid) {
    return {
      ...initialState,
      error: "Password-i aktual është i pasaktë.",
    };
  }

  const sameAsCurrentPassword = await bcrypt.compare(
    newPassword,
    user.passwordHash,
  );

  if (sameAsCurrentPassword) {
    return {
      ...initialState,

      error: "Password-i i ri duhet të jetë ndryshe nga password-i aktual.",
    };
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  const now = new Date();

  try {
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
  } catch (error) {
    console.error("Gabim gjatë ndryshimit të password-it:", error);

    return {
      ...initialState,

      error: "Password-i nuk mund të ndryshohej. Provo përsëri.",
    };
  }

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
    console.error(
      "Password-i u ndryshua, por email-i njoftues dështoi:",
      emailError,
    );
  }

  await signOut({
    redirectTo: "/login?passwordChanged=1",
  });
}
