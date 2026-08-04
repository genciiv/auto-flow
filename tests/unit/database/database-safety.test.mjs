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

test("reset commands bllokohen", () => {
  assert.throws(() => assertNotProductionReset("prisma migrate reset"), /ndaluara/);
  assert.throws(() => assertNotProductionReset("prisma db push --force-reset"), /ndaluara/);
  assert.doesNotThrow(() => assertNotProductionReset("prisma migrate deploy"));
});

