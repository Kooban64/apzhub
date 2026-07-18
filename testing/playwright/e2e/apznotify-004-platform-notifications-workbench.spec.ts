import { expect, test, type Page } from "@playwright/test";

import { signIn } from "./testing-ui-helpers";

const NOTIFICATIONS_HOME = "/workspace/notifications";

async function mockNotificationsHttpApi(page: Page, seen: string[]) {
  await page.route("**/api/v1/notifications**", async (route) => {
    const url = new URL(route.request().url());
    seen.push(url.pathname + url.search);

    if (
      url.pathname.endsWith("/notifications/diagnostics") ||
      url.pathname.endsWith("/notifications/capabilities") ||
      url.pathname.endsWith("/notifications/health") ||
      url.pathname.endsWith("/notifications/readiness")
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            notificationEnabled: true,
            deliveryEnabled: false,
            deliveryPlaneReady: false,
            providersConfigured: false,
            workersReady: false,
            eventBusReady: false,
            realtimeReady: false,
            persistenceMode: "memory",
            healthy: true,
            ready: true,
            status: "ok",
            capabilities: { delivery: false, metadataCrud: true },
            platformServicesVersion: "pw",
          },
          meta: { correlationId: "pw-apznotify-004" },
        }),
      });
      return;
    }

    if (url.pathname.endsWith("/notifications/templates")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "ntt_pw",
              tenantId: "tenant_a",
              key: "welcome",
              name: "Welcome",
              defaultPriority: "normal",
              defaultChannelKinds: ["in_app"],
              createdAt: "2026-07-16T12:00:00.000Z",
              updatedAt: "2026-07-16T12:00:00.000Z",
              createdBy: "user_1",
              updatedBy: "user_1",
              revision: 1,
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apznotify-004" },
        }),
      });
      return;
    }

    if (url.pathname.endsWith("/notifications/channels")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "ntch_pw",
              tenantId: "tenant_a",
              kind: "in_app",
              name: "In-app",
              enabled: true,
              deliveryAvailable: false,
              providersConfigured: false,
              createdAt: "2026-07-16T12:00:00.000Z",
              updatedAt: "2026-07-16T12:00:00.000Z",
            },
          ],
          page: { limit: 1, hasMore: false },
          meta: { correlationId: "pw-apznotify-004" },
        }),
      });
      return;
    }

    if (url.pathname.match(/\/notifications\/[^/]+$/)) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: "ntf_pw",
            tenantId: "tenant_a",
            title: "Playwright notice",
            status: "pending",
            priority: "normal",
            channelKinds: ["in_app"],
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
            revision: 1,
          },
          meta: { correlationId: "pw-apznotify-004" },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          {
            id: "ntf_pw",
            tenantId: "tenant_a",
            title: "Playwright notice",
            status: "pending",
            priority: "normal",
            channelKinds: ["in_app"],
            createdAt: "2026-07-16T12:00:00.000Z",
            updatedAt: "2026-07-16T12:00:00.000Z",
            createdBy: "user_1",
            updatedBy: "user_1",
            revision: 1,
          },
        ],
        page: { limit: 1, hasMore: false },
        meta: { correlationId: "pw-apznotify-004" },
      }),
    });
  });
}

test.describe("APZNOTIFY-004 Notification Workbench", () => {
  test("overview shows delivery unavailable via typed client HTTP", async ({
    page,
  }) => {
    const seen: string[] = [];
    await mockNotificationsHttpApi(page, seen);
    await signIn(page);
    await page.goto(`${NOTIFICATIONS_HOME}/overview`);
    await expect(page.getByTestId("card-delivery-status")).toContainText(
      "DELIVERY PROVIDERS NOT AVAILABLE",
    );
    await expect(page.getByTestId("notifications-toolbar")).toBeVisible();
    expect(seen.some((path) => path.includes("/api/v1/notifications"))).toBe(true);
  });

  test("notifications section lists metadata", async ({ page }) => {
    const seen: string[] = [];
    await mockNotificationsHttpApi(page, seen);
    await signIn(page);
    await page.goto(`${NOTIFICATIONS_HOME}/notifications`);
    await expect(page.getByText("Playwright notice")).toBeVisible();
    await expect(page.getByRole("button", { name: /Mark Read/i })).toBeVisible();
  });
});
