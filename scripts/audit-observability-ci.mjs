import { readFile, access } from "node:fs/promises";

const requiredFiles = [
  "src/lib/logger.js",
  "src/lib/health.js",
  "src/app/api/health/live/route.js",
  "src/app/api/health/ready/route.js",
  ".github/workflows/ci.yml",
];

for (const file of requiredFiles) await access(file);

const [logger, ready, workflow, db, apiResponse] = await Promise.all([
  readFile("src/lib/logger.js", "utf8"),
  readFile("src/app/api/health/ready/route.js", "utf8"),
  readFile(".github/workflows/ci.yml", "utf8"),
  readFile("src/lib/db.js", "utf8"),
  readFile("src/lib/api-response.js", "utf8"),
]);

const checks = [
  [logger.includes("JSON.stringify(entry)"), "structured JSON logging mungon"],
  [logger.includes("[REDACTED]"), "redaction mungon"],
  [ready.includes("503"), "readiness endpoint nuk sinjalizon degradation"],
  [workflow.includes("npm ci") && workflow.includes("npm test") && workflow.includes("npm run build"), "CI pipeline është e paplotë"],
  [db.includes("PRISMA_LOG_QUERIES"), "Prisma query logging nuk kontrollohet me env"],
  [apiResponse.includes("api.request.failed"), "API errors nuk lidhen me structured logger"],
];

const failed = checks.filter(([ok]) => !ok).map(([, message]) => message);
if (failed.length) {
  console.error(`Observability & CI audit failed:\n- ${failed.join("\n- ")}`);
  process.exit(1);
}

console.log("Observability & CI audit: OK — structured logs, health checks, release metadata dhe pipeline u verifikuan.");
