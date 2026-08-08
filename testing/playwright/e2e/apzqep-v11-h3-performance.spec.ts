import { expect, test, type Page } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";
import { mockAllV11Surfaces, V11_PRIMARY_SURFACES } from "./apzqep-v11-api-mocks";

/**
 * QX-HD / H3 — Performance (APZQEP V1.1 Hardening).
 * Measure after shell is ready (Projects H3 methodology).
 * Optimise only when budgets are exceeded.
 *
 * Budgets (certification host ceilings):
 * - Heading ready after shell: 5000ms
 * - Detail panel ready: 5000ms
 * - Evidence filter interactive: 4000ms
 * - Mocked QEP API max: 1500ms
 */

const BUDGETS = {
  headingReadyMs: 5_000,
  detailReadyMs: 5_000,
  searchInteractiveMs: 4_000,
  apiMaxResponseMs: 1_500,
} as const;

async function openSurface(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
}

test.describe("QX-HD / H3 APZQEP V1.1 performance", () => {
  test("primary surfaces, detail, evidence search, API timings", async ({ page }) => {
    test.setTimeout(240_000);
    await signInDevUser(page);
    await mockAllV11Surfaces(page);

    const measurements: Record<string, number> = {};
    const apiSamples: number[] = [];

    page.on("response", (response) => {
      const url = response.url();
      if (!url.includes("/api/v1/qep/")) return;
      const timing = response.request().timing();
      const total = (timing.responseEnd || 0) - (timing.requestStart || 0);
      if (total > 0) apiSamples.push(total);
    });

    // Warm Next.js workspace compile once (excluded from budgets).
    await openSurface(page, "/workspace/qep/quality-flows");

    for (const surface of V11_PRIMARY_SURFACES) {
      await openSurface(page, surface.path);
      const t0 = Date.now();
      await expect(
        page.getByRole("heading", { level: 1, name: surface.heading }),
      ).toBeVisible({ timeout: 20_000 });
      const ms = Date.now() - t0;
      measurements[`heading:${surface.path}`] = ms;
      expect(ms, `${surface.path} heading budget`).toBeLessThanOrEqual(
        BUDGETS.headingReadyMs,
      );
    }

    // Quality Flow detail — shell ready, then assert detail heading budget
    await openSurface(page, "/workspace/qep/quality-flows/flows/qfi_e2e_1");
    let t0 = Date.now();
    await expect(
      page.getByRole("heading", { level: 1, name: "Continuous Certification" }),
    ).toBeVisible({ timeout: 20_000 });
    measurements.qfwDetailReadyMs = Date.now() - t0;
    expect(measurements.qfwDetailReadyMs).toBeLessThanOrEqual(BUDGETS.detailReadyMs);

    await openSurface(page, "/workspace/qep/dashboards/view/qep-executive");
    t0 = Date.now();
    await expect(page.getByText("No data")).toBeVisible({ timeout: 20_000 });
    measurements.dashboardDetailReadyMs = Date.now() - t0;
    expect(measurements.dashboardDetailReadyMs).toBeLessThanOrEqual(
      BUDGETS.detailReadyMs,
    );

    await openSurface(page, "/workspace/qep/evidence/explorer");
    const filter = page.getByTestId("qep-evidence-status-filter");
    await expect(filter).toBeVisible({ timeout: 15_000 });
    t0 = Date.now();
    await filter.selectOption("captured");
    measurements.evidenceFilterInteractiveMs = Date.now() - t0;
    expect(measurements.evidenceFilterInteractiveMs).toBeLessThanOrEqual(
      BUDGETS.searchInteractiveMs,
    );

    if (apiSamples.length > 0) {
      const maxApi = Math.max(...apiSamples);
      measurements.apiMaxResponseMs = Math.round(maxApi);
      expect(maxApi).toBeLessThanOrEqual(BUDGETS.apiMaxResponseMs);
    }

    console.log(
      "[H3-PERF-APZQEP]",
      JSON.stringify({ budgets: BUDGETS, measurements }, null, 0),
    );
  });
});
