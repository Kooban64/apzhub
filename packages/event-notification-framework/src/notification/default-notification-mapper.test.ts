import { describe, expect, it } from "vitest";

import { bootstrapNotificationRegistry } from "../catalogue/bootstrap-notification-registry";
import { createEventNotificationContext } from "../di/event-notification-context";
import type { EventEnvelope } from "../event/event-envelope";
import {
  createDefaultNotificationMapper,
  createDefaultNotificationMapperRegistry,
  DefaultNotificationMapper,
  renderNotificationTemplate,
  resolveNotificationRoutes,
} from "../notification";
import { createDefaultNotificationRegistry } from "../notification/default-notification-registry";

const BOOTSTRAP_EVENT: EventEnvelope = {
  envelopeId: "env-bootstrap-1",
  eventId: "system.platform.bootstrap.completed",
  eventVersion: "1.0.0",
  category: "system",
  correlationId: "corr-bootstrap",
  timestamp: "2026-07-04T10:00:00.000Z",
  publisher: "platform-runtime",
  payload: {
    bootstrapId: "boot-123",
  },
};

const HEALTH_EVENT: EventEnvelope = {
  envelopeId: "env-health-1",
  eventId: "system.platform.health.changed",
  eventVersion: "1.0.0",
  category: "system",
  correlationId: "corr-health",
  timestamp: "2026-07-04T10:05:00.000Z",
  publisher: "platform-runtime",
  payload: {
    status: "degraded",
  },
};

describe("renderNotificationTemplate", () => {
  it("substitutes event and payload placeholders", () => {
    const rendered = renderNotificationTemplate(
      "{{event.id}} / {{event.category}} / {{event.timestamp}} / {{payload.bootstrapId}}",
      BOOTSTRAP_EVENT,
    );

    expect(rendered).toBe(
      "system.platform.bootstrap.completed / system / 2026-07-04T10:00:00.000Z / boot-123",
    );
  });

  it("leaves unknown placeholders as empty strings", () => {
    expect(renderNotificationTemplate("{{payload.missing}}", BOOTSTRAP_EVENT)).toBe("");
  });
});

describe("resolveNotificationRoutes", () => {
  it("resolves exact and prefix wildcard event patterns", () => {
    const registry = createDefaultNotificationRegistry();
    registry.register({
      routeId: "exact.route",
      eventPattern: "capability.action.executed",
      notificationKind: "inbox",
      channel: "in-app",
      templateRef: "exact",
      version: "1.0.0",
      status: "active",
    });
    registry.register({
      routeId: "prefix.route",
      eventPattern: "capability.action.*",
      notificationKind: "toast",
      channel: "in-app",
      templateRef: "prefix",
      version: "1.0.0",
      status: "active",
    });

    const exactMatches = resolveNotificationRoutes(
      registry,
      "capability.action.executed",
    );
    expect(exactMatches.map((route) => route.routeId)).toEqual([
      "exact.route",
      "prefix.route",
    ]);

    const prefixOnly = resolveNotificationRoutes(
      registry,
      "capability.action.scheduled",
    );
    expect(prefixOnly.map((route) => route.routeId)).toEqual(["prefix.route"]);
  });

  it("skips planned and disabled routes by default", () => {
    const registry = createDefaultNotificationRegistry();
    registry.register({
      routeId: "planned.route",
      eventPattern: "system.platform.bootstrap.completed",
      notificationKind: "toast",
      channel: "in-app",
      templateRef: "planned",
      version: "1.0.0",
      status: "planned",
    });
    registry.register({
      routeId: "disabled.route",
      eventPattern: "system.platform.bootstrap.completed",
      notificationKind: "banner",
      channel: "in-app",
      templateRef: "disabled",
      version: "1.0.0",
      status: "disabled",
    });

    expect(
      resolveNotificationRoutes(registry, "system.platform.bootstrap.completed"),
    ).toEqual([]);
  });
});

