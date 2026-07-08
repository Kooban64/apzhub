import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  EVENT_NOTIFICATION_REACT_STATUS,
  EventNotificationProvider,
  createNotificationRegistryFromDto,
  useNotificationService,
} from "./index";

describe("@apzhub/event-notification-framework/react", () => {
  it("exports react presentation status", () => {
    expect(EVENT_NOTIFICATION_REACT_STATUS).toBe("integration");
  });

  it("provider pass-through renders children", () => {
    expect(EventNotificationProvider({ children: "child" })).toBe("child");
  });

  it("exports client hydration helpers", () => {
    expect(createNotificationRegistryFromDto).toBeTypeOf("function");
  });

  it("useNotificationService requires provider", () => {
    expect(() => renderHook(() => useNotificationService())).toThrow(
      "useNotificationService must be used within NotificationServiceProvider",
    );
  });
});
