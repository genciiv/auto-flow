"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  requireBusinessActionPermission,
} from "@/lib/business-context";
import {
  requireBusinessConversation,
  requireCustomerConversation,
  requireActiveCustomerVehicleLink,
} from "@/lib/chat-access";
import { requireCustomerActionContext } from "@/lib/customer-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";

const idSchema = z.string().trim().min(1);
const messageSchema = z.object({
  conversationId: idSchema,
  body: z.string().trim().min(1, "Shkruaj një mesazh.").max(4000),
});
const createSchema = z.object({
  vehicleId: idSchema,
  serviceId: z.string().trim().optional().transform((value) => value || null),
  subject: z.string().trim().max(120).optional().transform((value) => value || null),
  body: z.string().trim().min(1, "Shkruaj mesazhin e parë.").max(4000),
});

function actionError(error, fallback) {
  return {
    success: false,
    message: error instanceof Error ? error.message : fallback,
  };
}

async function validateService({ serviceId, businessId, vehicleId, database }) {
  if (!serviceId) return null;
  const service = await database.serviceRecord.findFirst({
    where: { id: serviceId, businessId, vehicleId },
    select: { id: true },
  });
  if (!service) throw new Error("Shërbimi i zgjedhur nuk është i vlefshëm.");
  return service;
}

async function notifyRecipient({ database, conversation, senderType, preview }) {
  if (senderType === "CUSTOMER") {
    await database.notification.create({
      data: {
        businessId: conversation.businessId,
        title: "Mesazh i ri nga klienti",
        message: preview,
        type: "INFO",
        entityType: "CHAT",
        entityId: conversation.id,
      },
    });
    return;
  }

  const profile = await database.customerProfile.findUnique({
    where: { id: conversation.customerProfileId },
    select: { userId: true },
  });
  if (profile?.userId) {
    await database.notification.create({
      data: {
        userId: profile.userId,
        title: "Mesazh i ri nga servisi",
        message: preview,
        type: "INFO",
        entityType: "CHAT",
        entityId: conversation.id,
      },
    });
  }
}

export async function createCustomerConversationAction(_previousState, formData) {
  try {
    const context = await requireCustomerActionContext();
    const parsed = createSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message || "Të dhënat nuk janë të vlefshme." };

    const { vehicleId, serviceId, subject, body } = parsed.data;
    const link = await db.customerVehicleLink.findFirst({
      where: {
        isActive: true,
        vehicleId,
        customerVehicle: { profileId: context.profileId },
      },
      select: { vehicle: { select: { businessId: true } } },
    });
    if (!link) throw new Error("Automjeti nuk është i lidhur me këtë servis.");
    const businessId = link.vehicle.businessId;
    await validateService({ serviceId, businessId, vehicleId, database: db });

    let conversationId;
    await db.$transaction(async (transaction) => {
      let conversation = await transaction.conversation.findFirst({
        where: { businessId, customerProfileId: context.profileId, vehicleId, serviceId, status: "ACTIVE" },
        select: { id: true, businessId: true, customerProfileId: true },
      });
      if (!conversation) {
        conversation = await transaction.conversation.create({
          data: { businessId, customerProfileId: context.profileId, vehicleId, serviceId, subject, customerLastReadAt: new Date() },
          select: { id: true, businessId: true, customerProfileId: true },
        });
      }
      await transaction.chatMessage.create({
        data: { conversationId: conversation.id, senderUserId: context.userId, senderType: "CUSTOMER", body },
      });
      await transaction.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date(), customerLastReadAt: new Date(), status: "ACTIVE" },
      });
      await notifyRecipient({ database: transaction, conversation, senderType: "CUSTOMER", preview: body.slice(0, 160) });
      conversationId = conversation.id;
    });

    revalidatePath("/customer/messages");
    revalidatePath("/dashboard/messages");
    return { success: true, message: "Biseda u hap.", conversationId };
  } catch (error) {
    return actionError(error, "Biseda nuk u krijua.");
  }
}

