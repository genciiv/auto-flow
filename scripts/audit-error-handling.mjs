import fs from "node:fs";
import path from "node:path";

const srcRoot = path.resolve("src");
const findings = [];

function walk(directory) {
  if (!fs.existsSync(directory)) return;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (entry.name.endsWith(".js") || entry.name.endsWith(".jsx")) {
      inspectFile(fullPath);
    }
  }
}

function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/");
}

function isServerActionFile(filePath, source) {
  const normalizedPath = normalizePath(filePath);
  const hasUseServer = /^\s*["']use server["'];/m.test(source);
  const isKnownActionPath =
    normalizedPath.includes("/actions/") ||
    normalizedPath.endsWith("/actions.js") ||
    normalizedPath.endsWith("-actions.js");

  return hasUseServer && isKnownActionPath;
}

function isApiRoute(filePath) {
  const normalizedPath = normalizePath(filePath);

  return (
    normalizedPath.includes("/src/app/api/") &&
    normalizedPath.endsWith("/route.js")
  );
}

function inspectFile(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const relativePath = path.relative(process.cwd(), filePath);

  if (isServerActionFile(filePath, source)) {
    inspectServerActions(relativePath, source);
  }

  if (isApiRoute(filePath)) {
    inspectApiRoute(relativePath, source);
  }
}

function inspectServerActions(relativePath, source) {
  const hasExportedAction =
    /export\s+async\s+function\s+[A-Za-z0-9_]+/.test(source) ||
    /export\s+const\s+[A-Za-z0-9_]+\s*=\s*async/.test(source);

  if (!hasExportedAction) return;

  const hasStandardResultHelper =
    source.includes('from "@/lib/action-result"') ||
    source.includes("from '@/lib/action-result'") ||
    source.includes("actionSuccess(") ||
    source.includes("actionFailure(") ||
    source.includes("validationFailure(") ||
    source.includes("errorFailure(");

  const hasLegacyControlledResult =
    /return\s*\{[\s\S]{0,700}\bsuccess\s*:/.test(source) ||
    /return\s*\{[\s\S]{0,700}\berror\s*:/.test(source);

  const hasFrameworkRedirectFlow =
    /\bredirect\s*\(/.test(source) ||
    /\bsignOut\s*\(\s*\{[\s\S]{0,200}\bredirectTo\s*:/.test(source) ||
    /\bsignIn\s*\([\s\S]{0,300}\bredirectTo\s*:/.test(source);

  if (
    !hasStandardResultHelper &&
    !hasLegacyControlledResult &&
    !hasFrameworkRedirectFlow
  ) {
    findings.push(
      `${relativePath}: action-et nuk përdorin rezultat standard, rezultat të kontrolluar ose redirect të framework-ut`,
    );
  }

  if (/throw\s+new\s+Error\s*\(/.test(source)) {
    findings.push(
      `${relativePath}: përmban throw new Error(); përdor AppError/createActionError`,
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

  if (!readsRequestInput) return;

  const usesValidation =
    source.includes("validateFormData") ||
    source.includes("validateObject") ||
    source.includes("safeParse") ||
    source.includes(".parse(");

  if (!usesValidation) {
    findings.push(`${relativePath}: merr input nga request pa validim`);
  }

  const hasControlledResponse =
    source.includes("NextResponse.json") ||
    source.includes("apiSuccess") ||
    source.includes("apiFailure");

  if (!hasControlledResponse) {
    findings.push(`${relativePath}: nuk përdor përgjigje API të kontrolluar`);
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

const requiredUiFiles = [
  "src/components/feedback/ToastProvider.jsx",
  "src/components/feedback/ConfirmProvider.jsx",
  "src/components/feedback/ErrorState.jsx",
  "src/components/ui/Alert.jsx",
  "src/components/ui/FieldError.jsx",
  "src/components/ui/Skeleton.jsx",
  "src/app/global-error.jsx",
  "src/app/admin/error.jsx",
  "src/app/dashboard/error.jsx",
  "src/app/customer/error.jsx",
];

for (const requiredFile of requiredUiFiles) {
  if (!fs.existsSync(path.resolve(requiredFile))) {
    console.error(`Mungon komponenti UI i detyrueshëm: ${requiredFile}`);
    process.exit(1);
  }
}

const clientSource = [];
function collectClientSource(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectClientSource(fullPath);
    else if (/\.(js|jsx)$/.test(entry.name)) clientSource.push(fs.readFileSync(fullPath, "utf8"));
  }
}
collectClientSource(srcRoot);
if (clientSource.some((source) => source.includes("window.confirm("))) {
  console.error("U gjet window.confirm; përdor ConfirmProvider global.");
  process.exit(1);
}

console.log("Error handling audit: OK — kontrata e actions dhe shtresa UI u verifikuan.");
