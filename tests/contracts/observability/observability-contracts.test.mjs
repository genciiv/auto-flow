import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(path, "utf8");
}

test("health endpoints ekspozojnë liveness dhe readiness pa cache", async () => {
  const [live, ready] = await Promise.all([
    source("src/app/api/health/live/route.js"),
    source("src/app/api/health/ready/route.js"),
  ]);

  assert.match(live, /status:\s*"ok"/);
  assert.match(live, /cache-control/);
  assert.match(ready, /checkDatabase/);
  assert.match(ready, /503/);
  assert.match(ready, /x-request-id/);
});

test("CI ekzekuton audit, tests, lint dhe production build", async () => {
  const workflow = await source(".github/workflows/ci.yml");

  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run audit:ci/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npm run lint/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /cancel-in-progress:\s*true/);
});

test("Prisma query logging është opt-in", async () => {
  const db = await source("src/lib/db.js");
  assert.match(db, /PRISMA_LOG_QUERIES/);
  assert.doesNotMatch(db, /NODE_ENV === "development"\s*\? \["query"/);
});
