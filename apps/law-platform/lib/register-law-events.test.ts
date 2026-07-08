import { describe, expect, it } from "vitest";

import { createDefaultEventRegistry } from "@apzhub/event-notification-framework";

import { registerLawEvents } from "./register-law-events";

describe("registerLawEvents", () => {
  it("registers placeholder Law Platform event definitions", () => {
    const registry = createDefaultEventRegistry();
    registerLawEvents(registry);

    expect(registry.has("legal-platform-module-opened")).toBe(true);
    expect(registry.has("legal-platform-feature-available")).toBe(true);
    expect(registry.has("legal.client.viewed")).toBe(true);
    expect(registry.has("legal.client.created")).toBe(true);
    expect(registry.has("legal.client.updated")).toBe(true);
    expect(registry.has("legal.client.deleted")).toBe(true);
    expect(registry.has("legal.matter.viewed")).toBe(true);
    expect(registry.has("legal.matter.created")).toBe(true);
    expect(registry.has("legal.matter.updated")).toBe(true);
    expect(registry.has("legal.matter.archived")).toBe(true);
    expect(registry.has("legal.matter.workspace.opened")).toBe(true);
    expect(registry.has("legal.document.viewed")).toBe(true);
    expect(registry.has("legal.document.created")).toBe(true);
    expect(registry.has("legal.document.updated")).toBe(true);
    expect(registry.has("legal.document.archived")).toBe(true);
    expect(registry.has("legal.task.viewed")).toBe(true);
    expect(registry.has("legal.task.created")).toBe(true);
    expect(registry.has("legal.task.updated")).toBe(true);
    expect(registry.has("legal.task.completed")).toBe(true);
    expect(registry.has("legal.task.archived")).toBe(true);
    expect(registry.has("legal.time.viewed")).toBe(true);
    expect(registry.has("legal.time.created")).toBe(true);
    expect(registry.has("legal.time.updated")).toBe(true);
    expect(registry.has("legal.time.deleted")).toBe(true);
    expect(registry.has("legal.invoice.viewed")).toBe(true);
    expect(registry.has("legal.invoice.created")).toBe(true);
    expect(registry.has("legal.invoice.updated")).toBe(true);
    expect(registry.has("legal.invoice.cancelled")).toBe(true);
    expect(registry.has("legal.invoice.paid")).toBe(true);
    expect(registry.has("legal.calendar.viewed")).toBe(true);
    expect(registry.has("legal.calendar.created")).toBe(true);
    expect(registry.has("legal.calendar.updated")).toBe(true);
    expect(registry.has("legal.calendar.cancelled")).toBe(true);
    expect(registry.has("legal.search.executed")).toBe(true);
    expect(registry.has("legal.search.result.opened")).toBe(true);
    expect(registry.has("legal.search.filtered")).toBe(true);
  });
});
