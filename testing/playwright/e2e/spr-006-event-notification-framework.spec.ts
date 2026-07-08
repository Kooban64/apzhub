import { test, expect } from "@playwright/test";

const DEV_EMAIL = "dev@apzhub.local";
const DEV_PASSWORD = "DevPassword123!";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEV_EMAIL);
  await page.getByLabel("Password").fill(DEV_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  try {
    await expect(page).toHaveURL(/\/workspace\/home/, { timeout: 5000 });
  } catch {
    await page.goto("/register");
    await page.getByLabel("Name").fill("Dev User");
    await page.getByLabel("Email").fill(DEV_EMAIL);
    await page.getByLabel("Password").fill(DEV_PASSWORD);
    await page.getByRole("button", { name: "Register" }).click();
    await expect(page).toHaveURL(/\/workspace\/home/);
  }
}

function shellNotifications(page: import("@playwright/test").Page) {
  return page.getByTestId("workbench-notifications");
}

async function executeSuccessfulWorkbenchAction(page: import("@playwright/test").Page) {
  await page.waitForFunction(() => window.__APZHUB_E2E__ !== undefined);
  const result = await page.evaluate(async () => {
    const hooks = window.__APZHUB_E2E__;
    if (!hooks) {
      throw new Error("E2E test hooks are not mounted");
    }

    return hooks.executeWorkbenchAction("workbench.view.open", {
      viewId: "platform-home",
    });
  });

  expect(result.ok).toBe(true);
}

