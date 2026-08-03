import { db } from "@/lib/db";

const ROLE_GROUPS = {
  MANAGEMENT: ["OWNER", "MANAGER"],
  FRONT_DESK: ["OWNER", "MANAGER", "RECEPTIONIST"],
  WAREHOUSE: ["OWNER", "MANAGER", "WAREHOUSE"],
  FINANCE: ["OWNER", "MANAGER", "ACCOUNTANT"],
};

function startOfDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

async function getActiveRoleUsers(database, businessId, roles) {
  const memberships = await database.businessUser.findMany({
    where: { businessId, isActive: true, role: { in: roles } },
    select: { userId: true },
  });

  return [...new Set(memberships.map((item) => item.userId).filter(Boolean))];
}

export async function notifyUsersByRoles({
  database = db,
  businessId,
  roles,
  title,
  message,
  type = "INFO",
  entityType = "SYSTEM",
  entityId = null,
  excludeUserId = null,
}) {
  const userIds = await getActiveRoleUsers(database, businessId, roles);
  const recipients = userIds.filter((userId) => userId !== excludeUserId);

  if (recipients.length === 0) return { count: 0 };

  return database.notification.createMany({
    data: recipients.map((userId) => ({
      userId,
      businessId: null,
      title,
      message,
      type,
      entityType,
      entityId,
    })),
  });
}

export async function notifyAssignedMechanic({
  database = db,
  businessId,
  mechanicUserId,
  serviceId,
  serviceTitle,
  plate,
}) {
  if (!mechanicUserId) return null;

  return database.notification.create({
    data: {
      userId: mechanicUserId,
      title: "Punë e re e caktuar",
      message: `${serviceTitle}${plate ? ` (${plate})` : ""} të është caktuar për përpunim.`,
      type: "INFO",
      entityType: "SERVICE",
      entityId: serviceId,
    },
  });
}

export async function notifyServiceWaitingForParts({ database = db, businessId, serviceId, serviceTitle, plate }) {
  return notifyUsersByRoles({
    database,
    businessId,
    roles: ROLE_GROUPS.WAREHOUSE,
    title: "Puna po pret pjesë",
    message: `${serviceTitle}${plate ? ` (${plate})` : ""} kaloi në pritje të pjesëve.`,
    type: "WARNING",
    entityType: "SERVICE",
    entityId: serviceId,
  });
}

export async function notifyServiceReadyForPickup({ database = db, businessId, serviceId, serviceTitle, plate }) {
  return notifyUsersByRoles({
    database,
    businessId,
    roles: ROLE_GROUPS.FRONT_DESK,
    title: "Automjeti është gati",
    message: `${serviceTitle}${plate ? ` (${plate})` : ""} është gati për dorëzim.`,
    type: "SUCCESS",
    entityType: "SERVICE",
    entityId: serviceId,
  });
}

export async function notifyLowStock({ database = db, businessId, partId, partName, stock, minStock }) {
  return notifyUsersByRoles({
    database,
    businessId,
    roles: ROLE_GROUPS.WAREHOUSE,
    title: "Stok i ulët",
    message: `${partName} ka mbetur në ${stock} copë (minimumi ${minStock}).`,
    type: "WARNING",
    entityType: "SYSTEM",
    entityId: partId,
  });
}

export async function notifyPartialPayment({ database = db, businessId, invoiceId, invoiceNumber, remaining }) {
  return notifyUsersByRoles({
    database,
    businessId,
    roles: ROLE_GROUPS.FINANCE,
    title: "Pagesë e pjesshme",
    message: `Fatura ${invoiceNumber} ka ende ${Math.max(remaining, 0).toFixed(0)} Lekë pa paguar.`,
    type: "WARNING",
    entityType: "PAYMENT",
    entityId: invoiceId,
  });
}

async function createDailyNotificationOnce({ database, userId, title, message, type, entityType, entityId, dayStart, dayEnd }) {
  const exists = await database.notification.findFirst({
    where: { userId, title, entityType, entityId, createdAt: { gte: dayStart, lte: dayEnd } },
    select: { id: true },
  });

  if (exists) return false;

  await database.notification.create({
    data: { userId, title, message, type, entityType, entityId },
  });
  return true;
}

export async function syncOperationalReminders({ businessId }) {
  if (!businessId) return;

  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [frontDeskUsers, financeUsers, warehouseUsers, appointments, overdueInvoices, lowStockParts] = await Promise.all([
    getActiveRoleUsers(db, businessId, ROLE_GROUPS.FRONT_DESK),
    getActiveRoleUsers(db, businessId, ROLE_GROUPS.FINANCE),
    getActiveRoleUsers(db, businessId, ROLE_GROUPS.WAREHOUSE),
    db.appointment.findMany({
      where: { businessId, date: { gte: dayStart, lte: dayEnd }, status: { notIn: ["COMPLETED", "CANCELLED"] } },
      select: { id: true, title: true, date: true },
      take: 50,
    }),
    db.invoice.findMany({
      where: { businessId, status: "UNPAID", createdAt: { lte: sevenDaysAgo } },
      select: { id: true, number: true, total: true },
      take: 50,
    }),
    db.part.findMany({
      where: { businessId },
      select: { id: true, name: true, stock: true, minStock: true },
      take: 500,
    }).then((items) => items.filter((item) => Number(item.stock) <= Number(item.minStock))),
  ]);

  const tasks = [];

  for (const appointment of appointments) {
    for (const userId of frontDeskUsers) {
      tasks.push(createDailyNotificationOnce({
        database: db,
        userId,
        title: "Termin sot",
        message: `${appointment.title} është planifikuar sot në ${new Intl.DateTimeFormat("sq-AL", { hour: "2-digit", minute: "2-digit" }).format(appointment.date)}.`,
        type: "INFO",
        entityType: "APPOINTMENT",
        entityId: appointment.id,
        dayStart,
        dayEnd,
      }));
    }
  }

  for (const invoice of overdueInvoices) {
    for (const userId of financeUsers) {
      tasks.push(createDailyNotificationOnce({
        database: db,
        userId,
        title: "Faturë e papaguar",
        message: `Fatura ${invoice.number} (${Number(invoice.total).toFixed(0)} Lekë) është e papaguar prej më shumë se 7 ditësh.`,
        type: "WARNING",
        entityType: "PAYMENT",
        entityId: invoice.id,
        dayStart,
        dayEnd,
      }));
    }
  }

  for (const part of lowStockParts) {
    for (const userId of warehouseUsers) {
      tasks.push(createDailyNotificationOnce({
        database: db,
        userId,
        title: "Stok nën minimum",
        message: `${part.name}: ${part.stock} në stok, minimumi ${part.minStock}.`,
        type: "WARNING",
        entityType: "SYSTEM",
        entityId: part.id,
        dayStart,
        dayEnd,
      }));
    }
  }

  await Promise.all(tasks);
}