describe("DefaultNotificationMapper", () => {
  it("creates immutable notification items for matching routes", () => {
    const bootstrap = bootstrapNotificationRegistry();
    const mapper = createDefaultNotificationMapper({
      notificationRegistry: bootstrap.registry,
    });

    const result = mapper.map(BOOTSTRAP_EVENT);

    expect(result.ok).toBe(true);
    expect(result.matchedRouteCount).toBe(2);
    expect(result.createdCount).toBe(2);
    expect(result.items.map((item) => item.routeId)).toEqual([
      "platform.inbox.system",
      "platform.toast.default",
    ]);

    const toast = result.items.find(
      (item) => item.routeId === "platform.toast.default",
    );
    expect(toast?.kind).toBe("toast");
    expect(toast?.eventId).toBe("system.platform.bootstrap.completed");
    expect(toast?.title).toBe("Platform bootstrap completed");
    expect(toast?.metadata.sourceEnvelopeId).toBe("env-bootstrap-1");
    expect(toast?.diagnostics.message).toContain("not delivered");
    expect(Object.isFrozen(toast)).toBe(true);
  });

  it("supports multiple matching routes for one event", () => {
    const registry = createDefaultNotificationRegistry();
    registry.registerMany([
      {
        routeId: "capability.action.executed.inbox",
        eventPattern: "capability.action.executed",
        notificationKind: "inbox",
        channel: "in-app",
        templateRef: "action-inbox",
        version: "1.0.0",
        titleTemplate: "Action completed",
        bodyTemplate: "{{payload.actionId}}",
      },
      {
        routeId: "capability.action.executed.toast",
        eventPattern: "capability.action.executed",
        notificationKind: "toast",
        channel: "in-app",
        templateRef: "action-toast",
        version: "1.0.0",
        titleTemplate: "Action toast",
      },
    ]);

    const mapper = createDefaultNotificationMapper({ notificationRegistry: registry });
    const result = mapper.map({
      ...BOOTSTRAP_EVENT,
      envelopeId: "env-action-1",
      eventId: "capability.action.executed",
      category: "capability",
      payload: { actionId: "platform.theme.toggle" },
    });

    expect(result.createdCount).toBe(2);
    const inbox = result.items.find(
      (item) => item.routeId === "capability.action.executed.inbox",
    );
    expect(inbox?.body).toBe("platform.theme.toggle");
  });

  it("returns empty items when no routes match", () => {
    const mapper = createDefaultNotificationMapper({
      notificationRegistry: createDefaultNotificationRegistry(),
    });

    const result = mapper.map(BOOTSTRAP_EVENT);

    expect(result.ok).toBe(true);
    expect(result.createdCount).toBe(0);
    expect(result.items).toEqual([]);
    expect(result.issues[0]?.code).toBe("NO_MATCH");
  });

  it("reports mapper diagnostics after mapping", () => {
    const bootstrap = bootstrapNotificationRegistry();
    const mapper = createDefaultNotificationMapper({
      notificationRegistry: bootstrap.registry,
    });

    mapper.map(HEALTH_EVENT);
    const diagnostics = mapper.getDiagnostics();

    expect(diagnostics.status).toBe("ready");
    expect(diagnostics.layerStatus).toBe("experiences");
    expect(diagnostics.lastMappedCount).toBe(2);
    expect(diagnostics.lastMatchedRouteCount).toBe(2);
    expect(diagnostics.lastEventId).toBe("system.platform.health.changed");
    expect(diagnostics.mappedCount).toBe(2);
  });

  it("uses NotificationMapperRegistry templates registered explicitly", () => {
    const registry = createDefaultNotificationRegistry();
    registry.register({
      routeId: "custom.route",
      eventPattern: "integration.connector.sync.failed",
      notificationKind: "banner",
      channel: "in-app",
      templateRef: "custom",
      version: "1.0.0",
    });

    const templateRegistry = createDefaultNotificationMapperRegistry();
    templateRegistry.register({
      routeId: "custom.route",
      titleTemplate: "Sync failed",
      bodyTemplate: "{{payload.connectorId}}",
    });

    const mapper = new DefaultNotificationMapper({
      notificationRegistry: registry,
      templateRegistry,
    });

    const result = mapper.map({
      ...BOOTSTRAP_EVENT,
      eventId: "integration.connector.sync.failed",
      category: "integration",
      payload: { connectorId: "salesforce" },
    });

    expect(result.createdCount).toBe(1);
    expect(result.items[0]?.title).toBe("Sync failed");
    expect(result.items[0]?.body).toBe("salesforce");
  });
});

describe("createEventNotificationContext DI", () => {
  it("defaults to DefaultNotificationMapper wired to notification registry", () => {
    const bootstrap = bootstrapNotificationRegistry();
    const context = createEventNotificationContext({
      notificationRegistry: bootstrap.registry,
    });

    expect(context.notificationMapper).toBeInstanceOf(DefaultNotificationMapper);
    expect(context.notificationMapper.getDiagnostics().layerStatus).toBe("experiences");

    const result = context.notificationMapper.map(BOOTSTRAP_EVENT);
    expect(result.createdCount).toBeGreaterThan(0);
  });
});
