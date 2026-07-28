import { expect, test } from "@playwright/test";

/**
 * APZQEP-ENG-030C — Traceability Workbench smoke / deep-link navigation.
 * Full authenticated mutation flows are covered by Vitest component tests with API mocks.
 * This suite verifies route reservation and Workbench entry when the app is reachable.
 */
test.describe("APZQEP-ENG-030C Traceability Workbench", () => {
  test("traceability route is reserved and reachable under QEP workspace", async ({
    page,
  }) => {
    const response = await page.goto("/workspace/qep/traceability", {
      waitUntil: "domcontentloaded",
    });
    // Unauthenticated environments redirect to login — still proves routing exists.
    expect(response?.status()).toBeLessThan(500);
    const url = page.url();
    expect(
      url.includes("/workspace/qep/traceability") ||
        url.includes("/login") ||
        url.includes("/auth"),
    ).toBeTruthy();
  });

  test("trace links list route is reachable", async ({ page }) => {
    const response = await page.goto("/workspace/qep/traceability/trace-links", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBeLessThan(500);
  });

  test("trace link new and supersede routes do not 500", async ({ page }) => {
    for (const path of [
      "/workspace/qep/traceability/trace-links/new",
      "/workspace/qep/traceability/trace-links/supersede",
    ]) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(500);
    }
  });

  test("trace matrix and taxonomy routes do not 500", async ({ page }) => {
    for (const path of [
      "/workspace/qep/traceability/matrix",
      "/workspace/qep/traceability/taxonomy",
    ]) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(500);
    }
  });
});
