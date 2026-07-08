import { describe, expect, it } from "vitest";

import * as main from "./index";
import * as server from "./server";
import * as serverEvent from "./server/event/index";
import * as serverNotification from "./server/notification/index";
import * as react from "./react/index";

describe("@apzhub/event-notification-framework exports", () => {
  it("main export exposes framework status and composition root", () => {
    expect(main.EVENT_NOTIFICATION_FRAMEWORK_STATUS).toBe("scaffold");
    expect(main.createEventNotificationContext).toBeTypeOf("function");
    expect(main.createDefaultEventRegistry).toBeTypeOf("function");
    expect(main.createPlaceholderEventRegistry).toBeTypeOf("function");
    expect(main.createInProcessEventBus).toBeTypeOf("function");
    expect(main.bootstrapEventRegistry).toBeTypeOf("function");
    expect(main.bootstrapNotificationRegistry).toBeTypeOf("function");
    expect(main.createDefaultNotificationRegistry).toBeTypeOf("function");
    expect(main.createDefaultNotificationMapper).toBeTypeOf("function");
    expect(main.createNotificationRegistryFromDto).toBeTypeOf("function");
    expect(main.createDefaultNotificationService).toBeTypeOf("function");
    expect(main.mapNotificationItemToViewModel).toBeTypeOf("function");
    expect(main.createActionAuditEventBusHook).toBeTypeOf("function");
    expect(main.publishActionExecutedEventToBus).toBeTypeOf("function");
    expect(main.wireNotificationMapperToService).toBeTypeOf("function");
  });

  it("server export exposes server status and placeholders", () => {
    expect(server.EVENT_NOTIFICATION_SERVER_STATUS).toBe("integration");
    expect(server.createEventNotificationContext).toBeTypeOf("function");
    expect(server.PlaceholderEventBus).toBeDefined();
    expect(server.mapEventRegistryDto).toBeTypeOf("function");
    expect(server.filterEventRegistryDto).toBeTypeOf("function");
  });

  it("server/event export exposes event layer only", () => {
    expect(serverEvent.EVENT_LAYER_STATUS).toBe("audit");
    expect(serverEvent.filterEventRegistryDto).toBeTypeOf("function");
    expect(serverEvent.mapEventRegistryDto).toBeTypeOf("function");
    expect(serverEvent.DefaultEventRegistry).toBeDefined();
    expect(serverEvent.PlaceholderEventRegistry).toBeDefined();
    expect(serverEvent.PlaceholderEventBus).toBeDefined();
    expect("PlaceholderNotificationRegistry" in serverEvent).toBe(false);
  });

  it("server/notification export exposes notification layer only", () => {
    expect(serverNotification.NOTIFICATION_LAYER_STATUS).toBe("experiences");
    expect(serverNotification.DefaultNotificationRegistry).toBeDefined();
    expect(serverNotification.PlaceholderNotificationRegistry).toBeDefined();
    expect(serverNotification.DefaultNotificationService).toBeDefined();
    expect(serverNotification.createDefaultNotificationService).toBeTypeOf("function");
    expect("PlaceholderEventBus" in serverNotification).toBe(false);
  });

  it("react export exposes hydration status and registry hooks", () => {
    expect(react.EVENT_NOTIFICATION_REACT_STATUS).toBe("integration");
    expect(react.useNotificationPresentation).toBeTypeOf("function");
    expect(react.mapNotificationItemToViewModel).toBeTypeOf("function");
    expect(react.NotificationRegistryProvider).toBeTypeOf("function");
    expect(react.useNotificationRegistry).toBeTypeOf("function");
    expect(react.NotificationServiceProvider).toBeTypeOf("function");
    expect(react.useNotificationService).toBeTypeOf("function");
    expect(react.useEventRegistry).toBeTypeOf("function");
  });
});

describe("interface shape smoke tests", () => {
  it("event registry interface supports descriptor registration contract", () => {
    const registry = main.createDefaultEventRegistry();
    registry.register({
      eventId: "capability.action.executed",
      version: "1.0.0",
      category: "capability",
      publisher: "command-framework",
    });
    expect(registry.has("capability.action.executed")).toBe(true);
  });

  it("notification registry interface supports route descriptor contract", () => {
    const registry = main.createPlaceholderNotificationRegistry();
    registry.register({
      routeId: "platform.action.executed.inbox",
      eventPattern: "capability.action.executed",
      notificationKind: "inbox",
      channel: "in-app",
      templateRef: "action-executed",
      version: "1.0.0",
    });
    expect(registry.list()).toEqual([]);
  });
});
