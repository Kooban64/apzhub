import { describe, expect, it, beforeEach } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  loadEventFrameworkHealthSummary,
  loadNotificationFrameworkHealthSummary,
} from "./event-notification-health";
import { loadSharedEventNotificationContext } from "./load-shared-event-notification-context";
import { _resetRuntimeInitForTests, ensurePlatformRuntimeReady } from "./runtime-init";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("event notification application integration", () => {
  beforeEach(() => {
    _resetRuntimeInitForTests();
  });

  it("loads shared context after runtime bootstrap", async () => {
    const bootstrap = await ensurePlatformRuntimeReady();
    expect(bootstrap.success).toBe(true);
    expect(workspaceRoot).toMatch(/apz-portal$/);

    const context = await loadSharedEventNotificationContext();

    expect(context).not.toBeNull();
    expect(
      context?.eventRegistry.getDiagnostics().registeredEventCount,
    ).toBeGreaterThan(0);
    expect(
      context?.notificationRegistry.getDiagnostics().registeredRouteCount,
    ).toBeGreaterThan(0);
    expect(context?.notificationRegistry.has("capability.action.executed.inbox")).toBe(
      true,
    );
  });

  it("builds event and notification health summaries for /api/health", async () => {
    await ensurePlatformRuntimeReady();

    const [events, notifications] = await Promise.all([
      loadEventFrameworkHealthSummary(),
      loadNotificationFrameworkHealthSummary(),
    ]);

    expect(events).toMatchObject({
      status: expect.stringMatching(/healthy|degraded/),
      registeredCount: expect.any(Number),
      publishCount: expect.any(Number),
      subscriberCount: expect.any(Number),
    });
    expect(notifications).toMatchObject({
      status: expect.stringMatching(/healthy|degraded/),
      registeredRouteCount: expect.any(Number),
      mapperStatus: "ready",
      serviceStatus: "empty",
    });
  });
});
