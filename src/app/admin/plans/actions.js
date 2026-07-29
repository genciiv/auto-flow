"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/auth-guard";
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

  if (planId) {
    revalidatePath(`/admin/plans/${planId}`);
    revalidatePath(`/admin/plans/${planId}/edit`);
  }
}

export async function createPlanAction(formData) {
  await requirePlatformAdmin();

  try {
    const data = getPlanData(formData);

    const plan = await createPlan(data);

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
  await requirePlatformAdmin();

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
  await requirePlatformAdmin();

  if (!planId) {
    throw new Error("ID-ja e planit mungon.");
  }

  try {
    const plan = await togglePlanStatus(planId);

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
  await requirePlatformAdmin();

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
