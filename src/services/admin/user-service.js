import { db } from "@/lib/db";

const PAGE_SIZE = 20;
const VALID_STATUS_FILTERS = ["all", "active", "inactive", "locked", "unverified"];
const VALID_ACCESS_FILTERS = ["all", "platform_admin", "customer", "business"];

function normalizePage(value) {
  const page = Number.parseInt(value, 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function normalizeFilter(value, allowed) {
  return allowed.includes(value) ? value : "all";
}

function statusWhere(status) {
  if (status === "active") return { isActive: true };
  if (status === "inactive") return { isActive: false };
  if (status === "unverified") return { emailVerified: null };
  if (status === "locked") return { lockedUntil: { gt: new Date() } };
  return {};
}

function accessWhere(access) {
  if (access === "platform_admin") return { globalRole: "PLATFORM_ADMIN" };
  if (access === "customer") return { globalRole: "CUSTOMER" };
  if (access === "business") return { businesses: { some: {} } };
  return {};
}

export async function getAdminUsers({ search = "", status = "all", access = "all", page = 1 } = {}) {
  const normalizedSearch = typeof search === "string" ? search.trim() : "";
  const normalizedStatus = normalizeFilter(status, VALID_STATUS_FILTERS);
  const normalizedAccess = normalizeFilter(access, VALID_ACCESS_FILTERS);
  const currentPage = normalizePage(page);

  const where = {
    ...statusWhere(normalizedStatus),
    ...accessWhere(normalizedAccess),
    ...(normalizedSearch
      ? {
          OR: [
            { name: { contains: normalizedSearch, mode: "insensitive" } },
            { email: { contains: normalizedSearch, mode: "insensitive" } },
            { phone: { contains: normalizedSearch, mode: "insensitive" } },
            { businesses: { some: { business: { name: { contains: normalizedSearch, mode: "insensitive" } } } } },
          ],
        }
      : {}),
  };

  const now = new Date();
  const [users, totalItems, totalUsers, activeUsers, customerUsers, businessUsers, platformAdmins, lockedUsers] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, name: true, email: true, phone: true, globalRole: true, isActive: true,
        emailVerified: true, lastLoginAt: true, lockedUntil: true, createdAt: true,
        businesses: {
          orderBy: { createdAt: "asc" },
          select: { id: true, role: true, isActive: true, business: { select: { id: true, name: true, isActive: true } } },
        },
      },
    }),
    db.user.count({ where }),
    db.user.count(),
    db.user.count({ where: { isActive: true } }),
    db.user.count({ where: { globalRole: "CUSTOMER" } }),
    db.user.count({ where: { businesses: { some: {} } } }),
    db.user.count({ where: { globalRole: "PLATFORM_ADMIN", isActive: true } }),
    db.user.count({ where: { lockedUntil: { gt: now } } }),
  ]);

  return {
    users,
    counts: { total: totalUsers, active: activeUsers, customers: customerUsers, business: businessUsers, admins: platformAdmins, locked: lockedUsers },
    filters: { search: normalizedSearch, status: normalizedStatus, access: normalizedAccess },
    pagination: { currentPage, pageSize: PAGE_SIZE, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / PAGE_SIZE)) },
  };
}

