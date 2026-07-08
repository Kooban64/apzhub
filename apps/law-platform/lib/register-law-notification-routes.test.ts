import { describe, expect, it } from "vitest";

import { createDefaultNotificationRegistry } from "@apzhub/event-notification-framework";

import { registerLawNotificationRoutes } from "./register-law-notification-routes";

describe("registerLawNotificationRoutes", () => {
  it("registers placeholder Law Platform notification routes", () => {
    const registry = createDefaultNotificationRegistry();

    registerLawNotificationRoutes(registry);

    expect(registry.has("legal.module.opened.inbox")).toBe(true);
    expect(registry.has("legal.feature.available.toast")).toBe(true);
    expect(registry.get("legal.module.opened.inbox")?.eventPattern).toBe(
      "legal-platform-module-opened",
    );
  });

  it("is idempotent", () => {
    const registry = createDefaultNotificationRegistry();

    registerLawNotificationRoutes(registry);
    registerLawNotificationRoutes(registry);

    expect(
      registry.list().filter((route) => route.routeId.startsWith("legal.")),
    ).toHaveLength(36);
  });

  it("registers Client Management notification routes", () => {
    const registry = createDefaultNotificationRegistry();
    registerLawNotificationRoutes(registry);

    expect(registry.has("legal.client.viewed.inbox")).toBe(true);
    expect(registry.has("legal.client.created.toast")).toBe(true);
    expect(registry.has("legal.client.edited.toast")).toBe(true);
    expect(registry.has("legal.client.deleted.toast")).toBe(true);
  });

  it("registers Matter Management notification routes", () => {
    const registry = createDefaultNotificationRegistry();
    registerLawNotificationRoutes(registry);

    expect(registry.has("legal.matter.viewed.inbox")).toBe(true);
    expect(registry.has("legal.matter.created.toast")).toBe(true);
    expect(registry.has("legal.matter.edited.toast")).toBe(true);
    expect(registry.has("legal.matter.archived.toast")).toBe(true);
    expect(registry.has("legal.matter.workspace.opened.inbox")).toBe(true);
  });

  it("registers Document Management notification routes", () => {
    const registry = createDefaultNotificationRegistry();
    registerLawNotificationRoutes(registry);

    expect(registry.has("legal.document.viewed.inbox")).toBe(true);
    expect(registry.has("legal.document.created.toast")).toBe(true);
    expect(registry.has("legal.document.edited.toast")).toBe(true);
    expect(registry.has("legal.document.archived.toast")).toBe(true);
  });

  it("registers Task Management notification routes", () => {
    const registry = createDefaultNotificationRegistry();
    registerLawNotificationRoutes(registry);

    expect(registry.has("legal.task.viewed.inbox")).toBe(true);
    expect(registry.has("legal.task.created.toast")).toBe(true);
    expect(registry.has("legal.task.edited.toast")).toBe(true);
    expect(registry.has("legal.task.completed.toast")).toBe(true);
    expect(registry.has("legal.task.archived.toast")).toBe(true);
  });

  it("registers Time Recording notification routes", () => {
    const registry = createDefaultNotificationRegistry();
    registerLawNotificationRoutes(registry);

    expect(registry.has("legal.time.viewed.inbox")).toBe(true);
    expect(registry.has("legal.time.created.toast")).toBe(true);
    expect(registry.has("legal.time.edited.toast")).toBe(true);
    expect(registry.has("legal.time.deleted.toast")).toBe(true);
  });

  it("registers Calendar Management notification routes", () => {
    const registry = createDefaultNotificationRegistry();
    registerLawNotificationRoutes(registry);

    expect(registry.has("legal.calendar.viewed.inbox")).toBe(true);
    expect(registry.has("legal.calendar.created.toast")).toBe(true);
    expect(registry.has("legal.calendar.edited.toast")).toBe(true);
    expect(registry.has("legal.calendar.cancelled.toast")).toBe(true);
  });

  it("registers Unified Legal Search notification routes", () => {
    const registry = createDefaultNotificationRegistry();
    registerLawNotificationRoutes(registry);

    expect(registry.has("legal.notification.search.executed")).toBe(true);
    expect(registry.has("legal.notification.search.result-opened")).toBe(true);
    expect(registry.has("legal.notification.search.filtered")).toBe(true);
  });
});
