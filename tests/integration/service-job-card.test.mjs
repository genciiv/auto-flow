import assert from "node:assert/strict";
import test from "node:test";

import { readFile } from "node:fs/promises";

async function readProjectFile(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("Job Card ruan problemin, diagnozën dhe shënimet pa miratim klienti", async () => {
  const actionSource = await readProjectFile(
    "src/actions/service-workflow-actions.js",
  );
  const panelSource = await readProjectFile(
    "src/components/services/ServiceWorkflowPanel.jsx",
  );
  const pageSource = await readProjectFile(
    "src/app/dashboard/services/[id]/page.jsx",
  );

  assert.match(actionSource, /description: optionalTextSchema/);
  assert.match(actionSource, /diagnosis: optionalTextSchema/);
  assert.match(actionSource, /internalNotes: optionalTextSchema/);
  assert.match(actionSource, /customerApprovalRequired: false/);
  assert.doesNotMatch(actionSource, /Nevojitet miratimi i klientit/);

  assert.match(panelSource, /Problemi i raportuar nga klienti/);
  assert.match(panelSource, /Diagnoza e mekanikut/);
  assert.match(panelSource, /transitionNote/);
  assert.match(panelSource, /Fleta e punës/);
  assert.match(panelSource, /Ruaj fletën e punës/);
  assert.doesNotMatch(panelSource, /Job Card/);
  assert.doesNotMatch(panelSource, /Kërko miratim klienti/);

  assert.doesNotMatch(pageSource, /canManageApproval/);
});
