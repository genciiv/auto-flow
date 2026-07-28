"use server";

import bcrypt from "bcryptjs";

import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { EMAIL_CONFIG, passwordChangedTemplate, sendEmail } from "@/lib/email";

export async function changePasswordAction(previousState, formData) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: "Sesioni yt ka skaduar. Hyr përsëri në llogari.",
      success: false,
    };
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");

  const newPassword = String(formData.get("newPassword") ?? "");

  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return {
      error: "Plotëso të gjitha fushat e password-it.",
      success: false,
    };
  }

  if (newPassword.length < 8) {
    return {
      error: "Password-i i ri duhet të ketë të paktën 8 karaktere.",
      success: false,
    };
  }

  if (newPassword.length > 100) {
    return {
      error: "Password-i i ri është shumë i gjatë.",
      success: false,
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      error: "Password-et e reja nuk përputhen.",
      success: false,
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
      isActive: true,
      passwordHash: true,
    },
  });

  if (!user || !user.isActive || !user.passwordHash) {
    return {
      error: "Llogaria nuk mund të përpunohej.",
      success: false,
    };
  }

  const currentPasswordIsValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash,
  );

  if (!currentPasswordIsValid) {
    return {
      error: "Password-i aktual është i pasaktë.",
      success: false,
    };
  }

  const sameAsCurrentPassword = await bcrypt.compare(
    newPassword,
    user.passwordHash,
  );

  if (sameAsCurrentPassword) {
    return {
      error: "Password-i i ri duhet të jetë ndryshe nga password-i aktual.",
      success: false,
    };
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);
  const now = new Date();

  try {
    await db.$transaction(async (tx) => {
      await tx.user.update({
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

      await tx.authToken.updateMany({
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
      error: "Password-i nuk mund të ndryshohej. Provo përsëri.",
      success: false,
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
