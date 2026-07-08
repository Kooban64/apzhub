import { describe, expect, it } from "vitest";

import type { EventDescriptor } from "./event-descriptor";
import { CANONICAL_EVENT_CATEGORIES } from "../types/event-category";
import {
  EventRegistryDuplicateError,
  EventRegistryNotFoundError,
  EventRegistryValidationError,
  createDefaultEventRegistry,
  validateEventDescriptor,
} from "./index";

function sampleEvent(overrides: Partial<EventDescriptor> = {}): EventDescriptor {
  return {
    eventId: "capability.action.executed",
    version: "1.0.0",
    category: "capability",
    publisher: "command-framework",
    label: "Action Executed",
    description: "Emitted after successful action execution",
    tags: ["action", "audit"],
    subscribers: ["notifications", "audit"],
    ...overrides,
  };
}

describe("validateEventDescriptor", () => {
  it("accepts valid descriptors", () => {
    expect(() => validateEventDescriptor(sampleEvent())).not.toThrow();
  });

  it("rejects invalid event id pattern", () => {
    expect(() => validateEventDescriptor(sampleEvent({ eventId: "Bad_ID" }))).toThrow(
      EventRegistryValidationError,
    );
  });

  it("rejects invalid semver version", () => {
    expect(() => validateEventDescriptor(sampleEvent({ version: "v1" }))).toThrow(
      EventRegistryValidationError,
    );
  });

  it("rejects missing publisher", () => {
    expect(() =>
      validateEventDescriptor(
        sampleEvent({ publisher: "  ", sourceCapability: undefined }),
      ),
    ).toThrow(EventRegistryValidationError);
  });
});

describe("DefaultEventRegistry registration", () => {
  it("registers events and lists immutable snapshots", () => {
    const registry = createDefaultEventRegistry();
    registry.register(sampleEvent());

    const listed = registry.list();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.eventId).toBe("capability.action.executed");
    expect(Object.isFrozen(listed)).toBe(true);
    expect(Object.isFrozen(listed[0]?.tags)).toBe(true);
  });

  it("supports all canonical EN-001 categories", () => {
    const registry = createDefaultEventRegistry();

    for (const category of CANONICAL_EVENT_CATEGORIES) {
      const eventId = `${category}.example.event`;
      registry.register(
        sampleEvent({
          eventId,
          category,
          publisher: `${category}-service`,
        }),
      );
      expect(registry.get(eventId)?.category).toBe(category);
    }

    expect(registry.list()).toHaveLength(CANONICAL_EVENT_CATEGORIES.length);
  });

  it("throws on duplicate registration", () => {
    const registry = createDefaultEventRegistry();
    registry.register(sampleEvent());

    expect(() => registry.register(sampleEvent())).toThrow(EventRegistryDuplicateError);
  });

  it("registerMany rejects batch duplicates", () => {
    const registry = createDefaultEventRegistry();

    expect(() => registry.registerMany([sampleEvent(), sampleEvent()])).toThrow(
      EventRegistryDuplicateError,
    );
  });

  it("registerManyAtomic rejects invalid descriptors without registering", () => {
    const registry = createDefaultEventRegistry();

    const result = registry.registerManyAtomic([
      sampleEvent(),
      sampleEvent({ eventId: "invalid id" }),
    ]);

    expect(result.ok).toBe(false);
    expect(result.registeredCount).toBe(0);
    expect(result.errors[0]?.code).toBe("VALIDATION");
    expect(registry.list()).toHaveLength(0);
  });

  it("registerManyAtomic rejects duplicates without registering", () => {
    const registry = createDefaultEventRegistry();
    registry.register(sampleEvent());

    const result = registry.registerManyAtomic([sampleEvent()]);

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
    expect(registry.list()).toHaveLength(1);
  });

  it("registerManyAtomic registers valid batch atomically", () => {
    const registry = createDefaultEventRegistry();

    const result = registry.registerManyAtomic([
      sampleEvent({
        eventId: "system.platform.bootstrap.completed",
        category: "system",
      }),
      sampleEvent({ eventId: "user.session.started", category: "user" }),
      sampleEvent({
        eventId: "integration.connector.sync.failed",
        category: "integration",
      }),
    ]);

    expect(result.ok).toBe(true);
    expect(result.registeredCount).toBe(3);
    expect(registry.list()).toHaveLength(3);
  });

  it("replace updates existing descriptor", () => {
    const registry = createDefaultEventRegistry();
    registry.register(sampleEvent());

    registry.replace(
      sampleEvent({
        description: "Updated description",
        stability: "experimental",
      }),
    );

    expect(registry.get("capability.action.executed")?.description).toBe(
      "Updated description",
    );
    expect(registry.getMetadata("capability.action.executed")?.stability).toBe(
      "experimental",
    );
  });

  it("replace throws when event is missing", () => {
    const registry = createDefaultEventRegistry();

    expect(() => registry.replace(sampleEvent())).toThrow(EventRegistryNotFoundError);
  });
});

describe("DefaultEventRegistry metadata", () => {
  it("builds metadata with defaults and diagnostics", () => {
    const registry = createDefaultEventRegistry();
    registry.register(
      sampleEvent({
        sourceCapability: "command-framework",
        schemaVersion: "1.1.0",
        visibility: "internal",
      }),
    );

    const metadata = registry.getMetadata("capability.action.executed");
    expect(metadata).toMatchObject({
      eventId: "capability.action.executed",
      category: "capability",
      version: "1.0.0",
      sourceCapability: "command-framework",
      schemaVersion: "1.1.0",
      visibility: "internal",
      stability: "stable",
      status: "active",
    });
    expect(metadata?.tags).toEqual(["action", "audit"]);
    expect(metadata?.diagnostics.subscriberCount).toBe(2);
    expect(Object.isFrozen(metadata)).toBe(true);
  });

  it("exposes registry metadata snapshot", () => {
    const registry = createDefaultEventRegistry();
    registry.register(sampleEvent());
    registry.recordManifestCapabilities(["example-capability", "command-framework"]);
    registry.recordFrameworkVersion("0.6.0-scaffold");

    const metadata = registry.getRegistryMetadata();
    expect(metadata.manifestCapabilityCount).toBe(2);
    expect(metadata.frameworkVersion).toBe("0.6.0-scaffold");
    expect(metadata.eventMetadata).toHaveLength(1);
  });
});

describe("DefaultEventRegistry diagnostics and DI", () => {
  it("reports empty then ready diagnostics", () => {
    const registry = createDefaultEventRegistry();

    expect(registry.getDiagnostics()).toMatchObject({
      status: "empty",
      registeredEventCount: 0,
      layerStatus: "audit",
    });

    registry.register(sampleEvent());

    expect(registry.getDiagnostics()).toMatchObject({
      status: "ready",
      registeredEventCount: 1,
      categoryCounts: { capability: 1 },
    });
  });

  it("returns defensive copies from get", () => {
    const registry = createDefaultEventRegistry();
    registry.register(sampleEvent());

    const first = registry.get("capability.action.executed");
    const second = registry.get("capability.action.executed");
    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });

  it("clears registry state", () => {
    const registry = createDefaultEventRegistry();
    registry.register(sampleEvent());
    registry.recordFrameworkVersion("1.0.0");
    registry.clear();

    expect(registry.list()).toHaveLength(0);
    expect(registry.getDiagnostics().status).toBe("empty");
    expect(registry.getRegistryMetadata().frameworkVersion).toBeUndefined();
  });
});
