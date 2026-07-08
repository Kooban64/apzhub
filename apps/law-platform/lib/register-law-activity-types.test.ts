import { describe, expect, it } from "vitest";

import { bootstrapActivityRegistry } from "@apzhub/activity-timeline-framework/server";

import { registerLawActivityTypes } from "./register-law-activity-types";

describe("registerLawActivityTypes", () => {
  it("registers placeholder Law Platform activity types", () => {
    const bootstrap = bootstrapActivityRegistry();
    registerLawActivityTypes(bootstrap.registry);

    expect(bootstrap.registry.has("legal.activity.dashboard.opened")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.clients.viewed")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.matters.list.opened")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.client.opened")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.client.created")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.client.edited")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.client.deleted")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.matter.opened")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.matter.created")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.matter.edited")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.matter.archived")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.document.opened")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.document.created")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.document.edited")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.document.archived")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.task.opened")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.task.created")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.task.edited")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.task.completed")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.task.archived")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.time.opened")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.time.created")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.time.edited")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.time.deleted")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.search.executed")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.search.result-opened")).toBe(true);
    expect(bootstrap.registry.has("legal.activity.search.filtered")).toBe(true);
  });
});
