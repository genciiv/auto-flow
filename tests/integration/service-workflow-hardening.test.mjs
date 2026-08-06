import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

async function readProjectFile(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("workflow-i qendror lejon vetëm kalimet e vlefshme të servisit", async () => {
  const helper = await readProjectFile("src/lib/service-workflow.js");

  assert.match(helper, /IN_PROGRESS: \["WAITING_FOR_PARTS", "READY_FOR_PICKUP", "CANCELLED"\]/);
  assert.match(helper, /READY_FOR_PICKUP: \["IN_PROGRESS", "COMPLETED"\]/);
  assert.match(helper, /COMPLETED: \["DELIVERED"\]/);
  assert.doesNotMatch(helper, /READY_FOR_PICKUP: \[[^\]]*"DELIVERED"/);
  assert.match(helper, /assertServiceTransitionAllowed/);
});

test("mbyllja kërkon diagnozë dhe të paktën një punë ose pjesë", async () => {
  const helper = await readProjectFile("src/lib/service-workflow.js");
  const action = await readProjectFile("src/actions/service-workflow-actions.js");

  assert.match(helper, /service\.diagnosis\?\.trim\(\)/);
  assert.match(helper, /laborCount \+ partCount === 0/);
  assert.match(helper, /targetStatus === "DELIVERED" && service\.status !== "COMPLETED"/);
  assert.match(action, /assertServiceReadyToClose\(service, target\)/);
  assert.match(action, /laborItems: true/);
  assert.match(action, /partsUsed: true/);
});

test("ndryshimi i statusit është transaksional, idempotent dhe pa rrugë anësore", async () => {
  const helper = await readProjectFile("src/lib/service-workflow.js");
  const workflow = await readProjectFile("src/actions/service-workflow-actions.js");
  const legacyActions = await readProjectFile("src/actions/service-actions.js");

  assert.match(helper, /isolationLevel: "Serializable"/);
  assert.match(helper, /SERIALIZABLE_RETRY_CODES/);
  assert.match(workflow, /transaction\.serviceRecord\.updateMany/);
  assert.match(workflow, /status: service\.status/);
  assert.match(workflow, /claimed\.count !== 1/);
  assert.match(workflow, /current\?\.status === target/);
  assert.match(workflow, /serviceStatusHistory\.create/);
  assert.match(workflow, /logStatusChange/);
  assert.match(legacyActions, /return transitionServiceAction\(serviceId, status\)/);
  assert.match(legacyActions, /status: existingService\.status/);
});
