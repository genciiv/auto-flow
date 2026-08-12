import test from "node:test";
import assert from "node:assert/strict";
import {
  assertNotProductionReset,
  parseDatabaseTarget,
  requireDatabaseConfirmation,
} from "../../../scripts/db/database-safety.mjs";

test("parseDatabaseTarget fsheh kredencialet dhe krijon fingerprint", () => {
  const target = parseDatabaseTarget("postgresql://user:secret@db.example.com:5432/autoflow");
  assert.equal(target.safeLabel, "db.example.com/autoflow");
  assert.equal(target.isLocal, false);
  assert.equal(target.fingerprint.length, 12);
  assert.equal(target.safeLabel.includes("secret"), false);
});

test("operacionet remote bllokohen pa flag dhe konfirmim", () => {
  const url = "postgresql://user:secret@db.example.com:5432/autoflow";
  assert.throws(
    () => requireDatabaseConfirmation({ databaseUrl: url }),
    /remote|Konfirmimi|DB_OPERATION_CONFIRM/i,
  );

  const target = parseDatabaseTarget(url);
  assert.doesNotThrow(() =>
    requireDatabaseConfirmation({
      databaseUrl: url,
      allowRemote: true,
      confirmation: `${target.database}:${target.fingerprint}`,
    }),
  );
});

test("DIRECT_URL ka prioritet ndaj DATABASE_URL per target-in default", () => {
  const previousDirectUrl = process.env.DIRECT_URL;
  const previousDatabaseUrl = process.env.DATABASE_URL;

  try {
    process.env.DATABASE_URL = "postgresql://user:secret@pooler.example.com:5432/autoflow";
    process.env.DIRECT_URL = "postgresql://user:secret@direct.example.com:5432/autoflow";

    const target = parseDatabaseTarget();

    assert.equal(target.host, "direct.example.com");
    assert.equal(target.safeLabel, "direct.example.com/autoflow");
  } finally {
    if (previousDirectUrl === undefined) delete process.env.DIRECT_URL;
    else process.env.DIRECT_URL = previousDirectUrl;

    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
  }
});
test("reset commands bllokohen", () => {
  assert.throws(() => assertNotProductionReset("prisma migrate reset"), /ndaluara/);
  assert.throws(() => assertNotProductionReset("prisma db push --force-reset"), /ndaluara/);
  assert.doesNotThrow(() => assertNotProductionReset("prisma migrate deploy"));
});

