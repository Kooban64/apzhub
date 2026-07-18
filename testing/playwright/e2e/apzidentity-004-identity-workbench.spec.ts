import { expect, test, type Page } from "@playwright/test";

import { signIn } from "./testing-ui-helpers";

const IDENTITY_HOME = "/workspace/identity";

const ts = "2026-07-16T12:00:00.000Z";

const user = {
  id: "usr_pw",
  tenantId: "tenant_a",
  organisationId: "org_pw",
  email: "pw.user@example.com",
  displayName: "Playwright User",
  status: "active",
  createdAt: ts,
  updatedAt: ts,
  createdBy: "user_1",
  updatedBy: "user_1",
  revision: 1,
};

const membership = {
  id: "mem_pw",
  tenantId: "tenant_a",
  userId: user.id,
  kind: "group",
  targetId: "grp_pw",
  status: "active",
  createdAt: ts,
  updatedAt: ts,
  createdBy: "user_1",
  updatedBy: "user_1",
};

const serviceAssignment = {
  id: "svcasg_pw",
  tenantId: "tenant_a",
  subjectKind: "user",
  subjectId: user.id,
  serviceCapability: "projects",
  status: "active",
  createdAt: ts,
  updatedAt: ts,
  createdBy: "user_1",
  updatedBy: "user_1",
};

const group = {
  id: "grp_pw",
  tenantId: "tenant_a",
  organisationId: "org_pw",
  key: "engineering",
  name: "Engineering",
  description: "Engineering group",
  status: "active",
  createdAt: ts,
  updatedAt: ts,
  createdBy: "user_1",
  updatedBy: "user_1",
  revision: 1,
};

const role = {
  id: "role_pw",
  tenantId: "tenant_a",
  organisationId: "org_pw",
  key: "member",
  name: "Member",
  description: "Standard member role",
  status: "active",
  createdAt: ts,
  updatedAt: ts,
  createdBy: "user_1",
  updatedBy: "user_1",
  revision: 1,
};

const organisation = {
  id: "org_pw",
  tenantId: "tenant_a",
  key: "acme",
  name: "Acme Corp",
  description: "Primary organisation",
  status: "active",
  createdAt: ts,
  updatedAt: ts,
  createdBy: "user_1",
  updatedBy: "user_1",
  revision: 1,
};

const tenant = {
  id: "tenant_a",
  key: "default",
  name: "Default Tenant",
  description: "Default platform tenant",
  status: "active",
  createdAt: ts,
  updatedAt: ts,
  createdBy: "user_1",
  updatedBy: "user_1",
  revision: 1,
};

const managementCapabilities = {
  identityEnabled: true,
  managementPlaneReady: true,
  persistenceReady: true,
  identityCoreReady: true,
  gatewayRegistered: true,
  requestPipelineReady: true,
  authorizationReady: true,
  httpEnabled: true,
  workbenchEnabled: true,
  authenticationManaged: false,
  provisioningEnabled: false,
  directorySyncEnabled: false,
  persistenceMode: "postgres",
  capabilities: {
    users: true,
    groups: true,
    roles: true,
    organisations: true,
    tenants: true,
    departments: true,
    positions: true,
    memberships: true,
    serviceAssignments: true,
    invitations: true,
    activation: true,
    deactivation: true,
    policies: true,
    audit: true,
    history: true,
    references: true,
    diagnostics: true,
    http: true,
    workbench: true,
    authentication: false,
    provisioning: false,
    directorySync: false,
  },
};

function collectionBody<T>(items: readonly T[]) {
  return JSON.stringify({
    data: items,
    page: { limit: items.length, hasMore: false },
    meta: { correlationId: "pw-apzidentity-004" },
  });
}

function itemBody<T>(item: T) {
  return JSON.stringify({ data: item, meta: { correlationId: "pw-apzidentity-004" } });
}