export async function getAdminUserById(userId) {
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, phone: true, passwordHash: true, globalRole: true, isActive: true,
      emailVerified: true, lastLoginAt: true, failedLoginAttempts: true, lastFailedLoginAt: true,
      lockedUntil: true, sessionVersion: true, createdAt: true, updatedAt: true,
      customerProfile: { select: { id: true, firstName: true, lastName: true, phone: true, city: true, address: true, createdAt: true } },
      businesses: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true, role: true, isActive: true, createdAt: true,
          business: { select: { id: true, name: true, city: true, isActive: true } },
        },
      },
      _count: {
        select: {
          notifications: true, auditLogs: true, assignedServices: true, assignedAppointments: true,
          staffInvitationsSent: true, subscriptionPlanRequestsCreated: true, customerPaymentsRecorded: true,
          inventoryMovements: true, serviceLaborItemsCreated: true, chatMessagesSent: true,
        },
      },
    },
  });

  if (!user) return null;

  const recentSecurityEvents = await db.auditLog.findMany({
    where: {
      OR: [
        { userId: userId, action: { in: ["LOGIN", "LOGOUT"] } },
        { entityType: "USER", entityId: userId },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, action: true, title: true, description: true, createdAt: true, metadata: true },
  });

  const deleteBlockers = [];
  if (user.businesses.length) deleteBlockers.push("Ka akses në një ose më shumë biznese.");
  if (user.customerProfile) deleteBlockers.push("Ka profil Customer dhe të dhëna personale të lidhura.");
  if (user._count.subscriptionPlanRequestsCreated) deleteBlockers.push("Ka kërkesa plani të krijuara.");
  if (user._count.assignedServices || user._count.assignedAppointments) deleteBlockers.push("Ka shërbime ose termine të caktuara.");
  if (user._count.staffInvitationsSent) deleteBlockers.push("Ka ftesa stafi të dërguara.");
  if (user._count.customerPaymentsRecorded || user._count.inventoryMovements || user._count.serviceLaborItemsCreated) deleteBlockers.push("Ka histori operative/financiare të regjistruar.");
  if (user._count.chatMessagesSent) deleteBlockers.push("Ka mesazhe të lidhura me llogarinë.");

  return {
    ...user,
    passwordHash: undefined,
    hasPassword: Boolean(user.passwordHash),
    recentSecurityEvents,
    canDelete: deleteBlockers.length === 0,
    deleteBlockers,
  };
}

export async function setAdminUserActiveState({ userId, isActive }) {
  return db.user.update({
    where: { id: userId },
    data: { isActive, sessionVersion: { increment: 1 }, ...(isActive ? {} : { failedLoginAttempts: 0, lastFailedLoginAt: null, lockedUntil: null }) },
    select: { id: true, name: true, email: true, globalRole: true, isActive: true },
  });
}

export async function updateAdminUserProfile({ userId, name, phone }) {
  return db.user.update({ where: { id: userId }, data: { name, phone }, select: { id: true, name: true, email: true, phone: true } });
}

export async function setAdminUserEmailVerified({ userId, verified }) {
  return db.user.update({
    where: { id: userId },
    data: { emailVerified: verified ? new Date() : null, sessionVersion: { increment: 1 } },
    select: { id: true, email: true, emailVerified: true },
  });
}

export async function revokeAdminUserSessions(userId) {
  return db.user.update({ where: { id: userId }, data: { sessionVersion: { increment: 1 } }, select: { id: true, sessionVersion: true } });
}

export async function unlockAdminUser(userId) {
  return db.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lastFailedLoginAt: null, lockedUntil: null, sessionVersion: { increment: 1 } },
    select: { id: true, name: true, email: true, lockedUntil: true },
  });
}

export async function setAdminUserGlobalRole({ userId, globalRole }) {
  const nextRole = globalRole === "NONE" ? null : globalRole;
  return db.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId }, data: { globalRole: nextRole, sessionVersion: { increment: 1 } },
      select: { id: true, name: true, email: true, globalRole: true },
    });
    if (nextRole === "CUSTOMER") {
      await tx.customerProfile.upsert({ where: { userId }, update: {}, create: { userId } });
    }
    return user;
  });
}

export async function getBusinessMembershipForAdmin({ userId, membershipId }) {
  return db.businessUser.findFirst({
    where: { id: membershipId, userId },
    include: { business: { select: { id: true, name: true } } },
  });
}

export async function countOtherActiveOwners({ businessId, membershipId }) {
  return db.businessUser.count({
    where: { businessId, id: { not: membershipId }, role: "OWNER", isActive: true },
  });
}

export async function updateBusinessMembershipRole({ membershipId, role }) {
  return db.businessUser.update({ where: { id: membershipId }, data: { role }, select: { id: true, role: true, businessId: true, userId: true } });
}

export async function removeBusinessMembership(membershipId) {
  return db.businessUser.delete({ where: { id: membershipId }, select: { id: true, businessId: true, userId: true, role: true } });
}

export async function deleteAdminUser(userId) {
  return db.user.delete({ where: { id: userId }, select: { id: true, email: true, name: true } });
}

export async function countOtherActivePlatformAdmins(userId) {
  return db.user.count({ where: { id: { not: userId }, globalRole: "PLATFORM_ADMIN", isActive: true } });
}
