import { createForbiddenError, createNotFoundError } from "@/lib/errors";
import { db } from "@/lib/db";
import {
  activeCustomerVehicleLinkWhere,
  customerConversationAccessWhere,
} from "@/lib/customer-access";

export async function requireActiveCustomerVehicleLink({
  businessId,
  customerProfileId,
  vehicleId,
  database = db,
}) {
  const link = await database.customerVehicleLink.findFirst({
    where: activeCustomerVehicleLinkWhere(customerProfileId, {
      vehicleId,
      businessId,
    }),
    select: { id: true },
  });

  if (!link) {
    throw createForbiddenError(
      "Biseda lejohet vetëm për automjete të lidhura dhe të aprovuara.",
    );
  }

  return link;
}

export async function requireBusinessConversation({
  conversationId,
  businessId,
  database = db,
}) {
  const conversation = await database.conversation.findFirst({
    where: { id: conversationId, businessId },
    include: {
      business: { select: { id: true, name: true } },
      customerProfile: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      vehicle: {
        select: { id: true, plate: true, brand: true, model: true },
      },
      service: { select: { id: true, title: true, status: true } },
    },
  });

  if (!conversation) {
    throw createNotFoundError("Biseda nuk u gjet.");
  }

  return conversation;
}

export async function requireCustomerConversation({
  conversationId,
  customerProfileId,
  database = db,
}) {
  const conversation = await database.conversation.findFirst({
    where: customerConversationAccessWhere(
      customerProfileId,
      conversationId,
    ),
    include: {
      business: { select: { id: true, name: true, city: true } },
      customerProfile: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      vehicle: {
        select: { id: true, plate: true, brand: true, model: true },
      },
      service: { select: { id: true, title: true, status: true } },
    },
  });

  if (!conversation) {
    throw createNotFoundError("Biseda nuk u gjet.");
  }

  await requireActiveCustomerVehicleLink({
    businessId: conversation.businessId,
    customerProfileId,
    vehicleId: conversation.vehicleId,
    database,
  });

  return conversation;
}
