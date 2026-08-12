import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { runCommand } from "./command-utils.mjs";
import { requireDatabaseConfirmation } from "./database-safety.mjs";

const target = requireDatabaseConfirmation();
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = resolve(process.env.DB_BACKUP_DIR || "backups");
const output = resolve(
  backupDir,
  `autoflow-${target.database}-${timestamp}.dump`,
);
mkdirSync(backupDir, { recursive: true });

runCommand("pg_dump", [
  "--format=custom",
  "--no-owner",
  "--no-acl",
  `--file=${output}`,
  process.env.DIRECT_URL || process.env.DATABASE_URL,
], { shell: false });
console.log(`Backup u krijua: ${output}`);
console.log(
  "Ruaje jashtë makinës së aplikacionit dhe testo restore-in në një databazë të veçantë.",
);
