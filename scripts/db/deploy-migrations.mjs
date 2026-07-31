import { requireDatabaseConfirmation } from "./database-safety.mjs";
import { runCommand } from "./command-utils.mjs";

const execute = process.argv.includes("--execute");
const target = requireDatabaseConfirmation();
console.log(`Target: ${target.safeLabel} [${target.fingerprint}]`);

if (!execute) {
  console.log("DRY RUN: asnjë migration nuk u aplikua.");
  console.log("Përdor npm run db:migrate:deploy -- --execute vetëm në release/staging/production pas backup-it.");
  process.exit(0);
}

runCommand(process.platform === "win32" ? "npx.cmd" : "npx", ["prisma", "migrate", "deploy"]);
