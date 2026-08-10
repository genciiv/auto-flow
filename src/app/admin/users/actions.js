"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth-guard";
import { authTokenService } from "@/lib/auth-tokens";
import { EMAIL_CONFIG, emailVerificationTemplate, passwordResetTemplate, sendEmail } from "@/lib/email";
import { createActionError } from "@/lib/errors";
import { getFirstValidationMessage, validateObject } from "@/lib/validation";
import {
  adminBusinessMembershipRemoveSchema,
  adminBusinessMembershipSchema,
  adminDeleteUserSchema,
  adminUserGlobalRoleSchema,
  adminUserIdSchema,
  adminUserProfileSchema,
  adminUserStatusSchema,
  adminUserVerificationSchema,
} from "@/schemas/admin-user-schema";
import { createPlatformAuditLog } from "@/services/admin/activity-log-service";
import {
  countOtherActiveOwners,
  countOtherActivePlatformAdmins,
  deleteAdminUser,
  getAdminUserById,
  getBusinessMembershipForAdmin,
  removeBusinessMembership,
  revokeAdminUserSessions,
  setAdminUserActiveState,
  setAdminUserEmailVerified,
  setAdminUserGlobalRole,
  unlockAdminUser,
  updateAdminUserProfile,
  updateBusinessMembershipRole,
} from "@/services/admin/user-service";

function revalidateUserPages(userId) {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  if (userId) revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/activity-logs");
}

function validate(schema, input, fallback) {
  const result = validateObject(schema, input);
  if (!result.success) throw createActionError(getFirstValidationMessage(result.error, fallback));
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
  if (otherAdmins < 1) throw createActionError("Nuk mund të hiqet ose çaktivizohet administratori i fundit aktiv i platformës.");
}

async function ensureMembershipCanLoseOwner(membership) {
  if (membership.role !== "OWNER" || !membership.isActive) return;
  const otherOwners = await countOtherActiveOwners({ businessId: membership.businessId, membershipId: membership.id });
  if (otherOwners < 1) throw createActionError("Nuk mund të hiqet ose ndryshohet pronari i fundit aktiv i këtij biznesi.");
}

export async function changeAdminUserStatusAction(userId, isActive) {
  const admin = await requirePlatformAdmin();
  const data = validate(adminUserStatusSchema, { userId, isActive }, "Statusi nuk është i vlefshëm.");
  const target = await ensureTargetExists(data.userId);

  if (target.id === admin.id && !data.isActive) throw createActionError("Nuk mund ta çaktivizosh llogarinë tënde.");
  if (!data.isActive) await ensureAdminContinuity(target);
  if (target.isActive === data.isActive) return { success: true, isActive: target.isActive, message: data.isActive ? "Përdoruesi është tashmë aktiv." : "Përdoruesi është tashmë joaktiv." };

  const updated = await setAdminUserActiveState(data);
  await createPlatformAuditLog({ userId: admin.id, action: "STATUS_CHANGE", entityType: "USER", entityId: target.id, title: data.isActive ? "U aktivizua përdoruesi" : "U çaktivizua përdoruesi", description: `${target.name} (${target.email})`, oldValues: { isActive: target.isActive }, newValues: { isActive: updated.isActive } });
  revalidateUserPages(target.id);
  return { success: true, isActive: updated.isActive, message: updated.isActive ? "Përdoruesi u aktivizua." : "Përdoruesi u çaktivizua dhe sesionet aktive u revokuan." };
}

export async function updateAdminUserProfileAction(userId, name, phone) {
  const admin = await requirePlatformAdmin();
  const data = validate(adminUserProfileSchema, { userId, name, phone }, "Të dhënat e profilit nuk janë të vlefshme.");
  const target = await ensureTargetExists(data.userId);
  const updated = await updateAdminUserProfile(data);

  await createPlatformAuditLog({ userId: admin.id, action: "UPDATE", entityType: "USER", entityId: target.id, title: "U përditësua profili i përdoruesit", description: `${target.name} (${target.email})`, oldValues: { name: target.name, phone: target.phone }, newValues: { name: updated.name, phone: updated.phone } });
  revalidateUserPages(target.id);
  return { success: true, message: "Emri dhe telefoni u përditësuan." };
}

export async function changeAdminUserVerificationAction(userId, verified) {
  const admin = await requirePlatformAdmin();
  const data = validate(adminUserVerificationSchema, { userId, verified }, "Statusi i verifikimit nuk është i vlefshëm.");
  const target = await ensureTargetExists(data.userId);

  if (target.id === admin.id && !data.verified) throw createActionError("Nuk mund ta heqësh verifikimin e email-it të llogarisë tënde.");
  const currentlyVerified = Boolean(target.emailVerified);
  if (currentlyVerified === data.verified) return { success: true, message: data.verified ? "Email-i është tashmë i verifikuar." : "Email-i është tashmë i paverifikuar." };

  const updated = await setAdminUserEmailVerified(data);
  await createPlatformAuditLog({ userId: admin.id, action: "STATUS_CHANGE", entityType: "USER", entityId: target.id, title: data.verified ? "Email-i u shënua i verifikuar" : "U hoq verifikimi i email-it", description: target.email, oldValues: { emailVerified: target.emailVerified?.toISOString?.() || null }, newValues: { emailVerified: updated.emailVerified?.toISOString?.() || null } });
  revalidateUserPages(target.id);
  return { success: true, message: data.verified ? "Email-i u shënua si i verifikuar." : "Verifikimi u hoq dhe sesionet aktive u revokuan." };
}

