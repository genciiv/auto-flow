import { parseDatabaseTarget } from "./database-safety.mjs";
const target = parseDatabaseTarget();
console.log(`Database target: ${target.safeLabel}`);
console.log(`Local: ${target.isLocal ? "po" : "jo"}`);
console.log(`Fingerprint: ${target.fingerprint}`);
console.log(`DB_OPERATION_CONFIRM=${target.database}:${target.fingerprint}`);
