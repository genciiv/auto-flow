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

function requireText(source, text, message) {
  if (!source.includes(text)) failures.push(message);
}

function listFiles(directory, predicate) {
  const absoluteDirectory = path.join(root, directory);
  if (!fs.existsSync(absoluteDirectory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(absoluteDirectory, { withFileTypes: true })) {
    const relative = path.join(directory, entry.name);
    const normalizedRelative = relative.replaceAll("\\", "/");
    if (entry.isDirectory()) files.push(...listFiles(relative, predicate));
    else if (predicate(normalizedRelative)) files.push(normalizedRelative);
  }
  return files;
}

const packageJson = read("package.json");
const nextConfig = read("next.config.mjs");
const securityHeaders = read("src/lib/security-headers.mjs");
const envValidation = read("src/lib/env-validation.mjs");
const envExample = read(".env.example");
const auth = read("src/auth.js");
const proxy = read("src/proxy.js");
const adminLayout = read("src/app/admin/layout.jsx");
const ci = read(".github/workflows/ci.yml");
const subscriptionCron = read("src/app/api/cron/subscriptions/route.js");
const reminderCron = read("src/app/api/cron/customer-vehicle-reminders/route.js");
const debugRoute = read("src/app/api/debug-session/route.js");
const testEmailRoute = read("src/app/api/test-email/route.js");

requireText(nextConfig, "poweredByHeader: false", "next.config.mjs: X-Powered-By nuk është çaktivizuar.");
requireText(nextConfig, "SECURITY_HEADERS", "next.config.mjs: security headers nuk janë aplikuar globalisht.");

for (const header of [
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "Cross-Origin-Opener-Policy",
  "Strict-Transport-Security",
]) {
  requireText(securityHeaders, header, `security-headers: mungon ${header}.`);
}

for (const variable of [
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "CRON_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
  "BREVO_API_KEY",
  "EMAIL_FROM",
]) {
  requireText(envExample, variable, `.env.example: mungon ${variable}.`);
  requireText(envValidation, `"${variable}"`, `env-validation: ${variable} nuk është pjesë e runtime gate.`);
}

requireText(envValidation, "CRON_SECRET duhet të ketë të paktën 32 karaktere.", "env-validation: CRON_SECRET nuk ka minimum 32 karaktere.");
requireText(envValidation, "AUTH_SECRET duhet të ketë të paktën 32 karaktere.", "env-validation: AUTH_SECRET nuk ka minimum 32 karaktere.");
requireText(envValidation, "ENABLE_TEST_EMAIL_API duhet të jetë false", "env-validation: test email API nuk bllokohet në production.");

requireText(auth, "DUMMY_PASSWORD_HASH", "auth: mungon mbrojtja kundër user enumeration.");
requireText(auth, "currentUser.sessionVersion !== token.sessionVersion", "auth: session revocation nuk verifikohet.");
requireText(auth, "!currentUser.isActive", "auth: sesionet e user-ave joaktivë nuk invaliden.");
requireText(auth, 'profile?.email_verified !== true', "auth: Google OAuth nuk kërkon email të verifikuar.");

requireText(proxy, 'request.headers.has("next-action")', "proxy: Server Actions nuk trajtohen siç duhet.");
requireText(adminLayout, "requirePlatformAdmin", "admin layout: mungon Platform Admin guard.");

for (const cron of [
  ["subscriptions cron", subscriptionCron],
  ["customer reminders cron", reminderCron],
]) {
  requireText(cron[1], "timingSafeEqual", `${cron[0]}: secret comparison nuk është timing-safe.`);
  requireText(cron[1], "CRON_SECRET", `${cron[0]}: CRON_SECRET mungon.`);
  requireText(cron[1], "UNAUTHORIZED", `${cron[0]}: unauthorized response mungon.`);
}

requireText(debugRoute, 'process.env.NODE_ENV === "production"', "debug-session: endpoint-i nuk është i mbyllur në production.");
requireText(testEmailRoute, "ENABLE_TEST_EMAIL_API", "test-email: production feature gate mungon.");
requireText(testEmailRoute, 'globalRole !== "PLATFORM_ADMIN"', "test-email: Platform Admin guard mungon.");

const adminActionFiles = listFiles("src/app/admin", (file) =>
  /(?:^|\/)actions(?:\/[^/]+)?\.js$/.test(file) || file.endsWith("/actions.js")
);

for (const file of adminActionFiles) {
  const source = read(file);
  if (!source.includes("requirePlatformAdmin")) {
    failures.push(`${file}: Server Action admin pa requirePlatformAdmin.`);
  }
}

requireText(ci, "npm run audit:dependencies", "CI: dependency audit mungon.");
requireText(ci, "npm run audit:ci", "CI: project audit gate mungon.");
requireText(ci, "npm test", "CI: automated tests mungojnë.");
requireText(ci, "npm run lint", "CI: lint mungon.");
requireText(ci, "npm run build", "CI: production build mungon.");
requireText(packageJson, '"audit:production"', "package.json: audit:production mungon.");

const serverActionLimitMatch = nextConfig.match(/bodySizeLimit:\s*"([^"]+)"/);
if (serverActionLimitMatch) {
  warnings.push(`Server Actions bodySizeLimit=${serverActionLimitMatch[1]}; mbaje vetëm nëse upload-et e biznesit e kërkojnë realisht.`);
}

if (failures.length) {
  console.error("Final production security audit: FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  if (warnings.length) warnings.forEach((warning) => console.warn(`WARNING: ${warning}`));
  process.exit(1);
}

console.log(`Final production security audit: OK — ${adminActionFiles.length} module admin actions, auth/session, cron, env, headers dhe CI u verifikuan.`);
warnings.forEach((warning) => console.warn(`WARNING: ${warning}`));
