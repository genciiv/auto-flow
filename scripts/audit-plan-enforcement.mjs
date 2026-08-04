import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const SUPPORTED_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);

function collectSourceFiles(directory) {
  if (!existsSync(directory)) {
    throw new Error(`Folderi i kërkuar nuk ekziston: ${directory}`);
  }

  const files = [];

  for (const entry of readdirSync(directory, {
    withFileTypes: true,
  })) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (entry.isFile() && SUPPORTED_EXTENSIONS.has(extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function readSourceDirectory(directory) {
  const files = collectSourceFiles(directory);

  if (files.length === 0) {
    throw new Error(`Nuk u gjet asnjë source file në: ${directory}`);
  }

  return files.map((filePath) => readFileSync(filePath, "utf8")).join("\n");
}

function expect(content, pattern, message) {
  if (!pattern.test(content)) {
    throw new Error(message);
  }
}

const inventory = readSourceDirectory("src/app/dashboard/inventory");

const analytics = readSourceDirectory("src/app/dashboard/analytics");

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
