"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  actionFailure,
  actionSuccess,
  errorFailure,
  validationFailure,
} from "@/lib/action-result";
import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { ERROR_CODES } from "@/lib/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { validateFormData } from "@/lib/validation";
import { createAuditLog } from "@/services/audit-log-service";
import { STAFF_ROLES, STAFF_ROLE_LABELS } from "@/config/staff";
import { createStaffInvitation } from "@/services/staff-service";

const requiredIdSchema = z.string().trim().min(1, "Identifikuesi mungon.");

const staffRoleSchema = z
  .string()
  .trim()
  .refine((role) => STAFF_ROLES.includes(role), "Roli nuk është i vlefshëm.");

const inviteStaffSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email-i është i detyrueshëm.")
    .email("Email-i nuk është i vlefshëm.")
    .transform((value) => value.toLowerCase()),

  role: staffRoleSchema,
});

const updateStaffRoleSchema = z.object({
  membershipId: requiredIdSchema,
  role: staffRoleSchema,
});

const toggleStaffStatusSchema = z.object({
  membershipId: requiredIdSchema,
});

const revokeInvitationSchema = z.object({
  invitationId: requiredIdSchema,
});

function revalidateStaffPages() {
  revalidatePath("/dashboard/staff");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/workspace");
  revalidatePath("/dashboard/my-work");
}

export async function inviteStaffAction(previousState, formData) {
  const validationResult = validateFormData(inviteStaffSchema, formData);

  if (!validationResult.success) {
    return validationFailure(validationResult.error, {
      message: "Ftesa nuk mund të dërgohej.",
    });
  }

  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.STAFF_CREATE,
    );

    const { email, role } = validationResult.data;

    await createStaffInvitation({
      businessId: context.businessId,
      invitedById: context.userId,
      email,
      role,
    });

    revalidatePath("/dashboard/staff");

    return actionSuccess({
      message: "Ftesa u dërgua me sukses.",
    });
  } catch (error) {
    return errorFailure(error, {
      fallbackCode: ERROR_CODES.VALIDATION_ERROR,
      fallbackMessage: "Ftesa nuk u dërgua.",
    });
  }
}

export async function updateStaffRoleAction(previousState, formData) {
  const validationResult = validateFormData(updateStaffRoleSchema, formData);

  if (!validationResult.success) {
    return validationFailure(validationResult.error, {
      message: "Roli nuk mund të përditësohej.",
    });
  }

  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.STAFF_MANAGE_ROLES,
    );

    const { membershipId, role } = validationResult.data;

    const member = await db.businessUser.findFirst({
      where: {
        id: membershipId,
        businessId: context.businessId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!member) {
      return actionFailure({
        code: ERROR_CODES.NOT_FOUND,
        message: "Përdoruesi nuk u gjet.",
      });
    }

    if (member.role === "OWNER") {
      return actionFailure({
        code: ERROR_CODES.FORBIDDEN,
        message: "Pronari nuk mund të ndryshohet nga kjo faqe.",
      });
    }

    const oldRole = member.role;

    if (oldRole === role) {
      return actionSuccess({
        message: "Ky përdorues e ka tashmë këtë rol.",
      });
    }

    await db.$transaction([
      db.businessUser.update({
        where: {
          id: member.id,
        },
        data: {
          role,
        },
      }),

      db.user.update({
        where: {
          id: member.user.id,
        },
        data: {
          sessionVersion: {
            increment: 1,
          },
        },
      }),
    ]);

    await createAuditLog({
      businessId: context.businessId,
      userId: context.userId,
      action: "UPDATE",
      entityType: "BusinessUser",
      entityId: member.id,
      title: "U ndryshua roli i stafit",
      description:
        `${member.user.email}: ` +
        `${STAFF_ROLE_LABELS[oldRole]} → ` +
        `${STAFF_ROLE_LABELS[role]}.`,
      oldValues: {
        role: oldRole,
      },
      newValues: {
        role,
      },
    });

    revalidateStaffPages();

    return actionSuccess({
      message:
        "Roli u përditësua. Përdoruesi duhet të hyjë përsëri që të marrë aksesin e ri.",
    });
  } catch (error) {
    return errorFailure(error, {
      fallbackMessage: "Roli nuk mund të përditësohej.",
    });
  }
}

export async function toggleStaffStatusAction(previousState, formData) {
  const validationResult = validateFormData(toggleStaffStatusSchema, formData);

  if (!validationResult.success) {
    return validationFailure(validationResult.error, {
      message: "Statusi i përdoruesit nuk mund të ndryshohej.",
    });
  }

  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.STAFF_DELETE,
    );

    const { membershipId } = validationResult.data;

    const member = await db.businessUser.findFirst({
      where: {
        id: membershipId,
        businessId: context.businessId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!member) {
      return actionFailure({
        code: ERROR_CODES.NOT_FOUND,
        message: "Përdoruesi nuk u gjet.",
      });
    }

    if (member.role === "OWNER" || member.id === context.membershipId) {
      return actionFailure({
        code: ERROR_CODES.FORBIDDEN,
        message: "Ky përdorues nuk mund të çaktivizohet.",
      });
    }

    const isActive = !member.isActive;

    await db.$transaction([
      db.businessUser.update({
        where: {
          id: member.id,
        },
        data: {
          isActive,
        },
      }),

      db.user.update({
        where: {
          id: member.user.id,
        },
        data: {
          sessionVersion: {
            increment: 1,
          },
        },
      }),
    ]);

    await createAuditLog({
      businessId: context.businessId,
      userId: context.userId,
      action: "UPDATE",
      entityType: "BusinessUser",
      entityId: member.id,
      title: isActive ? "Stafi u aktivizua" : "Stafi u çaktivizua",
      description: member.user.email,
      oldValues: {
        isActive: member.isActive,
      },
      newValues: {
        isActive,
      },
    });

    revalidateStaffPages();

    return actionSuccess({
      message: isActive
        ? "Përdoruesi u aktivizua."
        : "Përdoruesi u çaktivizua.",
    });
  } catch (error) {
    return errorFailure(error, {
      fallbackMessage: "Statusi i përdoruesit nuk mund të ndryshohej.",
    });
  }
}

export async function revokeInvitationAction(previousState, formData) {
  const validationResult = validateFormData(revokeInvitationSchema, formData);

  if (!validationResult.success) {
    return validationFailure(validationResult.error, {
      message: "Ftesa nuk mund të anulohej.",
    });
  }

  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.STAFF_DELETE,
    );

    const { invitationId } = validationResult.data;

    const invitation = await db.staffInvitation.findFirst({
      where: {
        id: invitationId,
        businessId: context.businessId,
        status: "PENDING",
      },
    });

    if (!invitation) {
      return actionFailure({
        code: ERROR_CODES.NOT_FOUND,
        message: "Ftesa nuk u gjet.",
      });
    }

    await db.staffInvitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
      },
    });

    await createAuditLog({
      businessId: context.businessId,
      userId: context.userId,
      action: "UPDATE",
      entityType: "StaffInvitation",
      entityId: invitation.id,
      title: "Ftesa e stafit u anulua",
      description: invitation.email,
      oldValues: {
        status: invitation.status,
      },
      newValues: {
        status: "REVOKED",
      },
    });

    revalidatePath("/dashboard/staff");

    return actionSuccess({
      message: "Ftesa u anulua.",
    });
  } catch (error) {
    return errorFailure(error, {
      fallbackMessage: "Ftesa nuk mund të anulohej.",
    });
  }
}
