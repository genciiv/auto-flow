import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const requiredFiles = [
  "tests/support/register.mjs",
  "tests/support/alias-loader.mjs",
  "tests/index.test.mjs",
  "tests/unit/index.test.mjs",
  "tests/contracts/index.test.mjs",
  "tests/unit/errors.test.mjs",
  "tests/unit/action-result.test.mjs",
  "tests/unit/request-context.test.mjs",
  "tests/unit/validation.test.mjs",
  "tests/unit/api-response.test.mjs",
  "tests/contracts/security-contracts.test.mjs",
  "tests/contracts/authorization-contracts.test.mjs",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    failures.push(`${file}: mungon.`);
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const requiredScripts = ["test", "test:unit", "test:contracts", "audit:tests"];

for (const script of requiredScripts) {
  if (!packageJson.scripts?.[script]) {
    failures.push(`package.json: mungon script-i ${script}.`);
  }
}

if (failures.length > 0) {
  console.error("Automated testing audit: FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Automated testing audit: OK — ${requiredFiles.length - 2} test files dhe test runner-i u verifikuan.`,
);
