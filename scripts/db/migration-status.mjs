import { runCommand } from "./command-utils.mjs";
import { parseDatabaseTarget } from "./database-safety.mjs";

const target = parseDatabaseTarget();
console.log(`Migration status për ${target.safeLabel} [${target.fingerprint}]`);
runCommand(process.platform === "win32" ? "npx.cmd" : "npx", ["prisma", "migrate", "status"]);
