import { test, expect } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";

function contextPanel(page: import("@playwright/test").Page) {
  return page.getByTestId("workbench-context-panel");
}

function shellNotifications(page: import("@playwright/test").Page) {
  return page.getByTestId("workbench-notifications");
}

async function waitForE2eHooks(page: import("@playwright/test").Page) {
  await page.waitForFunction(
    () =>
      window.__APZHUB_E2E__?.executeWorkbenchAction !== undefined &&
      window.__APZHUB_E2E__?.getActivityCount !== undefined,
  );
}

async function refreshActivityTimelinePresentation(
  page: import("@playwright/test").Page,
) {
  await page.evaluate(() => {
    window.__APZHUB_E2E__?.refreshActivityTimelinePresentation?.();
  });
}

async function executeSuccessfulWorkbenchAction(page: import("@playwright/test").Page) {
  await waitForE2eHooks(page);
  const result = await page.evaluate(async () => {
    const hooks = window.__APZHUB_E2E__;
    if (!hooks?.executeWorkbenchAction) {
      throw new Error("E2E test hooks are not mounted");
    }

    return hooks.executeWorkbenchAction("workbench.view.open", {
      viewId: "platform-home",
    });
  });

  expect(result.ok).toBe(true);
  await refreshActivityTimelinePresentation(page);
}

