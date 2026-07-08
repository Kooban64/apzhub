import { describe, expect, it } from "vitest";

import { NOTIFICATION_KINDS } from "../types/notification-kind";
import type { NotificationDescriptor } from "./notification-descriptor";
import {
  NotificationRegistryDuplicateError,
  NotificationRegistryNotFoundError,
  NotificationRegistryValidationError,
  createDefaultNotificationRegistry,
  validateNotificationDescriptor,
} from "./index";
import { createEventNotificationContext } from "../di/event-notification-context";

function sampleRoute(
  overrides: Partial<NotificationDescriptor> = {},
): NotificationDescriptor {
  return {
    routeId: "platform.action.executed.inbox",
    eventPattern: "capability.action.executed",
    notificationKind: "inbox",
    channel: "in-app",
    templateRef: "action-executed",
    version: "1.0.0",
    label: "Action Executed Inbox",
    description: "Inbox notification when an action completes",
    tags: ["action", "inbox"],
    ...overrides,
  };
}

describe("validateNotificationDescriptor", () => {
  it("accepts valid descriptors", () => {
    expect(() => validateNotificationDescriptor(sampleRoute())).not.toThrow();
  });

  it("rejects invalid route id pattern", () => {
    expect(() =>
      validateNotificationDescriptor(sampleRoute({ routeId: "Bad_ID" })),
    ).toThrow(NotificationRegistryValidationError);
  });

  it("rejects invalid notification kind", () => {
    expect(() =>
      validateNotificationDescriptor(
        sampleRoute({
          notificationKind: "invalid" as NotificationDescriptor["notificationKind"],
        }),
      ),
    ).toThrow(NotificationRegistryValidationError);
  });

  it("supports all EN-001 notification kinds", () => {
    const registry = createDefaultNotificationRegistry();

    for (const kind of NOTIFICATION_KINDS) {
      const routeId = `platform.example.${kind}`;
      registry.register(
        sampleRoute({
          routeId,
          notificationKind: kind,
          channel:
            kind === "email" || kind === "sms" || kind === "push" || kind === "webhook"
              ? kind === "email"
                ? "email"
                : kind === "sms"
                  ? "sms"
                  : kind === "push"
                    ? "push"
                    : "webhook"
              : "in-app",
        }),
      );
      expect(registry.get(routeId)?.notificationKind).toBe(kind);
    }

    expect(registry.list()).toHaveLength(NOTIFICATION_KINDS.length);
  });
});

describe("DefaultNotificationRegistry registration", () => {
  it("registers routes and lists immutable snapshots", () => {
    const registry = createDefaultNotificationRegistry();
    registry.register(sampleRoute());

    const listed = registry.list();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.routeId).toBe("platform.action.executed.inbox");
    expect(Object.isFrozen(listed)).toBe(true);
    expect(Object.isFrozen(listed[0]?.tags)).toBe(true);
  });

  it("throws on duplicate registration", () => {
    const registry = createDefaultNotificationRegistry();
    registry.register(sampleRoute());

    expect(() => registry.register(sampleRoute())).toThrow(
      NotificationRegistryDuplicateError,
    );
  });

  it("registerMany rejects batch duplicates", () => {
    const registry = createDefaultNotificationRegistry();

    expect(() => registry.registerMany([sampleRoute(), sampleRoute()])).toThrow(
      NotificationRegistryDuplicateError,
    );
  });

  it("registerManyAtomic rejects invalid descriptors without registering", () => {
    const registry = createDefaultNotificationRegistry();

    const result = registry.registerManyAtomic([
      sampleRoute(),
      sampleRoute({ routeId: "invalid id" }),
    ]);

    expect(result.ok).toBe(false);
    expect(result.registeredCount).toBe(0);
    expect(result.errors[0]?.code).toBe("VALIDATION");
    expect(registry.list()).toHaveLength(0);
  });

  it("registerManyAtomic rejects duplicates without registering", () => {
    const registry = createDefaultNotificationRegistry();
    registry.register(sampleRoute());

    const result = registry.registerManyAtomic([sampleRoute()]);

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
    expect(registry.list()).toHaveLength(1);
  });

  it("replace updates an existing route", () => {
    const registry = createDefaultNotificationRegistry();
    registry.register(sampleRoute());

    registry.replace(
      sampleRoute({
        label: "Updated Label",
        version: "1.1.0",
      }),
    );

    expect(registry.get("platform.action.executed.inbox")?.label).toBe("Updated Label");
    expect(registry.getMetadata("platform.action.executed.inbox")?.version).toBe(
      "1.1.0",
    );
  });

  it("replace throws when route is missing", () => {
    const registry = createDefaultNotificationRegistry();

    expect(() => registry.replace(sampleRoute())).toThrow(
      NotificationRegistryNotFoundError,
    );
  });
});

