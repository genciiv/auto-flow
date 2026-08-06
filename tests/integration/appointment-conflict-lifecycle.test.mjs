import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

async function readProjectFile(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("konflikti i terminit kontrollon mbivendosjen server-side", async () => {
  const helper = await readProjectFile("src/lib/appointment-scheduling.js");

  assert.match(helper, /candidate\.date < end && candidateEnd > start/);
  assert.match(helper, /status: \{ notIn: NON_BLOCKING_APPOINTMENT_STATUSES \}/);
  assert.match(helper, /businessId,/);
  assert.match(helper, /assignedUserId,/);
  assert.match(helper, /Europe\/Tirane/);
});

test("krijimi, përditësimi dhe riplanifikimi përdorin të njëjtin guard", async () => {
  const source = await readProjectFile("src/actions/appointment-actions.js");

  const occurrences = source.match(/assertAppointmentSlotAvailable\(\{/g) || [];
  assert.equal(occurrences.length, 3);
  assert.match(source, /excludeAppointmentId: appointment\.id/);
  assert.match(source, /durationMinutes: appointment\.durationMinutes/);
});

test("transaksionet serializable mbrojnë konfliktet dhe nisjen e servisit", async () => {
  const helper = await readProjectFile("src/lib/appointment-scheduling.js");
  const source = await readProjectFile("src/actions/appointment-actions.js");

  assert.match(helper, /isolationLevel: "Serializable"/);
  assert.match(helper, /SERIALIZABLE_RETRY_CODES/);
  assert.match(source, /serviceId: true/);
  assert.match(source, /return \{ service: existingService, created: false \}/);
  assert.match(source, /status: \{ in: \["PENDING", "CONFIRMED"\] \}/);
  assert.match(source, /serviceResult\.created/);
});
