import { test, expect } from "@playwright/test";

test("business owner can login and access dashboard", async ({ page }) => {
  const email = process.env.E2E_OWNER_EMAIL;
  const password = process.env.E2E_OWNER_PASSWORD;

  expect(email).toBeTruthy();
  expect(password).toBeTruthy();

  await page.goto("/login");

  const rejectOptional = page.getByRole("button", {
    name: "Refuzo jo të domosdoshmet",
  });

  if (await rejectOptional.isVisible()) {
    await rejectOptional.click();
  }

  await page.getByRole("tab", { name: /Login Biznes/ }).click();

  await page.getByLabel("Email").fill(email);
  await page.locator("#password").fill(password);

  await page.locator('button[type="submit"]').click();

  await page.waitForURL("**/dashboard", { timeout: 15_000 });

  expect(new URL(page.url()).pathname).toBe("/dashboard");
  await expect(page.locator("body")).toBeVisible();
});