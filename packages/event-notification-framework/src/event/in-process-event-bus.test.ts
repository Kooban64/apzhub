import { describe, expect, it, vi } from "vitest";

import type { EventDescriptor } from "./event-descriptor";
import type { EventEnvelope } from "./event-envelope";
import {
  createDefaultEventRegistry,
  createInProcessEventBus,
  matchesEventPattern,
  validateEventEnvelope,
} from "./index";
import { createEventNotificationContext } from "../di/event-notification-context";

const ENVELOPE_ID = "550e8400-e29b-41d4-a716-446655440000";
const CAUSATION_ID = "6ba7b811-9dad-41d1-80b4-00c04fd430c8";

function sampleEvent(overrides: Partial<EventDescriptor> = {}): EventDescriptor {
  return {
    eventId: "capability.action.executed",
    version: "1.0.0",
    category: "capability",
    publisher: "command-framework",
    sourceCapability: "command-framework",
    ...overrides,
  };
}

function sampleEnvelope(overrides: Partial<EventEnvelope> = {}): EventEnvelope {
  return {
    envelopeId: ENVELOPE_ID,
    eventId: "capability.action.executed",
    eventVersion: "1.0.0",
    category: "capability",
    correlationId: "req-abc-123",
    timestamp: "2026-07-03T18:00:00.000Z",
    publisher: "command-framework",
    payload: { actionId: "platform.theme.toggle" },
    ...overrides,
  };
}

describe("matchesEventPattern", () => {
  it("matches exact event ids", () => {
    expect(
      matchesEventPattern("capability.action.executed", "capability.action.executed"),
    ).toBe(true);
    expect(
      matchesEventPattern("capability.action.executed", "capability.action.failed"),
    ).toBe(false);
  });

  it("matches prefix patterns ending in .*", () => {
    expect(
      matchesEventPattern("capability.action.*", "capability.action.executed"),
    ).toBe(true);
    expect(matchesEventPattern("capability.action.*", "capability.action")).toBe(true);
    expect(
      matchesEventPattern("capability.action.*", "capability.other.executed"),
    ).toBe(false);
  });
});

describe("validateEventEnvelope", () => {
  it("accepts a valid envelope for a registered event", () => {
    const registry = createDefaultEventRegistry();
    registry.register(sampleEvent());

    const result = validateEventEnvelope(sampleEnvelope(), registry);
    expect(result.ok).toBe(true);
  });

  it("rejects unregistered event ids", () => {
    const registry = createDefaultEventRegistry();
    const result = validateEventEnvelope(sampleEnvelope(), registry);

    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("EVENT_NOT_REGISTERED");
  });

  it("rejects version and category mismatches", () => {
    const registry = createDefaultEventRegistry();
    registry.register(sampleEvent());

    expect(
      validateEventEnvelope(sampleEnvelope({ eventVersion: "2.0.0" }), registry)
        .errorCode,
    ).toBe("INVALID_ENVELOPE");
    expect(
      validateEventEnvelope(sampleEnvelope({ category: "system" }), registry).errorCode,
    ).toBe("INVALID_ENVELOPE");
  });

  it("rejects unauthorized publishers", () => {
    const registry = createDefaultEventRegistry();
    registry.register(sampleEvent());

    const result = validateEventEnvelope(
      sampleEnvelope({ publisher: "unknown-service" }),
      registry,
    );
    expect(result.ok).toBe(false);
    expect(result.issue?.code).toBe("PUBLISHER_UNAUTHORIZED");
  });

  it("rejects invalid envelope ids and payloads", () => {
    const registry = createDefaultEventRegistry();
    registry.register(sampleEvent());

    expect(
      validateEventEnvelope(sampleEnvelope({ envelopeId: "not-a-uuid" }), registry)
        .issue?.code,
    ).toBe("INVALID_UUID");
    expect(
      validateEventEnvelope(
        sampleEnvelope({ payload: null as unknown as EventEnvelope["payload"] }),
        registry,
      ).issue?.code,
    ).toBe("INVALID_PAYLOAD");
    expect(
      validateEventEnvelope(sampleEnvelope({ causationId: CAUSATION_ID }), registry).ok,
    ).toBe(true);
  });
});

