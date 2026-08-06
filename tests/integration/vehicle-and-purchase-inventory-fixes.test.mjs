import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readProjectFile(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("automjetet e dorëzuara numërohen aktive dhe porositë krijojnë hyrje stoku", async () => {
  const [vehiclesPage, purchaseActions] = await Promise.all([
    readProjectFile("src/app/dashboard/vehicles/page.jsx"),
    readProjectFile("src/actions/purchase-item-actions.js"),
  ]);

  assert.match(
    vehiclesPage,
    /latestService\.status === "DELIVERED"/,
  );

  assert.match(
    purchaseActions,
    /type:\s*"PURCHASE_IN"/,
  );

  assert.match(
    purchaseActions,
    /transaction\.inventoryMovement\.create/,
  );

  assert.match(
    purchaseActions,
    /stockBefore/,
  );

  assert.match(
    purchaseActions,
    /stockAfter/,
  );
});
