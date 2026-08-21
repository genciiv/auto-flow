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

test("pranimi i porosisë përdor mesatare të ponderuar për buyPrice", async () => {
  const purchaseActions = await readProjectFile(
    "src/actions/purchase-item-actions.js",
  );

  const receiveSection = purchaseActions.slice(
    purchaseActions.indexOf(
      "export async function receivePurchaseOrder",
    ),
  );

  assert.match(receiveSection, /buyPrice: true/);

  assert.match(
    receiveSection,
    /const existingStockValue = multiplyMoney\(\s*existingPart\.buyPrice \?\? 0,\s*stockBefore,\s*\)/,
  );

  assert.match(
    receiveSection,
    /const receivedStockValue = multiplyMoney\(\s*unitPrice,\s*movementQuantity,\s*\)/,
  );

  assert.match(
    receiveSection,
    /const combinedStockValue = addMoney\(\s*existingStockValue,\s*receivedStockValue,\s*\)/,
  );

  assert.match(
    receiveSection,
    /const weightedBuyPrice = divideMoney\(\s*combinedStockValue,\s*stockAfter,\s*\)/,
  );

  assert.match(
    receiveSection,
    /buyPrice: weightedBuyPrice/,
  );

  assert.match(
    receiveSection,
    /stock: stockBefore/,
  );

  assert.doesNotMatch(
    receiveSection,
    /buyPrice:\s*unitPrice,\s*supplier:\s*purchase\.supplier/,
  );
});