import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const warnings = [];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);

  if (!fs.existsSync(absolutePath)) {
    failures.push(`${relativePath}: mungon.`);
    return "";
  }

  return fs.readFileSync(absolutePath, "utf8");
}

function requireIncludes(source, expected, label) {
  if (!source.includes(expected)) {
    failures.push(label);
  }
}

const nextConfig = read("next.config.mjs");
const securityHeaders = read("src/lib/security-headers.mjs");
const authSource = read("src/auth.js");
const businessContext = read("src/lib/business-context.js");
const debugRoute = read("src/app/api/debug-session/route.js");
const testEmailRoute = read("src/app/api/test-email/route.js");
const proxySource = read("src/proxy.js");

requireIncludes(
  nextConfig,
  "SECURITY_HEADERS",
  "next.config.mjs: security headers nuk janë lidhur globalisht.",
);

for (const header of [
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "Strict-Transport-Security",
]) {
  requireIncludes(
    securityHeaders,
    header,
    `src/lib/security-headers.mjs: mungon header-i ${header}.`,
  );
}

requireIncludes(
  authSource,
  "DUMMY_PASSWORD_HASH",
  "src/auth.js: mungon bcrypt dummy hash kundër user enumeration.",
);
requireIncludes(
  authSource,
  "sessionVersion",
  "src/auth.js: session invalidation nuk verifikohet.",
);
requireIncludes(
  businessContext,
  "createForbiddenError",
  "src/lib/business-context.js: autorizimi nuk përdor AppError FORBIDDEN.",
);

if (/throw\s+new\s+Error\s*\(/.test(businessContext)) {
  failures.push(
    "src/lib/business-context.js: përdor throw new Error në helper-at e autorizimit.",
  );
}

requireIncludes(
  debugRoute,
  'process.env.NODE_ENV === "production"',
  "src/app/api/debug-session/route.js: debug endpoint nuk bllokohet në production.",
);
requireIncludes(
  testEmailRoute,
  "ENABLE_TEST_EMAIL_API",
  "src/app/api/test-email/route.js: test-email nuk ka feature gate në production.",
);
requireIncludes(
  proxySource,
  'request.headers.has("next-action")',
  "src/proxy.js: Server Actions nuk trajtohen në mënyrë eksplicite.",
);

const protectedActionFiles = [
  "src/actions/appointment-actions.js",
  "src/actions/customer-actions.js",
  "src/actions/invoice-actions.js",
  "src/actions/marketplace-actions.js",
  "src/actions/part-actions.js",
  "src/actions/purchase-actions.js",
  "src/actions/purchase-item-actions.js",
  "src/actions/service-actions.js",
  "src/actions/service-part-actions.js",
  "src/actions/settings-actions.js",
  "src/actions/vehicle-actions.js",
];

for (const relativePath of protectedActionFiles) {
  const source = read(relativePath);
  const hasBusinessGuard =
    source.includes("requireBusinessActionPermission") ||
    source.includes("requireAnyBusinessActionPermission") ||
    source.includes("requireAllBusinessActionPermissions");

  if (!hasBusinessGuard) {
    failures.push(`${relativePath}: mungon business action permission guard.`);
  }

  if (!source.includes("businessId")) {
    warnings.push(`${relativePath}: nuk u gjet businessId; verifiko tenant scope.`);
  }
}

if (failures.length > 0) {
  console.error("Security & authorization audit: FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `Security & authorization audit: OK — ${protectedActionFiles.length} module veprimesh biznesi dhe kontrollet globale u verifikuan.`,
);

if (warnings.length > 0) {
  console.log(`Warnings: ${warnings.length}`);
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

