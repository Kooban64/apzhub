import { expect, test, type Page } from "@playwright/test";

import { signIn } from "./testing-ui-helpers";

const CONFIGURATION_HOME = "/workspace/configuration";

const cfg = {
  id: "cfg_pw",
  tenantId: "tenant_a",
  namespaceId: "ns_pw",
  keyId: "key_pw",
  hierarchyLevel: "tenant",
  scope: { kind: "tenant", tenantId: "tenant_a" },
  status: "draft",
  createdAt: "2026-07-16T12:00:00.000Z",
  updatedAt: "2026-07-16T12:00:00.000Z",
  createdBy: "user_1",
  updatedBy: "user_1",
  revision: 1,
};

async function mockConfigurationHttpApi(page: Page) {
  await page.route("**/api/v1/configuration**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (
      path.endsWith("/configuration/capabilities") ||
      path.endsWith("/configuration/health") ||
      path.endsWith("/configuration/readiness") ||
      path.endsWith("/configuration/diagnostics")
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            configurationEnabled: true,
            managementPlaneReady: true,
            runtimeResolutionReady: false,
            runtimeApplicationReady: false,
            featureFlagsReady: false,
            secretManagementReady: false,
            hotReloadReady: false,
            eventBusReady: false,
            status: "ok",
            ready: true,
          },
          meta: { correlationId: "pw-apzconfig-004" },
        }),
      });
      return;
    }

    if (path.endsWith("/configuration/namespaces")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "ns_pw",
              tenantId: "tenant_a",
              key: "platform",
              name: "Platform",
              createdAt: cfg.createdAt,
              updatedAt: cfg.updatedAt,
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzconfig-004" },
        }),
      });
      return;
    }

    if (path.endsWith("/configuration/groups")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "grp_pw",
              tenantId: "tenant_a",
              namespaceId: "ns_pw",
              key: "ui",
              name: "UI",
              createdAt: cfg.createdAt,
              updatedAt: cfg.updatedAt,
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzconfig-004" },
        }),
      });
      return;
    }

    if (path.endsWith("/configuration/validation/rules")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [{ kind: "string", description: "string rule" }],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzconfig-004" },
        }),
      });
      return;
    }

    if (path.endsWith("/configuration/audit")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "aud_pw",
              tenantId: "tenant_a",
              configurationId: "cfg_pw",
              action: "created",
              actorUserId: "user_1",
              createdAt: cfg.createdAt,
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzconfig-004" },
        }),
      });
      return;
    }

    if (path.includes("/versions")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "ver_pw",
              configurationId: "cfg_pw",
              versionNumber: 1,
              immutable: true,
              isCurrent: false,
              createdAt: cfg.createdAt,
              createdBy: "user_1",
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzconfig-004" },
        }),
      });
      return;
    }

    if (path.includes("/overrides")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "ovr_pw",
              configurationId: "cfg_pw",
              hierarchyLevel: "user",
              scope: { kind: "user", userId: "user_1" },
              valueId: "val_pw",
              precedenceRank: 0,
              createdAt: cfg.createdAt,
              updatedAt: cfg.updatedAt,
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzconfig-004" },
        }),
      });
      return;
    }

    if (path.endsWith("/configuration/scopes") || path.includes("/scopes/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: path.endsWith("/scopes")
            ? [
                {
                  configurationId: "cfg_pw",
                  scopeKind: "tenant",
                  scope: { kind: "tenant", tenantId: "tenant_a" },
                },
              ]
            : {
                configurationId: "cfg_pw",
                scopeKind: "tenant",
                scope: { kind: "tenant", tenantId: "tenant_a" },
              },
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzconfig-004" },
        }),
      });
      return;
    }

    if (path.includes("/approve") || path.includes("/publish") || path.includes("/archive") || path.includes("/restore") || path.includes("/validate") || path.includes("/transition")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { ...cfg, status: "approved" },
          meta: { correlationId: "pw-apzconfig-004" },
        }),
      });
      return;
    }

    if (path.includes("/configurations/cfg_pw") || path.match(/\/configurations\/[^/]+$/)) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: cfg,
          meta: { correlationId: "pw-apzconfig-004" },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [cfg],
        page: { limit: 1, hasMore: false },
        meta: { correlationId: "pw-apzconfig-004" },
      }),
    });
  });
}

test.describe("APZCONFIG-004 Configuration Workbench", () => {
  test("opens overview with unavailable capability banners", async ({
    page,
  }) => {
    await mockConfigurationHttpApi(page);
    await signIn(page);
    await page.goto(`${CONFIGURATION_HOME}/overview`);
    await expect(page.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible();
    await expect(page.getByTestId("card-runtime-status")).toContainText(
      "RUNTIME RESOLUTION NOT AVAILABLE",
    );
    await expect(page.getByTestId("card-flags-status")).toContainText(
      "FEATURE FLAGS NOT AVAILABLE",
    );
    await expect(page.getByTestId("card-secrets-status")).toContainText(
      "SECRET MANAGEMENT NOT AVAILABLE",
    );
  });

  test("browses configurations and diagnostics", async ({ page }) => {
    await mockConfigurationHttpApi(page);
    await signIn(page);
    await page.goto(`${CONFIGURATION_HOME}/configurations`);
    await expect(page.getByText("cfg_pw")).toBeVisible();
    await expect(page.getByTestId("value-hidden-notice")).toContainText(
      "VALUE HIDDEN",
    );

    await page.goto(`${CONFIGURATION_HOME}/diagnostics`);
    await expect(page.getByTestId("diag-runtime")).toContainText("Unavailable");
    await expect(page.getByTestId("diag-event-bus")).toContainText("Unavailable");
  });

  test("navigates hierarchy and overrides notices", async ({ page }) => {
    await mockConfigurationHttpApi(page);
    await signIn(page);
    await page.goto(`${CONFIGURATION_HOME}/scopes`);
    await expect(page.getByTestId("hierarchy-list")).toBeVisible();

    await page.goto(`${CONFIGURATION_HOME}/overrides`);
    await expect(page.getByTestId("override-metadata-notice")).toContainText(
      "EFFECTIVE VALUE IS NOT RESOLVED",
    );
  });
});
