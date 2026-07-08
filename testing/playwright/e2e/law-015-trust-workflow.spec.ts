import { test, expect, type Page } from "@playwright/test";

const DEV_EMAIL = "dev@apzhub.local";
const DEV_PASSWORD = "DevPassword123!";
const LAW_BASE_URL = process.env.PLAYWRIGHT_LAW_BASE_URL ?? "http://localhost:3302";

const TRUST_ROUTES = [
  {
    kind: "dashboard",
    path: "/workspace/law/trust",
    pageTestId: "trust-dashboard-page",
  },
  {
    kind: "accounts",
    path: "/workspace/law/trust/accounts",
    pageTestId: "trust-accounts-page",
  },
  {
    kind: "transactions",
    path: "/workspace/law/trust/transactions",
    pageTestId: "trust-transactions-page",
  },
  {
    kind: "allocations",
    path: "/workspace/law/trust/allocations",
    pageTestId: "trust-allocations-page",
  },
  {
    kind: "reconciliation",
    path: "/workspace/law/trust/reconciliation",
    pageTestId: "trust-reconciliation-page",
  },
  {
    kind: "interest",
    path: "/workspace/law/trust/interest",
    pageTestId: "trust-interest-page",
  },
  {
    kind: "transfers",
    path: "/workspace/law/trust/transfers",
    pageTestId: "trust-transfers-page",
  },
  {
    kind: "reports",
    path: "/workspace/law/trust/reports",
    pageTestId: "trust-reports-page",
  },
] as const;

