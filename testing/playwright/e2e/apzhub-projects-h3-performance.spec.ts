import { expect, test } from "@playwright/test";
import path from "node:path";

import { PROJECT_ID, mockProjectsApi, signIn } from "./projects-ui-cert-helpers";

const authFile = path.resolve(__dirname, "../.auth/projects-user.json");

/**
 * H3 — Performance verification (Release 3.0 Hardening).
 * Record wall-clock timings; flag only when evidence exceeds budgets.
 *
 * Budgets (p95-style single-run ceilings for certification host):
 * - Workspace / cockpit / portfolio shell visible: 5000ms
 * - Search input interactive: 4000ms
 * - Command palette open: 2000ms
 * - Core Projects API (mocked or live under mock): request fulfill < 1500ms
 */
const BUDGETS = {
  workspaceVisibleMs: 5_000,
  cockpitVisibleMs: 5_000,
  portfolioVisibleMs: 5_000,
  searchInteractiveMs: 4_000,
  commandPaletteMs: 2_000,
  apiResponseMs: 1_500,
} as const;

test.describe("APZ Projects H3 performance", () => {
  test.use({ storageState: authFile });

  async function openOrReauth(page: import("@playwright/test").Page, target: string) {
    await page.goto(target, { waitUntil: "domcontentloaded" });
    try {
      await expect(page.getByTestId("projects-page")).toBeVisible({
        timeout: 25_000,
      });
    } catch {
      if (!page.url().includes("/login")) throw new Error(`Failed to open ${target}`);
      await signIn(page);
      await page.goto(target, { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("projects-page")).toBeVisible({
        timeout: 25_000,
      });
    }
  }

  test("workspace, cockpit, portfolio, search, palette, API timings", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await mockProjectsApi(page);

    const measurements: Record<string, number> = {};

    const apiSamples: number[] = [];
    page.on("response", (response) => {
      const url = response.url();
      if (!url.includes("/api/v1/projects")) return;
      const timing = response.request().timing();
      const total = (timing.responseEnd || 0) - (timing.requestStart || 0);
      if (total > 0) apiSamples.push(total);
    });

    // Workspace (shell visible after navigation)
    await openOrReauth(page, "/workspace/projects");
    let t0 = Date.now();
    await expect(page.getByTestId("operational-queue")).toBeVisible({
      timeout: 20_000,
    });
    measurements.workspaceVisibleMs = Date.now() - t0;
    expect(measurements.workspaceVisibleMs).toBeLessThanOrEqual(
      BUDGETS.workspaceVisibleMs,
    );

    // Portfolio section (desktop viewport) — already mounted with workspace
    t0 = Date.now();
    await expect(page.getByTestId("delivery-portfolio")).toBeVisible();
    measurements.portfolioVisibleMs = Date.now() - t0;
    expect(measurements.portfolioVisibleMs).toBeLessThanOrEqual(
      BUDGETS.portfolioVisibleMs,
    );

    // Cockpit
    await openOrReauth(page, `/workspace/projects/${PROJECT_ID}`);
    t0 = Date.now();
    await expect(page.getByTestId("projects-cockpit")).toBeVisible({
      timeout: 20_000,
    });
    measurements.cockpitVisibleMs = Date.now() - t0;
    expect(measurements.cockpitVisibleMs).toBeLessThanOrEqual(BUDGETS.cockpitVisibleMs);

    // Context composition (panel present; does not block cockpit)
    t0 = Date.now();
    const context = page.getByTestId("enterprise-context-panel");
    await expect(context).toBeVisible({ timeout: 15_000 });
    measurements.contextCompositionMs = Date.now() - t0;

    // Search latency — interactive after surface ready
    await openOrReauth(page, "/workspace/projects/search");
    await expect(page.getByTestId("projects-search-q")).toBeVisible({
      timeout: 15_000,
    });
    t0 = Date.now();
    await page.getByTestId("projects-search-q").fill("alpha");
    measurements.searchInteractiveMs = Date.now() - t0;
    expect(measurements.searchInteractiveMs).toBeLessThanOrEqual(
      BUDGETS.searchInteractiveMs,
    );

    // Blur editable target so Ctrl+Shift+P is not swallowed by input handlers
    await page.locator("body").click({ position: { x: 8, y: 8 } });
    await page.getByTestId("projects-search-q").evaluate((node) => {
      (node as HTMLInputElement).blur();
    });

    // Command palette
    t0 = Date.now();
    await page.keyboard.press("Control+Shift+P");
    const palette = page.getByTestId("command-palette");
    try {
      await expect(palette).toBeVisible({ timeout: 3_000 });
    } catch {
      await page.keyboard.press("Meta+Shift+P");
      await expect(palette).toBeVisible({ timeout: 5_000 });
    }
    measurements.commandPaletteMs = Date.now() - t0;
    expect(measurements.commandPaletteMs).toBeLessThanOrEqual(BUDGETS.commandPaletteMs);
    await page.keyboard.press("Escape");

    // Large portfolio shell
    await openOrReauth(page, "/workspace/projects/portfolio");
    t0 = Date.now();
    await expect(page.getByTestId("projects-page")).toBeVisible({
      timeout: 20_000,
    });
    measurements.largePortfolioShellMs = Date.now() - t0;

    if (apiSamples.length > 0) {
      const maxApi = Math.max(...apiSamples);
      measurements.apiMaxResponseMs = Math.round(maxApi);
      expect(maxApi).toBeLessThanOrEqual(BUDGETS.apiResponseMs);
    }

    // Persist evidence for Owner / H3 doc consumers
    console.log(
      "[H3-PERF]",
      JSON.stringify({ budgets: BUDGETS, measurements }, null, 0),
    );
  });
});
