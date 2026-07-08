import { describe, expect, it } from "vitest";

import { createDefaultKnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

import { registerLawBillingKnowledge } from "./register-law-billing-knowledge";

describe("registerLawBillingKnowledge", () => {
  it("registers Billing help sources", () => {
    const registry = createDefaultKnowledgeRegistry();
    registerLawBillingKnowledge(registry);

    expect(registry.hasSource("legal.help.billing.list")).toBe(true);
    expect(registry.hasSource("legal.help.billing.create")).toBe(true);
    expect(registry.hasSource("legal.help.billing.detail")).toBe(true);
  });

  it("is idempotent", () => {
    const registry = createDefaultKnowledgeRegistry();
    registerLawBillingKnowledge(registry);
    registerLawBillingKnowledge(registry);

    expect(
      registry
        .listSources()
        .filter((source) => source.id.startsWith("legal.help.billing.")),
    ).toHaveLength(3);
  });
});
