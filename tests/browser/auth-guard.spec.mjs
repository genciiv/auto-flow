import { test, expect } from "@playwright/test";

test("unauthenticated user cannot access business dashboard", async ({ page }) => {
  await page.goto("/dashboard");

  const url = new URL(page.url());

  expect(url.pathname).toBe("/login");
  expect(url.searchParams.get("callbackUrl")).toBe("/dashboard");

  await expect(page.locator("body")).toBeVisible();
});