import fs from "node:fs";
import path from "node:path";

const srcRoot = path.resolve("src");
const findings = [];

function walk(directory) {
  if (!fs.existsSync(directory)) {
    return;
  }

  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true,
  })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (
      entry.name.endsWith(".js") ||
      entry.name.endsWith(".jsx")
    ) {
      inspectFile(fullPath);
    }
  }
}

function isServerActionFile(filePath, source) {
  const normalizedPath = filePath.replaceAll("\\", "/");

  const hasUseServer =
    /^\s*["']use server["'];/m.test(source);

  const hasExportedAsyncFunction =
    /export\s+async\s+function\s+[A-Za-z0-9_]+/g.test(
      source,
    );

  const isKnownActionPath =
    normalizedPath.includes("/actions/") ||
    normalizedPath.endsWith("/actions.js") ||
    normalizedPath.endsWith("-actions.js");

  return (
    hasUseServer &&
    hasExportedAsyncFunction &&
    isKnownActionPath
  );
}

function isApiRoute(filePath) {
  const normalizedPath = filePath.replaceAll("\\", "/");

  return (
    normalizedPath.includes("/src/app/api/") &&
    normalizedPath.endsWith("/route.js")
  );
}

function inspectFile(filePath) {
  const source = fs.readFileSync(filePath, "utf8");

  const relativePath = path.relative(
    process.cwd(),
    filePath,
  );

  if (isServerActionFile(filePath, source)) {
    inspectServerActions(relativePath, source);
  }

  if (isApiRoute(filePath)) {
    inspectApiRoute(relativePath, source);
  }
}

function inspectServerActions(relativePath, source) {
  const exportedActions = [
    ...source.matchAll(
      /export\s+async\s+function\s+([A-Za-z0-9_]+)/g,
    ),
  ].map((match) => match[1]);

  const hasStandardResultHelper =
    source.includes('from "@/lib/action-result"') ||
    source.includes("from '@/lib/action-result'") ||
    source.includes("actionSuccess(") ||
    source.includes("actionFailure(") ||
    source.includes("validationFailure(") ||
    source.includes("errorFailure(");

  const hasLegacyControlledResult =
    /return\s*\{\s*success\s*:/m.test(source) ||
    /return\s*\{\s*error\s*:/m.test(source);

  const hasUncontrolledExpectedThrow =
    /throw\s+new\s+Error\s*\(/.test(source);

  if (
    exportedActions.length > 0 &&
    !hasStandardResultHelper &&
    !hasLegacyControlledResult
  ) {
    findings.push(
      `${relativePath}: action-et nuk përdorin rezultat standard ose rezultat të kontrolluar`,
    );
  }

  if (hasUncontrolledExpectedThrow) {
    findings.push(
      `${relativePath}: përmban throw new Error(); kontrollo nëse është gabim biznesi i pritshëm`,
    );
  }

  const usesValidation =
    source.includes("validateFormData") ||
    source.includes("validateObject") ||
    source.includes("safeParse") ||
    source.includes(".parse(");

  const readsFormInput =
    /formData\??\.get\(/.test(source) ||
    /formData\??\.getAll\(/.test(source);

  if (readsFormInput && !usesValidation) {
    findings.push(
      `${relativePath}: lexon FormData pa validim të centralizuar`,
    );
  }
}

function inspectApiRoute(relativePath, source) {
  const readsRequestInput =
    /request\.(json|formData)\(/.test(source) ||
    /searchParams\.get\(/.test(source) ||
    /request\.nextUrl\.searchParams/.test(source);

  if (!readsRequestInput) {
    return;
  }

  const usesValidation =
    source.includes("validateFormData") ||
    source.includes("validateObject") ||
    source.includes("safeParse") ||
    source.includes(".parse(");

  if (!usesValidation) {
    findings.push(
      `${relativePath}: merr input nga request pa validim`,
    );
  }

  const hasControlledResponse =
    source.includes("NextResponse.json") ||
    source.includes("apiSuccess") ||
    source.includes("apiFailure");

  if (!hasControlledResponse) {
    findings.push(
      `${relativePath}: nuk përdor përgjigje API të kontrolluar`,
    );
  }
}

if (!fs.existsSync(srcRoot)) {
  console.error("Folderi src nuk u gjet.");
  process.exit(1);
}

walk(srcRoot);

if (findings.length > 0) {
  console.error("Auditimi gjeti pika për kontroll:\n");

  for (const finding of findings) {
    console.error(`- ${finding}`);
  }

  process.exit(1);
}

console.log("Error handling audit: OK");
