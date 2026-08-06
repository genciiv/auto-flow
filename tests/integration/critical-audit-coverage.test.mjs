import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

async function readProjectFile(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("terminet regjistrojnë krijim, ndryshim, fshirje, status dhe nisje servisi", async () => {
  const source = await readProjectFile("src/actions/appointment-actions.js");

  for (const marker of [
    'title: "U krijua termini"',
    'title: "U përditësua termini"',
    'title: "U fshi termini"',
    'title: "U ndryshua statusi i terminit"',
    'title: "U nis servisi nga termini"',
    'title: "U riplanifikua termini"',
  ]) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(source, /businessId,\s*userId,\s*action:/);
});

test("porositë regjistrojnë lifecycle-in e plotë në Audit Log", async () => {
  const source = await readProjectFile("src/actions/purchase-actions.js");

  for (const action of ["CREATE", "UPDATE", "STATUS_CHANGE", "DELETE"]) {
    assert.match(source, new RegExp(`action: "${action}"`));
  }

  assert.match(source, /entityType: "PURCHASE_ORDER"/);
  assert.match(source, /metadata: \{ deletedItems:/);
});