describe("InProcessEventBus", () => {
  it("publishes registered events to subscribers", () => {
    const registry = createDefaultEventRegistry();
    registry.register(sampleEvent());
    const bus = createInProcessEventBus({ registry });

    const handler = vi.fn();
    bus.subscribe({ eventPattern: "capability.action.executed", handler });

    const result = bus.publish(sampleEnvelope());

    expect(result.ok).toBe(true);
    expect(result.subscriberCount).toBe(1);
    expect(result.deliveredCount).toBe(1);
    expect(result.failedSubscriberCount).toBe(0);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0]?.payload).toEqual({
      actionId: "platform.theme.toggle",
    });
    expect(Object.isFrozen(handler.mock.calls[0]?.[0])).toBe(true);
  });

  it("rejects unregistered events without dispatching", () => {
    const registry = createDefaultEventRegistry();
    const bus = createInProcessEventBus({ registry });
    const handler = vi.fn();
    bus.subscribe({ eventPattern: "capability.action.executed", handler });

    const result = bus.publish(sampleEnvelope());

    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("EVENT_NOT_REGISTERED");
    expect(handler).not.toHaveBeenCalled();
  });

  it("supports subscribe and unsubscribe", () => {
    const registry = createDefaultEventRegistry();
    registry.register(sampleEvent());
    const bus = createInProcessEventBus({ registry });

    const handler = vi.fn();
    const subscriptionId = bus.subscribe({
      eventPattern: "capability.action.executed",
      handler,
    });

    expect(bus.getDiagnostics().subscriptionCount).toBe(1);
    expect(bus.unsubscribe(subscriptionId)).toBe(true);
    expect(bus.unsubscribe(subscriptionId)).toBe(false);
    expect(bus.getDiagnostics().subscriptionCount).toBe(0);

    bus.publish(sampleEnvelope());
    expect(handler).not.toHaveBeenCalled();
  });

  it("dispatches to multiple subscribers including pattern matches", () => {
    const registry = createDefaultEventRegistry();
    registry.register(sampleEvent());
    registry.register(
      sampleEvent({
        eventId: "capability.action.failed",
        label: "Action Failed",
      }),
    );
    const bus = createInProcessEventBus({ registry });

    const exact = vi.fn();
    const prefix = vi.fn();
    bus.subscribe({ eventPattern: "capability.action.executed", handler: exact });
    bus.subscribe({ eventPattern: "capability.action.*", handler: prefix });

    bus.publish(sampleEnvelope());
    bus.publish(
      sampleEnvelope({
        envelopeId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        eventId: "capability.action.failed",
      }),
    );

    expect(exact).toHaveBeenCalledTimes(1);
    expect(prefix).toHaveBeenCalledTimes(2);
  });

  it("isolates subscriber failures", () => {
    const registry = createDefaultEventRegistry();
    registry.register(sampleEvent());
    const bus = createInProcessEventBus({ registry });

    const failing = vi.fn(() => {
      throw new Error("subscriber failed");
    });
    const succeeding = vi.fn();
    bus.subscribe({ eventPattern: "capability.action.executed", handler: failing });
    bus.subscribe({ eventPattern: "capability.action.executed", handler: succeeding });

    const result = bus.publish(sampleEnvelope());

    expect(result.ok).toBe(true);
    expect(result.subscriberCount).toBe(2);
    expect(result.deliveredCount).toBe(1);
    expect(result.failedSubscriberCount).toBe(1);
    expect(succeeding).toHaveBeenCalledTimes(1);
    expect(bus.getDiagnostics().subscriberFailureCount).toBe(1);
  });

  it("reports bus diagnostics after publish failures", () => {
    const registry = createDefaultEventRegistry();
    const bus = createInProcessEventBus({ registry });

    bus.publish(sampleEnvelope());

    const diagnostics = bus.getDiagnostics();
    expect(diagnostics.layerStatus).toBe("audit");
    expect(diagnostics.lastPublishStatus).toBe("failed");
    expect(diagnostics.failedPublishCount).toBe(1);
    expect(diagnostics.lastPublishEnvelopeId).toBe(ENVELOPE_ID);
    expect(diagnostics.message).toContain("InProcessEventBus");
  });

  it("wires through createEventNotificationContext with shared registry", () => {
    const context = createEventNotificationContext();
    context.eventRegistry.register(sampleEvent());

    const handler = vi.fn();
    context.eventBus.subscribe({ eventPattern: "capability.action.executed", handler });

    const result = context.eventBus.publish(sampleEnvelope());
    expect(result.ok).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