async function mockIdentityHttpApi(page: Page) {
  await page.route("**/api/v1/identity/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (path.endsWith("/identity/health")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: itemBody({ status: "healthy", identityEnabled: true, httpEnabled: true }),
      });
      return;
    }
    if (path.endsWith("/identity/readiness")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: itemBody({ ready: true, identityEnabled: true, httpEnabled: true }),
      });
      return;
    }
    if (path.endsWith("/identity/capabilities")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: itemBody({
          identityEnabled: true,
          managementPlaneReady: true,
          http: true,
        }),
      });
      return;
    }
    if (path.endsWith("/identity/management-capabilities")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: itemBody(managementCapabilities),
      });
      return;
    }

    if (path.match(/\/identity\/users\/[^/]+$/)) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: itemBody(user),
      });
      return;
    }
    if (path.endsWith("/identity/users")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: collectionBody([user]),
      });
      return;
    }
    if (path.endsWith("/identity/groups")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: collectionBody([group]),
      });
      return;
    }
    if (path.endsWith("/identity/roles")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: collectionBody([role]),
      });
      return;
    }
    if (path.endsWith("/identity/organisations")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: collectionBody([organisation]),
      });
      return;
    }
    if (path.endsWith("/identity/tenants")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: collectionBody([tenant]),
      });
      return;
    }
    if (path.endsWith("/identity/memberships")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: collectionBody([membership]),
      });
      return;
    }
    if (path.endsWith("/identity/service-assignments")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: collectionBody([serviceAssignment]),
      });
      return;
    }
    if (
      path.endsWith("/identity/invitations") ||
      path.endsWith("/identity/departments") ||
      path.endsWith("/identity/positions") ||
      path.endsWith("/identity/policies") ||
      path.endsWith("/identity/audit") ||
      path.endsWith("/identity/history") ||
      path.endsWith("/identity/references") ||
      path.endsWith("/identity/activation") ||
      path.endsWith("/identity/deactivation")
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: collectionBody([]),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: collectionBody([]),
    });
  });
}

test.describe("APZIDENTITY-004 Identity Administration Workbench", () => {
  test("opens overview with authentication/provisioning/directory-sync banners", async ({
    page,
  }) => {
    await mockIdentityHttpApi(page);
    await signIn(page);

    await page.goto(`${IDENTITY_HOME}/overview`);
    await expect(
      page.getByRole("heading", { level: 1, name: "Overview" }),
    ).toBeVisible();
    await expect(page.getByTestId("card-auth-status")).toContainText(
      "AUTHENTICATION NOT MANAGED",
    );
    await expect(page.getByTestId("card-provisioning-status")).toContainText(
      "PROVISIONING NOT AVAILABLE",
    );
    await expect(page.getByTestId("card-directory-sync-status")).toContainText(
      "DIRECTORY SYNC",
    );
    await expect(page.getByTestId("card-users-count")).toContainText("1");
  });

  test("browses users, opens a user, and sees memberships and service assignments", async ({
    page,
  }) => {
    await mockIdentityHttpApi(page);
    await signIn(page);

    await page.goto(`${IDENTITY_HOME}/users`);
    await expect(page.getByRole("heading", { level: 1, name: "Users" })).toBeVisible();
    await expect(page.getByTestId("banner-auth")).toContainText(
      "AUTHENTICATION NOT MANAGED",
    );

    await page.getByText(user.displayName).click();

    await expect(page.getByTestId("identity-detail")).toBeVisible();
    await expect(page.getByTestId("user-status")).toContainText("active");
    await expect(page.getByTestId("user-memberships")).toBeVisible();
    await expect(page.getByTestId("user-memberships")).toContainText("grp_pw");
    await expect(page.getByTestId("user-service-assignments")).toBeVisible();
    await expect(page.getByTestId("user-service-assignments")).toContainText(
      "projects",
    );
  });

  test("navigates memberships and service assignments sections", async ({ page }) => {
    await mockIdentityHttpApi(page);
    await signIn(page);

    await page.goto(`${IDENTITY_HOME}/memberships`);
    await expect(page.getByText("mem_pw")).toBeVisible();

    await page.goto(`${IDENTITY_HOME}/service-assignments`);
    await expect(page.getByText("svcasg_pw")).toBeVisible();
  });

  test("shows Diagnostics in a safe, unavailable state with no live IdP", async ({
    page,
  }) => {
    await mockIdentityHttpApi(page);
    await signIn(page);

    await page.goto(`${IDENTITY_HOME}/diagnostics`);
    await expect(
      page.getByRole("heading", { level: 1, name: "Diagnostics" }),
    ).toBeVisible();
    await expect(page.getByTestId("banner-auth")).toContainText(
      "AUTHENTICATION NOT MANAGED",
    );
    await expect(page.getByTestId("banner-provisioning")).toContainText(
      "PROVISIONING NOT AVAILABLE",
    );
    await expect(page.getByTestId("banner-directory-sync")).toContainText(
      "DIRECTORY SYNC",
    );
    await expect(page.getByTestId("diag-authentication")).toContainText("Unavailable");
    await expect(page.getByTestId("diag-provisioning")).toContainText("Unavailable");
    await expect(page.getByTestId("diag-directory-sync")).toContainText("Unavailable");
  });
});
