import nextEnv from "@next/env";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  LEGACY_PLAN_SLUGS,
  SUBSCRIPTION_PLAN_CATALOG,
  TRIAL_CONFIGURATION,
} from "../src/config/subscription-plans.js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL mungon. Konfigurimi i planeve u anulua.");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const db = new PrismaClient({ adapter });

function formatLek(value) {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "ALL",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

async function configurePlans() {
  const results = [];

  for (const plan of SUBSCRIPTION_PLAN_CATALOG) {
    const savedPlan = await db.plan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        description: plan.description,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        maxUsers: plan.maxUsers,
        maxCustomers: plan.maxCustomers,
        maxVehicles: plan.maxVehicles,
        features: [...plan.features],
        isActive: plan.isActive,
        isRecommended: plan.isRecommended,
        sortOrder: plan.sortOrder,
      },
      create: {
        ...plan,
        features: [...plan.features],
      },
    });

    results.push(savedPlan);
  }

  if (LEGACY_PLAN_SLUGS.length > 0) {
    await db.plan.updateMany({
      where: { slug: { in: [...LEGACY_PLAN_SLUGS] } },
      data: { isActive: false, isRecommended: false },
    });
  }

  const settings = await db.platformSetting.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (settings) {
    await db.platformSetting.update({
      where: { id: settings.id },
      data: {
        trialEnabled: TRIAL_CONFIGURATION.enabled,
        trialDurationDays: TRIAL_CONFIGURATION.durationDays,
        defaultCurrency: "ALL",
      },
    });
  } else {
    await db.platformSetting.create({
      data: {
        trialEnabled: TRIAL_CONFIGURATION.enabled,
        trialDurationDays: TRIAL_CONFIGURATION.durationDays,
        defaultCurrency: "ALL",
      },
    });
  }

  return results;
}

try {
  const plans = await configurePlans();

  console.log("Planet e AutoFlow u konfiguruan me sukses:");

  for (const plan of plans) {
    console.log(
      `- ${plan.name}: ${formatLek(plan.monthlyPrice)}/muaj, ${
        plan.maxUsers ?? "pa kufi"
      } përdorues`,
    );
  }

  if (LEGACY_PLAN_SLUGS.length > 0) {
    console.log(
      `Planet e vjetra u çaktivizuan: ${LEGACY_PLAN_SLUGS.join(", ")}.`,
    );
  }

  console.log(
    `Trial: ${TRIAL_CONFIGURATION.durationDays} ditë me planin ${TRIAL_CONFIGURATION.planSlug}.`,
  );
} catch (error) {
  console.error("Konfigurimi i planeve dështoi:");
  console.error(error);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
