"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import {
  getFirstValidationMessage,
  validateFormData,
  validateObject,
} from "@/lib/validation";
import {
  createPaymentSchema,
  paymentIdObjectSchema,
  updatePaymentStatusSchema,
} from "@/schemas/payment-schema";
import { createPlatformAuditLog } from "@/services/admin/activity-log-service";
import {
  getPaymentById,
  refundPayment,
} from "@/services/admin/payment-service";
import { getPlatformSettings } from "@/services/admin/settings-service";

import { createActionError } from "@/lib/errors";
function getAdminUserId(admin) {
  return admin?.user?.id ?? admin?.id ?? null;
}

function serializeDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function parsePaidAt(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw createActionError("Data e pagesës nuk është e vlefshme.");
  }

  return date;
}

function revalidatePaymentPages(paymentId = null, subscriptionId = null) {
  revalidatePath("/admin");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/activity-logs");

  if (paymentId) {
    revalidatePath(`/admin/payments/${paymentId}`);
  }

  if (subscriptionId) {
    revalidatePath(`/admin/subscriptions/${subscriptionId}`);
  }
}

async function activateSubscriptionFromPayment({
  transaction,
  subscription,
  paymentStatus,
}) {
  if (!subscription || paymentStatus !== "PAID") {
    return;
  }

  await transaction.subscription.update({
    where: {
      id: subscription.id,
    },

    data: {
      status: "ACTIVE",
      trialStartsAt: null,
      trialEndsAt: null,
      cancelledAt: null,
      cancelAtPeriodEnd: false,
    },
  });
}

async function validateEnabledPaymentMethod(method) {
  const settings = await getPlatformSettings();

  const enabledMethods = ["OTHER"];

  if (settings.cashPaymentsEnabled) {
    enabledMethods.push("CASH");
  }

  if (settings.bankPaymentsEnabled) {
    enabledMethods.push("BANK_TRANSFER");
  }

  if (settings.cardPaymentsEnabled) {
    enabledMethods.push("CARD");
  }

  if (!enabledMethods.includes(method)) {
    throw createActionError(
      "Kjo metodë pagese është çaktivizuar te konfigurimet e platformës.",
    );
  }
}

function validatePaymentId(paymentId) {
  const validationResult = validateObject(paymentIdObjectSchema, {
    paymentId,
  });

  if (!validationResult.success) {
    throw createActionError(
      getFirstValidationMessage(
        validationResult.error,
        "ID-ja e pagesës mungon.",
      ),
    );
  }

  return validationResult.data.paymentId;
}

function getDefaultSubscriptionAmount(subscription) {
  const amount = Number(subscription.price);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw createActionError("Shuma e pagesës nuk është e vlefshme.");
  }

  return amount;
}

export async function createPaymentAction(formData) {
  const admin = await requirePlatformAdmin();
  const adminUserId = getAdminUserId(admin);

  const validationResult = validateFormData(createPaymentSchema, formData);

  if (!validationResult.success) {
    throw createActionError(
      getFirstValidationMessage(
        validationResult.error,
        "Të dhënat e pagesës nuk janë të vlefshme.",
      ),
    );
  }

  const {
    subscriptionId,
    amount: customAmount,
    status,
    method,
    reference,
    description,
    paidAt: paidAtInput,
  } = validationResult.data;

  await validateEnabledPaymentMethod(method);

  const subscription = await db.subscription.findUnique({
    where: {
      id: subscriptionId,
    },

    include: {
      business: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },

      plan: {
        select: {
          id: true,
          name: true,
          slug: true,
          monthlyPrice: true,
          yearlyPrice: true,
        },
      },
    },
  });

  if (!subscription) {
    throw createActionError("Abonimi nuk u gjet.");
  }

  if (!subscription.business.isActive) {
    throw createActionError("Biznesi është i çaktivizuar.");
  }

  if (subscription.plan.slug === "free-trial") {
    throw createActionError(
      "Nuk mund të regjistrohet pagesë për planin Free Trial. Aktivizo fillimisht një plan me pagesë.",
    );
  }

  const amount =
    customAmount !== null
      ? customAmount
      : getDefaultSubscriptionAmount(subscription);

  const parsedPaidAt = parsePaidAt(paidAtInput);

  const paidAt = status === "PAID" ? parsedPaidAt || new Date() : null;

  const payment = await db.$transaction(async (transaction) => {
    const createdPayment = await transaction.payment.create({
      data: {
        businessId: subscription.businessId,

        subscriptionId: subscription.id,

        amount,
        currency: "ALL",
        status,
        method,
        reference,
        description,
        paidAt,

        periodStart: subscription.currentPeriodStart,

        periodEnd: subscription.currentPeriodEnd,
      },
    });

    await activateSubscriptionFromPayment({
      transaction,
      subscription,
      paymentStatus: status,
    });

    return createdPayment;
  });

  await createPlatformAuditLog({
    userId: adminUserId,
    businessId: subscription.businessId,
    action: "PAYMENT",
    entityType: "PAYMENT",
    entityId: payment.id,
    title: "Pagesa u regjistrua",

    description: `U regjistrua një pagesë për biznesin ${subscription.business.name}.`,

    newValues: {
      subscriptionId: subscription.id,
      planId: subscription.plan.id,
      planName: subscription.plan.name,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      reference: payment.reference,
      paidAt: serializeDate(payment.paidAt),

      periodStart: serializeDate(payment.periodStart),

      periodEnd: serializeDate(payment.periodEnd),
    },
  });

  revalidatePaymentPages(payment.id, subscription.id);

  return {
    success: true,
    paymentId: payment.id,
    subscriptionId: subscription.id,

    message:
      status === "PAID"
        ? "Pagesa u regjistrua dhe abonimi u aktivizua."
        : "Pagesa u regjistrua me sukses.",
  };
}

