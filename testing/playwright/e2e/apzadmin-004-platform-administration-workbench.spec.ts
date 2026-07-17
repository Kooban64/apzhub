import { expect, test, type Page } from "@playwright/test";

import { signIn } from "./testing-ui-helpers";

const ADMINISTRATION_HOME = "/workspace/administration";

const mod = {
  id: "mod_pw",
  tenantId: "tenant_a",
  key: "configuration",
  name: "Configuration",
  description: "Platform Configuration",
  status: "registered",
  createdAt: "2026-07-16T12:00:00.000Z",
  updatedAt: "2026-07-16T12:00:00.000Z",
  createdBy: "user_1",
  updatedBy: "user_1",
  revision: 1,
};

async function mockAdministrationHttpApi(page: Page) {
  await page.route("**/api/v1/administration**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (
      path.endsWith("/administration/management-capabilities") ||
      path.endsWith("/administration/health") ||
      path.endsWith("/administration/readiness") ||
      path.endsWith("/administration/diagnostics")
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            administrationEnabled: true,
            managementPlaneReady: true,
            httpEnabled: true,
            workbenchEnabled: true,
            runtimeAdminEnabled: false,
            status: "healthy",
            ready: true,
          },
          meta: { correlationId: "pw-apzadmin-004" },
        }),
      });
      return;
    }

    if (path.includes("/diagnostics/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: "diag_pw",
            tenantId: "tenant_a",
            severity: "info",
            code: "OK",
            message: "ok",
            createdAt: mod.createdAt,
          },
          meta: { correlationId: "pw-apzadmin-004" },
        }),
      });
      return;
    }

    if (path.endsWith("/administration/capabilities")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "cap_pw",
              tenantId: "tenant_a",
              moduleId: "mod_pw",
              key: "configuration.metadata",
              name: "Configuration metadata",
              enabled: true,
              available: true,
              healthy: true,
              certified: false,
              productionReady: false,
              owner: "platform",
              version: "0.1.0",
              createdAt: mod.createdAt,
              updatedAt: mod.updatedAt,
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzadmin-004" },
        }),
      });
      return;
    }

    if (path.endsWith("/administration/permissions")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "perm_pw",
              tenantId: "tenant_a",
              key: "admin.read",
              name: "Administration read",
              createdAt: mod.createdAt,
              updatedAt: mod.updatedAt,
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzadmin-004" },
        }),
      });
      return;
    }

    if (path.endsWith("/administration/registrations")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "reg_pw",
              tenantId: "tenant_a",
              moduleKey: "configuration",
              version: "0.1.0",
              status: "registered",
              registeredAt: mod.createdAt,
              registeredBy: "user_1",
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzadmin-004" },
        }),
      });
      return;
    }

    if (path.endsWith("/administration/navigations")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "nav_pw",
              tenantId: "tenant_a",
              moduleId: "mod_pw",
              key: "configuration.overview",
              label: "Configuration",
              ordering: 10,
              visibility: "visible",
              routePath: "/workspace/configuration",
              createdAt: mod.createdAt,
              updatedAt: mod.updatedAt,
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzadmin-004" },
        }),
      });
      return;
    }

    if (path.endsWith("/administration/dashboards")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "dash_pw",
              tenantId: "tenant_a",
              key: "admin.overview",
              name: "Overview",
              ordering: 10,
              createdAt: mod.createdAt,
              updatedAt: mod.updatedAt,
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzadmin-004" },
        }),
      });
      return;
    }

    if (path.endsWith("/administration/audit")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "aud_pw",
              tenantId: "tenant_a",
              moduleId: "mod_pw",
              action: "module.registered",
              actorUserId: "user_1",
              createdAt: mod.createdAt,
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apzadmin-004" },
        }),
      });
      return;
    }

    if (
      path.includes("/modules/mod_pw") ||
      path.match(/\/modules\/[^/]+$/)
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: mod,
          meta: { correlationId: "pw-apzadmin-004" },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: path.endsWith("/modules") ? [mod] : [],
        page: { limit: 1, hasMore: false },
        meta: { correlationId: "pw-apzadmin-004" },
      }),
    });
  });
}

test.describe("APZADMIN-004 Administration Workbench", () => {
  test("opens overview with unavailable capability banners", async ({
    page,
  }) => {
    await mockAdministrationHttpApi(page);
    await signIn(page);
    await page.goto(`${ADMINISTRATION_HOME}/overview`);
    await expect(
      page.getByRole("heading", { level: 1, name: "Overview" }),
    ).toBeVisible();
    await expect(page.getByTestId("banner-metadata")).toContainText(
      "ADMINISTRATION METADATA ONLY — RUNTIME ADMINISTRATION IS NOT AVAILABLE",
    );
    await expect(
      page.getByTestId("card-unavailable-runtime-administration"),
    ).toContainText("Unavailable");
    await expect(
      page.getByTestId("card-unavailable-user-management"),
    ).toContainText("Unavailable");
  });

  test("browses modules capabilities permissions registrations", async ({
    page,
  }) => {
    await mockAdministrationHttpApi(page);
    await signIn(page);

    await page.goto(`${ADMINISTRATION_HOME}/modules`);
    await expect(page.getByText("mod_pw")).toBeVisible();

    await page.goto(`${ADMINISTRATION_HOME}/capabilities`);
    await expect(page.getByText("cap_pw")).toBeVisible();

    await page.goto(`${ADMINISTRATION_HOME}/permissions`);
    await expect(page.getByTestId("banner-permissions")).toContainText(
      "ACCESS ASSIGNMENT IS OUTSIDE THIS MILESTONE",
    );

    await page.goto(`${ADMINISTRATION_HOME}/registrations`);
    await expect(page.getByTestId("banner-registration")).toContainText(
      "NO SERVICE PROVISIONING",
    );
  });

  test("navigates navigation dashboards audit diagnostics", async ({
    page,
  }) => {
    await mockAdministrationHttpApi(page);
    await signIn(page);

    await page.goto(`${ADMINISTRATION_HOME}/navigation`);
    await expect(page.getByText("nav_pw")).toBeVisible();

    await page.goto(`${ADMINISTRATION_HOME}/dashboards`);
    await expect(page.getByTestId("banner-dashboards")).toContainText(
      "ANALYTICS RENDERING IS NOT PART OF ADMINISTRATION",
    );

    await page.goto(`${ADMINISTRATION_HOME}/audit`);
    await expect(page.getByTestId("administration-audit-table")).toBeVisible();

    await page.goto(`${ADMINISTRATION_HOME}/diagnostics`);
    await expect(page.getByTestId("diag-runtime")).toContainText("Unavailable");
    await expect(page.getByTestId("diag-event-bus")).toContainText(
      "Unavailable",
    );
    await expect(page.getByTestId("banner-health")).toContainText(
      "NO LIVE PROBE",
    );
  });
});
