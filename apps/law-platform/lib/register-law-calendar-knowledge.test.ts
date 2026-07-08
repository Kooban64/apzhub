import { describe, expect, it } from "vitest";

import { bootstrapKnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

import { registerLawCalendarKnowledge } from "./register-law-calendar-knowledge";

describe("registerLawCalendarKnowledge", () => {
  it("registers calendar help sources", () => {
    const bootstrap = bootstrapKnowledgeRegistry();
    registerLawCalendarKnowledge(bootstrap.registry);

    expect(bootstrap.registry.hasSource("legal.help.calendar.list")).toBe(true);
    expect(bootstrap.registry.hasSource("legal.help.calendar.create")).toBe(true);
    expect(bootstrap.registry.hasSource("legal.help.calendar.detail")).toBe(true);
  });
});