describe("DefaultNotificationRegistry metadata", () => {
  it("exposes metadata with event mapping reference and source", () => {
    const registry = createDefaultNotificationRegistry();
    registry.register(
      sampleRoute({
        source: "builtin",
        sourceCapability: "command-framework",
        schemaVersion: "1.0.0",
      }),
    );

    const metadata = registry.getMetadata("platform.action.executed.inbox");
    expect(metadata?.routeId).toBe("platform.action.executed.inbox");
    expect(metadata?.notificationKind).toBe("inbox");
    expect(metadata?.channel).toBe("in-app");
    expect(metadata?.eventPattern).toBe("capability.action.executed");
    expect(metadata?.source).toBe("builtin");
    expect(metadata?.schemaVersion).toBe("1.0.0");
    expect(metadata?.tags).toEqual(["action", "inbox"]);
    expect(metadata?.diagnostics.validationIssueCount).toBe(0);
  });

  it("returns registry metadata snapshot", () => {
    const registry = createDefaultNotificationRegistry();
    registry.register(sampleRoute());
    registry.recordFrameworkVersion("3.0.0");

    const metadata = registry.getRegistryMetadata();
    expect(metadata.routeMetadata).toHaveLength(1);
    expect(metadata.frameworkVersion).toBe("3.0.0");
    expect(Object.isFrozen(metadata.routeMetadata)).toBe(true);
  });
});

describe("DefaultNotificationRegistry diagnostics", () => {
  it("reports ready diagnostics with kind and channel counts", () => {
    const registry = createDefaultNotificationRegistry();
    registry.register(sampleRoute());
    registry.register(
      sampleRoute({
        routeId: "platform.action.executed.email",
        notificationKind: "email",
        channel: "email",
      }),
    );

    const diagnostics = registry.getDiagnostics();
    expect(diagnostics.status).toBe("ready");
    expect(diagnostics.layerStatus).toBe("experiences");
    expect(diagnostics.registeredRouteCount).toBe(2);
    expect(diagnostics.kindCounts.inbox).toBe(1);
    expect(diagnostics.kindCounts.email).toBe(1);
    expect(diagnostics.channelCounts["in-app"]).toBe(1);
    expect(diagnostics.channelCounts.email).toBe(1);
    expect(diagnostics.message).toContain("metadata only");
  });

  it("reports empty diagnostics for new registry", () => {
    const registry = createDefaultNotificationRegistry();
    const diagnostics = registry.getDiagnostics();

    expect(diagnostics.status).toBe("empty");
    expect(diagnostics.registeredRouteCount).toBe(0);
    expect(diagnostics.routeIds).toEqual([]);
  });
});

describe("createEventNotificationContext DI", () => {
  it("defaults to DefaultNotificationRegistry", () => {
    const context = createEventNotificationContext();

    context.notificationRegistry.register(sampleRoute());
    expect(context.notificationRegistry.has("platform.action.executed.inbox")).toBe(
      true,
    );
    expect(context.getDiagnostics().notificationRegistry.layerStatus).toBe(
      "experiences",
    );
    expect(context.getDiagnostics().notificationMapper.message).toContain(
      "DefaultNotificationMapper",
    );
  });

  it("allows notification registry injection for tests", () => {
    const registry = createDefaultNotificationRegistry();
    const context = createEventNotificationContext({ notificationRegistry: registry });

    expect(context.notificationRegistry).toBe(registry);
  });
});
