import { runCommand } from "./command-utils.mjs";
import { parseDatabaseTarget } from "./database-safety.mjs";

const target = parseDatabaseTarget();
console.log(`Po kontrollohet drift për ${target.safeLabel} [${target.fingerprint}]...`);

try {
  runCommand(process.platform === "win32" ? "npx.cmd" : "npx", [
    "prisma",
    "migrate",
    "diff",
    "--exit-code",
    "--from-config-datasource",
    "--to-schema=prisma/schema.prisma",
  ]);
  console.log("Schema e databazës dhe schema.prisma janë në sinkron.");
} catch (error) {
  console.error("Drift u zbulua ose lidhja me databazën dështoi.");
  throw error;
}
