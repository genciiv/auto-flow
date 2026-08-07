import test from "node:test";
import assert from "node:assert/strict";

import { getCustomerVehicleHealth } from "@/lib/customer-vehicle-health";

const NOW = new Date("2026-08-07T10:00:00.000Z");

function baseInput(overrides = {}) {
  return {
    vehicleId: "vehicle-1",
    mileage: 120000,
    latestMileageAt: new Date("2026-08-01T10:00:00.000Z"),
    maintenanceHistory: [],
    reminders: [],
    documents: [],
    expenses: [],
    serviceCount: 2,
    now: NOW,
    ...overrides,
  };
}

test("vehicle health është OK kur nuk ka afate aktive", () => {
  const health = getCustomerVehicleHealth(baseInput());

  assert.equal(health.status, "OK");
  assert.equal(health.actionCount, 0);
  assert.equal(health.metrics.serviceCount, 2);
});

test("dokument që skadon brenda 30 ditësh kërkon vëmendje", () => {
  const health = getCustomerVehicleHealth(
    baseInput({
      documents: [
        {
          id: "doc-1",
          title: "Siguracioni",
          expiresAt: new Date("2026-08-27T10:00:00.000Z"),
        },
      ],
    }),
  );

  assert.equal(health.status, "ATTENTION");
  assert.equal(health.actions[0].kind, "DOCUMENT");
  assert.match(health.actions[0].href, /#documents$/);
});

test("dokument i skaduar ose mirëmbajtje e kaluar e bën statusin urgent", () => {
  const health = getCustomerVehicleHealth(
    baseInput({
      maintenanceHistory: [
        {
          id: "maintenance-1",
          type: "ENGINE_OIL",
          title: "Vaji",
          nextMileage: 119000,
          nextDate: null,
        },
      ],
      documents: [
        {
          id: "doc-1",
          title: "Kontrolli teknik",
          expiresAt: new Date("2026-08-01T10:00:00.000Z"),
        },
      ],
    }),
  );

  assert.equal(health.status, "URGENT");
  assert.ok(health.actions.some((action) => action.kind === "MAINTENANCE"));
  assert.ok(health.actions.some((action) => action.kind === "DOCUMENT"));
});

test("reminder-i i dokumentit nuk dublohet me dokumentin në health actions", () => {
  const health = getCustomerVehicleHealth(
    baseInput({
      reminders: [
        {
          id: "reminder-doc",
          documentId: "doc-1",
          title: "Siguracioni – skadimi",
          dueDate: new Date("2026-08-10T10:00:00.000Z"),
          dueMileage: null,
        },
      ],
      documents: [
        {
          id: "doc-1",
          title: "Siguracioni",
          expiresAt: new Date("2026-08-10T10:00:00.000Z"),
        },
      ],
    }),
  );

  assert.equal(health.actions.filter((action) => action.kind === "DOCUMENT").length, 1);
  assert.equal(health.actions.filter((action) => action.kind === "REMINDER").length, 0);
});

test("shpenzimet e ownership insight llogariten vetëm për 12 muajt e fundit", () => {
  const health = getCustomerVehicleHealth(
    baseInput({
      expenses: [
        { amount: "12000.00", occurredAt: new Date("2026-07-01T10:00:00.000Z") },
        { amount: "8000.00", occurredAt: new Date("2025-09-01T10:00:00.000Z") },
        { amount: "5000.00", occurredAt: new Date("2025-07-01T10:00:00.000Z") },
      ],
    }),
  );

  assert.equal(health.metrics.expenseTotal12Months, 20000);
  assert.equal(health.metrics.expenseCount12Months, 2);
});

test("kilometrazhi i munguar ose shumë i vjetër prodhon action pa e bërë urgent", () => {
  const missing = getCustomerVehicleHealth(baseInput({ mileage: null, latestMileageAt: null }));
  const stale = getCustomerVehicleHealth(
    baseInput({ latestMileageAt: new Date("2026-01-01T10:00:00.000Z") }),
  );

  assert.equal(missing.status, "ATTENTION");
  assert.equal(stale.status, "ATTENTION");
  assert.ok(stale.actions.some((action) => action.key === "mileage:stale"));
});
