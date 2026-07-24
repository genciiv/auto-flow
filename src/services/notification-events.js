import {
  createBusinessNotification,
  createCustomerNotification,
} from "@/services/notification-service";

/*
|--------------------------------------------------------------------------
| CUSTOMER
|--------------------------------------------------------------------------
*/

export async function notifyCustomerCreated({
  businessId,
  customerId,
  customerName,
}) {
  return createBusinessNotification({
    businessId,
    title: "Klient i ri",
    message: `Klienti "${customerName}" u regjistrua me sukses.`,
    type: "SUCCESS",
    entityType: "CUSTOMER",
    entityId: customerId,
  });
}

/*
|--------------------------------------------------------------------------
| VEHICLE
|--------------------------------------------------------------------------
*/

export async function notifyVehicleCreated({
  businessId,
  vehicleId,
  brand,
  model,
  plateNumber,
}) {
  const vehicle = [brand, model].filter(Boolean).join(" ") || "Automjet";

  const plate = plateNumber ? ` (${plateNumber})` : "";

  return createBusinessNotification({
    businessId,
    title: "Automjet i ri",
    message: `${vehicle}${plate} u shtua në sistem.`,
    type: "SUCCESS",
    entityType: "VEHICLE",
    entityId: vehicleId,
  });
}

/*
|--------------------------------------------------------------------------
| SERVICE
|--------------------------------------------------------------------------
*/

export async function notifyServiceCreated({
  businessId,
  serviceId,
  plateNumber,
}) {
  return createBusinessNotification({
    businessId,
    title: "Servis i ri",
    message: `U hap një servis i ri për automjetin ${plateNumber}.`,
    type: "INFO",
    entityType: "SERVICE",
    entityId: serviceId,
  });
}

export async function notifyServiceCompleted({
  businessId,
  serviceId,
  plateNumber,
}) {
  return createBusinessNotification({
    businessId,
    title: "Servisi përfundoi",
    message: `Servisi për automjetin ${plateNumber} u përfundua me sukses.`,
    type: "SUCCESS",
    entityType: "SERVICE",
    entityId: serviceId,
  });
}

/*
|--------------------------------------------------------------------------
| APPOINTMENT
|--------------------------------------------------------------------------
*/

export async function notifyAppointmentCreated({
  businessId,
  appointmentId,
  customerName,
}) {
  return createBusinessNotification({
    businessId,
    title: "Rezervim i ri",
    message: `${customerName} rezervoi një takim të ri.`,
    type: "INFO",
    entityType: "APPOINTMENT",
    entityId: appointmentId,
  });
}

/*
|--------------------------------------------------------------------------
| PAYMENT
|--------------------------------------------------------------------------
*/

export async function notifyPaymentReceived({ businessId, paymentId, amount }) {
  return createBusinessNotification({
    businessId,
    title: "Pagesë e pranuar",
    message: `U regjistrua një pagesë prej ${amount} ALL.`,
    type: "SUCCESS",
    entityType: "PAYMENT",
    entityId: paymentId,
  });
}

/*
|--------------------------------------------------------------------------
| SUBSCRIPTION
|--------------------------------------------------------------------------
*/

export async function notifySubscriptionUpdated({
  userId,
  subscriptionId,
  planName,
}) {
  return createCustomerNotification({
    userId,
    title: "Abonimi u përditësua",
    message: `Plani juaj u ndryshua në "${planName}".`,
    type: "SUCCESS",
    entityType: "SUBSCRIPTION",
    entityId: subscriptionId,
  });
}

/*
|--------------------------------------------------------------------------
| MARKETPLACE
|--------------------------------------------------------------------------
*/

export async function notifyMarketplaceListingPublished({
  businessId,
  listingId,
  listingTitle,
}) {
  return createBusinessNotification({
    businessId,
    title: "Produkti u publikua",
    message: `"${listingTitle}" u publikua në Marketplace.`,
    type: "SUCCESS",
    entityType: "MARKETPLACE",
    entityId: listingId,
  });
}

export async function notifyMarketplaceInquiry({
  businessId,
  listingId,
  senderName,
}) {
  return createBusinessNotification({
    businessId,
    title: "Interesim i ri",
    message: `${senderName} dërgoi një kërkesë për produktin tuaj.`,
    type: "INFO",
    entityType: "MARKETPLACE",
    entityId: listingId,
  });
}

/*
|--------------------------------------------------------------------------
| DOCUMENT
|--------------------------------------------------------------------------
*/

export async function notifyDocumentUploaded({
  businessId,
  documentId,
  documentName,
}) {
  return createBusinessNotification({
    businessId,
    title: "Dokument i ri",
    message: `Dokumenti "${documentName}" u ngarkua.`,
    type: "INFO",
    entityType: "DOCUMENT",
    entityId: documentId,
  });
}

/*
|--------------------------------------------------------------------------
| SYSTEM
|--------------------------------------------------------------------------
*/

export async function notifySystemMessage({
  userId,
  title,
  message,
  type = "INFO",
}) {
  return createCustomerNotification({
    userId,
    title,
    message,
    type,
    entityType: "SYSTEM",
    entityId: null,
  });
}
