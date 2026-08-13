import { db } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

function getCustomerName(claim) {
  return (
    [
      claim.customerVehicle?.profile?.firstName,
      claim.customerVehicle?.profile?.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    claim.customerVehicle?.profile?.user?.name ||
    "Klient AutoFlow"
  );
}

function getVehicleTitle(vehicle) {
  return (
    [vehicle?.brand, vehicle?.model].filter(Boolean).join(" ") ||
    vehicle?.brand ||
    "Automjet"
  );
}

function canViewNotificationForRole(notification, businessRole) {
  const permissionByEntityType = {
    APPOINTMENT: PERMISSIONS.APPOINTMENTS_VIEW,
    CHAT: PERMISSIONS.MESSAGES_VIEW,
    CUSTOMER: PERMISSIONS.CUSTOMERS_VIEW,
    DOCUMENT: PERMISSIONS.VEHICLES_VIEW,
    INVOICE: PERMISSIONS.INVOICES_VIEW,
    PAYMENT: PERMISSIONS.INVOICES_VIEW,
    SERVICE: PERMISSIONS.SERVICES_VIEW,
    SUBSCRIPTION: PERMISSIONS.BILLING_MANAGE,
    SYSTEM: PERMISSIONS.INVENTORY_VIEW,
    VEHICLE: PERMISSIONS.VEHICLES_VIEW,
  };

  const permission = permissionByEntityType[notification.entityType];
  return permission ? hasPermission(businessRole, permission) : false;
}

export async function getDashboardNotifications(businessId, userId = null, businessRole = null) {
  if (!businessId) {
    return {
      unreadCount: 0,
      vehicleClaimPendingCount: 0,
      notifications: [],
    };
  }

  const canManageVehicleClaims = hasPermission(
    businessRole,
    PERMISSIONS.VEHICLES_UPDATE,
  );

  const [
    vehicleClaimPendingCount,
    vehicleClaims,
    businessNotificationUnreadCount,
    businessNotifications,
    userNotificationUnreadCount,
    userNotifications,
  ] = await Promise.all([

    canManageVehicleClaims
      ? db.vehicleClaim.count({
          where: {
            status: "PENDING",
            vehicle: { businessId },
          },
        })
      : Promise.resolve(0),

    canManageVehicleClaims
      ? db.vehicleClaim.findMany({
      where: {
        status: "PENDING",
        vehicle: { businessId },
      },
      select: {
        id: true,
        createdAt: true,
        customerMessage: true,
        customerVehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                user: {
                  select: { name: true },
                },
              },
            },
          },
        },
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
          take: 8,
        })
      : Promise.resolve([]),

    db.notification.count({
      where: {
        businessId,
        isRead: false,
      },
    }),

    db.notification.findMany({
      where: { businessId },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        entityType: true,
        entityId: true,
        isRead: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),

    userId
      ? db.notification.count({
          where: { userId, businessId, isRead: false },
        })
      : Promise.resolve(0),

    userId
      ? db.notification.findMany({
          where: { userId, businessId },
          select: {
            id: true,
            title: true,
            message: true,
            type: true,
            entityType: true,
            entityId: true,
            isRead: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 12,
        })
      : Promise.resolve([]),
  ]);

  const vehicleClaimNotifications = vehicleClaims.map((claim) => {
    const customerName = getCustomerName(claim);
    const vehicleTitle = getVehicleTitle(claim.vehicle);

    return {
      id: `vehicle-claim-${claim.id}`,
      sourceId: claim.id,
      kind: "VEHICLE_CLAIM",
      title: "Kërkesë për lidhjen e automjetit",
      subtitle: customerName,
      message:
        claim.customerMessage ||
        `${customerName} kërkon të lidhë ${vehicleTitle} – ${claim.vehicle.plate}.`,
      isRead: false,
      createdAt: claim.createdAt.toISOString(),
      href: "/dashboard/vehicle-claims",
      image: null,
      vehicle: {
        title: vehicleTitle,
        plate: claim.vehicle.plate,
      },
    };
  });

  function getNotificationHref(notification) {
    if (notification.entityType === "SUBSCRIPTION") return "/dashboard/settings/subscription";
    if (notification.entityType === "SERVICE" && notification.entityId) return `/dashboard/services/${notification.entityId}`;
    if (notification.entityType === "APPOINTMENT") return "/dashboard/appointments";
    if (notification.entityType === "PAYMENT" && notification.entityId) return `/dashboard/invoices/${notification.entityId}`;
    if (notification.entityType === "CHAT" && notification.entityId) return `/dashboard/messages/${notification.entityId}`;
    if (notification.entityType === "SYSTEM") return "/dashboard/inventory";
    if (notification.entityType === "CUSTOMER") return "/dashboard/customers";
    if (notification.entityType === "VEHICLE") return "/dashboard/vehicles";
    return "/dashboard";
  }

  function mapSystemNotification(notification, scope) {
    return {
      id: `${scope}-notification-${notification.id}`,
      sourceId: notification.id,
      notificationScope: scope,
      kind: "SYSTEM_NOTIFICATION",
      title: notification.title,
      subtitle: notification.entityType === "SUBSCRIPTION" ? "Abonimi" : "AutoFlow",
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
      href: getNotificationHref(notification),
      image: null,
      notificationType: notification.type,
    };
  }

  const allowedBusinessNotifications = businessNotifications.filter((notification) =>
    canViewNotificationForRole(notification, businessRole),
  );

  const allowedUserNotifications = userNotifications.filter((notification) =>
    canViewNotificationForRole(notification, businessRole),
  );

  const systemNotifications = allowedBusinessNotifications.map((notification) =>
    mapSystemNotification(notification, "business"),
  );
  const personalNotifications = allowedUserNotifications.map((notification) =>
    mapSystemNotification(notification, "user"),
  );

  const notifications = [
    ...personalNotifications,
    ...systemNotifications,
    ...vehicleClaimNotifications,
  ]
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    )
    .slice(0, 8);

  return {
    unreadCount:
      vehicleClaimPendingCount +
      allowedBusinessNotifications.filter((notification) => !notification.isRead).length +
      allowedUserNotifications.filter((notification) => !notification.isRead).length,
    vehicleClaimPendingCount,
    notifications,
  };
}
