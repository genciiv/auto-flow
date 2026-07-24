import { createAuditLog } from "@/services/audit-log-service";

function getContextValues(context) {
  if (!context?.businessId) {
    throw new Error("Business context mungon për Audit Log.");
  }

  return {
    businessId: context.businessId,
    userId: context.userId || context.user?.id || null,
  };
}

export async function logCreate({
  context,
  entityType,
  entityId,
  title,
  description,
  newValues,
  metadata,
  database,
}) {
  const actor = getContextValues(context);

  return createAuditLog(
    {
      ...actor,
      action: "CREATE",
      entityType,
      entityId,
      title,
      description,
      newValues,
      metadata,
    },
    database,
  );
}

export async function logUpdate({
  context,
  entityType,
  entityId,
  title,
  description,
  oldValues,
  newValues,
  metadata,
  database,
}) {
  const actor = getContextValues(context);

  return createAuditLog(
    {
      ...actor,
      action: "UPDATE",
      entityType,
      entityId,
      title,
      description,
      oldValues,
      newValues,
      metadata,
    },
    database,
  );
}

export async function logDelete({
  context,
  entityType,
  entityId,
  title,
  description,
  oldValues,
  metadata,
  database,
}) {
  const actor = getContextValues(context);

  return createAuditLog(
    {
      ...actor,
      action: "DELETE",
      entityType,
      entityId,
      title,
      description,
      oldValues,
      metadata,
    },
    database,
  );
}

export async function logRestore({
  context,
  entityType,
  entityId,
  title,
  description,
  newValues,
  metadata,
  database,
}) {
  const actor = getContextValues(context);

  return createAuditLog(
    {
      ...actor,
      action: "RESTORE",
      entityType,
      entityId,
      title,
      description,
      newValues,
      metadata,
    },
    database,
  );
}

export async function logStatusChange({
  context,
  entityType,
  entityId,
  title,
  description,
  oldStatus,
  newStatus,
  metadata,
  database,
}) {
  const actor = getContextValues(context);

  return createAuditLog(
    {
      ...actor,
      action: "STATUS_CHANGE",
      entityType,
      entityId,
      title,
      description,
      oldValues: {
        status: oldStatus ?? null,
      },
      newValues: {
        status: newStatus ?? null,
      },
      metadata,
    },
    database,
  );
}

export async function logPayment({
  context,
  entityType = "PAYMENT",
  entityId,
  title,
  description,
  oldValues,
  newValues,
  metadata,
  database,
}) {
  const actor = getContextValues(context);

  return createAuditLog(
    {
      ...actor,
      action: "PAYMENT",
      entityType,
      entityId,
      title,
      description,
      oldValues,
      newValues,
      metadata,
    },
    database,
  );
}

export async function logExport({
  context,
  entityType,
  entityId,
  title,
  description,
  metadata,
  database,
}) {
  const actor = getContextValues(context);

  return createAuditLog(
    {
      ...actor,
      action: "EXPORT",
      entityType,
      entityId,
      title,
      description,
      metadata,
    },
    database,
  );
}

export async function logImport({
  context,
  entityType,
  entityId,
  title,
  description,
  metadata,
  database,
}) {
  const actor = getContextValues(context);

  return createAuditLog(
    {
      ...actor,
      action: "IMPORT",
      entityType,
      entityId,
      title,
      description,
      metadata,
    },
    database,
  );
}

export async function logCustom({
  context,
  entityType,
  entityId,
  title,
  description,
  oldValues,
  newValues,
  metadata,
  database,
}) {
  const actor = getContextValues(context);

  return createAuditLog(
    {
      ...actor,
      action: "CUSTOM",
      entityType,
      entityId,
      title,
      description,
      oldValues,
      newValues,
      metadata,
    },
    database,
  );
}
