import { expect, test, type Page } from "@playwright/test";

import { signIn } from "./testing-ui-helpers";

const REPORTING_HOME = "/workspace/reporting";

async function mockReportingHttpApi(page: Page, seen: string[]) {
  await page.route("**/api/v1/reporting/**", async (route) => {
    const url = new URL(route.request().url());
    seen.push(url.pathname);

    if (url.pathname.endsWith("/reporting/formats")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { formats: ["html", "markdown", "pdf", "docx", "json", "csv"] },
          meta: { correlationId: "pw-apzreport-002" },
        }),
      });
      return;
    }

    if (url.pathname.endsWith("/reporting/templates")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "tmpl-executive-dashboard",
              reportType: "executive",
              name: "Executive Dashboard",
              description: "PW mock template",
              version: "1.0.0",
              revision: 1,
              title: "Executive Dashboard",
              builtin: true,
              createdAt: "2026-07-12T12:00:00.000Z",
              updatedAt: "2026-07-12T12:00:00.000Z",
            },
          ],
          page: { total: 1 },
          meta: { correlationId: "pw-apzreport-002" },
        }),
      });
      return;
    }

    if (url.pathname.endsWith("/reporting/generations")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [],
          page: { total: 0 },
          meta: { correlationId: "pw-apzreport-002" },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {},
        meta: { correlationId: "pw-apzreport-002" },
      }),
    });
  });
}

test.describe("APZREPORT-002 Platform Reporting workbench", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("opens Reporting workbench through mocked /api/v1/reporting", async ({
    page,
  }) => {
    const seen: string[] = [];
    await mockReportingHttpApi(page, seen);

    await page.goto(REPORTING_HOME, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("reporting-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByRole("heading", { level: 1, name: /Templates/i }),
    ).toBeVisible();
    await expect(page.getByText("Executive Dashboard")).toBeVisible();

    expect(seen.some((p) => p.endsWith("/reporting/templates"))).toBe(true);
  });

  test("exposes command toolbar and a11y landmarks", async ({ page }) => {
    const seen: string[] = [];
    await mockReportingHttpApi(page, seen);

    await page.goto(`${REPORTING_HOME}/templates`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByRole("toolbar", { name: /Reporting commands/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /Preview/i }),
    ).toBeVisible();
    await expect(page.getByTestId("reporting-page")).toBeVisible();
    await expect(page.getByLabelText("Filter reporting list")).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      page.getByRole("heading", { level: 1, name: /Templates/i }),
    ).toBeVisible();
  });
});
