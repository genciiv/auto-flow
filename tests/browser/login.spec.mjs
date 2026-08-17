import { test, expect } from "@playwright/test";

test("invalid credentials show login error", async ({ page }) => {
  await page.goto("/login");

  const rejectOptional = page.getByRole("button", {
    name: "Refuzo jo të domosdoshmet",
  });

  if (await rejectOptional.isVisible()) {
    await rejectOptional.click();
  }

  await page.getByLabel("Email").fill("invalid-e2e@example.com");
  await page.locator("#password").fill("invalid-password-e2e");

  await page.getByRole("button", { name: "Hyr si individ" }).click();

  await expect(
    page.getByText("Email-i ose password-i është i pasaktë.", { exact: true }).first()
  ).toBeVisible();

  expect(new URL(page.url()).pathname).toBe("/login");
});