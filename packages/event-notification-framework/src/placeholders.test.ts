import { describe, expect, it, vi } from "vitest";

import {
  DefaultEventRegistry,
  DefaultNotificationRegistry,
  PlaceholderEventBus,
  PlaceholderEventRegistry,
  PlaceholderNotificationMapper,
  PlaceholderNotificationRegistry,
  PlaceholderNotificationService,
  createPlaceholderNotificationRegistry,
} from "./index";

describe("placeholder subsystem method coverage", () => {
  it("exercises event registry placeholder methods", () => {
    const registry = new PlaceholderEventRegistry();
    registry.register({
      eventId: "system.platform.bootstrap.completed",
      version: "1.0.0",
      category: "system",
      publisher: "platform-runtime",
    });
    registry.registerMany([
      {
        eventId: "user.session.started",
        version: "1.0.0",
        category: "user",
        publisher: "auth",
      },
    ]);
    expect(registry.has("missing")).toBe(false);
    expect(registry.get("missing")).toBeUndefined();
    expect(registry.list()).toEqual([]);
    expect(registry.getDiagnostics().registeredEventCount).toBe(0);
  });

  it("exercises event bus placeholder methods", () => {
    const bus = new PlaceholderEventBus();
    const subscriptionId = bus.subscribe({
      eventPattern: "capability.action.executed",
      handler: vi.fn(),
    });
    expect(subscriptionId).toBe("placeholder-subscription");
    expect(bus.unsubscribe(subscriptionId)).toBe(false);
    expect(bus.getDiagnostics().subscriberCount).toBe(0);
  });

  it("exercises notification registry placeholder methods", () => {
    const registry = new PlaceholderNotificationRegistry();
    registry.register({
      routeId: "platform.action.executed.inbox",
      eventPattern: "capability.action.executed",
      notificationKind: "inbox",
      channel: "in-app",
      templateRef: "action-executed",
      version: "1.0.0",
    });
    registry.registerMany([
      {
        routeId: "platform.action.executed.toast",
        eventPattern: "capability.action.executed",
        notificationKind: "toast",
        channel: "in-app",
        templateRef: "action-executed-toast",
        version: "1.0.0",
      },
    ]);
    expect(registry.has("missing")).toBe(false);
    expect(registry.get("missing")).toBeUndefined();
    expect(registry.list()).toEqual([]);
    expect(registry.getDiagnostics().registeredRouteCount).toBe(0);
  });

  it("exercises notification mapper and service placeholder methods", () => {
    const mapper = new PlaceholderNotificationMapper();
    const service = new PlaceholderNotificationService();

    expect(
      mapper.map({
        envelopeId: "env-3",
        eventId: "integration.connector.sync.failed",
        eventVersion: "1.0.0",
        category: "integration",
        correlationId: "corr-3",
        timestamp: "2026-07-03T00:00:00.000Z",
        publisher: "plane-connector",
        payload: { connectorId: "plane" },
      }).createdCount,
    ).toBe(0);

    expect(service.addNotifications([])).toEqual({ addedCount: 0, skippedCount: 0 });
    expect(service.getNotification("missing")).toBeUndefined();
    expect(service.clearNotifications()).toBe(0);

    expect(service.listNotifications({ unreadOnly: true, limit: 5 })).toEqual([]);
    expect(service.markRead("missing")).toBe(false);
    expect(service.markAllRead()).toBe(0);

    const listener = vi.fn();
    const unsubscribe = service.subscribe(listener);
    unsubscribe();
    expect(listener).not.toHaveBeenCalled();
  });

  it("exercises extended placeholder registry methods", () => {
    const registry = new PlaceholderEventRegistry();
    expect(registry.registerManyAtomic([]).ok).toBe(false);
    expect(registry.getMetadata("missing")).toBeUndefined();
    expect(registry.listMetadata()).toEqual([]);
    expect(registry.getRegistryMetadata().eventMetadata).toEqual([]);
    registry.recordManifestCapabilities(["example"]);
    registry.recordFrameworkVersion("1.0.0");
    registry.clear();
  });

  it("exercises extended placeholder notification registry methods", () => {
    const registry = createPlaceholderNotificationRegistry();
    expect(registry.registerManyAtomic([]).ok).toBe(false);
    expect(registry.getMetadata("missing")).toBeUndefined();
    expect(registry.listMetadata()).toEqual([]);
    expect(registry.getRegistryMetadata().routeMetadata).toEqual([]);
    registry.recordManifestCapabilities(["example"]);
    registry.recordFrameworkVersion("1.0.0");
    registry.clear();
  });

  it("default event registry is distinct from placeholder", () => {
    expect(new DefaultEventRegistry()).not.toBeInstanceOf(PlaceholderEventRegistry);
  });

  it("default notification registry is distinct from placeholder", () => {
    expect(new DefaultNotificationRegistry()).not.toBeInstanceOf(
      PlaceholderNotificationRegistry,
    );
  });
});
