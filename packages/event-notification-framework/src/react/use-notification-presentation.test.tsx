import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { createNotificationItem } from "../notification/create-notification-item";
import type { EventEnvelope } from "../event/event-envelope";
import type { NotificationDescriptor } from "../notification/notification-descriptor";
import { createDefaultNotificationService } from "../notification/default-notification-service";
import { NotificationServiceProvider } from "./notification-service-context";
import { useNotificationPresentation } from "./use-notification-presentation";

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
  envelopeId: "env-present-1",
  eventId: "system.platform.bootstrap.completed",
  eventVersion: "1.0.0",
  category: "system",
  correlationId: "corr-present",
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

describe("useNotificationPresentation", () => {
  it("maps service notifications to grouped view models", async () => {
    const service = createDefaultNotificationService();
    const item = createNotificationItem({
      envelope: ENVELOPE,
      route: ROUTE,
      title: "Bootstrap complete",
      renderedAt: "2026-07-04T10:00:01.000Z",
    });
    service.addNotifications([item]);

    const { result } = renderHook(
      () => useNotificationPresentation({ now: "2026-07-04T10:05:00.000Z" }),
      { wrapper: createWrapper(service) },
    );

    await waitFor(() => {
      expect(result.current.viewModels).toHaveLength(1);
    });

    expect(result.current.viewModels[0]?.relativeTimestamp).toBe("5m ago");
    expect(result.current.groups).toHaveLength(1);
    expect(result.current.diagnostics.status).toBe("ready");
    expect(result.current.serviceDiagnostics.activeNotificationCount).toBe(1);
  });

  it("updates presentation diagnostics after markAsRead", async () => {
    const service = createDefaultNotificationService();
    const item = createNotificationItem({
      envelope: ENVELOPE,
      route: ROUTE,
      title: "Bootstrap complete",
      renderedAt: "2026-07-04T10:00:01.000Z",
    });
    service.addNotifications([item]);

    const { result } = renderHook(() => useNotificationPresentation(), {
      wrapper: createWrapper(service),
    });

    await waitFor(() => {
      expect(result.current.diagnostics.unreadCount).toBe(1);
    });

    act(() => {
      result.current.markAsRead(item.notificationId);
    });

    await waitFor(() => {
      expect(result.current.viewModels[0]?.readState).toBe("read");
      expect(result.current.diagnostics.readCount).toBe(1);
    });
  });
});
