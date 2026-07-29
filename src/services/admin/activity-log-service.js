import { db } from "@/lib/db";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

function normalizeLimit(value) {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsedValue, MAX_LIMIT);
}

function cleanOptionalText(value) {
  if (typeof value !== "string") {
    return null;
  }

  const cleanedValue = value.trim();

  return cleanedValue || null;
}

function normalizeJsonValue(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  return value;
}

export async function createPlatformAuditLog({
  userId,
  businessId = null,
  action,
  entityType,
  entityId = null,
  title,
  description = null,
  oldValues,
  newValues,
  metadata,
}) {
  if (!action) {
    throw new Error("Audit action është i detyrueshëm.");
  }

  if (!entityType) {
    throw new Error("Entity type është i detyrueshëm.");
  }

  if (!title) {
    throw new Error("Titulli i activity log është i detyrueshëm.");
  }

  return db.auditLog.create({
    data: {
      userId: userId || null,
      businessId: businessId || null,
      action,
      entityType: String(entityType).trim(),
      entityId: cleanOptionalText(entityId),
      title: String(title).trim(),
      description: cleanOptionalText(description),
      oldValues: normalizeJsonValue(oldValues),
      newValues: normalizeJsonValue(newValues),
      metadata: normalizeJsonValue(metadata),
    },
  });
}

export async function getPlatformActivityLogs({
  page = 1,
  limit = DEFAULT_LIMIT,
  action,
  entityType,
  search,
} = {}) {
  const take = normalizeLimit(limit);
  const currentPage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const skip = (currentPage - 1) * take;

  const cleanSearch = typeof search === "string" ? search.trim() : "";

  const where = {
    ...(action ? { action } : {}),
    ...(entityType ? { entityType } : {}),
    ...(cleanSearch
      ? {
          OR: [
            {
              title: {
                contains: cleanSearch,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: cleanSearch,
                mode: "insensitive",
              },
            },
            {
              entityType: {
                contains: cleanSearch,
                mode: "insensitive",
              },
            },
            {
              user: {
                is: {
                  OR: [
                    {
                      name: {
                        contains: cleanSearch,
                        mode: "insensitive",
                      },
                    },
                    {
                      email: {
                        contains: cleanSearch,
                        mode: "insensitive",
                      },
                    },
                  ],
                },
              },
            },
            {
              business: {
                is: {
                  name: {
                    contains: cleanSearch,
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        title: true,
        description: true,
        oldValues: true,
        newValues: true,
        metadata: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    db.auditLog.count({
      where,
    }),
  ]);

  return {
    logs,
    pagination: {
      page: currentPage,
      limit: take,
      total,
      totalPages: Math.max(Math.ceil(total / take), 1),
    },
  };
}

export async function getPlatformActivityLogById(id) {
  if (!id) {
    return null;
  }

  return db.auditLog.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      business: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function getActivityLogFilterOptions() {
  const entityTypes = await db.auditLog.findMany({
    distinct: ["entityType"],
    orderBy: {
      entityType: "asc",
    },
    select: {
      entityType: true,
    },
  });

  return {
    actions: [
      "CREATE",
      "UPDATE",
      "DELETE",
      "RESTORE",
      "STATUS_CHANGE",
      "LOGIN",
      "LOGOUT",
      "EXPORT",
      "IMPORT",
      "PAYMENT",
      "CUSTOM",
    ],
    entityTypes: entityTypes.map((item) => item.entityType),
  };
}
