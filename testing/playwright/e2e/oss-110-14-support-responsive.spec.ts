import { expect, test, type Page } from "@playwright/test";

import { REQUEST_ID, mockSupportApi, signIn } from "./support-ui-cert-helpers";

const VIEWPORTS = [
  { name: "Desktop", width: 1440, height: 900 },
  { name: "Laptop", width: 1280, height: 800 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Mobile", width: 390, height: 844 },
] as const;

async function expectNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
    };
  });
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

test.describe("OSS-110-14 Support responsive", () => {
  for (const viewport of VIEWPORTS) {
    test(`inbox visible without horizontal overflow (${viewport.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await signIn(page);
      await mockSupportApi(page);

      await page.goto("/workspace/support/requests");
      await expect(page.getByTestId("support-page")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }

  for (const viewport of VIEWPORTS.filter(
    (item) => item.name === "Tablet" || item.name === "Mobile",
  )) {
    test(`detail visible at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await signIn(page);
      await mockSupportApi(page);

      await page.goto(`/workspace/support/requests/${REQUEST_ID}`);
      await expect(page.getByTestId("support-page")).toBeVisible();
      await expect(page.getByTestId("support-request-detail")).toBeVisible();
    });
  }
});
