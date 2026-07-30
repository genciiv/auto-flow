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
  createSubscriptionSchema,
  renewSubscriptionSchema,
  subscriptionIdObjectSchema,
  updateSubscriptionStatusSchema,
} from "@/schemas/subscription-schema";
import { createPlatformAuditLog } from "@/services/admin/activity-log-service";
import {
  createPaidSubscription,
  getSubscriptionById,
  renewSubscription,
  updateSubscriptionStatus,
} from "@/services/admin/subscription-service";

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

function parsePeriodStart(value) {
  if (!value) {
    return new Date();
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Data e fillimit nuk është e vlefshme.");
  }

  return date;
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

function getDefaultPlanPrice(plan, billingInterval) {
  const value =
    billingInterval === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice;

  const price = Number(value);

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Çmimi i planit nuk është i vlefshëm.");
  }

  return price;
}

function validateSubscriptionId(subscriptionId) {
  const validationResult = validateObject(subscriptionIdObjectSchema, {
    subscriptionId,
  });

  if (!validationResult.success) {
    throw new Error(
      getFirstValidationMessage(
        validationResult.error,
        "ID-ja e abonimit mungon.",
      ),
    );
  }

  return validationResult.data.subscriptionId;
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

  const validationResult = validateFormData(createSubscriptionSchema, formData);

  if (!validationResult.success) {
    throw new Error(
      getFirstValidationMessage(
        validationResult.error,
        "Të dhënat e abonimit nuk janë të vlefshme.",
      ),
    );
  }

  const {
    businessId,
    planId,
    billingInterval,
    periodStart: periodStartInput,
    price: customPrice,
  } = validationResult.data;

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

  const periodStart = parsePeriodStart(periodStartInput);

  const periodEnd = addBillingPeriod(periodStart, billingInterval);

  const price =
    customPrice !== null
      ? customPrice
      : getDefaultPlanPrice(plan, billingInterval);

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

  const validatedSubscriptionId = validateSubscriptionId(subscriptionId);

  const validationResult = validateFormData(renewSubscriptionSchema, formData);

  if (!validationResult.success) {
    throw new Error(
      getFirstValidationMessage(
        validationResult.error,
        "Të dhënat e rinovimit nuk janë të vlefshme.",
      ),
    );
  }

  const {
    billingInterval,
    periodStart: periodStartInput,
    price: customPrice,
  } = validationResult.data;

  const existingSubscription = await getSubscriptionById(
    validatedSubscriptionId,
  );

  if (!existingSubscription) {
    throw new Error("Abonimi nuk u gjet.");
  }

  if (!existingSubscription.plan) {
    throw new Error("Plani i abonimit nuk u gjet.");
  }

  if (existingSubscription.plan.slug === "free-trial") {
    throw new Error("Free Trial nuk mund të rinovohet si abonim me pagesë.");
  }

  const periodStart = parsePeriodStart(periodStartInput);

  const periodEnd = addBillingPeriod(periodStart, billingInterval);

  const price =
    customPrice !== null
      ? customPrice
      : getDefaultPlanPrice(existingSubscription.plan, billingInterval);

  const subscription = await renewSubscription({
    subscriptionId: validatedSubscriptionId,
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

  const validationResult = validateObject(updateSubscriptionStatusSchema, {
    subscriptionId,
    status,
  });

  if (!validationResult.success) {
    throw new Error(
      getFirstValidationMessage(
        validationResult.error,
        "Statusi i abonimit nuk është i vlefshëm.",
      ),
    );
  }

  const { subscriptionId: validatedSubscriptionId, status: validatedStatus } =
    validationResult.data;

  const existingSubscription = await getSubscriptionById(
    validatedSubscriptionId,
  );

  if (!existingSubscription) {
    throw new Error("Abonimi nuk u gjet.");
  }

  if (existingSubscription.status === validatedStatus) {
    return {
      success: true,
      status: existingSubscription.status,
      message: "Statusi i abonimit është tashmë i përditësuar.",
    };
  }

  const subscription = await updateSubscriptionStatus({
    subscriptionId: validatedSubscriptionId,

    status: validatedStatus,
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

    message:
      messages[subscription.status] || "Statusi i abonimit u përditësua.",
  };
}
