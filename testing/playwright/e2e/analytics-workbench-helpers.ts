import { type Page, type Route } from "@playwright/test";

import { DEV_EMAIL, DEV_PASSWORD, signInDevUser } from "./auth-helpers";

export { DEV_EMAIL, DEV_PASSWORD };

export const DASHBOARD_ID = "dash_exec_overview";
export const SAVED_ID = "saved_exec_mine";

export function meta() {
  return { requestId: "req_analytics_e2e", correlationId: "corr_analytics_e2e" };
}

export function pageEnvelope() {
  return { cursor: null, nextCursor: null, limit: 20, hasMore: false };
}

export function dashboard(overrides: Record<string, unknown> = {}) {
  return {
    id: DASHBOARD_ID,
    tenantId: "tenant_e2e",
    title: "Executive Overview",
    description: "Cross-product executive scorecards",
    categoryId: "cat_executive",
    status: "published",
    tags: ["executive"],
    provider: { providerId: "platform", providerRef: "collection:1" },
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-19T00:00:00.000Z",
    createdBy: "user_e2e",
    updatedBy: "user_e2e",
    revision: 1,
    ...overrides,
  };
}

export async function signIn(page: Page): Promise<void> {
  await signInDevUser(page);
}

export async function mockAnalyticsApi(page: Page): Promise<void> {
  await page.route("**/api/v1/analytics/**", async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (path.endsWith("/analytics/health") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            status: "healthy",
            checkedAt: "2026-07-19T00:00:00.000Z",
            providerStatuses: [{ providerId: "platform", status: "healthy" }],
          },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/analytics/readiness") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            readiness: "ready_with_limitations",
            reasons: ["e2e-mock"],
            providerId: "platform",
            healthStatus: "healthy",
          },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/analytics/capabilities") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            capabilities: [],
            analyticsEnabled: true,
            registryMode: "in_memory",
            opsMode: "mock",
            providerId: "platform",
            httpApiVersion: "1.0.0",
            workbenchReady: true,
            productReady: true,
          },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/analytics/categories") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            items: [
              {
                id: "cat_executive",
                tenantId: "tenant_e2e",
                key: "executive",
                name: "Executive",
                status: "published",
              },
            ],
          },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/analytics/dashboards") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [dashboard()],
          page: pageEnvelope(),
          meta: meta(),
        }),
      });
    }

    if (path.includes("/analytics/dashboards/") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: dashboard(), meta: meta() }),
      });
    }

    if (path.endsWith("/analytics/datasets") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            items: [
              {
                id: "ds_projects_throughput",
                tenantId: "tenant_e2e",
                key: "projects.throughput",
                name: "Projects Throughput",
                status: "published",
                provider: { providerId: "platform", providerRef: "dataset:1" },
              },
            ],
          },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/analytics/reports") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            items: [
              {
                id: "rep_weekly_ops",
                tenantId: "tenant_e2e",
                reportingSorRef: "reporting:weekly_ops",
                key: "weekly.ops",
                title: "Weekly Ops Report",
              },
            ],
          },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/analytics/saved") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            items: [
              {
                id: SAVED_ID,
                tenantId: "tenant_e2e",
                ownerPrincipalId: "user_e2e",
                dashboardId: DASHBOARD_ID,
                name: "My Executive",
                status: "published",
                createdAt: "2026-07-01T00:00:00.000Z",
                updatedAt: "2026-07-19T00:00:00.000Z",
                revision: 1,
              },
            ],
          },
          meta: meta(),
        }),
      });
    }

    if (path.endsWith("/analytics/saved") && method === "POST") {
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: "saved_new_e2e",
            tenantId: "tenant_e2e",
            ownerPrincipalId: "user_e2e",
            dashboardId: DASHBOARD_ID,
            name: "HTTP Saved",
            status: "draft",
            createdAt: "2026-07-19T00:00:00.000Z",
            updatedAt: "2026-07-19T00:00:00.000Z",
            revision: 1,
          },
          meta: meta(),
        }),
      });
    }

    if (path.includes("/analytics/saved/") && method === "DELETE") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: SAVED_ID,
            tenantId: "tenant_e2e",
            ownerPrincipalId: "user_e2e",
            dashboardId: DASHBOARD_ID,
            name: "My Executive",
            status: "archived",
            createdAt: "2026-07-01T00:00:00.000Z",
            updatedAt: "2026-07-19T00:00:00.000Z",
            revision: 2,
          },
          meta: meta(),
        }),
      });
    }

    return route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({
        error: { code: "NOT_FOUND", message: `Unhandled mock ${method} ${path}` },
        meta: meta(),
      }),
    });
  });
}
