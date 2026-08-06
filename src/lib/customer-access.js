/**
 * Server-side access filters for the customer portal.
 *
 * Never trust profileId, businessId or ownership identifiers coming from the
 * browser. profileId must always come from requireCustomerContext() or
 * requireCustomerActionContext().
 */
export function customerVehicleAccessWhere(profileId, vehicleId = null) {
  return {
    ...(vehicleId ? { id: vehicleId } : {}),
    profileId,
  };
}

export function activeCustomerVehicleLinkWhere(
  profileId,
  { linkId = null, vehicleId = null, businessId = null } = {},
) {
  return {
    ...(linkId ? { id: linkId } : {}),
    ...(vehicleId ? { vehicleId } : {}),
    isActive: true,
    customerVehicle: { profileId },
    ...(businessId ? { vehicle: { businessId } } : {}),
  };
}

export function customerServiceAccessWhere(profileId, serviceId = null) {
  return {
    ...(serviceId ? { id: serviceId } : {}),
    vehicle: {
      customerLinks: {
        some: activeCustomerVehicleLinkWhere(profileId),
      },
    },
  };
}

export function customerConversationAccessWhere(
  profileId,
  conversationId = null,
) {
  return {
    ...(conversationId ? { id: conversationId } : {}),
    customerProfileId: profileId,
    vehicle: {
      customerLinks: {
        some: activeCustomerVehicleLinkWhere(profileId),
      },
    },
  };
}