export async function createBusinessConversationAction(_previousState, formData) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.MESSAGES_SEND,
    );
    const parsed = createSchema.extend({ customerProfileId: idSchema }).safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message || "Të dhënat nuk janë të vlefshme." };
    const { customerProfileId, vehicleId, serviceId, subject, body } = parsed.data;
    await requireActiveCustomerVehicleLink({ businessId: context.businessId, customerProfileId, vehicleId });
    await validateService({ serviceId, businessId: context.businessId, vehicleId, database: db });

    let conversationId;
    await db.$transaction(async (transaction) => {
      let conversation = await transaction.conversation.findFirst({
        where: { businessId: context.businessId, customerProfileId, vehicleId, serviceId, status: "ACTIVE" },
        select: { id: true, businessId: true, customerProfileId: true },
      });
      if (!conversation) {
        conversation = await transaction.conversation.create({
          data: { businessId: context.businessId, customerProfileId, vehicleId, serviceId, subject, businessLastReadAt: new Date() },
          select: { id: true, businessId: true, customerProfileId: true },
        });
      }
      await transaction.chatMessage.create({
        data: { conversationId: conversation.id, senderUserId: context.userId, senderType: "BUSINESS", body },
      });
      await transaction.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date(), businessLastReadAt: new Date(), status: "ACTIVE" },
      });
      await notifyRecipient({ database: transaction, conversation, senderType: "BUSINESS", preview: body.slice(0, 160) });
      conversationId = conversation.id;
    });

    revalidatePath("/dashboard/messages");
    revalidatePath("/customer/messages");
    return { success: true, message: "Biseda u hap.", conversationId };
  } catch (error) {
    return actionError(error, "Biseda nuk u krijua.");
  }
}

export async function sendBusinessMessageAction(_previousState, formData) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.MESSAGES_SEND,
    );
    const parsed = messageSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message || "Mesazhi nuk është i vlefshëm." };
    const conversation = await requireBusinessConversation({ conversationId: parsed.data.conversationId, businessId: context.businessId });
    await db.$transaction(async (transaction) => {
      await transaction.chatMessage.create({ data: { conversationId: conversation.id, senderUserId: context.userId, senderType: "BUSINESS", body: parsed.data.body } });
      await transaction.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date(), businessLastReadAt: new Date() } });
      await notifyRecipient({ database: transaction, conversation, senderType: "BUSINESS", preview: parsed.data.body.slice(0, 160) });
    });
    revalidatePath(`/dashboard/messages/${conversation.id}`);
    revalidatePath(`/customer/messages/${conversation.id}`);
    return { success: true, message: "Mesazhi u dërgua." };
  } catch (error) { return actionError(error, "Mesazhi nuk u dërgua."); }
}

export async function sendCustomerMessageAction(_previousState, formData) {
  try {
    const context = await requireCustomerActionContext();
    const parsed = messageSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message || "Mesazhi nuk është i vlefshëm." };
    const conversation = await requireCustomerConversation({ conversationId: parsed.data.conversationId, customerProfileId: context.profileId });
    await db.$transaction(async (transaction) => {
      await transaction.chatMessage.create({ data: { conversationId: conversation.id, senderUserId: context.userId, senderType: "CUSTOMER", body: parsed.data.body } });
      await transaction.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date(), customerLastReadAt: new Date() } });
      await notifyRecipient({ database: transaction, conversation, senderType: "CUSTOMER", preview: parsed.data.body.slice(0, 160) });
    });
    revalidatePath(`/customer/messages/${conversation.id}`);
    revalidatePath(`/dashboard/messages/${conversation.id}`);
    return { success: true, message: "Mesazhi u dërgua." };
  } catch (error) { return actionError(error, "Mesazhi nuk u dërgua."); }
}

export async function markBusinessConversationReadAction(conversationId) {
  const context = await requireBusinessActionPermission(
    PERMISSIONS.MESSAGES_VIEW,
  );
  const conversation = await requireBusinessConversation({ conversationId, businessId: context.businessId });
  await db.conversation.update({ where: { id: conversation.id }, data: { businessLastReadAt: new Date() } });
  revalidatePath("/dashboard/messages");
  return { success: true };
}

export async function markCustomerConversationReadAction(conversationId) {
  const context = await requireCustomerActionContext();
  const conversation = await requireCustomerConversation({ conversationId, customerProfileId: context.profileId });
  await db.conversation.update({ where: { id: conversation.id }, data: { customerLastReadAt: new Date() } });
  revalidatePath("/customer/messages");
  return { success: true };
}
