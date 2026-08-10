"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth-guard";
import { createActionError } from "@/lib/errors";
import { getFirstValidationMessage, validateObject } from "@/lib/validation";
import { adminUserGlobalRoleSchema, adminUserIdSchema, adminUserStatusSchema } from "@/schemas/admin-user-schema";
import { createPlatformAuditLog } from "@/services/admin/activity-log-service";
import {
  countOtherActivePlatformAdmins,
  getAdminUserById,
  setAdminUserActiveState,
  setAdminUserGlobalRole,
  unlockAdminUser,
} from "@/services/admin/user-service";

function revalidateUserPages(userId) {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/activity-logs");
}

function validate(schema, input, fallback) {
  const result = validateObject(schema, input);
  if (!result.success) {
    throw createActionError(getFirstValidationMessage(result.error, fallback));
  }
  return result.data;
}

async function ensureTargetExists(userId) {
  const target = await getAdminUserById(userId);
  if (!target) throw createActionError("Përdoruesi nuk u gjet.");
  return target;
}

async function ensureAdminContinuity(target) {
  if (target.globalRole !== "PLATFORM_ADMIN" || !target.isActive) return;
  const otherAdmins = await countOtherActivePlatformAdmins(target.id);
  if (otherAdmins < 1) {
    throw createActionError("Nuk mund të hiqet ose çaktivizohet administratori i fundit aktiv i platformës.");
  }
}

export async function changeAdminUserStatusAction(userId, isActive) {
  const admin = await requirePlatformAdmin();
  const data = validate(adminUserStatusSchema, { userId, isActive }, "Statusi nuk është i vlefshëm.");
  const target = await ensureTargetExists(data.userId);

  if (target.id === admin.id && !data.isActive) {
    throw createActionError("Nuk mund ta çaktivizosh llogarinë tënde.");
  }

  if (!data.isActive) await ensureAdminContinuity(target);

  if (target.isActive === data.isActive) {
    return { success: true, isActive: target.isActive, message: data.isActive ? "Përdoruesi është tashmë aktiv." : "Përdoruesi është tashmë joaktiv." };
  }

  const updated = await setAdminUserActiveState(data);
  await createPlatformAuditLog({
    userId: admin.id,
    action: "STATUS_CHANGE",
    entityType: "USER",
    entityId: target.id,
    title: data.isActive ? "U aktivizua përdoruesi" : "U çaktivizua përdoruesi",
    description: `${target.name} (${target.email})`,
    oldValues: { isActive: target.isActive },
    newValues: { isActive: updated.isActive },
  });

  revalidateUserPages(target.id);
  return { success: true, isActive: updated.isActive, message: updated.isActive ? "Përdoruesi u aktivizua." : "Përdoruesi u çaktivizua dhe sesionet aktive u revokuan." };
}

export async function unlockAdminUserAction(userId) {
  const admin = await requirePlatformAdmin();
  const data = validate(adminUserIdSchema, { userId }, "ID-ja e përdoruesit mungon.");
  const target = await ensureTargetExists(data.userId);

  if (!target.lockedUntil && target.failedLoginAttempts === 0) {
    return { success: true, message: "Llogaria nuk është e bllokuar." };
  }

  await unlockAdminUser(target.id);
  await createPlatformAuditLog({
    userId: admin.id,
    action: "STATUS_CHANGE",
    entityType: "USER",
    entityId: target.id,
    title: "U zhbllokua llogaria e përdoruesit",
    description: `${target.name} (${target.email})`,
    oldValues: { lockedUntil: target.lockedUntil?.toISOString?.() || null, failedLoginAttempts: target.failedLoginAttempts },
    newValues: { lockedUntil: null, failedLoginAttempts: 0 },
  });

  revalidateUserPages(target.id);
  return { success: true, message: "Llogaria u zhbllokua dhe tentativat e dështuara u pastruan." };
}

export async function changeAdminUserGlobalRoleAction(userId, globalRole) {
  const admin = await requirePlatformAdmin();
  const data = validate(adminUserGlobalRoleSchema, { userId, globalRole }, "Roli global nuk është i vlefshëm.");
  const target = await ensureTargetExists(data.userId);
  const currentRole = target.globalRole || "NONE";

  if (target.id === admin.id && data.globalRole !== "PLATFORM_ADMIN") {
    throw createActionError("Nuk mund t'i heqësh vetes rolin Platform Admin.");
  }

  if (currentRole === "PLATFORM_ADMIN" && data.globalRole !== "PLATFORM_ADMIN") {
    await ensureAdminContinuity(target);
  }

  if (currentRole === data.globalRole) {
    return { success: true, globalRole: target.globalRole, message: "Roli global nuk ndryshoi." };
  }

  const updated = await setAdminUserGlobalRole(data);
  await createPlatformAuditLog({
    userId: admin.id,
    action: "STATUS_CHANGE",
    entityType: "USER",
    entityId: target.id,
    title: "U ndryshua roli global i përdoruesit",
    description: `${target.name} (${target.email})`,
    oldValues: { globalRole: target.globalRole },
    newValues: { globalRole: updated.globalRole },
  });

  revalidateUserPages(target.id);
  return { success: true, globalRole: updated.globalRole, message: "Roli global u përditësua dhe sesionet ekzistuese u revokuan." };
}
