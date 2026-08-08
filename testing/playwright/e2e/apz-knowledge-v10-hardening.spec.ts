import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { mockKnowledgeApi, signIn } from "./knowledge-workbench-helpers";

/**
 * APZ Knowledge V1.0 Hardening — KNW-H1 · KNW-H2 · KNW-H3
 */

const PRIMARY_SURFACES = [
  { path: "/workspace/knowledge", testId: "knowledge-page" },
  { path: "/workspace/knowledge/help", testId: "knowledge-help-content" },
  { path: "/workspace/knowledge/memory", testId: "knowledge-memory-types" },
  { path: "/workspace/knowledge/lessons", testId: "knowledge-lessons-list" },
] as const;

const BUDGETS = {
  readyMs: 8_000,
} as const;

async function openSurface(page: Page, path: string, testId: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId(testId)).toBeVisible({ timeout: 30_000 });
}

test.describe("KNW-H1 APZ Knowledge V1.0 product journeys", () => {
  test("Home → Memory → Lessons + honesty surfaces", async ({ page }) => {
    test.setTimeout(120_000);
    await signIn(page);
    await mockKnowledgeApi(page);

    await page.goto("/workspace/knowledge");
    await expect(page.getByTestId("knowledge-page")).toBeVisible();
    await expect(page.getByTestId("knowledge-home-onboarding")).toBeVisible();

    await page.goto("/workspace/knowledge/memory");
    await expect(page.getByTestId("knowledge-memory-types")).toBeVisible();

    await page.goto("/workspace/knowledge/lessons");
    await expect(page.getByTestId("knowledge-lessons-list")).toBeVisible();

    await page.goto("/workspace/knowledge/help");
    await expect(page.getByTestId("knowledge-help-limitations")).toBeVisible();
    await expect(page.getByTestId("knowledge-help-limitations")).toContainText(
      /Consumer overlays/i,
    );
    await expect(page.getByTestId("knowledge-help-limitations")).toContainText(
      /AI \/ RAG/i,
    );
  });

  test("denied path — 403 does not leak engine identity", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.route(/\/api\/v1\/knowledge\/objects(\?|$)/, async (route) => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "FORBIDDEN", message: "bookstack denied" },
          meta: { requestId: "req_h", correlationId: "corr_h" },
        }),
      });
    });
    await page.goto("/workspace/knowledge/lessons");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/bookstack/i);
  });
});

test.describe("KNW-H2 APZ Knowledge V1.0 accessibility", () => {
  test("primary surfaces — axe critical/serious = 0", async ({ page }) => {
    test.setTimeout(180_000);
    await signIn(page);
    await mockKnowledgeApi(page);

    for (const surface of PRIMARY_SURFACES) {
      await openSurface(page, surface.path, surface.testId);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const blocking = results.violations.filter((v) =>
        ["critical", "serious"].includes(v.impact ?? ""),
      );
      expect(
        blocking,
        `${surface.path}\n${blocking.map((v) => `${v.id}: ${v.help}`).join("\n")}`,
      ).toEqual([]);
    }
  });
});

test.describe("KNW-H3 APZ Knowledge V1.0 performance", () => {
  test("warm-shell ready budgets on primary surfaces", async ({ page }) => {
    test.setTimeout(180_000);
    await signIn(page);
    await mockKnowledgeApi(page);

    await openSurface(page, "/workspace/knowledge", "knowledge-page");

    for (const surface of PRIMARY_SURFACES) {
      const t0 = Date.now();
      await openSurface(page, surface.path, surface.testId);
      const ms = Date.now() - t0;
      expect(ms, `${surface.path} ready budget`).toBeLessThanOrEqual(BUDGETS.readyMs);
    }
  });
});
