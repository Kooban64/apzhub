import { describe, expect, it } from "vitest";

import {
  asNotificationId,
  hasNotificationPermission,
  isNotificationChannelKind,
  isNotificationPriority,
  isNotificationReferenceKind,
  isNotificationStatus,
  isPlatformNotificationIdShape,
  isPlatformNotificationPermission,
  NOTIFICATION_CONTRACTS_VERSION,
  PLATFORM_NOTIFICATION_PERMISSIONS,
} from "./index";

describe("notification-contracts", () => {
  it("exports version 0.2.0", () => {
    expect(NOTIFICATION_CONTRACTS_VERSION).toBe("0.2.0");
  });

  it("includes required permission keys", () => {
    for (const key of [
      "notification.*",
      "notification.read",
      "notification.manage",
      "notification.template",
      "notification.preference",
      "notification.audit",
      "notification.delivery",
    ]) {
      expect(PLATFORM_NOTIFICATION_PERMISSIONS).toContain(key);
      expect(isPlatformNotificationPermission(key)).toBe(true);
    }
    expect(isPlatformNotificationPermission("notification.send")).toBe(false);
  });

  it("validates enums and permission helpers", () => {
    expect(isNotificationStatus("draft")).toBe(true);
    expect(isNotificationStatus("sent")).toBe(false);
    expect(isNotificationPriority("critical")).toBe(true);
    expect(isNotificationPriority("urgent")).toBe(false);
    expect(isNotificationChannelKind("in_app")).toBe(true);
    expect(isNotificationChannelKind("fax")).toBe(false);
    expect(isNotificationReferenceKind("projects")).toBe(true);
    expect(isNotificationReferenceKind("plane")).toBe(false);
    expect(hasNotificationPermission(["notification.*"], "manage")).toBe(true);
    expect(hasNotificationPermission(["notification.read"], "manage")).toBe(false);
    expect(hasNotificationPermission(["notification.read"], "read")).toBe(true);
    expect(hasNotificationPermission(["notification.template"], "template")).toBe(true);
  });

  it("brands identifiers and rejects invalid shapes", () => {
    expect(isPlatformNotificationIdShape("ntf_1")).toBe(true);
    expect(asNotificationId("ntf_1")).toBe("ntf_1");
    expect(() => asNotificationId("")).toThrow(/Invalid/);
    expect(() => asNotificationId(" bad")).toThrow(/Invalid/);
  });
});
