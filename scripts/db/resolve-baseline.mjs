import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { requireDatabaseConfirmation } from "./database-safety.mjs";
import { runCommand } from "./command-utils.mjs";

const migrationName = "20260731000000_baseline";
const migrationFile = resolve("prisma", "migrations", migrationName, "migration.sql");
const execute = process.argv.includes("--execute");

if (!existsSync(migrationFile)) {
  throw new Error("Baseline migration.sql mungon. Ekzekuto npm run db:baseline:generate.");
}

const target = requireDatabaseConfirmation();
console.log(`Target: ${target.safeLabel} [${target.fingerprint}]`);

if (!execute) {
  console.log("DRY RUN: asgjë nuk u ndryshua.");
  console.log(`Komanda e planifikuar: prisma migrate resolve --applied ${migrationName}`);
  console.log("Pasi të kesh backup dhe drift check të pastër, përdor: npm run db:baseline:resolve -- --execute");
  process.exit(0);
}

runCommand(process.platform === "win32" ? "npx.cmd" : "npx", [
  "prisma",
  "migrate",
  "resolve",
  "--applied",
  migrationName,
]);
console.log("Baseline u regjistrua si applied. Kontrollo menjëherë me npm run db:migrate:status.");
