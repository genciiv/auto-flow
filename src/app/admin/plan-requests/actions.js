"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth-guard";
import { EMAIL_CONFIG, sendEmail } from "@/lib/email";
import { createActionError, logServerError } from "@/lib/errors";
import { createBusinessNotification } from "@/services/notification-service";
import { createPlatformAuditLog } from "@/services/admin/activity-log-service";
import {
  approveSubscriptionPlanRequest,
  markSubscriptionPlanRequestPaid,
  rejectSubscriptionPlanRequest,
} from "@/services/admin/subscription-plan-request-service";

function getAdminUserId(admin) {
  return admin?.user?.id ?? admin?.id ?? null;
}

function cleanId(formData) {
  const requestId = String(formData.get("requestId") ?? "").trim();

  if (!requestId) {
    throw createActionError("ID-ja e kërkesës mungon.");
  }

  return requestId;
}

function revalidatePages() {
  revalidatePath("/admin");
  revalidatePath("/admin/plan-requests");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/activity-logs");
}

async function notifyBusiness(request, { title, message, type }) {
  await createBusinessNotification({
    businessId: request.businessId,
    title,
    message,
    type,
    entityType: "SUBSCRIPTION",
    entityId: request.id,
  });

  const recipient = request.requestedBy?.email || request.business?.email;

  if (!recipient) {
    return;
  }

  try {
    await sendEmail({
      to: recipient,
      replyTo: EMAIL_CONFIG.replyTo || undefined,
      subject: title,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px">
          <h2>${title}</h2>
          <p>${message}</p>
          <p style="margin-top:28px;font-size:12px;color:#64748b">AutoFlow</p>
        </div>
      `,
    });
  } catch (error) {
    logServerError("planRequest:notifyBusiness", error, {
      requestId: request.id,
      businessId: request.businessId,
    });
  }
}

export async function approvePlanRequestAction(formData) {
  const admin = await requirePlatformAdmin();
  const adminUserId = getAdminUserId(admin);
  const requestId = cleanId(formData);
  const notes = String(formData.get("notes") ?? "").trim();

  const request = await approveSubscriptionPlanRequest({
    requestId,
    reviewedById: adminUserId,
    notes,
  });

  await createPlatformAuditLog({
    userId: adminUserId,
    businessId: request.businessId,
    action: "STATUS_CHANGE",
    entityType: "SUBSCRIPTION_PLAN_REQUEST",
    entityId: request.id,
    title: "Kërkesa e planit u aprovua",
    description: `${request.business.name} kërkoi planin ${request.requestedPlan.name}.`,
    newValues: { status: "APPROVED", notes: notes || null },
  });

  await notifyBusiness(request, {
    title: "Kërkesa për plan u aprovua",
    message: `Kërkesa për planin ${request.requestedPlan.name} u aprovua. Aktivizimi kryhet pasi pagesa të konfirmohet.`,
    type: "SUCCESS",
  });

  revalidatePages();
}

export async function rejectPlanRequestAction(formData) {
  const admin = await requirePlatformAdmin();
  const adminUserId = getAdminUserId(admin);
  const requestId = cleanId(formData);
  const reason = String(formData.get("reason") ?? "").trim();

  if (reason.length < 3) {
    throw createActionError("Shkruaj arsyen e refuzimit.");
  }

  const request = await rejectSubscriptionPlanRequest({
    requestId,
    reviewedById: adminUserId,
    reason,
  });

  await createPlatformAuditLog({
    userId: adminUserId,
    businessId: request.businessId,
    action: "STATUS_CHANGE",
    entityType: "SUBSCRIPTION_PLAN_REQUEST",
    entityId: request.id,
    title: "Kërkesa e planit u refuzua",
    description: `${request.business.name} — ${request.requestedPlan.name}.`,
    newValues: { status: "REJECTED", rejectionReason: reason },
  });

  await notifyBusiness(request, {
    title: "Kërkesa për plan u refuzua",
    message: `Kërkesa për planin ${request.requestedPlan.name} u refuzua. Arsyeja: ${reason}`,
    type: "WARNING",
  });

  revalidatePages();
}

export async function markPlanRequestPaidAction(formData) {
  const admin = await requirePlatformAdmin();
  const adminUserId = getAdminUserId(admin);
  const requestId = cleanId(formData);

  const request = await markSubscriptionPlanRequestPaid({
    requestId,
    reviewedById: adminUserId,
  });

  await createPlatformAuditLog({
    userId: adminUserId,
    businessId: request.businessId,
    action: "PAYMENT",
    entityType: "SUBSCRIPTION_PLAN_REQUEST",
    entityId: request.id,
    title: "Plani u pagua dhe u aktivizua",
    description: `${request.business.name} kaloi në planin ${request.requestedPlan.name}.`,
    newValues: {
      status: "PAID",
      subscriptionId: request.subscriptionId,
      planId: request.requestedPlanId,
      price: request.requestedPrice,
      billingInterval: request.billingInterval,
    },
  });

  await notifyBusiness(request, {
    title: "Plani i ri u aktivizua",
    message: `Pagesa u konfirmua dhe plani ${request.requestedPlan.name} është aktiv.`,
    type: "SUCCESS",
  });

  revalidatePages();
}
