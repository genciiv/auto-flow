"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { createPlatformAuditLog } from "@/services/admin/activity-log-service";
import {
  createPaidSubscription,
  getSubscriptionById,
  renewSubscription,
  updateSubscriptionStatus,
} from "@/services/admin/subscription-service";

const VALID_INTERVALS = ["MONTHLY", "YEARLY"];

const VALID_STATUSES = [
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "CANCELLED",
  "EXPIRED",
];

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

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

function parsePositiveNumber(value, fieldLabel) {
  const normalizedValue = normalizeText(value).replace(",", ".");

  if (!normalizedValue) {
    throw new Error(`${fieldLabel} është i detyrueshëm.`);
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throw new Error(`${fieldLabel} duhet të jetë numër pozitiv.`);
  }

  return parsedValue;
}

function parseDate(value, fieldLabel) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    throw new Error(`${fieldLabel} është e detyrueshme.`);
  }

  const parsedDate = new Date(`${normalizedValue}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`${fieldLabel} nuk është e vlefshme.`);
  }

  return parsedDate;
}

function addBillingPeriod(startDate, billingInterval) {
  const endDate = new Date(startDate);

  if (billingInterval === "YEARLY") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  return endDate;
}

function revalidateSubscriptionPages(subscriptionId = null) {
  revalidatePath("/admin");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/businesses");
  revalidatePath("/admin/activity-logs");

  if (subscriptionId) {
    revalidatePath(`/admin/subscriptions/${subscriptionId}`);
  }
}

export async function createSubscriptionAction(formData) {
  const admin = await requirePlatformAdmin();
  const adminUserId = getAdminUserId(admin);

  const businessId = normalizeText(formData.get("businessId"));
  const planId = normalizeText(formData.get("planId"));
  const billingInterval = normalizeText(formData.get("billingInterval"));

  if (!businessId) {
    throw new Error("Zgjidh biznesin.");
  }

  if (!planId) {
    throw new Error("Zgjidh planin.");
  }

  if (!VALID_INTERVALS.includes(billingInterval)) {
    throw new Error("Periudha e faturimit nuk është e vlefshme.");
  }

  const [business, plan] = await Promise.all([
    db.business.findUnique({
      where: {
        id: businessId,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    }),

    db.plan.findUnique({
      where: {
        id: planId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        monthlyPrice: true,
        yearlyPrice: true,
      },
    }),
  ]);

  if (!business) {
    throw new Error("Biznesi nuk u gjet.");
  }

  if (!business.isActive) {
    throw new Error("Biznesi është i çaktivizuar.");
  }

  if (!plan) {
    throw new Error("Plani nuk u gjet.");
  }

  if (!plan.isActive) {
    throw new Error("Plani është i çaktivizuar.");
  }

  if (plan.slug === "free-trial") {
    throw new Error(
      "Free Trial krijohet automatikisht gjatë aprovimit të biznesit.",
    );
  }

  const periodStartInput = normalizeText(formData.get("periodStart"));

  const periodStart = periodStartInput
    ? parseDate(periodStartInput, "Data e fillimit")
    : new Date();

  const periodEnd = addBillingPeriod(periodStart, billingInterval);

  const customPrice = normalizeText(formData.get("price"));

  const price = customPrice
    ? parsePositiveNumber(customPrice, "Çmimi")
    : billingInterval === "YEARLY"
      ? Number(plan.yearlyPrice)
      : Number(plan.monthlyPrice);

  const subscription = await createPaidSubscription({
    businessId,
    planId,
    billingInterval,
    price,
    periodStart,
    periodEnd,
  });

  await createPlatformAuditLog({
    userId: adminUserId,
    businessId,
    action: "CREATE",
    entityType: "SUBSCRIPTION",
    entityId: subscription.id,
    title: "Abonimi u krijua",
    description: `U aktivizua plani ${plan.name} për biznesin ${business.name}.`,
    newValues: {
      businessId,
      planId,
      planName: plan.name,
      status: subscription.status,
      billingInterval,
      price,
      currentPeriodStart: serializeDate(periodStart),
      currentPeriodEnd: serializeDate(periodEnd),
    },
  });

  revalidateSubscriptionPages(subscription.id);

  return {
    success: true,
    subscriptionId: subscription.id,
    message: "Abonimi u aktivizua me sukses.",
  };
}

export async function renewSubscriptionAction(subscriptionId, formData) {
  const admin = await requirePlatformAdmin();
  const adminUserId = getAdminUserId(admin);

  if (!subscriptionId) {
    throw new Error("ID-ja e abonimit mungon.");
  }

  const existingSubscription = await getSubscriptionById(subscriptionId);

  if (!existingSubscription) {
    throw new Error("Abonimi nuk u gjet.");
  }

  const billingInterval = normalizeText(formData.get("billingInterval"));

  if (!VALID_INTERVALS.includes(billingInterval)) {
    throw new Error("Periudha e faturimit nuk është e vlefshme.");
  }

  const periodStartInput = normalizeText(formData.get("periodStart"));

  const periodStart = periodStartInput
    ? parseDate(periodStartInput, "Data e fillimit")
    : new Date();

  const periodEnd = addBillingPeriod(periodStart, billingInterval);

  const customPrice = normalizeText(formData.get("price"));

  const price = customPrice
    ? parsePositiveNumber(customPrice, "Çmimi")
    : billingInterval === "YEARLY"
      ? Number(existingSubscription.plan.yearlyPrice)
      : Number(existingSubscription.plan.monthlyPrice);

  const subscription = await renewSubscription({
    subscriptionId,
    billingInterval,
    price,
    periodStart,
    periodEnd,
  });

  await createPlatformAuditLog({
    userId: adminUserId,
    businessId: existingSubscription.businessId,
    action: "UPDATE",
    entityType: "SUBSCRIPTION",
    entityId: subscription.id,
    title: "Abonimi u rinovua",
    description: "Periudha e abonimit u rinovua.",
    oldValues: {
      status: existingSubscription.status,
      billingInterval: existingSubscription.billingInterval,
      price: existingSubscription.price,
      currentPeriodStart: serializeDate(
        existingSubscription.currentPeriodStart,
      ),
      currentPeriodEnd: serializeDate(existingSubscription.currentPeriodEnd),
    },
    newValues: {
      status: subscription.status,
      billingInterval,
      price,
      currentPeriodStart: serializeDate(periodStart),
      currentPeriodEnd: serializeDate(periodEnd),
    },
  });

  revalidateSubscriptionPages(subscription.id);

  return {
    success: true,
    subscriptionId: subscription.id,
    message: "Abonimi u rinovua me sukses.",
  };
}

export async function updateSubscriptionStatusAction(subscriptionId, status) {
  const admin = await requirePlatformAdmin();
  const adminUserId = getAdminUserId(admin);

  if (!subscriptionId) {
    throw new Error("ID-ja e abonimit mungon.");
  }

  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Statusi i abonimit nuk është i vlefshëm.");
  }

  const existingSubscription = await getSubscriptionById(subscriptionId);

  if (!existingSubscription) {
    throw new Error("Abonimi nuk u gjet.");
  }

  const subscription = await updateSubscriptionStatus({
    subscriptionId,
    status,
  });

  await createPlatformAuditLog({
    userId: adminUserId,
    businessId: existingSubscription.businessId,
    action: "STATUS_CHANGE",
    entityType: "SUBSCRIPTION",
    entityId: subscription.id,
    title: "Statusi i abonimit u ndryshua",
    description: `Statusi kaloi nga ${existingSubscription.status} në ${subscription.status}.`,
    oldValues: {
      status: existingSubscription.status,
    },
    newValues: {
      status: subscription.status,
    },
  });

  revalidateSubscriptionPages(subscription.id);

  const messages = {
    TRIALING: "Abonimi u kthye në periudhë prove.",
    ACTIVE: "Abonimi u aktivizua.",
    PAST_DUE: "Abonimi u shënua si pagesë e vonuar.",
    CANCELLED: "Abonimi u anulua.",
    EXPIRED: "Abonimi u shënua si i skaduar.",
  };

  return {
    success: true,
    status: subscription.status,
    message: messages[subscription.status],
  };
}