export async function updatePaymentStatusAction(paymentId, status) {
  const admin = await requirePlatformAdmin();
  const adminUserId = getAdminUserId(admin);

  const validationResult = validateObject(updatePaymentStatusSchema, {
    paymentId,
    status,
  });

  if (!validationResult.success) {
    throw createActionError(
      getFirstValidationMessage(
        validationResult.error,
        "Statusi i pagesës nuk është i vlefshëm.",
      ),
    );
  }

  const { paymentId: validatedPaymentId, status: validatedStatus } =
    validationResult.data;

  if (validatedStatus === "REFUNDED") {
    throw createActionError("Përdor veprimin Rimburso për të rimbursuar pagesën.");
  }

  const existingPayment = await getPaymentById(validatedPaymentId);

  if (!existingPayment) {
    throw createActionError("Pagesa nuk u gjet.");
  }

  if (existingPayment.status === "REFUNDED") {
    throw createActionError(
      "Statusi i një pagese të rimbursuar nuk mund të ndryshohet.",
    );
  }

  if (existingPayment.status === validatedStatus) {
    return {
      success: true,
      status: existingPayment.status,
      message: "Statusi i pagesës është tashmë i përditësuar.",
    };
  }

  const payment = await db.$transaction(async (transaction) => {
    const updatedPayment = await transaction.payment.update({
      where: {
        id: validatedPaymentId,
      },

      data: {
        status: validatedStatus,

        paidAt:
          validatedStatus === "PAID"
            ? existingPayment.paidAt || new Date()
            : validatedStatus === "PENDING"
              ? null
              : existingPayment.paidAt,
      },
    });

    if (validatedStatus === "PAID" && existingPayment.subscription) {
      await transaction.subscription.update({
        where: {
          id: existingPayment.subscription.id,
        },

        data: {
          status: "ACTIVE",
          trialStartsAt: null,
          trialEndsAt: null,
          cancelledAt: null,
          cancelAtPeriodEnd: false,
        },
      });
    }

    return updatedPayment;
  });

  await createPlatformAuditLog({
    userId: adminUserId,
    businessId: existingPayment.businessId,
    action: "STATUS_CHANGE",
    entityType: "PAYMENT",
    entityId: payment.id,
    title: "Statusi i pagesës u ndryshua",

    description: `Statusi kaloi nga ${existingPayment.status} në ${payment.status}.`,

    oldValues: {
      status: existingPayment.status,

      paidAt: serializeDate(existingPayment.paidAt),
    },

    newValues: {
      status: payment.status,

      paidAt: serializeDate(payment.paidAt),
    },
  });

  revalidatePaymentPages(payment.id, existingPayment.subscriptionId);

  const messages = {
    PENDING: "Pagesa u kthye në pritje.",

    PAID: "Pagesa u konfirmua dhe abonimi u aktivizua.",

    FAILED: "Pagesa u shënua si e dështuar.",
  };

  return {
    success: true,
    status: payment.status,

    message: messages[payment.status] || "Statusi u përditësua.",
  };
}

export async function refundPaymentAction(paymentId) {
  const admin = await requirePlatformAdmin();
  const adminUserId = getAdminUserId(admin);

  const validatedPaymentId = validatePaymentId(paymentId);

  const existingPayment = await getPaymentById(validatedPaymentId);

  if (!existingPayment) {
    throw createActionError("Pagesa nuk u gjet.");
  }

  if (existingPayment.status === "REFUNDED") {
    return {
      success: true,
      status: existingPayment.status,
      message: "Pagesa është tashmë e rimbursuar.",
    };
  }

  if (existingPayment.status !== "PAID") {
    throw createActionError("Vetëm një pagesë e paguar mund të rimbursohet.");
  }

  const payment = await refundPayment(validatedPaymentId);

  await createPlatformAuditLog({
    userId: adminUserId,
    businessId: existingPayment.businessId,
    action: "PAYMENT",
    entityType: "PAYMENT",
    entityId: payment.id,
    title: "Pagesa u rimbursua",
    description: "Pagesa u shënua si e rimbursuar.",

    oldValues: {
      status: existingPayment.status,
    },

    newValues: {
      status: payment.status,
    },
  });

  revalidatePaymentPages(payment.id, existingPayment.subscriptionId);

  return {
    success: true,
    status: payment.status,
    message: "Pagesa u rimbursua me sukses.",
  };
}
