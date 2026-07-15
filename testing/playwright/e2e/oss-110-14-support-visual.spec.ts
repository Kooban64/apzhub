import { expect, test } from "@playwright/test";

import { REQUEST_ID, mockSupportApi, signIn } from "./support-ui-cert-helpers";

test.describe("OSS-110-14 Support visual baselines", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await signIn(page);
    await mockSupportApi(page);
  });

  test("inbox screenshot", async ({ page }) => {
    await page.goto("/workspace/support/requests");
    await expect(page.getByTestId("support-page")).toBeVisible();
    await expect(page.getByText("VPN cannot connect")).toBeVisible();
    await expect(page).toHaveScreenshot("support-inbox.png", {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });

  test("detail screenshot", async ({ page }) => {
    await page.goto(`/workspace/support/requests/${REQUEST_ID}`);
    await expect(page.getByTestId("support-request-detail")).toBeVisible();
    await expect(page).toHaveScreenshot("support-detail.png", {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });

  test("analytics screenshot", async ({ page }) => {
    await page.goto("/workspace/support/analytics");
    await expect(page.getByTestId("support-analytics")).toBeVisible();
    await expect(page).toHaveScreenshot("support-analytics.png", {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });
});
