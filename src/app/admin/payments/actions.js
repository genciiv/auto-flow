"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import {
  getPaymentById,
  refundPayment,
} from "@/services/admin/payment-service";

const VALID_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];
const VALID_METHODS = ["CASH", "BANK_TRANSFER", "CARD", "OTHER"];

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parsePositiveNumber(value, fieldLabel) {
  const normalizedValue = normalizeText(value).replace(",", ".");

  if (!normalizedValue) {
    throw new Error(`${fieldLabel} është e detyrueshme.`);
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new Error(`${fieldLabel} duhet të jetë më e madhe se zero.`);
  }

  return parsedValue;
}

function parseOptionalDate(value, fieldLabel) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return null;
  }

  const parsedDate = new Date(`${normalizedValue}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`${fieldLabel} nuk është e vlefshme.`);
  }

  return parsedDate;
}

function revalidatePaymentPages(paymentId = null, subscriptionId = null) {
  revalidatePath("/admin");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/analytics");

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

export async function createPaymentAction(formData) {
  await requirePlatformAdmin();

  const subscriptionId = normalizeText(formData.get("subscriptionId"));
  const status = normalizeText(formData.get("status"));
  const method = normalizeText(formData.get("method"));
  const reference = normalizeText(formData.get("reference"));
  const description = normalizeText(formData.get("description"));

  if (!subscriptionId) {
    throw new Error("Zgjidh abonimin.");
  }

  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Statusi i pagesës nuk është i vlefshëm.");
  }

  if (!VALID_METHODS.includes(method)) {
    throw new Error("Metoda e pagesës nuk është e vlefshme.");
  }

  if (method === "BANK_TRANSFER" && !reference) {
    throw new Error("Vendos referencën e transfertës bankare.");
  }

  if (status === "REFUNDED") {
    throw new Error("Pagesa nuk mund të krijohet direkt si e rimbursuar.");
  }

  const subscription = await db.subscription.findUnique({
    where: {
      id: subscriptionId,
    },
    include: {
      business: {
        select: {
          id: true,
          isActive: true,
        },
      },
      plan: {
        select: {
          id: true,
          slug: true,
          monthlyPrice: true,
          yearlyPrice: true,
        },
      },
    },
  });

  if (!subscription) {
    throw new Error("Abonimi nuk u gjet.");
  }

  if (!subscription.business.isActive) {
    throw new Error("Biznesi është i çaktivizuar.");
  }

  if (subscription.plan.slug === "free-trial") {
    throw new Error(
      "Nuk mund të regjistrohet pagesë për planin Free Trial. Aktivizo fillimisht një plan me pagesë.",
    );
  }

  const amountInput = normalizeText(formData.get("amount"));

  const amount = amountInput
    ? parsePositiveNumber(amountInput, "Shuma")
    : Number(subscription.price);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Shuma e pagesës nuk është e vlefshme.");
  }

  const paidAtInput = parseOptionalDate(
    formData.get("paidAt"),
    "Data e pagesës",
  );

  const paidAt = status === "PAID" ? paidAtInput || new Date() : null;

  const payment = await db.$transaction(async (transaction) => {
    const createdPayment = await transaction.payment.create({
      data: {
        businessId: subscription.businessId,
        subscriptionId: subscription.id,
        amount,
        currency: "ALL",
        status,
        method,
        reference: reference || null,
        description: description || null,
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
  await requirePlatformAdmin();

  if (!paymentId) {
    throw new Error("ID-ja e pagesës mungon.");
  }

  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Statusi i pagesës nuk është i vlefshëm.");
  }

  const existingPayment = await getPaymentById(paymentId);

  if (!existingPayment) {
    throw new Error("Pagesa nuk u gjet.");
  }

  if (status === "REFUNDED") {
    throw new Error("Përdor veprimin Rimburso për të rimbursuar pagesën.");
  }

  const payment = await db.$transaction(async (transaction) => {
    const updatedPayment = await transaction.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status,
        paidAt:
          status === "PAID"
            ? existingPayment.paidAt || new Date()
            : status === "PENDING"
              ? null
              : existingPayment.paidAt,
      },
    });

    if (status === "PAID" && existingPayment.subscription) {
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
  await requirePlatformAdmin();

  if (!paymentId) {
    throw new Error("ID-ja e pagesës mungon.");
  }

  const existingPayment = await getPaymentById(paymentId);

  if (!existingPayment) {
    throw new Error("Pagesa nuk u gjet.");
  }

  const payment = await refundPayment(paymentId);

  revalidatePaymentPages(payment.id, existingPayment.subscriptionId);

  return {
    success: true,
    status: payment.status,
    message: "Pagesa u rimbursua me sukses.",
  };
}