async function signIn(page: Page) {
  await page.goto(`${LAW_BASE_URL}/login`, { waitUntil: "networkidle" });
  await page
    .locator('input[name="email"]')
    .waitFor({ state: "visible", timeout: 20_000 });
  await page.locator('input[name="email"]').fill(DEV_EMAIL);
  await page.locator('input[name="password"]').fill(DEV_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  try {
    await expect(page).toHaveURL(/\/workspace\/home/, { timeout: 10_000 });
  } catch {
    await page.goto(`${LAW_BASE_URL}/register`, { waitUntil: "networkidle" });
    await page
      .locator('input[name="name"]')
      .waitFor({ state: "visible", timeout: 20_000 });
    await page.locator('input[name="name"]').fill("Dev User");
    await page.locator('input[name="email"]').fill(DEV_EMAIL);
    await page.locator('input[name="password"]').fill(DEV_PASSWORD);
    await page.getByRole("button", { name: "Register" }).click();
    await expect(page).toHaveURL(/\/workspace\/home/, { timeout: 20_000 });
  }
}

async function openTrustDashboard(page: Page) {
  await signIn(page);
  await page.goto(`${LAW_BASE_URL}/workspace/law/trust`, { waitUntil: "networkidle" });
  await expect(page.getByTestId("trust-dashboard-page")).toBeVisible({
    timeout: 20_000,
  });
}

test.describe("LAW-015-13 Trust Accounting E2E validation", () => {
  test("navigates to trust via Law Platform workspace and sidebar", async ({
    page,
  }) => {
    await signIn(page);

    await page.getByRole("button", { name: "Law Platform workspace" }).click();
    await expect(page).toHaveURL(/\/workspace\/law/);

    await page.getByRole("button", { name: "Trust" }).click();
    await expect(page).toHaveURL(/\/workspace\/law\/trust/);
    await expect(page.getByTestId("trust-dashboard-page")).toBeVisible();
  });

  test("renders trust dashboard metrics and diagnostics from seeded workbench data", async ({
    page,
  }) => {
    await openTrustDashboard(page);

    await expect(page.getByTestId("trust-dashboard-metrics")).toBeVisible();
    await expect(page.getByTestId("trust-diagnostics-panel")).toBeVisible();
    await expect(page.getByText("Ledger runs")).toBeVisible();
    await expect(page.getByText("Reporting runs")).toBeVisible();
    await expect(page.getByTestId("trust-recent-transactions")).toBeVisible();
  });

  test("walks all trust sub-routes and renders page shells with tables", async ({
    page,
  }) => {
    await openTrustDashboard(page);

    for (const route of TRUST_ROUTES) {
      await page.goto(`${LAW_BASE_URL}${route.path}`, { waitUntil: "networkidle" });
      await expect(page.getByTestId(route.pageTestId)).toBeVisible();
      await expect(page.getByTestId("trust-sub-nav")).toBeVisible();
      await expect(page.getByTestId(`trust-sub-nav-${route.kind}`)).toBeVisible();
    }
  });

  test("displays seeded transactions, allocations, reconciliation, interest, and transfers", async ({
    page,
  }) => {
    await openTrustDashboard(page);

    await page.goto(`${LAW_BASE_URL}/workspace/law/trust/transactions`, {
      waitUntil: "networkidle",
    });
    await expect(
      page.locator('[data-testid^="trust-transaction-row-"]').first(),
    ).toBeVisible();

    await page.goto(`${LAW_BASE_URL}/workspace/law/trust/allocations`, {
      waitUntil: "networkidle",
    });
    await expect(
      page.locator('[data-testid^="trust-allocation-row-"]').first(),
    ).toBeVisible();

    await page.goto(`${LAW_BASE_URL}/workspace/law/trust/reconciliation`, {
      waitUntil: "networkidle",
    });
    await expect(
      page.locator('[data-testid^="trust-reconciliation-row-"]').first(),
    ).toBeVisible();

    await page.goto(`${LAW_BASE_URL}/workspace/law/trust/interest`, {
      waitUntil: "networkidle",
    });
    await expect(
      page.locator('[data-testid^="trust-interest-row-"]').first(),
    ).toBeVisible();

    await page.goto(`${LAW_BASE_URL}/workspace/law/trust/transfers`, {
      waitUntil: "networkidle",
    });
    await expect(
      page.locator('[data-testid^="trust-transfer-row-"]').first(),
    ).toBeVisible();
  });

  test("generates a trust report and enables export actions", async ({ page }) => {
    await openTrustDashboard(page);
    await page.goto(`${LAW_BASE_URL}/workspace/law/trust/reports`, {
      waitUntil: "networkidle",
    });

    await page.getByTestId("trust-report-type-select").selectOption("trial_balance");
    await page.getByRole("button", { name: /Generate report/i }).click();

    await expect(page.getByTestId("trust-report-export-csv")).toBeVisible();
    await expect(page.getByTestId("trust-report-print-view")).toBeVisible();
  });

  test("opens print view in a new tab after generating a report", async ({
    page,
    context,
  }) => {
    await openTrustDashboard(page);
    await page.goto(`${LAW_BASE_URL}/workspace/law/trust/reports`, {
      waitUntil: "networkidle",
    });

    await page.getByTestId("trust-report-type-select").selectOption("ledger");
    await page.getByRole("button", { name: /Generate report/i }).click();
    await expect(page.getByTestId("trust-report-print-view")).toBeEnabled();

    const popupPromise = context.waitForEvent("page");
    await page.getByTestId("trust-report-print-view").click();
    const popup = await popupPromise;

    await expect(popup.locator("body")).toContainText(/ledger/i, { timeout: 10_000 });
    await popup.close();
  });

  test("trust diagnostics counters reflect seeded engine activity", async ({
    page,
  }) => {
    await openTrustDashboard(page);

    const ledgerRuns = page
      .getByTestId("trust-diagnostics-panel")
      .getByText("Ledger runs")
      .locator("..");
    await expect(ledgerRuns).toContainText(/\d+/);

    await page.goto(`${LAW_BASE_URL}/workspace/law/trust/accounts`, {
      waitUntil: "networkidle",
    });
    await expect(page.getByTestId("trust-diagnostics-panel")).toBeVisible();
    await expect(page.getByTestId("trust-accounts-table")).toBeVisible();
  });
});
