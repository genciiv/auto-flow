import "server-only";

import { checkDatabase, runtimeInfo } from "@/lib/health";

function configured(value, minimumLength = 1) {
  return typeof value === "string" && value.trim().length >= minimumLength;
}

function configCheck({ ok, message, detail }) {
  return {
    status: ok ? "up" : "warning",
    message,
    ...(detail ? { detail } : {}),
  };
}

export async function getSystemHealth() {
  const database = await checkDatabase();
  const runtime = runtimeInfo();

  const authConfigured = configured(process.env.AUTH_SECRET, 32);
  const emailConfigured =
    configured(process.env.BREVO_API_KEY) && configured(process.env.EMAIL_FROM);
  const storageConfigured =
    configured(process.env.SUPABASE_URL) &&
    configured(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
    configured(process.env.SUPABASE_STORAGE_BUCKET);
  const cronConfigured = configured(process.env.CRON_SECRET, 32);

  const checks = {
    database: {
      ...database,
      message:
        database.status === "up"
          ? "Databaza po përgjigjet normalisht."
          : "Databaza nuk është e arritshme.",
    },
    authentication: configCheck({
      ok: authConfigured,
      message: authConfigured
        ? "Konfigurimi bazë i autentikimit është aktiv."
        : "AUTH_SECRET mungon ose është shumë i shkurtër.",
    }),
    email: configCheck({
      ok: emailConfigured,
      message: emailConfigured
        ? "Email provider është konfiguruar."
        : "BREVO_API_KEY ose EMAIL_FROM nuk është konfiguruar.",
      detail: "Kontrollon konfigurimin, jo dërgimin real të një email-i.",
    }),
    storage: configCheck({
      ok: storageConfigured,
      message: storageConfigured
        ? "Storage privat është konfiguruar."
        : "Konfigurimi Supabase Storage nuk është i plotë.",
      detail: "Kontrollon vetëm konfigurimin dhe nuk ekspozon credential-e.",
    }),
    cron: configCheck({
      ok: cronConfigured,
      message: cronConfigured
        ? "CRON_SECRET është konfiguruar."
        : "CRON_SECRET mungon ose është shumë i shkurtër.",
    }),
  };

  const criticalDown =
    checks.database.status === "down" || checks.authentication.status !== "up";
  const hasWarning = Object.values(checks).some(
    (check) => check.status === "warning",
  );

  return {
    status: criticalDown ? "down" : hasWarning ? "warning" : "up",
    checkedAt: new Date().toISOString(),
    runtime,
    checks,
    endpoints: {
      liveness: "/api/health/live",
      readiness: "/api/health/ready",
      subscriptionCron: "/api/cron/subscriptions",
      customerReminderCron: "/api/cron/customer-vehicle-reminders",
    },
  };
}
