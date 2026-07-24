import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AuditLogClient from "@/components/audit/AuditLogClient";

import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";
import { getBusinessAuditLogs } from "@/services/audit-log-service";

function normalizeSearchParam(value) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}

export default async function AuditLogPage({ searchParams }) {
  const params = await searchParams;

  const { businessId } = await requireBusinessPermission(
    PERMISSIONS.AUDIT_VIEW,
  );

  const filters = {
    search: normalizeSearchParam(params?.search),
    action: normalizeSearchParam(params?.action),
    entityType: normalizeSearchParam(params?.entityType),
    userId: normalizeSearchParam(params?.userId),
    page: Math.max(Number(normalizeSearchParam(params?.page)) || 1, 1),
    pageSize: 20,
  };

  const auditWhere = {
    businessId,
  };

  const [
    auditData,
    totalEvents,
    updateEvents,
    deleteEvents,
    paymentEvents,
    statusChangeEvents,
    users,
    entityRows,
  ] = await Promise.all([
    getBusinessAuditLogs({
      businessId,
      search: filters.search,
      action: filters.action || undefined,
      entityType: filters.entityType || undefined,
      userId: filters.userId || undefined,
      page: filters.page,
      pageSize: filters.pageSize,
    }),

    db.auditLog.count({
      where: auditWhere,
    }),

    db.auditLog.count({
      where: {
        ...auditWhere,
        action: "UPDATE",
      },
    }),

    db.auditLog.count({
      where: {
        ...auditWhere,
        action: "DELETE",
      },
    }),

    db.auditLog.count({
      where: {
        ...auditWhere,
        action: "PAYMENT",
      },
    }),

    db.auditLog.count({
      where: {
        ...auditWhere,
        action: "STATUS_CHANGE",
      },
    }),

    db.user.findMany({
      where: {
        auditLogs: {
          some: {
            businessId,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),

    db.auditLog.findMany({
      where: {
        businessId,
      },
      distinct: ["entityType"],
      orderBy: {
        entityType: "asc",
      },
      select: {
        entityType: true,
      },
    }),
  ]);

  const logs = auditData.logs.map((log) => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
  }));

  const stats = {
    totalEvents,
    updateEvents,
    deleteEvents,
    paymentEvents,
    statusChangeEvents,
  };

  const entityTypes = entityRows.map((row) => row.entityType).filter(Boolean);

  return (
    <DashboardLayout>
      <AuditLogClient
        logs={logs}
        pagination={auditData.pagination}
        stats={stats}
        users={users}
        entityTypes={entityTypes}
        filters={filters}
      />
    </DashboardLayout>
  );
}
