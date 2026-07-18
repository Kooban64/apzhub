import { describe, expect, it } from "vitest";

import {
  assertNotificationApiPath,
  isNotificationApiPath,
  isNotificationsRoute,
  notificationsSectionPath,
  NOTIFICATIONS_SECTIONS,
  NOTIFICATIONS_WORKSPACE_BASE,
  resolveNotificationsSection,
} from "./routes";

describe("APZNOTIFY-004 notification workspace routes", () => {
  it("resolves sections and base paths", () => {
    expect(NOTIFICATIONS_WORKSPACE_BASE).toBe("/workspace/notifications");
    expect(isNotificationsRoute("/workspace/notifications")).toBe(true);
    expect(isNotificationsRoute("/workspace/notifications/")).toBe(true);
    expect(isNotificationsRoute("/workspace/notifications/audit")).toBe(true);
    expect(isNotificationsRoute("/workspace/workflows")).toBe(false);
    expect(resolveNotificationsSection("/workspace/notifications")).toBe("overview");
    expect(resolveNotificationsSection("/workspace/notifications/templates")).toBe(
      "templates",
    );
    expect(resolveNotificationsSection("/workspace/notifications/unknown")).toBe(
      "overview",
    );
    expect(notificationsSectionPath()).toBe("/workspace/notifications/overview");
    expect(notificationsSectionPath("overview")).toBe(
      "/workspace/notifications/overview",
    );
    expect(notificationsSectionPath("channels")).toBe(
      "/workspace/notifications/channels",
    );
    expect(NOTIFICATIONS_SECTIONS).toContain("diagnostics");
  });

  it("guards HTTP API path helpers", () => {
    expect(isNotificationApiPath("/api/v1/notifications")).toBe(true);
    expect(isNotificationApiPath("/api/v1/notifications/templates")).toBe(true);
    expect(isNotificationApiPath("/api/v1/workflows")).toBe(false);
    expect(() => assertNotificationApiPath("/api/v1/notifications")).not.toThrow();
    expect(() => assertNotificationApiPath("/api/v1/workflows")).toThrow(/only call/);
    expect(() => assertNotificationApiPath("/api/v1/notifications/send")).toThrow(
      /Forbidden/,
    );
  });
});
