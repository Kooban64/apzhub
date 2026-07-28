import { expect, test } from "@playwright/test";

/**
 * APZQEP-ENG-040C — Verification Workbench smoke / deep-link navigation.
 * Full authenticated mutation flows are covered by Vitest component tests with API mocks.
 */
test.describe("APZQEP-ENG-040C Verification Workbench", () => {
  test("verification route is reserved and reachable under QEP workspace", async ({ page }) => {
    const response = await page.goto("/workspace/qep/verification", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBeLessThan(500);
    const url = page.url();
    expect(
      url.includes("/workspace/qep/verification") ||
        url.includes("/login") ||
        url.includes("/auth"),
    ).toBeTruthy();
  });

  test("queue, team, search, history, dashboard routes do not 500", async ({ page }) => {
    for (const path of [
      "/workspace/qep/verification/queue",
      "/workspace/qep/verification/team",
      "/workspace/qep/verification/search",
      "/workspace/qep/verification/history",
      "/workspace/qep/verification/dashboard",
    ]) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(500);
    }
  });

  test("detail and new routes do not 500", async ({ page }) => {
    for (const path of [
      "/workspace/qep/verification/new",
      "/workspace/qep/verification/ver_smoke",
    ]) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(500);
    }
  });
});