test.describe("SPR-007 Activity & Timeline Framework integration", () => {
  test("health endpoint includes Activity and Timeline Framework summaries", async ({
    request,
  }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.activities).toMatchObject({
      status: expect.stringMatching(/healthy|degraded|unhealthy/),
      frameworkStatus: "experiences",
      layerStatus: expect.stringMatching(/ready|empty|degraded|scaffold/),
      registeredTypeCount: expect.any(Number),
      filteredTypeCount: expect.any(Number),
      platformTypeCount: expect.any(Number),
      capabilityTypeCount: expect.any(Number),
      serviceStatus: expect.stringMatching(/empty|ready/),
      storedCount: expect.any(Number),
      viewedCount: 0,
      unviewedCount: expect.any(Number),
      mapperStatus: "ready",
      mappedCount: expect.any(Number),
      lastBootstrapStatus: "ok",
      subscriberRegistered: true,
    });
    expect(body.activities.registeredTypeCount).toBeGreaterThan(0);

    expect(body.timelines).toMatchObject({
      status: expect.stringMatching(/healthy|degraded|unhealthy/),
      frameworkStatus: "experiences",
      layerStatus: expect.stringMatching(/ready|empty|degraded|scaffold/),
      registeredTimelineCount: expect.any(Number),
      filteredTimelineCount: expect.any(Number),
      platformTimelineCount: expect.any(Number),
      capabilityTimelineCount: expect.any(Number),
      activeScopeCount: expect.any(Number),
      scopeCounts: expect.any(Object),
      lastBootstrapStatus: "ok",
      hydrationStatus: expect.stringMatching(/empty|hydrated|invalid/),
    });
    expect(body.timelines.registeredTimelineCount).toBeGreaterThan(0);
    expect(body.timelines.hydrationStatus).toBe("hydrated");
  });

  test("authenticated shell mounts Activity Timeline providers with hidden diagnostics hooks", async ({
    page,
  }) => {
    await signInDevUser(page);

    await expect(page.getByTestId("workbench-layout-with-context-panel")).toBeVisible();
    await expect(contextPanel(page)).toBeVisible();
    await expect(page.getByTestId("context-panel-tab-activity")).toHaveText("Activity");

    const activityTimelineDiagnostics = page.getByTestId(
      "activity-timeline-diagnostics",
    );
    await expect(activityTimelineDiagnostics).toHaveCount(1);
    await expect(activityTimelineDiagnostics).toBeHidden();
    expect(
      Number(
        await activityTimelineDiagnostics.getAttribute(
          "data-activity-registered-count",
        ),
      ),
    ).toBeGreaterThan(0);
    expect(
      Number(
        await activityTimelineDiagnostics.getAttribute(
          "data-timeline-registered-count",
        ),
      ),
    ).toBeGreaterThan(0);
    await expect(activityTimelineDiagnostics).toHaveAttribute(
      "data-hydration-status",
      /hydrated|empty/,
    );
    await expect(activityTimelineDiagnostics).toHaveAttribute(
      "data-service-status",
      /ready|empty/,
    );
    await expect(activityTimelineDiagnostics).toHaveAttribute(
      "data-service-stored-count",
      "0",
    );

    const experienceDiagnostics = contextPanel(page).locator(
      '[data-testid="activity-timeline-experience-diagnostics"]',
    );
    await expect(experienceDiagnostics).toBeHidden();
    await expect(experienceDiagnostics).toHaveAttribute("data-loading", "false");
    await expect(experienceDiagnostics).toHaveAttribute("data-empty", "true");
  });

  test("context panel Activity tab is visible and supports open/close behaviour", async ({
    page,
  }) => {
    await signInDevUser(page);

    const panel = contextPanel(page);
    await expect(panel.getByTestId("activity-timeline-panel-experience")).toBeVisible();
    await expect(panel.getByTestId("activity-timeline-empty")).toBeVisible();
    await expect(panel.getByText("No recent activity")).toBeVisible();

    await panel.getByTestId("context-panel-toggle").click();
    await expect(panel.getByTestId("activity-timeline-panel-experience")).toHaveCount(
      0,
    );

    await panel.getByTestId("context-panel-toggle").click();
    await expect(panel.getByTestId("activity-timeline-panel-experience")).toBeVisible();
    await expect(panel.getByTestId("activity-timeline-empty")).toBeVisible();
  });

  test("action execution flows through Event Bus to Activity Timeline and parallel notifications", async ({
    page,
  }) => {
    await signInDevUser(page);

    const panel = contextPanel(page);
    const notifications = shellNotifications(page);

    await executeSuccessfulWorkbenchAction(page);

    await expect
      .poll(async () =>
        page.evaluate(() => window.__APZHUB_E2E__?.getActivityCount?.() ?? 0),
      )
      .toBeGreaterThan(0);

    await expect(panel.getByTestId("activity-timeline-empty")).toHaveCount(0);
    await expect(panel.getByTestId("activity-timeline-list")).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      panel.locator('[data-testid^="activity-timeline-item-"]').first(),
    ).toContainText("Action executed");

    const experienceDiagnostics = panel.locator(
      '[data-testid="activity-timeline-experience-diagnostics"]',
    );
    await expect(experienceDiagnostics).toHaveAttribute("data-empty", "false");
    expect(
      Number(await experienceDiagnostics.getAttribute("data-total-count")),
    ).toBeGreaterThan(0);

    const badgeCount = notifications.getByTestId("notification-badge-count");
    await expect(badgeCount).toBeVisible({ timeout: 10_000 });
    await expect(badgeCount).toHaveText(/^[12]$/);
  });

  test("activity actionRef delegates through Action Framework execute", async ({
    page,
  }) => {
    await signInDevUser(page);

    const panel = contextPanel(page);
    await waitForE2eHooks(page);

    await page.evaluate(() => {
      window.__APZHUB_E2E__?.seedActivityActionDelegationFixture?.();
    });
    await refreshActivityTimelinePresentation(page);

    const fixtureItem = panel.locator(
      '[data-testid="activity-timeline-item-e2e-fixture:platform.action.executed"]',
    );
    await expect(fixtureItem).toBeVisible();
    await expect(fixtureItem.getByText("E2E delegation fixture")).toBeVisible();

    const activityCountBefore = await page.evaluate(
      () => window.__APZHUB_E2E__?.getActivityCount?.() ?? 0,
    );

    await fixtureItem
      .getByTestId("activity-timeline-action-e2e-fixture:platform.action.executed")
      .click();

    await refreshActivityTimelinePresentation(page);

    await expect
      .poll(async () =>
        page.evaluate(() => window.__APZHUB_E2E__?.getActivityCount?.() ?? 0),
      )
      .toBeGreaterThan(activityCountBefore);
  });

  test("diagnostic hooks are hidden and do not render visible debug UI", async ({
    page,
  }) => {
    await signInDevUser(page);

    await expect(page.getByTestId("activity-timeline-diagnostics")).toBeHidden();
    await expect(
      contextPanel(page).locator(
        '[data-testid="activity-timeline-experience-diagnostics"]',
      ),
    ).toBeHidden();
    await expect(page.getByTestId("event-notification-diagnostics")).toBeHidden();
    await expect(
      page.locator("aside[data-testid$='-diagnostics']:visible"),
    ).toHaveCount(0);
  });
});
