import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { REQUEST_ID, mockSupportApi, signIn } from "./support-ui-cert-helpers";

/**
 * APZ Support V1.0 Hardening — SUP-H1 · SUP-H2 · SUP-H3
 * Mocked API; Delivery Standard closeout evidence.
 */

const PRIMARY_SURFACES = [
  { path: "/workspace/support/requests", testId: "support-page" },
  {
    path: `/workspace/support/requests/${REQUEST_ID}`,
    testId: "support-request-detail",
  },
  { path: "/workspace/support/help", testId: "support-help" },
  { path: "/workspace/support/search", testId: "support-page" },
] as const;

const BUDGETS = {
  /** Warm-shell navigation + ready marker (CI soft budget). */
  readyMs: 8_000,
} as const;

async function openSupportSurface(page: Page, path: string, testId: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId(testId)).toBeVisible({ timeout: 30_000 });
}

test.describe("SUP-H1 APZ Support V1.0 product journeys", () => {
  test("list → open → communicate → close + honesty surfaces", async ({ page }) => {
    test.setTimeout(120_000);
    await signIn(page);
    await mockSupportApi(page);

    await page.goto("/workspace/support/requests");
    await expect(page.getByTestId("support-page")).toBeVisible();
    await expect(page.getByText("VPN cannot connect")).toBeVisible();

    await page.getByText("VPN cannot connect").click();
    await expect(page).toHaveURL(
      new RegExp(`/workspace/support/requests/${REQUEST_ID}`),
    );
    await expect(page.getByTestId("support-request-detail")).toBeVisible();
    await expect(page.getByTestId("support-attachment-limits").first()).toContainText(
      /1 MiB/i,
    );

    await page.getByTestId("support-internal-note-body").fill("Hardening note");
    await page.getByTestId("support-internal-note-submit").click();
    await expect(page.getByText("Hardening note")).toBeVisible();

    await page.getByTestId("support-command-close").click();
    await page.getByTestId("support-confirm-dialog-confirm").click();
    await expect(page.getByTestId("support-command-reopen")).toBeVisible();

    await page.goto("/workspace/support/help");
    await expect(page.getByTestId("support-help-limitations")).toBeVisible();
    await expect(page.getByTestId("support-help-limitations")).toContainText(
      /not enabled/i,
    );
  });

  test("denied path — 403 does not leak engine identity", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.route(/\/api\/v1\/support-requests(\?|$)/, async (route) => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "FORBIDDEN", message: "zammad denied" },
          meta: { requestId: "req_h", correlationId: "corr_h" },
        }),
      });
    });
    await page.goto("/workspace/support/requests");
    await expect(page.getByTestId("support-error")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("support-error")).not.toContainText(/zammad/i);
  });
});

test.describe("SUP-H2 APZ Support V1.0 accessibility", () => {
  test("primary surfaces — axe critical/serious = 0", async ({ page }) => {
    test.setTimeout(180_000);
    await signIn(page);
    await mockSupportApi(page);

    for (const surface of PRIMARY_SURFACES) {
      await openSupportSurface(page, surface.path, surface.testId);
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

test.describe("SUP-H3 APZ Support V1.0 performance", () => {
  test("warm-shell ready budgets on primary surfaces", async ({ page }) => {
    test.setTimeout(180_000);
    await signIn(page);
    await mockSupportApi(page);

    await openSupportSurface(page, "/workspace/support/requests", "support-page");

    for (const surface of PRIMARY_SURFACES) {
      const t0 = Date.now();
      await openSupportSurface(page, surface.path, surface.testId);
      const ms = Date.now() - t0;
      expect(ms, `${surface.path} ready budget`).toBeLessThanOrEqual(BUDGETS.readyMs);
    }
  });
});
