import { readFileSync } from "node:fs";

function read(path) {
  return readFileSync(path, "utf8");
}

function expect(content, pattern, message) {
  if (!pattern.test(content)) {
    throw new Error(message);
  }
}

const inventory = read("src/app/dashboard/inventory/actions.js");
const analytics = read("src/app/dashboard/analytics/page.jsx");

expect(
  inventory,
  /PLAN_FEATURES\.INVENTORY/,
  "Inventari nuk kontrollon plan feature.",
);
expect(
  analytics,
  /PLAN_FEATURES\.ANALYTICS/,
  "Analytics nuk kontrollon plan feature.",
);

console.log("Plan enforcement audit kaloi me sukses.");
