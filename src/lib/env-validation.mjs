const URL_KEYS = new Set(["NEXT_PUBLIC_APP_URL", "APP_URL", "SUPABASE_URL"]);

export const REQUIRED_RUNTIME_ENV = [
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "CRON_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
  "BREVO_API_KEY",
  "EMAIL_FROM",
];

function isPlaceholder(value) {
  return /replace|example|changeme|your[-_ ]|localhost:5432\/postgres/i.test(value || "");
}

export function validateDeploymentEnvironment(env = process.env, { target = env.APP_ENV || env.VERCEL_ENV || "development" } = {}) {
  const errors = [];
  const warnings = [];
  const productionLike = target === "production" || target === "staging" || target === "preview";

  for (const key of REQUIRED_RUNTIME_ENV) {
    const value = String(env[key] || "").trim();
    if (!value) errors.push(`${key} mungon.`);
    else if (isPlaceholder(value)) errors.push(`${key} ka vlerë placeholder.`);
  }

  for (const key of URL_KEYS) {
    const value = String(env[key] || "").trim();
    if (!value) continue;
    try {
      const url = new URL(value);
      if (productionLike && url.protocol !== "https:") errors.push(`${key} duhet të përdorë HTTPS për ${target}.`);
      if (productionLike && ["localhost", "127.0.0.1", "::1"].includes(url.hostname)) errors.push(`${key} nuk mund të jetë localhost në ${target}.`);
    } catch {
      errors.push(`${key} nuk është URL e vlefshme.`);
    }
  }

  const authSecret = String(env.AUTH_SECRET || "");
  if (authSecret && authSecret.length < 32) errors.push("AUTH_SECRET duhet të ketë të paktën 32 karaktere.");

  const cronSecret = String(env.CRON_SECRET || "");
  if (cronSecret && cronSecret.length < 32) errors.push("CRON_SECRET duhet të ketë të paktën 32 karaktere.");

  const googleId = String(env.AUTH_GOOGLE_ID || "").trim();
  const googleSecret = String(env.AUTH_GOOGLE_SECRET || "").trim();
  if (Boolean(googleId) !== Boolean(googleSecret)) {
    errors.push("AUTH_GOOGLE_ID dhe AUTH_GOOGLE_SECRET duhet të konfigurohen së bashku.");
  }

  if (env.PRISMA_LOG_QUERIES === "true" && productionLike) warnings.push("PRISMA_LOG_QUERIES=true duhet përdorur vetëm për diagnostikim të përkohshëm.");
  if (env.ENABLE_TEST_EMAIL_API === "true" && productionLike) errors.push("ENABLE_TEST_EMAIL_API duhet të jetë false në staging/production.");

  return { ok: errors.length === 0, target, errors, warnings };
}
