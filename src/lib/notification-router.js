export function getNotificationUrl(notification) {
  if (!notification) {
    return null;
  }

  const { entityType, entityId } = notification;

  if (!entityType || !entityId) {
    return null;
  }

  switch (entityType) {
    case "CUSTOMER":
      return `/dashboard/customers/${entityId}`;

    case "VEHICLE":
      return `/dashboard/vehicles/${entityId}`;

    case "SERVICE":
      return `/dashboard/services/${entityId}`;

    case "APPOINTMENT":
      return `/dashboard/calendar/${entityId}`;

    case "PAYMENT":
      return `/dashboard/payments/${entityId}`;

    case "SUBSCRIPTION":
      return `/dashboard/subscriptions/${entityId}`;

    case "DOCUMENT":
      if (entityId.startsWith("customer-vehicle:")) {
        return `/customer/vehicles/${entityId.slice("customer-vehicle:".length)}#documents`;
      }
      return `/dashboard/documents/${entityId}`;

    case "BUSINESS":
      return `/dashboard/settings`;

    case "SYSTEM":
      return null;

    default:
      return null;
  }
}
