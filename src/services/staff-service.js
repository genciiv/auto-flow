import crypto from "node:crypto";

import { db } from "@/lib/db";
import { EMAIL_CONFIG, sendEmail } from "@/lib/email";
import { createAuditLog } from "@/services/audit-log-service";
import {
  assertPlanFeature,
  assertPlanLimit,
  PLAN_FEATURES,
  PLAN_RESOURCES,
} from "@/services/plan-access-service";

import { STAFF_ROLES, STAFF_ROLE_LABELS } from "@/config/staff";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function getStaffManagementData(businessId) {
  await db.staffInvitation.updateMany({
    where: { businessId, status: "PENDING", expiresAt: { lte: new Date() } },
    data: { status: "EXPIRED" },
  });

  const [members, invitations] = await Promise.all([
    db.businessUser.findMany({
      where: { businessId },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        role: true,
        isActive: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true, lastLoginAt: true } },
      },
    }),
    db.staffInvitation.findMany({
      where: { businessId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
    }),
  ]);

  return { members, invitations };
}

export async function createStaffInvitation({ businessId, invitedById, email, role }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("Vendos një email të vlefshëm.");
  }
  if (!STAFF_ROLES.includes(role)) {
    throw new Error("Roli i zgjedhur nuk është i vlefshëm.");
  }

  const access = await assertPlanFeature(businessId, PLAN_FEATURES.STAFF);
  await assertPlanLimit(businessId, PLAN_RESOURCES.USERS, { access });

  const existingUser = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, businesses: { where: { businessId }, select: { id: true } } },
  });
  if (existingUser?.businesses?.length) {
    throw new Error("Ky përdorues është tashmë pjesë e biznesit.");
  }

  await db.staffInvitation.updateMany({
    where: { businessId, email: normalizedEmail, status: "PENDING" },
    data: { status: "REVOKED", revokedAt: new Date() },
  });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const invitation = await db.staffInvitation.create({
    data: {
      businessId,
      invitedById,
      email: normalizedEmail,
      role,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    include: { business: { select: { name: true } }, invitedBy: { select: { name: true } } },
  });

  const url = `${EMAIL_CONFIG.appUrl}/accept-staff-invitation?token=${encodeURIComponent(rawToken)}`;
  await sendEmail({
    to: normalizedEmail,
    subject: `Ftesë për t'u bashkuar me ${invitation.business.name} në AutoFlow`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px"><h2>Ftesë në AutoFlow</h2><p>${invitation.invitedBy.name} të ka ftuar si <strong>${STAFF_ROLE_LABELS[role]}</strong> te <strong>${invitation.business.name}</strong>.</p><p style="margin:28px 0"><a href="${url}" style="background:#2563eb;color:#fff;padding:14px 20px;border-radius:10px;text-decoration:none;font-weight:700">Prano ftesën</a></p><p>Ftesa skadon pas 7 ditësh.</p></div>`,
  });

  await createAuditLog({ businessId, userId: invitedById, action: "CREATE", entityType: "StaffInvitation", entityId: invitation.id, title: "U dërgua ftesë për staf", description: `${normalizedEmail} u ftua si ${STAFF_ROLE_LABELS[role]}.`, newValues: { email: normalizedEmail, role } });
  return invitation;
}

export async function acceptStaffInvitation({ token, userId, userEmail }) {
  const invitation = await db.staffInvitation.findUnique({
    where: { tokenHash: hashToken(String(token || "")) },
    include: { business: { select: { id: true, name: true, isActive: true } } },
  });
  if (!invitation || invitation.status !== "PENDING") throw new Error("Ftesa nuk është e vlefshme ose është përdorur.");
  if (invitation.expiresAt <= new Date()) {
    await db.staffInvitation.update({ where: { id: invitation.id }, data: { status: "EXPIRED" } });
    throw new Error("Ftesa ka skaduar.");
  }
  if (normalizeEmail(userEmail) !== normalizeEmail(invitation.email)) throw new Error("Hyr me email-in ku është dërguar ftesa.");
  if (!invitation.business.isActive) throw new Error("Biznesi nuk është aktiv.");

  await assertPlanFeature(invitation.businessId, PLAN_FEATURES.STAFF);
  await assertPlanLimit(invitation.businessId, PLAN_RESOURCES.USERS);

  await db.$transaction(async (tx) => {
    await tx.businessUser.upsert({
      where: { userId_businessId: { userId, businessId: invitation.businessId } },
      update: { role: invitation.role, isActive: true },
      create: { userId, businessId: invitation.businessId, role: invitation.role, isActive: true },
    });
    await tx.staffInvitation.update({ where: { id: invitation.id }, data: { status: "ACCEPTED", acceptedAt: new Date() } });
  });

  await createAuditLog({ businessId: invitation.businessId, userId, action: "CREATE", entityType: "BusinessUser", entityId: userId, title: "Ftesa e stafit u pranua", description: `${userEmail} iu bashkua biznesit si ${STAFF_ROLE_LABELS[invitation.role]}.`, newValues: { role: invitation.role } });
  return invitation.business;
}
