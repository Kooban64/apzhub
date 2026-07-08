import { describe, expect, it } from "vitest";

import {
  CANONICAL_EVENT_CATEGORIES,
  EVENT_LAYER_STATUS,
  EVENT_NOTIFICATION_ARCHITECTURE_LAYERS,
  EVENT_NOTIFICATION_FRAMEWORK_STATUS,
  NOTIFICATION_LAYER_STATUS,
  PlaceholderEventBus,
  PlaceholderEventRegistry,
  PlaceholderNotificationMapper,
  PlaceholderNotificationRegistry,
  PlaceholderNotificationService,
  createEventNotificationContext,
  createPlaceholderEventBus,
  createPlaceholderEventRegistry,
  createPlaceholderNotificationMapper,
  createPlaceholderNotificationRegistry,
  createPlaceholderNotificationService,
} from "./index";

describe("@apzhub/event-notification-framework status", () => {
  it("exports scaffold framework status", () => {
    expect(EVENT_NOTIFICATION_FRAMEWORK_STATUS).toBe("scaffold");
    expect(EVENT_LAYER_STATUS).toBe("audit");
    expect(NOTIFICATION_LAYER_STATUS).toBe("experiences");
  });

  it("declares separate architecture layers", () => {
    expect(EVENT_NOTIFICATION_ARCHITECTURE_LAYERS.event).toBe("event-layer");
    expect(EVENT_NOTIFICATION_ARCHITECTURE_LAYERS.notification).toBe(
      "notification-layer",
    );
    expect(EVENT_NOTIFICATION_ARCHITECTURE_LAYERS.event).not.toBe(
      EVENT_NOTIFICATION_ARCHITECTURE_LAYERS.notification,
    );
  });

  it("documents canonical event categories", () => {
    expect(CANONICAL_EVENT_CATEGORIES).toEqual([
      "system",
      "user",
      "capability",
      "integration",
    ]);
  });
});

describe("@apzhub/event-notification-framework placeholders", () => {
  it("placeholder event registry reports scaffold diagnostics", () => {
    const registry = createPlaceholderEventRegistry();
    expect(registry.list()).toEqual([]);
    expect(registry.getDiagnostics().status).toBe("scaffold");
    expect(registry.getDiagnostics().layerStatus).toBe("audit");
  });

  it("placeholder event bus rejects publish as not implemented", () => {
    const bus = createPlaceholderEventBus();
    const result = bus.publish({
      envelopeId: "env-1",
      eventId: "capability.action.executed",
      eventVersion: "1.0.0",
      category: "capability",
      correlationId: "corr-1",
      timestamp: "2026-07-03T00:00:00.000Z",
      publisher: "command-framework",
      payload: { actionId: "platform.theme.toggle" },
    });

    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("NOT_IMPLEMENTED");
    expect(bus.getDiagnostics().lastPublishStatus).toBe("not_implemented");
  });

  it("placeholder notification mapper does not publish events", () => {
    const mapper = createPlaceholderNotificationMapper();
    const result = mapper.map({
      envelopeId: "env-2",
      eventId: "capability.action.executed",
      eventVersion: "1.0.0",
      category: "capability",
      correlationId: "corr-2",
      timestamp: "2026-07-03T00:00:00.000Z",
      publisher: "command-framework",
      payload: {},
    });

    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("NOT_IMPLEMENTED");
    expect(result.createdCount).toBe(0);
  });

  it("placeholder notification service returns empty collections", () => {
    const service = createPlaceholderNotificationService();
    expect(service.listNotifications()).toEqual([]);
    expect(service.getUnreadCount()).toBe(0);
    expect(service.getDiagnostics().status).toBe("scaffold");
  });

  it("placeholder classes match factory exports", () => {
    expect(createPlaceholderEventRegistry()).toBeInstanceOf(PlaceholderEventRegistry);
    expect(createPlaceholderEventBus()).toBeInstanceOf(PlaceholderEventBus);
    expect(createPlaceholderNotificationRegistry()).toBeInstanceOf(
      PlaceholderNotificationRegistry,
    );
    expect(createPlaceholderNotificationMapper()).toBeInstanceOf(
      PlaceholderNotificationMapper,
    );
    expect(createPlaceholderNotificationService()).toBeInstanceOf(
      PlaceholderNotificationService,
    );
  });
});

describe("createEventNotificationContext", () => {
  it("composes default event registry with in-process event bus", () => {
    const context = createEventNotificationContext();

    expect(context.status).toBe("scaffold");
    expect(context.eventRegistry.getDiagnostics().layerStatus).toBe("audit");
    expect(context.eventRegistry.getDiagnostics().status).toBe("empty");
    expect(context.notificationRegistry.getDiagnostics().layerStatus).toBe(
      "experiences",
    );

    const diagnostics = context.getDiagnostics();
    expect(diagnostics.frameworkStatus).toBe("scaffold");
    expect(diagnostics.eventBus.message).toContain("InProcessEventBus");
    expect(diagnostics.notificationMapper.message).toContain(
      "DefaultNotificationMapper",
    );
    expect(diagnostics.notificationService.message).toContain(
      "DefaultNotificationService",
    );
  });

  it("reports ready framework status when events are registered", () => {
    const context = createEventNotificationContext();
    context.eventRegistry.register({
      eventId: "capability.action.executed",
      version: "1.0.0",
      category: "capability",
      publisher: "command-framework",
    });

    expect(context.getDiagnostics().frameworkStatus).toBe("ready");
  });

  it("allows subsystem injection for tests", () => {
    const eventRegistry = createPlaceholderEventRegistry();
    const context = createEventNotificationContext({ eventRegistry });
    expect(context.eventRegistry).toBe(eventRegistry);
  });
});
