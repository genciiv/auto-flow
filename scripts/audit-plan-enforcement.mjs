import { readFileSync } from "node:fs";

const failures = [];
const read = (path) => {
  try { return readFileSync(path, "utf8"); }
  catch { failures.push(`${path}: mungon.`); return ""; }
};
const expect = (source, pattern, message) => {
  if (!pattern.test(source)) failures.push(message);
};

const service = read("src/services/plan-access-service.js");
const errors = read("src/lib/errors.js");
const customers = read("src/actions/customer-actions.js");
const vehicles = read("src/actions/vehicle-actions.js");
const marketplace = read("src/actions/marketplace-actions.js");
const inventory = read("src/actions/part-actions.js");
const analytics = read("src/app/dashboard/analytics/page.jsx");

expect(service, /assertPlanFeature/, "Mungon assertPlanFeature.");
expect(service, /assertPlanLimit/, "Mungon assertPlanLimit.");
expect(service, /getPlanUsage/, "Mungon getPlanUsage.");
expect(service, /maxUsers/, "Mungon maxUsers enforcement config.");
expect(service, /maxCustomers/, "Mungon maxCustomers enforcement config.");
expect(service, /maxVehicles/, "Mungon maxVehicles enforcement config.");
expect(errors, /PLAN_LIMIT_REACHED/, "Mungon PLAN_LIMIT_REACHED.");
expect(errors, /PLAN_FEATURE_NOT_INCLUDED/, "Mungon PLAN_FEATURE_NOT_INCLUDED.");
expect(customers, /PLAN_RESOURCES\.CUSTOMERS/, "Customer create nuk kontrollon plan limit.");
expect(vehicles, /PLAN_RESOURCES\.VEHICLES/, "Vehicle create nuk kontrollon plan limit.");
expect(marketplace, /PLAN_FEATURES\.MARKETPLACE/, "Marketplace nuk kontrollon plan feature.");
expect(inventory, /PLAN_FEATURES\.INVENTORY/, "Inventory nuk kontrollon plan feature.");
expect(analytics, /PLAN_FEATURES\.ANALYTICS/, "Analytics nuk kontrollon plan feature.");

if (failures.length) {
  console.error("Plan enforcement audit: FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Plan enforcement audit: OK — limits, features, usage service dhe server enforcement u verifikuan.");
