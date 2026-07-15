import { expect, test } from "@playwright/test";

import {
  CREATED_REQUEST_ID,
  GROUP_ID,
  REQUEST_ID,
  USER_ID,
  meta,
  mockSupportApi,
  signIn,
} from "./support-ui-cert-helpers";

test.describe("OSS-110-14 Support UI certification", () => {
  test("open Support, list requests, and search inbox", async ({ page }) => {
    await signIn(page);
    await mockSupportApi(page);

    await page.goto("/workspace/support/requests");
    await expect(page.getByTestId("support-page")).toBeVisible();
    await expect(page.getByText("VPN cannot connect")).toBeVisible();

    await page.getByTestId("support-filter-search").fill("VPN");
    await expect(page.getByText("VPN cannot connect")).toBeVisible();

    await page.getByTestId("support-filter-search").fill("nomatch-xyz");
    await expect(page.getByTestId("support-empty")).toBeVisible({ timeout: 10_000 });

    await page.goto("/workspace/support/search");
    await page.getByTestId("support-search-q").fill("VPN");
    await page.getByTestId("support-search-submit").click();
    await expect(page.getByTestId("support-search-results")).toBeVisible();
    await expect(
      page.getByTestId("support-search-results").getByText("Request", { exact: true }),
    ).toBeVisible();
  });

  test("create request and open detail", async ({ page }) => {
    await signIn(page);
    await mockSupportApi(page);

    await page.goto("/workspace/support/requests");
    await page.getByTestId("support-inbox-create").click();
    await expect(page.getByTestId("support-request-create")).toBeVisible();

    await page.getByTestId("support-create-title").fill("Printer offline");
    await page.getByLabel("Customer ID").fill(USER_ID);
    await page.getByLabel("Group ID").fill(GROUP_ID);

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/v1/support-requests") &&
          response.request().method() === "POST" &&
          response.ok(),
      ),
      page.getByTestId("support-create-submit").click(),
    ]);

    await expect(page).toHaveURL(
      new RegExp(`/workspace/support/requests/${CREATED_REQUEST_ID}`),
    );
    await expect(page.getByTestId("support-request-detail")).toBeVisible();
    await expect(page.getByText("Printer offline")).toBeVisible();
  });

  test("open request: note, reply, assign, state, priority, close, reopen", async ({
    page,
  }) => {
    await signIn(page);
    await mockSupportApi(page);

    await page.goto(`/workspace/support/requests/${REQUEST_ID}`);
    await expect(page.getByTestId("support-request-detail")).toBeVisible();

    await page.getByTestId("support-internal-note-body").fill("Checking logs");
    await page.getByTestId("support-internal-note-submit").click();
    await expect(page.getByText("Checking logs")).toBeVisible();

    await page.getByTestId("support-customer-reply-body").fill("Please reboot");
    await page.getByTestId("support-customer-reply-channel").selectOption("email");
    await page.getByTestId("support-customer-reply-submit").click();
    await expect(page.getByText("Please reboot")).toBeVisible();

    await page.getByTestId("support-command-owner").fill(USER_ID);
    await page.getByTestId("support-command-owner-assign").click();

    await page.getByTestId("support-command-state").selectOption("pending");
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes(`/support-requests/${REQUEST_ID}/state`) &&
          response.request().method() === "POST",
      ),
      page.getByTestId("support-command-state-apply").click(),
    ]);
    await expect(page.getByLabel("Status: Pending")).toBeVisible({ timeout: 10_000 });

    await page.getByTestId("support-command-priority").selectOption("urgent");
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes(`/support-requests/${REQUEST_ID}/priority`) &&
          response.request().method() === "POST",
      ),
      page.getByTestId("support-command-priority-apply").click(),
    ]);
    await expect(page.getByLabel("Priority: Urgent")).toBeVisible({ timeout: 10_000 });

    await page.getByTestId("support-command-close").click();
    await page.getByTestId("support-confirm-dialog-confirm").click();
    await expect(page.getByTestId("support-command-reopen")).toBeVisible();
    await page.getByTestId("support-command-reopen").click();
    await expect(page.getByTestId("support-command-close")).toBeVisible();
  });

  test("organizations, groups, users, and analytics lists", async ({ page }) => {
    await signIn(page);
    await mockSupportApi(page);

    await page.goto("/workspace/support/organizations");
    await expect(page.getByTestId("support-page")).toBeVisible();
    await expect(page.getByText("Acme Corp")).toBeVisible();

    await page.goto("/workspace/support/groups");
    await expect(page.getByTestId("support-page")).toBeVisible();
    await expect(page.getByText("Support Desk")).toBeVisible();

    await page.goto("/workspace/support/users");
    await expect(page.getByTestId("support-page")).toBeVisible();
    await expect(page.getByTestId("support-users-identity-banner")).toBeVisible();
    await expect(page.getByText("Pat Customer")).toBeVisible();

    await page.goto("/workspace/support/analytics");
    await expect(page.getByTestId("support-analytics")).toBeVisible();
    await expect(page.getByText(/not an SLA/i)).toBeVisible();
  });

  test("permission denied maps to support-error without zammad text", async ({ page }) => {
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
          meta: meta(),
        }),
      });
    });

    await page.goto("/workspace/support/requests");
    await expect(page.getByTestId("support-page")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("support-error")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("support-error")).not.toContainText(/zammad/i);
  });

  test("provider unavailable maps to support-error without provider leakage", async ({
    page,
  }) => {
    await signIn(page);

    await page.route(/\/api\/v1\/support-analytics(\?|$)/, async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "UNAVAILABLE", message: "provider down" },
          meta: meta(),
        }),
      });
    });

    await page.goto("/workspace/support/analytics");
    await expect(page.getByTestId("support-page")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("support-error")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("support-error")).not.toContainText(/provider/i);
  });

  test("cross-tenant denial shows safe not-found message", async ({ page }) => {
    const foreignId = "sreq_ffffffffffffffffffffffffffffffff";
    await signIn(page);
    await mockSupportApi(page, { protectedNotFoundIds: [foreignId] });

    await page.goto(`/workspace/support/requests/${foreignId}`);
    await expect(page.getByTestId("support-error")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("support-error")).toContainText(/not found/i);
    await expect(page.getByTestId("support-error")).not.toContainText(/zammad/i);
    await expect(page.getByTestId("support-error")).not.toContainText(/tenant/i);
    await expect(page.getByTestId("support-error")).not.toContainText(/provider/i);
  });
});
