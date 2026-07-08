import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { createNotificationItem } from "../notification/create-notification-item";
import type { EventEnvelope } from "../event/event-envelope";
import type { NotificationDescriptor } from "../notification/notification-descriptor";
import { createDefaultNotificationService } from "../notification/default-notification-service";
import { NotificationServiceProvider } from "./notification-service-context";
import { useNotificationService } from "./use-notification-service";

const ROUTE: NotificationDescriptor = {
  routeId: "platform.inbox.system",
  eventPattern: "system.platform.bootstrap.completed",
  notificationKind: "inbox",
  channel: "in-app",
  templateRef: "bootstrap-completed",
  version: "1.0.0",
  status: "active",
};

const ENVELOPE: EventEnvelope = {
  envelopeId: "env-hook-1",
  eventId: "system.platform.bootstrap.completed",
  eventVersion: "1.0.0",
  category: "system",
  correlationId: "corr-hook",
  timestamp: "2026-07-04T10:00:00.000Z",
  publisher: "platform-runtime",
  payload: {},
};

function createWrapper(service = createDefaultNotificationService()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NotificationServiceProvider service={service}>
        {children}
      </NotificationServiceProvider>
    );
  };
}

describe("useNotificationService", () => {
  it("returns notifications and unread count from service", async () => {
    const service = createDefaultNotificationService();
    const item = createNotificationItem({
      envelope: ENVELOPE,
      route: ROUTE,
      title: "Bootstrap complete",
      renderedAt: "2026-07-04T10:00:01.000Z",
    });

    const { result } = renderHook(() => useNotificationService(), {
      wrapper: createWrapper(service),
    });

    act(() => {
      result.current.addNotifications([item]);
    });

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(1);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.getNotification(item.notificationId)?.title).toBe(
      "Bootstrap complete",
    );
    expect(result.current.diagnostics.activeNotificationCount).toBe(1);
  });

  it("updates unread count after markAsRead", async () => {
    const service = createDefaultNotificationService();
    const item = createNotificationItem({
      envelope: ENVELOPE,
      route: ROUTE,
      title: "Bootstrap complete",
      renderedAt: "2026-07-04T10:00:01.000Z",
    });
    service.addNotifications([item]);

    const { result } = renderHook(() => useNotificationService(), {
      wrapper: createWrapper(service),
    });

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(1);
    });

    act(() => {
      result.current.markAsRead(item.notificationId);
    });

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(0);
    });
  });

  it("throws outside provider", () => {
    expect(() => renderHook(() => useNotificationService())).toThrow(
      "useNotificationService must be used within NotificationServiceProvider",
    );
  });
});
