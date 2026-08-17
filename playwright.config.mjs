import { defineConfig, devices } from "@playwright/test";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Browser E2E requires an explicit local DATABASE_URL. Refusing to use .env implicitly."
  );
}

let databaseHost;

try {
  databaseHost = new URL(databaseUrl).hostname;
} catch {
  throw new Error("Browser E2E received an invalid DATABASE_URL.");
}

const allowedDatabaseHosts = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
]);

if (!allowedDatabaseHosts.has(databaseHost)) {
  throw new Error(
    `Browser E2E may only run against a local database. Received host: ${databaseHost}`
  );
}

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30_000,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: [
    ["list"],
    ["html", { open: "never" }],
  ],

  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});