test.describe("SPR-006 Event & Notification Framework integration", () => {
  test("health endpoint includes Event and Notification Framework summaries", async ({
    request,
  }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.events).toMatchObject({
      status: expect.stringMatching(/healthy|degraded|unhealthy/),
      frameworkStatus: expect.stringMatching(/ready|scaffold/),
      layerStatus: "audit",
      registeredCount: expect.any(Number),
      filteredCount: expect.any(Number),
      platformEventCount: expect.any(Number),
      capabilityEventCount: expect.any(Number),
      publishCount: expect.any(Number),
      lastPublishStatus: expect.any(String),
      subscriberCount: expect.any(Number),
    });
    expect(body.events.registeredCount).toBeGreaterThan(0);
    expect(body.events.subscriberCount).toBeGreaterThan(0);

    expect(body.notifications).toMatchObject({
      status: expect.stringMatching(/healthy|degraded|unhealthy/),
      frameworkStatus: "scaffold",
      layerStatus: "experiences",
      registeredRouteCount: expect.any(Number),
      filteredRouteCount: expect.any(Number),
      platformRouteCount: expect.any(Number),
      capabilityRouteCount: expect.any(Number),
      serviceStatus: expect.stringMatching(/empty|ready/),
      storedCount: expect.any(Number),
      unreadCount: expect.any(Number),
      mapperStatus: "ready",
      mappedCount: expect.any(Number),
    });
    expect(body.notifications.registeredRouteCount).toBeGreaterThan(0);
    expect(body.notifications.mapperStatus).toBe("ready");
  });

  test("authenticated shell mounts notification providers with hidden diagnostics hooks", async ({
    page,
  }) => {
    await signIn(page);

    await expect(shellNotifications(page)).toBeVisible();
    await expect(page.getByTestId("notification-badge")).toBeVisible();

    const eventNotificationDiagnostics = page.getByTestId(
      "event-notification-diagnostics",
    );
    await expect(eventNotificationDiagnostics).toHaveCount(1);
    await expect(eventNotificationDiagnostics).toBeHidden();
    expect(
      Number(
        await eventNotificationDiagnostics.getAttribute("data-event-registered-count"),
      ),
    ).toBeGreaterThan(0);
    expect(
      Number(
        await eventNotificationDiagnostics.getAttribute(
          "data-notification-registered-count",
        ),
      ),
    ).toBeGreaterThan(0);
    await expect(eventNotificationDiagnostics).toHaveAttribute(
      "data-notification-service-status",
      /empty|ready/,
    );

    const badgeDiagnostics = shellNotifications(page).locator(
      '[data-testid="notification-diagnostics"][data-surface="notification-badge"]',
    );
    await expect(badgeDiagnostics).toBeHidden();
    await expect(badgeDiagnostics).toHaveAttribute("data-unread-count", "0");
  });

  test("notification panel shows empty state, opens, and closes from badge", async ({
    page,
  }) => {
    await signIn(page);

    const notifications = shellNotifications(page);
    const badge = notifications.getByTestId("notification-badge");

    await expect(badge).toBeVisible();
    await expect(notifications.getByTestId("notification-badge-count")).toHaveCount(0);

    await badge.click();
    await expect(notifications.getByTestId("notification-panel")).toBeVisible();
    await expect(notifications.getByTestId("notification-panel-empty")).toBeVisible();
    await expect(notifications.getByText("No notifications")).toBeVisible();

    await badge.click();
    await expect(notifications.getByTestId("notification-panel")).toHaveCount(0);
  });

  test("action execution flows through to badge and panel notifications", async ({
    page,
  }) => {
    await signIn(page);

    const notifications = shellNotifications(page);
    await executeSuccessfulWorkbenchAction(page);

    const badgeCount = notifications.getByTestId("notification-badge-count");
    await expect(badgeCount).toBeVisible({ timeout: 10_000 });
    await expect(badgeCount).toHaveText(/^[12]$/);

    await notifications.getByTestId("notification-badge").click();
    const panel = notifications.getByTestId("notification-panel");
    await expect(panel).toBeVisible();

    const inboxItem = panel
      .locator('[data-testid^="notification-item-"]')
      .filter({ hasText: "Action workbench.view.open completed" });
    await expect(inboxItem).toBeVisible();
    await expect(inboxItem.getByText("Executed by user")).toBeVisible();
    await expect(inboxItem.getByText("Just now")).toBeVisible();
    await expect(panel.getByText("Normal")).toBeVisible();

    const notificationItems = panel.locator('[data-testid^="notification-item-"]');
    expect(await notificationItems.count()).toBeGreaterThanOrEqual(1);

    await expect(
      notifications.locator(
        '[data-testid="notification-diagnostics"][data-surface="notification-badge"]',
      ),
    ).toHaveAttribute("data-unread-count", await badgeCount.textContent());
  });

  test("notification panel supports mark read and mark all read with badge updates", async ({
    page,
  }) => {
    await signIn(page);

    const notifications = shellNotifications(page);
    await executeSuccessfulWorkbenchAction(page);

    const badgeCount = notifications.getByTestId("notification-badge-count");
    await expect(badgeCount).toBeVisible({ timeout: 10_000 });
    const initialUnread = Number(await badgeCount.textContent());
    expect(initialUnread).toBeGreaterThan(0);

    await notifications.getByTestId("notification-badge").click();
    const panel = notifications.getByTestId("notification-panel");
    await expect(panel).toBeVisible();

    const firstMarkRead = panel
      .locator('[data-testid^="notification-mark-read-"]')
      .first();
    await firstMarkRead.click();

    if (initialUnread > 1) {
      await expect(badgeCount).toHaveText(String(initialUnread - 1), { timeout: 5000 });
      await expect(panel.getByTestId("notification-mark-all-read")).toBeVisible();
      await panel.getByTestId("notification-mark-all-read").click();
    }

    await expect(badgeCount).toHaveCount(0, { timeout: 5000 });
    await expect(
      notifications.locator(
        '[data-testid="notification-diagnostics"][data-surface="notification-badge"]',
      ),
    ).toHaveAttribute("data-unread-count", "0");
  });

  test("diagnostic hooks are hidden and do not render visible debug UI", async ({
    page,
  }) => {
    await signIn(page);

    await expect(page.getByTestId("event-notification-diagnostics")).toBeHidden();
    await expect(
      shellNotifications(page).locator(
        '[data-testid="notification-diagnostics"][data-surface="notification-badge"]',
      ),
    ).toBeHidden();

    await expect(
      page.locator("aside[data-testid$='-diagnostics']:visible"),
    ).toHaveCount(0);
  });
});
