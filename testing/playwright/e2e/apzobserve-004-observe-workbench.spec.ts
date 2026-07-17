import { expect, test, type Page } from "@playwright/test";

import { signIn } from "./testing-ui-helpers";

/**
 * APZOBSERVE-004 Observability Administration Workbench E2E (mocked HTTP).
 *
 * LIMITED: Playwright webServer may fail to start if Next.js detects the
 * pre-existing dynamic-route slug conflict between
 * `testing/traceability/[relationshipId]` and `testing/traceability/[resourceType]/[resourceId]`.
 * When webServer cannot boot, the suite cannot execute against a live app —
 * unit/component coverage and `pnpm audit:observe-workbench` remain authoritative.
 * Spec is syntax-validated via `playwright test --list`.
 */

const OBSERVE_HOME = "/workspace/observability";

const healthCheck = {
  id: "hc_pw",
  tenantId: "tenant_a",
  serviceKey: "platform-api",
  name: "Playwright health",
  status: "healthy",
  providerKind: "internal",
  createdAt: "2026-07-17T12:00:00.000Z",
  updatedAt: "2026-07-17T12:00:00.000Z",
  createdBy: "user_1",
  updatedBy: "user_1",
  revision: 1,
};

const metricDefinition = {
  id: "md_pw",
  key: "requests_total",
  name: "Requests",
  kind: "counter",
  providerKind: "prometheus",
  status: "active",
  createdAt: healthCheck.createdAt,
  updatedAt: healthCheck.updatedAt,
};

const alertDefinition = {
  id: "ad_pw",
  key: "high_errors",
  name: "High errors",
  severity: "warning",
  providerKind: "alertmanager",
  status: "active",
  createdAt: healthCheck.createdAt,
  updatedAt: healthCheck.updatedAt,
};

async function mockObserveHttpApi(page: Page, options?: { disabled?: boolean }) {
  await page.route("**/api/v1/observe**", async (route) => {
    if (options?.disabled) {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "OBSERVE_SERVICE_UNAVAILABLE",
            message: "Observability Platform HTTP API is not enabled",
          },
          meta: { correlationId: "pw-apzobserve-004" },
        }),
      });
      return;
    }

    const url = new URL(route.request().url());
    const path = url.pathname;

    if (
      path.endsWith("/observe/capabilities") ||
      path.endsWith("/observe/health") ||
      path.endsWith("/observe/readiness") ||
      path.endsWith("/observe/management-diagnostics") ||
      path.endsWith("/observe/diagnostics/capabilities") ||
      path.endsWith("/observe/diagnostics/health") ||
      path.endsWith("/observe/diagnostics/readiness")
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            observeEnabled: true,
            managementPlaneReady: true,
            persistenceReady: true,
            providerExecutionEnabled: false,
            workbenchReady: false,
            status: "healthy",
            ready: true,
            persistenceMode: "memory",
            metadataCompleteness: "foundation",
            registrationState: "registered",
            checkedAt: healthCheck.createdAt,
            capabilities: ["healthChecks", "diagnostics"],
          },
          meta: { correlationId: "pw-apzobserve-004" },
        }),
      });
      return;
    }

    if (path.includes("/observe/health-checks/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: healthCheck,
          meta: { correlationId: "pw-apzobserve-004" },
        }),
      });
      return;
    }

    if (path.endsWith("/observe/health-checks")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [healthCheck],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzobserve-004" },
        }),
      });
      return;
    }

    if (path.includes("/observe/service-health")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: path.endsWith("/service-health")
            ? [
                {
                  id: "sh_pw",
                  serviceKey: "platform-api",
                  displayName: "Platform API",
                  overallStatus: "healthy",
                  readinessStatus: "ready",
                  livenessStatus: "alive",
                },
              ]
            : {
                id: "sh_pw",
                serviceKey: "platform-api",
                displayName: "Platform API",
                overallStatus: "healthy",
                readinessStatus: "ready",
                livenessStatus: "alive",
              },
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzobserve-004" },
        }),
      });
      return;
    }

    if (path.includes("/observe/metric-definitions")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: path.endsWith("/metric-definitions")
            ? [metricDefinition]
            : metricDefinition,
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzobserve-004" },
        }),
      });
      return;
    }

    if (path.includes("/observe/alert-definitions")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: path.endsWith("/alert-definitions")
            ? [alertDefinition]
            : alertDefinition,
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzobserve-004" },
        }),
      });
      return;
    }

    if (path.includes("/observe/maintenance-windows")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "mw_pw",
              key: "mw1",
              name: "Window",
              startsAt: healthCheck.createdAt,
              endsAt: healthCheck.updatedAt,
              status: "active",
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzobserve-004" },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [],
        page: { limit: 0, hasMore: false },
        meta: { correlationId: "pw-apzobserve-004" },
      }),
    });
  });
}

test.describe("APZOBSERVE-004 Observability Workbench (mocked HTTP)", () => {
  test("manifest journey across overview, health, metrics, alerts, diagnostics", async ({
    page,
  }) => {
    await mockObserveHttpApi(page);
    await signIn(page);
    await page.goto(`${OBSERVE_HOME}/overview`);

    await expect(page.getByTestId("observability-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
    await expect(page.getByTestId("banner-grafana")).toBeVisible();
    await expect(page.getByTestId("card-health-checks-count")).toBeVisible();

    await page.goto(`${OBSERVE_HOME}/health-checks`);
    await expect(page.getByText("hc_pw")).toBeVisible();
    await expect(page.getByTestId("observability-detail")).toBeVisible();

    await page.goto(`${OBSERVE_HOME}/service-health`);
    await expect(page.getByTestId("facet-service-health")).toBeVisible();
    await expect(page.getByTestId("status-badge").first()).toBeVisible();

    await page.goto(`${OBSERVE_HOME}/metric-definitions`);
    await expect(page.getByText("md_pw")).toBeVisible();

    await page.goto(`${OBSERVE_HOME}/alert-definitions`);
    await expect(page.getByText("ad_pw")).toBeVisible();

    await page.goto(`${OBSERVE_HOME}/maintenance-windows`);
    await expect(page.getByTestId("facet-maintenance-windows")).toBeVisible();

    await page.goto(`${OBSERVE_HOME}/diagnostics`);
    await expect(page.getByTestId("diag-readiness")).toBeVisible();
    await expect(page.getByTestId("diag-provider-execution")).toContainText(
      "Unavailable",
    );
  });

  test("disabled service shows controlled unavailable state", async ({ page }) => {
    await mockObserveHttpApi(page, { disabled: true });
    await signIn(page);
    await page.goto(`${OBSERVE_HOME}/overview`);
    await expect(page.getByTestId("observability-unavailable")).toBeVisible();
  });
});
