"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth-guard";
import {
  getFirstValidationMessage,
  validateFormData,
  validateObject,
} from "@/lib/validation";
import {
  createPlanSchema,
  planIdObjectSchema,
  updatePlanSchema,
} from "@/schemas/plan-schema";
import { createPlatformAuditLog } from "@/services/admin/activity-log-service";
import {
  createPlan,
  getPlanById,
  togglePlanStatus,
  toggleRecommendedPlan,
  updatePlan,
} from "@/services/admin/plan-service";

function getAdminUserId(admin) {
  return admin?.user?.id ?? admin?.id ?? null;
}

function getPlanAuditValues(plan) {
  return {
    name: plan.name,
    slug: plan.slug,
    description: plan.description,
    monthlyPrice: plan.monthlyPrice,
    yearlyPrice: plan.yearlyPrice,
    maxUsers: plan.maxUsers,
    maxCustomers: plan.maxCustomers,
    maxVehicles: plan.maxVehicles,
    features: plan.features,
    isActive: plan.isActive,
    isRecommended: plan.isRecommended,
    sortOrder: plan.sortOrder,
  };
}

function handlePlanError(error) {
  if (error?.code === "P2002") {
    throw new Error("Ekziston një plan tjetër me këtë slug.");
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error("Veprimi nuk mund të përfundohej.");
}

function revalidatePlanPages(planId = null) {
  revalidatePath("/admin");
  revalidatePath("/admin/plans");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/activity-logs");

  if (planId) {
    revalidatePath(`/admin/plans/${planId}`);
    revalidatePath(`/admin/plans/${planId}/edit`);
  }
}

function validatePlanId(planId) {
  const validationResult = validateObject(planIdObjectSchema, {
    planId,
  });

  if (!validationResult.success) {
    throw new Error(
      getFirstValidationMessage(
        validationResult.error,
        "ID-ja e planit mungon.",
      ),
    );
  }

  return validationResult.data.planId;
}

export async function createPlanAction(formData) {
  const admin = await requirePlatformAdmin();
  const adminUserId = getAdminUserId(admin);

  try {
    const validationResult = validateFormData(createPlanSchema, formData);

    if (!validationResult.success) {
      throw new Error(
        getFirstValidationMessage(
          validationResult.error,
          "Të dhënat e planit nuk janë të vlefshme.",
        ),
      );
    }

    const plan = await createPlan(validationResult.data);

    await createPlatformAuditLog({
      userId: adminUserId,
      action: "CREATE",
      entityType: "PLAN",
      entityId: plan.id,
      title: "Plani u krijua",
      description: `U krijua plani ${plan.name}.`,
      newValues: getPlanAuditValues(plan),
    });

    revalidatePlanPages(plan.id);

    return {
      success: true,
      planId: plan.id,
      message: "Plani u krijua me sukses.",
    };
  } catch (error) {
    handlePlanError(error);
  }
}

export async function updatePlanAction(planId, formData) {
  const admin = await requirePlatformAdmin();
  const adminUserId = getAdminUserId(admin);

  try {
    const validatedPlanId = validatePlanId(planId);

    const existingPlan = await getPlanById(validatedPlanId);

    if (!existingPlan) {
      throw new Error("Plani nuk u gjet.");
    }

    const validationResult = validateFormData(updatePlanSchema, formData);

    if (!validationResult.success) {
      throw new Error(
        getFirstValidationMessage(
          validationResult.error,
          "Të dhënat e planit nuk janë të vlefshme.",
        ),
      );
    }

    const data = {
      ...validationResult.data,
    };

    if (existingPlan.slug === "free-trial") {
      data.slug = "free-trial";
      data.isActive = true;
      data.isRecommended = false;
      data.monthlyPrice = 0;
      data.yearlyPrice = 0;
    }

    const plan = await updatePlan({
      planId: validatedPlanId,
      ...data,
    });

    await createPlatformAuditLog({
      userId: adminUserId,
      action: "UPDATE",
      entityType: "PLAN",
      entityId: plan.id,
      title: "Plani u përditësua",
      description: `Plani ${plan.name} u përditësua.`,
      oldValues: getPlanAuditValues(existingPlan),
      newValues: getPlanAuditValues(plan),
    });

    revalidatePlanPages(plan.id);

    return {
      success: true,
      planId: plan.id,
      message: "Plani u përditësua me sukses.",
    };
  } catch (error) {
    handlePlanError(error);
  }
}

export async function togglePlanStatusAction(planId) {
  const admin = await requirePlatformAdmin();
  const adminUserId = getAdminUserId(admin);

  try {
    const validatedPlanId = validatePlanId(planId);

    const existingPlan = await getPlanById(validatedPlanId);

    if (!existingPlan) {
      throw new Error("Plani nuk u gjet.");
    }

    if (existingPlan.slug === "free-trial") {
      throw new Error("Free Trial duhet të mbetet gjithmonë aktiv.");
    }

    const plan = await togglePlanStatus(validatedPlanId);

    await createPlatformAuditLog({
      userId: adminUserId,
      action: "STATUS_CHANGE",
      entityType: "PLAN",
      entityId: plan.id,
      title: plan.isActive ? "Plani u aktivizua" : "Plani u çaktivizua",
      description: `Statusi i planit ${plan.name} u ndryshua.`,
      oldValues: {
        isActive: existingPlan.isActive,
      },
      newValues: {
        isActive: plan.isActive,
      },
    });

    revalidatePlanPages(plan.id);

    return {
      success: true,
      isActive: plan.isActive,
      message: plan.isActive
        ? "Plani u aktivizua me sukses."
        : "Plani u çaktivizua me sukses.",
    };
  } catch (error) {
    handlePlanError(error);
  }
}

export async function toggleRecommendedPlanAction(planId) {
  const admin = await requirePlatformAdmin();
  const adminUserId = getAdminUserId(admin);

  try {
    const validatedPlanId = validatePlanId(planId);

    const existingPlan = await getPlanById(validatedPlanId);

    if (!existingPlan) {
      throw new Error("Plani nuk u gjet.");
    }

    if (existingPlan.slug === "free-trial") {
      throw new Error("Free Trial nuk mund të shënohet si plan i rekomanduar.");
    }

    if (!existingPlan.isActive && !existingPlan.isRecommended) {
      throw new Error(
        "Aktivizoje planin para se ta shënosh si të rekomanduar.",
      );
    }

    const plan = await toggleRecommendedPlan(validatedPlanId);

    await createPlatformAuditLog({
      userId: adminUserId,
      action: "UPDATE",
      entityType: "PLAN",
      entityId: plan.id,
      title: "Rekomandimi i planit u ndryshua",
      description: `Statusi i rekomandimit për ${plan.name} u ndryshua.`,
      oldValues: {
        isRecommended: existingPlan.isRecommended,
      },
      newValues: {
        isRecommended: plan.isRecommended,
      },
    });

    revalidatePlanPages(plan.id);

    return {
      success: true,
      isRecommended: plan.isRecommended,
      message: plan.isRecommended
        ? "Plani u shënua si i rekomanduar."
        : "Plani nuk është më i rekomanduar.",
    };
  } catch (error) {
    handlePlanError(error);
  }
}
