import { test, expect } from "@playwright/test";

test("selects a tile and proceeds", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Growth Profile/i }).click();
  await page.getByRole("button", { name: /Continue/i }).click();
  await expect(page).toHaveURL(/growth-profile|profile/);
});