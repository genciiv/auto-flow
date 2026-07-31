import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const failures = [];
const warnings = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

const files = walk(srcRoot).filter((file) => /\.(js|jsx|ts|tsx)$/.test(file));
const serverActions = files.filter((file) => {
  const source = fs.readFileSync(file, "utf8");
  return /\.(js|ts)$/.test(file) && source.trimStart().startsWith('"use server"');
});
const apiRoutes = files.filter((file) => file.includes(`${path.sep}app${path.sep}api${path.sep}`) && /route\.(js|ts)$/.test(file));

for (const file of serverActions) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file);

  const exportsInputAction = /export\s+async\s+function\s+\w+\s*\((?!\s*\))/.test(source);
  if (exportsInputAction && !source.includes("validateFormData") && !source.includes("validateObject") && !source.includes("safeParse")) {
    warnings.push(`${relative}: action me input pa validim të drejtpërdrejtë Zod.`);
  }

  if (/throw\s+new\s+Error\s*\(/.test(source)) {
    failures.push(`${relative}: përdor throw new Error në vend të AppError/createActionError.`);
  }
}

for (const file of apiRoutes) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file);
  const normalizedRelative = relative.split(path.sep).join("/");

  if (normalizedRelative.endsWith("api/auth/[...nextauth]/route.js")) continue;

  if (!source.includes("apiSuccess") && !source.includes("apiFailure") && !source.includes("apiError")) {
    failures.push(`${relative}: API route nuk përdor kontratën e standardizuar.`);
  }
}

for (const required of [
  "src/lib/action-result.js",
  "src/lib/api-response.js",
  "src/lib/errors.js",
  "src/lib/request-context.js",
  "src/lib/validation.js",
]) {
  if (!fs.existsSync(path.join(root, required))) failures.push(`${required}: mungon.`);
}

if (failures.length) {
  console.error("Backend error-handling audit: FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Backend error-handling audit: OK — ${serverActions.length} Server Action files dhe ${apiRoutes.length} API routes u kontrolluan.`);
if (warnings.length) {
  console.log(`Warnings: ${warnings.length}`);
  warnings.forEach((warning) => console.log(`- ${warning}`));
}
