import { access, readFile } from "node:fs/promises";

const required = [
  "tests/integration/index.test.mjs",
  "tests/integration/tenant-isolation.test.mjs",
  "tests/integration/journeys.test.mjs",
  "tests/e2e/http-smoke.test.mjs",
];

const errors = [];
for (const file of required) {
  try { await access(file); } catch { errors.push(`${file}: mungon.`); }
}

const pkg = JSON.parse(await readFile("package.json", "utf8"));
for (const script of ["test:integration", "test:e2e", "audit:e2e"]) {
  if (!pkg.scripts?.[script]) errors.push(`package.json: mungon ${script}.`);
}

const e2e = await readFile("tests/e2e/http-smoke.test.mjs", "utf8");
for (const marker of ["E2E_BASE_URL", "/admin", "/dashboard", "/customer/dashboard", "x-content-type-options"]) {
  if (!e2e.includes(marker)) errors.push(`E2E smoke: mungon ${marker}.`);
}

if (errors.length) {
  console.error("Integration & E2E audit: FAILED");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Integration & E2E audit: OK — tenant isolation, role journeys dhe HTTP smoke suite u verifikuan.");
