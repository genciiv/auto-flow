import { createHash } from "node:crypto";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "host.docker.internal"]);

export function parseDatabaseTarget(databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL mungon.");
  }

  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL nuk Ã«shtÃ« URL e vlefshme.");
  }

  if (!url.protocol.startsWith("postgres")) {
    throw new Error("AutoFlow pret PostgreSQL pÃ«r migrimet.");
  }

  const database = decodeURIComponent(url.pathname.replace(/^\//, ""));
  if (!database) {
    throw new Error("DATABASE_URL nuk pÃ«rmban emrin e databazÃ«s.");
  }

  const isLocal = LOCAL_HOSTS.has(url.hostname);
  const fingerprint = createHash("sha256")
    .update(`${url.protocol}//${url.hostname}:${url.port || "default"}/${database}`)
    .digest("hex")
    .slice(0, 12);

  return {
    host: url.hostname,
    port: url.port || "default",
    database,
    isLocal,
    fingerprint,
    safeLabel: `${url.hostname}/${database}`,
  };
}

export function requireDatabaseConfirmation({
  databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL,
  confirmation = process.env.DB_OPERATION_CONFIRM,
  allowRemote = process.env.ALLOW_REMOTE_DB_OPERATIONS === "true",
} = {}) {
  const target = parseDatabaseTarget(databaseUrl);
  const expected = `${target.database}:${target.fingerprint}`;

  if (!target.isLocal && !allowRemote) {
    throw new Error(
      `Operacioni mbi databazÃ«n remote ${target.safeLabel} u bllokua. Vendos ALLOW_REMOTE_DB_OPERATIONS=true vetÃ«m pas backup-it dhe verifikimit tÃ« target-it.`,
    );
  }

  if (confirmation !== expected) {
    throw new Error(
      `Konfirmimi mungon ose Ã«shtÃ« i pasaktÃ«. Vendos DB_OPERATION_CONFIRM=${expected}`,
    );
  }

  return target;
}

export function assertNotProductionReset(command = "") {
  const normalized = String(command).toLowerCase();
  if (normalized.includes("migrate reset") || normalized.includes("db push --force-reset")) {
    throw new Error("Operacionet reset janÃ« tÃ« ndaluara nga workflow-i i AutoFlow.");
  }
}



