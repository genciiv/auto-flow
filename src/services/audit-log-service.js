import { db } from "@/lib/db";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "confirmPassword",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
  "authorization",
  "cookie",
  "session",
]);

const VALID_AUDIT_ACTIONS = new Set([
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
]);

function normalizeAuditAction(action) {
  const normalizedAction = String(action || "")
    .trim()
    .toUpperCase();

  if (!VALID_AUDIT_ACTIONS.has(normalizedAction)) {
    throw new Error(`Audit action "${normalizedAction}" nuk është i vlefshëm.`);
  }

  return normalizedAction;
}

function normalizeEntityType(entityType) {
  const normalizedEntityType = String(entityType || "")
    .trim()
    .toUpperCase();

  if (!normalizedEntityType) {
    throw new Error("Entity type mungon.");
  }

  return normalizedEntityType;
}

function normalizeOptionalString(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalizedValue = String(value).trim();

  return normalizedValue || null;
}

function isSensitiveKey(key) {
  return SENSITIVE_KEYS.has(String(key || "").toLowerCase());
}

function serializeAuditValue(value, visited = new WeakSet()) {
  if (value === undefined) {
    return null;
  }

  if (value === null) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value?.toJSON === "function") {
    try {
      return serializeAuditValue(value.toJSON(), visited);
    } catch {
      return String(value);
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeAuditValue(item, visited));
  }

  if (typeof value === "object") {
    if (visited.has(value)) {
      return "[Circular]";
    }

    visited.add(value);

    const output = {};

    for (const [key, item] of Object.entries(value)) {
      if (isSensitiveKey(key)) {
        output[key] = "[REDACTED]";
        continue;
      }

      output[key] = serializeAuditValue(item, visited);
    }

    visited.delete(value);

    return output;
  }

  return String(value);
}

function prepareJsonValue(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  return serializeAuditValue(value);
}

function prepareAuditData({
  businessId,
  userId,
  action,
  entityType,
  entityId,
  title,
  description,
  oldValues,
  newValues,
  metadata,
}) {
  if (!businessId) {
    throw new Error("Business ID mungon për Audit Log.");
  }

  const normalizedTitle = String(title || "").trim();

  if (!normalizedTitle) {
    throw new Error("Titulli i Audit Log mungon.");
  }

  return {
    businessId,
    userId: normalizeOptionalString(userId),
    action: normalizeAuditAction(action),
    entityType: normalizeEntityType(entityType),
    entityId: normalizeOptionalString(entityId),
    title: normalizedTitle,
    description: normalizeOptionalString(description),
    oldValues: prepareJsonValue(oldValues),
    newValues: prepareJsonValue(newValues),
    metadata: prepareJsonValue(metadata),
  };
}

export async function createAuditLog(
  {
    businessId,
    userId,
    action,
    entityType,
    entityId,
    title,
    description,
    oldValues,
    newValues,
    metadata,
  },
  database = db,
) {
  const data = prepareAuditData({
    businessId,
    userId,
    action,
    entityType,
    entityId,
    title,
    description,
    oldValues,
    newValues,
    metadata,
  });

  return database.auditLog.create({
    data,

    select: {
      id: true,
      businessId: true,
      userId: true,
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
    },
  });
}

export async function getBusinessAuditLogs({
  businessId,
  action,
  entityType,
  entityId,
  userId,
  search,
  page = 1,
  pageSize = 20,
}) {
  if (!businessId) {
    throw new Error("Business ID mungon.");
  }

  const normalizedPage = Math.max(Number(page) || 1, 1);
  const normalizedPageSize = Math.min(Math.max(Number(pageSize) || 20, 1), 100);

  const skip = (normalizedPage - 1) * normalizedPageSize;

  const where = {
    businessId,
  };

  if (action) {
    where.action = normalizeAuditAction(action);
  }

  if (entityType) {
    where.entityType = normalizeEntityType(entityType);
  }

  if (entityId) {
    where.entityId = String(entityId);
  }

  if (userId) {
    where.userId = String(userId);
  }

  const normalizedSearch = String(search || "").trim();

  if (normalizedSearch) {
    where.OR = [
      {
        title: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
      {
        entityType: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
      {
        user: {
          name: {
            contains: normalizedSearch,
            mode: "insensitive",
          },
        },
      },
      {
        user: {
          email: {
            contains: normalizedSearch,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: normalizedPageSize,

      select: {
        id: true,
        businessId: true,
        userId: true,
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
      },
    }),

    db.auditLog.count({
      where,
    }),
  ]);

  return {
    logs,
    pagination: {
      page: normalizedPage,
      pageSize: normalizedPageSize,
      total,
      totalPages: Math.max(Math.ceil(total / normalizedPageSize), 1),
      hasNextPage: normalizedPage * normalizedPageSize < total,
      hasPreviousPage: normalizedPage > 1,
    },
  };
}

export async function getEntityAuditLogs({
  businessId,
  entityType,
  entityId,
  limit = 50,
}) {
  if (!businessId) {
    throw new Error("Business ID mungon.");
  }

  if (!entityId) {
    throw new Error("Entity ID mungon.");
  }

  const normalizedLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);

  return db.auditLog.findMany({
    where: {
      businessId,
      entityType: normalizeEntityType(entityType),
      entityId: String(entityId),
    },

    orderBy: {
      createdAt: "desc",
    },

    take: normalizedLimit,

    select: {
      id: true,
      userId: true,
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
    },
  });
}

export async function getRecentBusinessActivity({ businessId, limit = 10 }) {
  if (!businessId) {
    throw new Error("Business ID mungon.");
  }

  const normalizedLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

  return db.auditLog.findMany({
    where: {
      businessId,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: normalizedLimit,

    select: {
      id: true,
      userId: true,
      action: true,
      entityType: true,
      entityId: true,
      title: true,
      description: true,
      metadata: true,
      createdAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}
