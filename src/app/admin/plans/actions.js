"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth-guard";
import { createPlatformAuditLog } from "@/services/admin/activity-log-service";
import {
  createPlan,
  getPlanById,
  togglePlanStatus,
  toggleRecommendedPlan,
  updatePlan,
} from "@/services/admin/plan-service";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSlug(value) {
  return normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getAdminUserId(admin) {
  return admin?.user?.id ?? admin?.id ?? null;
}

function parseRequiredNumber(value, fieldLabel) {
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

function parseOptionalInteger(value, fieldLabel) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number.parseInt(normalizedValue, 10);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 1 ||
    String(parsedValue) !== normalizedValue
  ) {
    throw new Error(`${fieldLabel} duhet të jetë numër i plotë pozitiv.`);
  }

  return parsedValue;
}

function parseSortOrder(value) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return 0;
  }

  const parsedValue = Number.parseInt(normalizedValue, 10);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw new Error("Renditja duhet të jetë numër i plotë pozitiv.");
  }

  return parsedValue;
}

function parseFeatures(value) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return [];
  }

  return normalizedValue
    .split("\n")
    .map((feature) => feature.trim())
    .filter(Boolean);
}

function getPlanData(formData) {
  const name = normalizeText(formData.get("name"));
  const slugInput = normalizeText(formData.get("slug"));
  const description = normalizeText(formData.get("description"));

  if (name.length < 2) {
    throw new Error("Emri i planit duhet të ketë të paktën 2 karaktere.");
  }

  const slug = normalizeSlug(slugInput || name);

  if (!slug) {
    throw new Error("Slug-u i planit nuk është i vlefshëm.");
  }

  const monthlyPrice = parseRequiredNumber(
    formData.get("monthlyPrice"),
    "Çmimi mujor",
  );

  const yearlyPrice = parseRequiredNumber(
    formData.get("yearlyPrice"),
    "Çmimi vjetor",
  );

  const maxUsers = parseOptionalInteger(
    formData.get("maxUsers"),
    "Numri maksimal i përdoruesve",
  );

  const maxCustomers = parseOptionalInteger(
    formData.get("maxCustomers"),
    "Numri maksimal i klientëve",
  );

  const maxVehicles = parseOptionalInteger(
    formData.get("maxVehicles"),
    "Numri maksimal i automjeteve",
  );

  const sortOrder = parseSortOrder(formData.get("sortOrder"));
  const features = parseFeatures(formData.get("features"));

  return {
    name,
    slug,
    description: description || null,
    monthlyPrice,
    yearlyPrice,
    maxUsers,
    maxCustomers,
    maxVehicles,
    features,
    isActive: formData.get("isActive") === "on",
    isRecommended: formData.get("isRecommended") === "on",
    sortOrder,
  };
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

export async function createPlanAction(formData) {
  const admin = await requirePlatformAdmin();
  const adminUserId = getAdminUserId(admin);

  try {
    const data = getPlanData(formData);

    const plan = await createPlan(data);

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

  if (!planId) {
    throw new Error("ID-ja e planit mungon.");
  }

  try {
    const existingPlan = await getPlanById(planId);

    if (!existingPlan) {
      throw new Error("Plani nuk u gjet.");
    }

    const data = getPlanData(formData);

    if (existingPlan.slug === "free-trial") {
      data.slug = "free-trial";
      data.isActive = true;
      data.isRecommended = false;
      data.monthlyPrice = 0;
      data.yearlyPrice = 0;
    }

    const plan = await updatePlan({
      planId,
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

  if (!planId) {
    throw new Error("ID-ja e planit mungon.");
  }

  try {
    const existingPlan = await getPlanById(planId);

    if (!existingPlan) {
      throw new Error("Plani nuk u gjet.");
    }

    const plan = await togglePlanStatus(planId);

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

  if (!planId) {
    throw new Error("ID-ja e planit mungon.");
  }

  try {
    const existingPlan = await getPlanById(planId);

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

    const plan = await toggleRecommendedPlan(planId);

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
