import { expect, test } from "@playwright/test";

import { REQUEST_ID, mockSupportApi, signIn } from "./support-ui-cert-helpers";

test.describe("OSS-110-14 Support UI performance baseline", () => {
  test("record Soft timings for major Support views", async ({ page }) => {
    await signIn(page);
    await mockSupportApi(page);

    async function measure(
      label: string,
      path: string,
      ready: () => Promise<void>,
    ): Promise<number> {
      const started = Date.now();
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await ready();
      return Date.now() - started;
    }

    const inboxMs = await measure("inbox", "/workspace/support/requests", async () => {
      await expect(page.getByTestId("support-page")).toBeVisible({ timeout: 30_000 });
    });

    const detailMs = await measure(
      "detail",
      `/workspace/support/requests/${REQUEST_ID}`,
      async () => {
        await expect(page.getByTestId("support-request-detail")).toBeVisible({
          timeout: 30_000,
        });
      },
    );

    const searchMs = await measure("search", "/workspace/support/search", async () => {
      await expect(page.getByTestId("support-page")).toBeVisible({ timeout: 30_000 });
    });

    const analyticsMs = await measure(
      "analytics",
      "/workspace/support/analytics",
      async () => {
        await expect(page.getByTestId("support-analytics")).toBeVisible({
          timeout: 30_000,
        });
      },
    );

    const baseline = {
      inboxMs,
      detailMs,
      searchMs,
      analyticsMs,
      recordedAt: new Date().toISOString(),
    };

    // Measurement-only marker for CI logs / trend collection.
    console.log(`SUPPORT_UI_PERF_BASELINE ${JSON.stringify(baseline)}`);

    for (const [name, ms] of Object.entries({
      inboxMs,
      detailMs,
      searchMs,
      analyticsMs,
    })) {
      // Soft target for CI machines; hard fail only if catastrophically slow.
      if (ms >= 15_000) {
        console.warn(`SUPPORT_UI_PERF_SOFT_SLOW ${name}=${ms}`);
      }
      expect(ms, `${name} must stay under 30s`).toBeLessThan(30_000);
    }
  });
});
