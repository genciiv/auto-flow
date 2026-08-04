"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  actionSuccess,
  errorFailure,
  validationFailure,
} from "@/lib/action-result";
import { requirePlatformAdmin } from "@/lib/auth-guard";
import { EMAIL_CONFIG, sendEmail } from "@/lib/email";
import { logServerError } from "@/lib/errors";
import { validateFormData } from "@/lib/validation";
import { createPlatformAuditLog } from "@/services/admin/activity-log-service";
import {
  approveSubscriptionPlanRequest,
  markSubscriptionPlanRequestPaid,
  rejectSubscriptionPlanRequest,
} from "@/services/admin/subscription-plan-request-service";
import { createBusinessNotification } from "@/services/notification-service";

const requestIdSchema = z.string().trim().min(1, "ID-ja e kërkesës mungon.");

const approvePlanRequestSchema = z.object({
  requestId: requestIdSchema,
  notes: z
    .string()
    .trim()
    .transform((value) => value || null),
});

const rejectPlanRequestSchema = z.object({
  requestId: requestIdSchema,
  reason: z.string().trim().min(3, "Shkruaj arsyen e refuzimit."),
});

const markPlanRequestPaidSchema = z.object({
  requestId: requestIdSchema,
});

function getAdminUserId(admin) {
  return admin?.user?.id ?? admin?.id ?? null;
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
          <p style="margin-top:28px;font-size:12px;color:#64748b">
            AutoFlow
          </p>
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
  const validationResult = validateFormData(approvePlanRequestSchema, formData);

  if (!validationResult.success) {
    return validationFailure(validationResult.error, {
      message: "Kërkesa nuk mund të aprovohej.",
    });
  }

  try {
    const admin = await requirePlatformAdmin();
    const adminUserId = getAdminUserId(admin);

    const { requestId, notes } = validationResult.data;

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
      description:
        `${request.business.name} kërkoi planin ` +
        `${request.requestedPlan.name}.`,
      newValues: {
        status: "APPROVED",
        notes,
      },
    });

    await notifyBusiness(request, {
      title: "Kërkesa për plan u aprovua",
      message:
        `Kërkesa për planin ${request.requestedPlan.name} ` +
        "u aprovua. Aktivizimi kryhet pasi pagesa të konfirmohet.",
      type: "SUCCESS",
    });

    revalidatePages();

    return actionSuccess({
      message: "Kërkesa e planit u aprovua me sukses.",
      data: {
        requestId: request.id,
        status: "APPROVED",
      },
    });
  } catch (error) {
    logServerError("approvePlanRequestAction", error);

    return errorFailure(error, {
      fallbackMessage: "Kërkesa nuk mund të aprovohej.",
    });
  }
}

export async function rejectPlanRequestAction(formData) {
  const validationResult = validateFormData(rejectPlanRequestSchema, formData);

  if (!validationResult.success) {
    return validationFailure(validationResult.error, {
      message: "Kërkesa nuk mund të refuzohej.",
    });
  }

  try {
    const admin = await requirePlatformAdmin();
    const adminUserId = getAdminUserId(admin);

    const { requestId, reason } = validationResult.data;

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
      description:
        `${request.business.name} — ` + `${request.requestedPlan.name}.`,
      newValues: {
        status: "REJECTED",
        rejectionReason: reason,
      },
    });

    await notifyBusiness(request, {
      title: "Kërkesa për plan u refuzua",
      message:
        `Kërkesa për planin ${request.requestedPlan.name} ` +
        `u refuzua. Arsyeja: ${reason}`,
      type: "WARNING",
    });

    revalidatePages();

    return actionSuccess({
      message: "Kërkesa e planit u refuzua.",
      data: {
        requestId: request.id,
        status: "REJECTED",
      },
    });
  } catch (error) {
    logServerError("rejectPlanRequestAction", error);

    return errorFailure(error, {
      fallbackMessage: "Kërkesa nuk mund të refuzohej.",
    });
  }
}

export async function markPlanRequestPaidAction(formData) {
  const validationResult = validateFormData(
    markPlanRequestPaidSchema,
    formData,
  );

  if (!validationResult.success) {
    return validationFailure(validationResult.error, {
      message: "Pagesa nuk mund të konfirmohej.",
    });
  }

  try {
    const admin = await requirePlatformAdmin();
    const adminUserId = getAdminUserId(admin);

    const { requestId } = validationResult.data;

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
      description:
        `${request.business.name} kaloi në planin ` +
        `${request.requestedPlan.name}.`,
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
      message:
        `Pagesa u konfirmua dhe plani ` +
        `${request.requestedPlan.name} është aktiv.`,
      type: "SUCCESS",
    });

    revalidatePages();

    return actionSuccess({
      message: "Pagesa u konfirmua dhe plani u aktivizua.",
      data: {
        requestId: request.id,
        status: "PAID",
        subscriptionId: request.subscriptionId,
      },
    });
  } catch (error) {
    logServerError("markPlanRequestPaidAction", error);

    return errorFailure(error, {
      fallbackMessage: "Pagesa nuk mund të konfirmohej.",
    });
  }
}
