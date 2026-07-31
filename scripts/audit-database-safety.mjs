import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "scripts/db/database-safety.mjs",
  "scripts/db/generate-baseline.mjs",
  "scripts/db/check-drift.mjs",
  "scripts/db/resolve-baseline.mjs",
  "scripts/db/deploy-migrations.mjs",
  "scripts/db/backup-postgres.mjs",
  "docs/database-migration-runbook.md",
  "docs/database-backup-restore.md",
  "prisma/migrations/README.md",
];

const errors = [];
for (const file of requiredFiles) {
  if (!existsSync(file)) errors.push(`${file}: mungon.`);
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
for (const script of [
  "db:baseline:generate",
  "db:baseline:resolve",
  "db:drift:check",
  "db:migrate:status",
  "db:migrate:deploy",
  "db:backup",
]) {
  if (!pkg.scripts?.[script]) errors.push(`package.json: mungon script-i ${script}.`);
}

const safety = readFileSync("scripts/db/database-safety.mjs", "utf8");
for (const marker of ["DB_OPERATION_CONFIRM", "ALLOW_REMOTE_DB_OPERATIONS", "fingerprint", "migrate reset"]) {
  if (!safety.includes(marker)) errors.push(`database-safety.mjs: mungon mbrojtja ${marker}.`);
}

if (errors.length) {
  console.error("Database safety audit: FAILED");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Database safety audit: OK — baseline workflow, drift checks, backup dhe guardrails u verifikuan.");
