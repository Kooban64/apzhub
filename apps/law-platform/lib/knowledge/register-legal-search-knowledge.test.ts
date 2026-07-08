import { describe, expect, it } from "vitest";

import { bootstrapKnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

import {
  LEGAL_CLIENT_SEARCH_SOURCE_ID,
  LEGAL_DOCUMENT_SEARCH_SOURCE_ID,
  LEGAL_MATTER_SEARCH_SOURCE_ID,
  LEGAL_TASK_SEARCH_SOURCE_ID,
  LEGAL_TIME_SEARCH_SOURCE_ID,
  LEGAL_CALENDAR_SEARCH_SOURCE_ID,
} from "./legal-search-source-ids";
import {
  registerLegalSearchKnowledgeProviders,
  registerLegalSearchKnowledgeSources,
} from "./register-legal-search-knowledge";

describe("registerLegalSearchKnowledge", () => {
  it("registers unified legal search sources and providers", () => {
    const bootstrap = bootstrapKnowledgeRegistry();
    registerLegalSearchKnowledgeSources(bootstrap.registry);

    expect(bootstrap.registry.hasSource(LEGAL_CLIENT_SEARCH_SOURCE_ID)).toBe(true);
    expect(bootstrap.registry.hasSource(LEGAL_MATTER_SEARCH_SOURCE_ID)).toBe(true);
    expect(bootstrap.registry.hasSource(LEGAL_DOCUMENT_SEARCH_SOURCE_ID)).toBe(true);
    expect(bootstrap.registry.hasSource(LEGAL_TASK_SEARCH_SOURCE_ID)).toBe(true);
    expect(bootstrap.registry.hasSource(LEGAL_TIME_SEARCH_SOURCE_ID)).toBe(true);
    expect(bootstrap.registry.hasSource(LEGAL_CALENDAR_SEARCH_SOURCE_ID)).toBe(true);

    registerLegalSearchKnowledgeProviders(bootstrap.registry);

    expect(bootstrap.registry.getProvider(LEGAL_CLIENT_SEARCH_SOURCE_ID)).toBeDefined();
    expect(bootstrap.registry.getProvider(LEGAL_MATTER_SEARCH_SOURCE_ID)).toBeDefined();
    expect(
      bootstrap.registry.getProvider(LEGAL_DOCUMENT_SEARCH_SOURCE_ID),
    ).toBeDefined();
    expect(bootstrap.registry.getProvider(LEGAL_TASK_SEARCH_SOURCE_ID)).toBeDefined();
    expect(bootstrap.registry.getProvider(LEGAL_TIME_SEARCH_SOURCE_ID)).toBeDefined();
    expect(
      bootstrap.registry.getProvider(LEGAL_CALENDAR_SEARCH_SOURCE_ID),
    ).toBeDefined();
  });

  it("is idempotent", () => {
    const bootstrap = bootstrapKnowledgeRegistry();
    registerLegalSearchKnowledgeProviders(bootstrap.registry);
    registerLegalSearchKnowledgeProviders(bootstrap.registry);

    expect(
      bootstrap.registry
        .listSources()
        .filter((source) => source.id.endsWith(".search")),
    ).toHaveLength(8);
  });
});
