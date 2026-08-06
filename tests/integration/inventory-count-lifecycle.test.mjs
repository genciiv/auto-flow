import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

async function readProjectFile(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("inventarizimi ndryshon stokun vetëm gjatë postimit të aprovuar", async () => {
  const source = await readProjectFile("src/app/dashboard/finance/actions.js");

  const saveSection = source.slice(
    source.indexOf("export async function saveInventoryCountAction"),
    source.indexOf("export async function submitInventoryCountAction"),
  );
  const approveSection = source.slice(
    source.indexOf("export async function approveInventoryCountAction"),
    source.indexOf("export async function postInventoryCountAction"),
  );
  const postSection = source.slice(
    source.indexOf("export async function postInventoryCountAction"),
  );

  assert.doesNotMatch(saveSection, /transaction\.part\.update|db\.part\.update/);
  assert.doesNotMatch(approveSection, /transaction\.part\.update|db\.part\.update/);
  assert.match(postSection, /transaction\.part\.update/);
  assert.match(postSection, /transaction\.inventoryMovement\.create/);
});

test("postimi i inventarizimit është idempotent dhe i mbrojtur nga konkurrenca", async () => {
  const source = await readProjectFile("src/app/dashboard/finance/actions.js");
  const postSection = source.slice(
    source.indexOf("export async function postInventoryCountAction"),
  );

  assert.match(postSection, /transaction\.inventoryCount\.updateMany/);
  assert.match(postSection, /status: "APPROVED"/);
  assert.match(postSection, /postedAt: null/);
  assert.match(postSection, /claimedCount\.count !== 1/);
  assert.match(postSection, /status: "POSTED"/);
});

test("korrigjimi përdor stokun aktual dhe regjistron lifecycle-in në Audit Log", async () => {
  const source = await readProjectFile("src/app/dashboard/finance/actions.js");

  assert.match(source, /const difference = item\.actualQuantity - part\.stock/);
  assert.match(source, /stockBefore: part\.stock/);
  assert.match(source, /title: "Inventarizimi u dërgua për shqyrtim"/);
  assert.match(source, /title: "Inventarizimi u aprovua"/);
  assert.match(source, /title: "Inventarizimi u postua"/);
  assert.match(source, /metadata: \{ adjustedItems: postingResult\.adjustedItems \}/);
});
