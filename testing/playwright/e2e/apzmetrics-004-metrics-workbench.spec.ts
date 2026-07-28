import { expect, test, type Page } from "@playwright/test";

import { signIn } from "./testing-ui-helpers";

/**
 * APZMETRICS-004 Metrics Administration Workbench E2E (mocked HTTP).
 * Metadata-only journey — no formula/KPI execution.
 */

const METRICS_HOME = "/workspace/metrics";

const metric = {
  id: "m_pw",
  tenantId: "tenant_a",
  key: "latency",
  name: "Playwright latency",
  status: "active",
  createdAt: "2026-07-17T12:00:00.000Z",
  updatedAt: "2026-07-17T12:00:00.000Z",
  createdBy: "user_1",
  updatedBy: "user_1",
  revision: 1,
};

const definition = {
  id: "def_pw",
  key: "def1",
  name: "Definition",
  kind: "gauge",
  status: "active",
  metricId: "m_pw",
  versionNumber: 1,
};

const version = {
  id: "ver_pw",
  metricId: "m_pw",
  versionNumber: 1,
  status: "active",
};

const formula = {
  id: "f_pw",
  expression: "a + b",
  language: "expression",
  status: "draft",
};

const kpi = {
  id: "kpi_pw",
  key: "kpi1",
  name: "KPI One",
  metricId: "m_pw",
  status: "active",
};

async function mockMetricsHttpApi(page: Page, options?: { disabled?: boolean }) {
  await page.route("**/api/v1/metrics**", async (route) => {
    if (options?.disabled) {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "METRICS_SERVICE_UNAVAILABLE",
            message: "Platform Metrics HTTP API is not enabled",
          },
          meta: { correlationId: "pw-apzmetrics-004" },
        }),
      });
      return;
    }

    const url = new URL(route.request().url());
    const path = url.pathname;

    if (
      path.endsWith("/metrics/capabilities") ||
      path.endsWith("/metrics/health") ||
      path.endsWith("/metrics/readiness") ||
      path.endsWith("/metrics/management-diagnostics") ||
      path.endsWith("/metrics/diagnostics/capabilities") ||
      path.endsWith("/metrics/diagnostics/health") ||
      path.endsWith("/metrics/diagnostics/readiness")
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            metricsEnabled: true,
            managementPlaneReady: true,
            persistenceReady: true,
            formulaExecutionEnabled: false,
            kpiExecutionEnabled: false,
            providerIntegrationEnabled: false,
            workbenchReady: false,
            status: "healthy",
            ready: true,
            persistenceMode: "memory",
            metadataCompleteness: "platform-services",
            registrationState: "registered",
            checkedAt: metric.createdAt,
            capabilities: ["metrics", "diagnostics"],
          },
          meta: { correlationId: "pw-apzmetrics-004" },
        }),
      });
      return;
    }

    const collections: Record<string, unknown> = {
      "/metrics/metrics": [metric],
      "/metrics/definitions": [definition],
      "/metrics/versions": [version],
      "/metrics/formulas": [formula],
      "/metrics/kpis": [kpi],
      "/metrics/categories": [],
      "/metrics/groups": [],
      "/metrics/owners": [],
      "/metrics/consumers": [],
      "/metrics/dependencies": [],
      "/metrics/relationships": [],
    };

    for (const [suffix, items] of Object.entries(collections)) {
      if (path.endsWith(suffix)) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: items,
            page: { limit: 100, hasMore: false },
            meta: { correlationId: "pw-apzmetrics-004" },
          }),
        });
        return;
      }
      if (path.includes(`${suffix}/`) && !path.endsWith(suffix)) {
        const sample = Array.isArray(items) && items[0] ? items[0] : metric;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: sample,
            meta: { correlationId: "pw-apzmetrics-004" },
          }),
        });
        return;
      }
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [],
        page: { limit: 100, hasMore: false },
        meta: { correlationId: "pw-apzmetrics-004" },
      }),
    });
  });
}

test.describe("APZMETRICS-004 Metrics Workbench (mocked)", () => {
  test("metadata journey across overview, definitions, versions, formulas, KPIs, diagnostics", async ({
    page,
  }) => {
    await mockMetricsHttpApi(page);
    await signIn(page);
    await page.goto(`${METRICS_HOME}/overview`);
    await expect(page.getByTestId("metrics-page")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("banner-formula-execution")).toContainText(
      "FORMULA EXECUTION NOT AVAILABLE",
    );
    await expect(page.getByTestId("card-metrics-count")).toBeVisible();

    await page.goto(`${METRICS_HOME}/definitions`);
    await expect(page.getByTestId("facet-definitions")).toBeVisible();

    await page.goto(`${METRICS_HOME}/metrics`);
    await expect(page.getByTestId("facet-metrics")).toBeVisible();
    await expect(page.getByTestId("metrics-detail")).toBeVisible();

    await page.goto(`${METRICS_HOME}/versions`);
    await expect(page.getByTestId("facet-versions")).toBeVisible();

    await page.goto(`${METRICS_HOME}/formulas`);
    await expect(page.getByTestId("facet-formulas")).toBeVisible();
    await expect(page.getByText(/never evaluated/i)).toBeVisible();

    await page.goto(`${METRICS_HOME}/kpis`);
    await expect(page.getByTestId("facet-kpis")).toBeVisible();

    await page.goto(`${METRICS_HOME}/diagnostics`);
    await expect(page.getByTestId("diag-formula-execution")).toContainText(
      "Unavailable",
    );
  });

  test("shows METRICS_SERVICE_UNAVAILABLE when disabled", async ({ page }) => {
    await mockMetricsHttpApi(page, { disabled: true });
    await signIn(page);
    await page.goto(`${METRICS_HOME}/overview`);
    await expect(page.getByTestId("metrics-unavailable")).toBeVisible({
      timeout: 20_000,
    });
  });
});
