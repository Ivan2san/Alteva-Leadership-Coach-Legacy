import { test, expect } from "@playwright/test";

test("service worker registers and offline works", async ({ page, context }) => {
  await page.goto("/");
  const swCount = await page.evaluate(async () =>
    (await navigator.serviceWorker?.getRegistrations())?.length || 0
  );
  expect(swCount).toBeGreaterThan(0);

  // Prime cache
  await page.goto("/growth-profile");

  // Go offline, page must still render core content
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText(/Growth Profile/i)).toBeVisible();
  await context.setOffline(false);
});

test("manifest present and app installable preconditions", async ({ page }) => {
  await page.goto("/");
  const hasManifest = await page.$('link[rel="manifest"]');
  expect(hasManifest).not.toBeNull();
  const isHttps = await page.evaluate(() => location.protocol === "https:");
  // In CI preview it may be http; allow either, but production must be https (budget in LHCI).
  expect(isHttps || process.env.CI === "true").toBeTruthy();
});