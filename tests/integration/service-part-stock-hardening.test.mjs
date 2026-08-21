import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

async function readProjectFile(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("pjesët e servisit përdorin transaksione serializable me retry", async () => {
  const helper = await readProjectFile("src/lib/service-part-stock.js");
  const action = await readProjectFile("src/actions/service-part-actions.js");

  assert.match(helper, /isolationLevel: "Serializable"/);
  assert.match(helper, /SERIALIZABLE_RETRY_CODES/);
  assert.match(helper, /"P2034"/);
  assert.match(helper, /"P2028"/);
  assert.match(action, /runSerializableServicePartTransaction/);
  assert.doesNotMatch(action, /await db\.\$transaction\(/);
});

test("dalja e stokut bllokon stokun negativ dhe regjistron stokun real", async () => {
  const action = await readProjectFile("src/actions/service-part-actions.js");
  const addSection = action.slice(
    action.indexOf("export async function addPartToService"),
    action.indexOf("export async function removePartFromServiceAction"),
  );

  assert.match(addSection, /currentStock\.lt\(requestedQuantity\)/);
  assert.match(addSection, /transaction\.part\.updateMany/);
  assert.match(addSection, /stock: currentStock/);
  assert.match(addSection, /stockUpdate\.count !== 1/);
  assert.match(addSection, /transaction\.servicePartUsage\.upsert/);
  assert.match(addSection, /stockBefore: currentStock/);
  assert.match(addSection, /stockAfter/);
});

test("përdorimi i pjesës ruan cost snapshot dhe mesataren e ponderuar", async () => {
  const action = await readProjectFile("src/actions/service-part-actions.js");
  const addSection = action.slice(
    action.indexOf("export async function addPartToService"),
    action.indexOf("export async function removePartFromServiceAction"),
  );

  assert.match(addSection, /buyPrice: true/);
  assert.match(
    addSection,
    /const costUnitPrice = toMoney\(part\.buyPrice \?\? 0\)/,
  );
  assert.match(
    addSection,
    /const costTotal = multiplyMoney\(\s*costUnitPrice,\s*requestedQuantity,\s*\)/,
  );
  assert.match(addSection, /costUnitPrice,\s*costTotal,/);
  assert.match(addSection, /costTotal: true/);
  assert.match(
    addSection,
    /const combinedCostTotal = existingUsage[\s\S]*addMoney\(existingUsage\.costTotal, costTotal\)/,
  );
  assert.match(
    addSection,
    /const combinedCostUnitPrice = divideMoney\(\s*combinedCostTotal,\s*combinedQuantity,\s*\)/,
  );
  assert.match(addSection, /costUnitPrice: combinedCostUnitPrice/);
  assert.match(addSection, /costTotal: combinedCostTotal/);
});

test("heqja e pjesës e pretendon usage-in para kthimit dhe nuk e kthen dy herë", async () => {
  const action = await readProjectFile("src/actions/service-part-actions.js");
  const removeSection = action.slice(
    action.indexOf("export async function removePartFromServiceAction"),
  );

  const deleteIndex = removeSection.indexOf(
    "transaction.servicePartUsage.deleteMany",
  );
  const returnIndex = removeSection.indexOf("transaction.part.updateMany");

  assert.ok(deleteIndex >= 0);
  assert.ok(returnIndex > deleteIndex);
  assert.match(removeSection, /usageDelete\.count !== 1/);
  assert.match(removeSection, /stock: stockBefore/);
  assert.match(removeSection, /stockReturn\.count !== 1/);
  assert.match(removeSection, /type: "SERVICE_RETURN"/);
  assert.match(removeSection, /stockBefore/);
  assert.match(removeSection, /stockAfter/);
});