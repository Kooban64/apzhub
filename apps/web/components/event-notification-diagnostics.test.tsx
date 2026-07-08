import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  NotificationRegistryProvider,
  NotificationServiceProvider,
} from "@apzhub/event-notification-framework/react";
import { createEmptyNotificationRegistryDto } from "@apzhub/event-notification-framework/react";

import { EventNotificationDiagnostics } from "./event-notification-diagnostics";

describe("EventNotificationDiagnostics", () => {
  it("renders hydration diagnostics when providers are mounted", () => {
    render(
      <NotificationRegistryProvider dto={createEmptyNotificationRegistryDto()}>
        <NotificationServiceProvider>
          <EventNotificationDiagnostics
            eventDiagnostics={{
              registeredCount: 3,
              filteredCount: 2,
              platformEventCount: 2,
              capabilityEventCount: 1,
              filteredPlatformEventCount: 2,
              filteredCapabilityEventCount: 0,
              platformEventIds: [],
              capabilityEventIds: [],
              manifestCapabilityCount: 0,
              manifestCapabilities: [],
            }}
            notificationDiagnostics={{
              registeredCount: 6,
              filteredCount: 5,
              platformRouteCount: 4,
              capabilityRouteCount: 2,
              filteredPlatformRouteCount: 4,
              filteredCapabilityRouteCount: 1,
              platformRouteIds: [],
              capabilityRouteIds: [],
              manifestCapabilityCount: 0,
              manifestCapabilities: [],
            }}
          />
        </NotificationServiceProvider>
      </NotificationRegistryProvider>,
    );

    const node = screen.getByTestId("event-notification-diagnostics");
    expect(node).toHaveAttribute("data-event-registered-count", "3");
    expect(node).toHaveAttribute("data-notification-filtered-count", "5");
    expect(node).toHaveAttribute("data-notification-service-status", "empty");
  });

  it("does not render diagnostics in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    render(
      <NotificationRegistryProvider dto={createEmptyNotificationRegistryDto()}>
        <NotificationServiceProvider>
          <EventNotificationDiagnostics
            eventDiagnostics={{
              registeredCount: 1,
              filteredCount: 1,
              platformEventCount: 1,
              capabilityEventCount: 0,
              filteredPlatformEventCount: 1,
              filteredCapabilityEventCount: 0,
              platformEventIds: [],
              capabilityEventIds: [],
              manifestCapabilityCount: 0,
              manifestCapabilities: [],
            }}
            notificationDiagnostics={{
              registeredCount: 1,
              filteredCount: 1,
              platformRouteCount: 1,
              capabilityRouteCount: 0,
              filteredPlatformRouteCount: 1,
              filteredCapabilityRouteCount: 0,
              platformRouteIds: [],
              capabilityRouteIds: [],
              manifestCapabilityCount: 0,
              manifestCapabilities: [],
            }}
          />
        </NotificationServiceProvider>
      </NotificationRegistryProvider>,
    );

    expect(
      screen.queryByTestId("event-notification-diagnostics"),
    ).not.toBeInTheDocument();
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});
