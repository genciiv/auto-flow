"use server";

import { revalidatePath } from "next/cache";

import { actionFailure, actionSuccess, errorFailure } from "@/lib/action-result";
import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { ERROR_CODES } from "@/lib/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { createAuditLog } from "@/services/audit-log-service";
import { STAFF_ROLES, STAFF_ROLE_LABELS } from "@/config/staff";
import { createStaffInvitation } from "@/services/staff-service";

export async function inviteStaffAction(previousState, formData) {
  try {
    const context = await requireBusinessActionPermission(PERMISSIONS.STAFF_CREATE);
    const email = String(formData.get("email") || "").trim();
    const role = String(formData.get("role") || "");
    await createStaffInvitation({ businessId: context.businessId, invitedById: context.userId, email, role });
    revalidatePath("/dashboard/staff");
    return actionSuccess({ message: "Ftesa u dërgua me sukses." });
  } catch (error) {
    return errorFailure(error, { fallbackCode: ERROR_CODES.VALIDATION_ERROR, fallbackMessage: error?.message || "Ftesa nuk u dërgua." });
  }
}

export async function updateStaffRoleAction(previousState, formData) {
  try {
    const context = await requireBusinessActionPermission(PERMISSIONS.STAFF_MANAGE_ROLES);
    const membershipId = String(formData.get("membershipId") || "");
    const role = String(formData.get("role") || "");
    if (!STAFF_ROLES.includes(role)) return actionFailure({ code: ERROR_CODES.VALIDATION_ERROR, message: "Roli nuk është i vlefshëm." });
    const member = await db.businessUser.findFirst({ where: { id: membershipId, businessId: context.businessId }, include: { user: { select: { email: true } } } });
    if (!member || member.role === "OWNER") return actionFailure({ code: ERROR_CODES.FORBIDDEN, message: "Pronari nuk mund të ndryshohet nga kjo faqe." });
    const oldRole = member.role;
    await db.businessUser.update({ where: { id: member.id }, data: { role } });
    await createAuditLog({ businessId: context.businessId, userId: context.userId, action: "UPDATE", entityType: "BusinessUser", entityId: member.id, title: "U ndryshua roli i stafit", description: `${member.user.email}: ${STAFF_ROLE_LABELS[oldRole]} → ${STAFF_ROLE_LABELS[role]}.`, oldValues: { role: oldRole }, newValues: { role } });
    revalidatePath("/dashboard/staff");
    return actionSuccess({ message: "Roli u përditësua." });
  } catch (error) { return errorFailure(error); }
}

export async function toggleStaffStatusAction(previousState, formData) {
  try {
    const context = await requireBusinessActionPermission(PERMISSIONS.STAFF_DELETE);
    const membershipId = String(formData.get("membershipId") || "");
    const member = await db.businessUser.findFirst({ where: { id: membershipId, businessId: context.businessId }, include: { user: { select: { email: true } } } });
    if (!member || member.role === "OWNER" || member.id === context.membershipId) return actionFailure({ code: ERROR_CODES.FORBIDDEN, message: "Ky përdorues nuk mund të çaktivizohet." });
    const isActive = !member.isActive;
    await db.businessUser.update({ where: { id: member.id }, data: { isActive } });
    await createAuditLog({ businessId: context.businessId, userId: context.userId, action: "UPDATE", entityType: "BusinessUser", entityId: member.id, title: isActive ? "Stafi u aktivizua" : "Stafi u çaktivizua", description: member.user.email, oldValues: { isActive: member.isActive }, newValues: { isActive } });
    revalidatePath("/dashboard/staff");
    return actionSuccess({ message: isActive ? "Përdoruesi u aktivizua." : "Përdoruesi u çaktivizua." });
  } catch (error) { return errorFailure(error); }
}

export async function revokeInvitationAction(previousState, formData) {
  try {
    const context = await requireBusinessActionPermission(PERMISSIONS.STAFF_DELETE);
    const invitationId = String(formData.get("invitationId") || "");
    const invitation = await db.staffInvitation.findFirst({ where: { id: invitationId, businessId: context.businessId, status: "PENDING" } });
    if (!invitation) return actionFailure({ code: ERROR_CODES.NOT_FOUND, message: "Ftesa nuk u gjet." });
    await db.staffInvitation.update({ where: { id: invitation.id }, data: { status: "REVOKED", revokedAt: new Date() } });
    revalidatePath("/dashboard/staff");
    return actionSuccess({ message: "Ftesa u anulua." });
  } catch (error) { return errorFailure(error); }
}