export async function revokeAdminUserSessionsAction(userId) {
  const admin = await requirePlatformAdmin();
  const data = validate(adminUserIdSchema, { userId }, "ID-ja e përdoruesit mungon.");
  const target = await ensureTargetExists(data.userId);
  if (target.id === admin.id) throw createActionError("Përdor opsionin Logout për sesionin tënd. Ky veprim është për përdorues të tjerë.");

  await revokeAdminUserSessions(target.id);
  await createPlatformAuditLog({ userId: admin.id, action: "LOGOUT", entityType: "USER", entityId: target.id, title: "U revokuan të gjitha sesionet", description: `${target.name} (${target.email})` });
  revalidateUserPages(target.id);
  return { success: true, message: "Të gjitha sesionet ekzistuese të përdoruesit u revokuan." };
}

export async function sendAdminPasswordResetAction(userId) {
  const admin = await requirePlatformAdmin();
  const data = validate(adminUserIdSchema, { userId }, "ID-ja e përdoruesit mungon.");
  const target = await ensureTargetExists(data.userId);
  if (!target.isActive) throw createActionError("Aktivizo llogarinë para se të dërgosh reset password.");
  if (!target.hasPassword) throw createActionError("Kjo llogari nuk përdor password lokal; hyrja mund të jetë vetëm me Google.");

  try {
    const token = await authTokenService.createPasswordResetToken(target.id);
    const resetPasswordUrl = `${EMAIL_CONFIG.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
    await sendEmail({ to: target.email, subject: "Rivendos password-in", html: passwordResetTemplate({ name: target.name, resetPasswordUrl }) });
  } catch {
    throw createActionError("Email-i për reset password nuk mund të dërgohej. Kontrollo konfigurimin e email-it dhe provo përsëri.");
  }
  await createPlatformAuditLog({ userId: admin.id, action: "CUSTOM", entityType: "USER", entityId: target.id, title: "U dërgua reset password nga administratori", description: target.email });
  revalidateUserPages(target.id);
  return { success: true, message: "Email-i për rivendosjen e password-it u dërgua." };
}

export async function sendAdminVerificationEmailAction(userId) {
  const admin = await requirePlatformAdmin();
  const data = validate(adminUserIdSchema, { userId }, "ID-ja e përdoruesit mungon.");
  const target = await ensureTargetExists(data.userId);
  if (!target.isActive) throw createActionError("Aktivizo llogarinë para se të dërgosh verifikimin.");
  if (target.emailVerified) return { success: true, message: "Email-i është tashmë i verifikuar." };

  try {
    const token = await authTokenService.createEmailVerificationToken(target.id);
    const verificationUrl = `${EMAIL_CONFIG.appUrl}/verify-email?token=${encodeURIComponent(token)}`;
    await sendEmail({ to: target.email, subject: "Verifiko email-in tënd", html: emailVerificationTemplate({ name: target.name, verificationUrl }) });
  } catch {
    throw createActionError("Email-i i verifikimit nuk mund të dërgohej. Kontrollo konfigurimin e email-it dhe provo përsëri.");
  }
  await createPlatformAuditLog({ userId: admin.id, action: "CUSTOM", entityType: "USER", entityId: target.id, title: "U ridërgua verifikimi i email-it nga administratori", description: target.email });
  revalidateUserPages(target.id);
  return { success: true, message: "Email-i i verifikimit u dërgua." };
}

export async function unlockAdminUserAction(userId) {
  const admin = await requirePlatformAdmin();
  const data = validate(adminUserIdSchema, { userId }, "ID-ja e përdoruesit mungon.");
  const target = await ensureTargetExists(data.userId);
  if (!target.lockedUntil && target.failedLoginAttempts === 0) return { success: true, message: "Llogaria nuk është e bllokuar." };

  await unlockAdminUser(target.id);
  await createPlatformAuditLog({ userId: admin.id, action: "STATUS_CHANGE", entityType: "USER", entityId: target.id, title: "U zhbllokua llogaria e përdoruesit", description: `${target.name} (${target.email})`, oldValues: { lockedUntil: target.lockedUntil?.toISOString?.() || null, failedLoginAttempts: target.failedLoginAttempts }, newValues: { lockedUntil: null, failedLoginAttempts: 0 } });
  revalidateUserPages(target.id);
  return { success: true, message: "Llogaria u zhbllokua dhe tentativat e dështuara u pastruan." };
}

export async function changeAdminUserGlobalRoleAction(userId, globalRole) {
  const admin = await requirePlatformAdmin();
  const data = validate(adminUserGlobalRoleSchema, { userId, globalRole }, "Roli global nuk është i vlefshëm.");
  const target = await ensureTargetExists(data.userId);
  const currentRole = target.globalRole || "NONE";

  if (target.id === admin.id && data.globalRole !== "PLATFORM_ADMIN") throw createActionError("Nuk mund t'i heqësh vetes rolin Platform Admin.");
  if (currentRole === "PLATFORM_ADMIN" && data.globalRole !== "PLATFORM_ADMIN") await ensureAdminContinuity(target);
  if (currentRole === data.globalRole) return { success: true, globalRole: target.globalRole, message: "Roli global nuk ndryshoi." };

  const updated = await setAdminUserGlobalRole(data);
  await createPlatformAuditLog({ userId: admin.id, action: "STATUS_CHANGE", entityType: "USER", entityId: target.id, title: "U ndryshua roli global i përdoruesit", description: `${target.name} (${target.email})`, oldValues: { globalRole: target.globalRole }, newValues: { globalRole: updated.globalRole } });
  revalidateUserPages(target.id);
  return { success: true, globalRole: updated.globalRole, message: "Roli global u përditësua dhe sesionet ekzistuese u revokuan." };
}

export async function changeAdminBusinessMembershipRoleAction(userId, membershipId, role) {
  const admin = await requirePlatformAdmin();
  const data = validate(adminBusinessMembershipSchema, { userId, membershipId, role }, "Roli në biznes nuk është i vlefshëm.");
  const target = await ensureTargetExists(data.userId);
  const membership = await getBusinessMembershipForAdmin(data);
  if (!membership) throw createActionError("Aksesi në biznes nuk u gjet.");
  if (membership.role === data.role) return { success: true, message: "Roli në biznes nuk ndryshoi." };
  if (membership.role === "OWNER" && data.role !== "OWNER") await ensureMembershipCanLoseOwner(membership);

  await updateBusinessMembershipRole({ membershipId: membership.id, role: data.role });
  await revokeAdminUserSessions(target.id);
  await createPlatformAuditLog({ userId: admin.id, businessId: membership.businessId, action: "STATUS_CHANGE", entityType: "USER", entityId: target.id, title: "U ndryshua roli i përdoruesit në biznes", description: `${target.name} • ${membership.business.name}`, oldValues: { role: membership.role }, newValues: { role: data.role } });
  revalidatePath(`/admin/businesses/${membership.businessId}`);
  revalidateUserPages(target.id);
  return { success: true, message: "Roli në biznes u përditësua dhe sesionet u revokuan." };
}

export async function removeAdminBusinessMembershipAction(userId, membershipId) {
  const admin = await requirePlatformAdmin();
  const data = validate(adminBusinessMembershipRemoveSchema, { userId, membershipId }, "Aksesi në biznes mungon.");
  const target = await ensureTargetExists(data.userId);
  const membership = await getBusinessMembershipForAdmin(data);
  if (!membership) throw createActionError("Aksesi në biznes nuk u gjet.");
  await ensureMembershipCanLoseOwner(membership);

  await removeBusinessMembership(membership.id);
  await revokeAdminUserSessions(target.id);
  await createPlatformAuditLog({ userId: admin.id, businessId: membership.businessId, action: "DELETE", entityType: "USER", entityId: target.id, title: "U hoq përdoruesi nga biznesi", description: `${target.name} • ${membership.business.name}`, oldValues: { role: membership.role, membershipId: membership.id } });
  revalidatePath(`/admin/businesses/${membership.businessId}`);
  revalidateUserPages(target.id);
  return { success: true, message: "Përdoruesi u hoq nga biznesi dhe sesionet u revokuan." };
}

export async function deleteAdminUserAction(userId, confirmEmail) {
  const admin = await requirePlatformAdmin();
  const data = validate(adminDeleteUserSchema, { userId, confirmEmail }, "Konfirmimi i fshirjes nuk është i vlefshëm.");
  const target = await ensureTargetExists(data.userId);
  if (target.id === admin.id) throw createActionError("Nuk mund ta fshish llogarinë tënde.");
  if (target.email.toLowerCase() !== data.confirmEmail.toLowerCase()) throw createActionError("Email-i i konfirmimit nuk përputhet.");
  await ensureAdminContinuity(target);
  if (!target.canDelete) throw createActionError(`Llogaria nuk mund të fshihet sepse ka të dhëna të lidhura: ${target.deleteBlockers.join(" ")}`);

  const snapshot = { id: target.id, name: target.name, email: target.email, globalRole: target.globalRole };
  await deleteAdminUser(target.id);
  await createPlatformAuditLog({ userId: admin.id, action: "DELETE", entityType: "USER", entityId: target.id, title: "U fshi llogaria e përdoruesit", description: `${target.name} (${target.email})`, oldValues: snapshot });
  revalidateUserPages(null);
  return { success: true, deleted: true, message: "Llogaria u fshi përfundimisht." };
}
