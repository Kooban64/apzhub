import { describe, expect, it } from "vitest";

import { bootstrapKnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

import { ClientFactory } from "@apzhub/legal-business-core";

import { getSharedClientRepository } from "../clients/in-memory-client-repository";
import {
  createLawPersistenceContext,
  DEFAULT_LAW_TENANT_ID,
  resetLawPersistenceScope,
  runWithLawPersistenceContextAsync,
} from "../persistence";
import { LEGAL_CLIENT_SEARCH_SOURCE_ID } from "./legal-search-source-ids";
import {
  registerLegalSearchKnowledgeProviders,
  registerLegalSearchKnowledgeSources,
} from "./register-legal-search-knowledge";

describe("legal search tenant isolation", () => {
  it("returns empty results without explicit persistence tenant binding", async () => {
    resetLawPersistenceScope();

    const bootstrap = bootstrapKnowledgeRegistry();
    registerLegalSearchKnowledgeSources(bootstrap.registry);
    registerLegalSearchKnowledgeProviders(bootstrap.registry);

    const provider = bootstrap.registry.getProvider(LEGAL_CLIENT_SEARCH_SOURCE_ID);
    expect(provider).toBeDefined();

    const result = await provider!.query({ text: "Harbour" }, {});

    expect(result.status).toBe("empty");
    expect(result.documents).toHaveLength(0);
  });

  it("returns results when persistence tenant scope is explicitly bound", async () => {
    resetLawPersistenceScope();

    const bootstrap = bootstrapKnowledgeRegistry();
    registerLegalSearchKnowledgeSources(bootstrap.registry);
    registerLegalSearchKnowledgeProviders(bootstrap.registry);
    const provider = bootstrap.registry.getProvider(LEGAL_CLIENT_SEARCH_SOURCE_ID)!;

    const tenantContext = createLawPersistenceContext({ tenantId: DEFAULT_LAW_TENANT_ID });

    const client = ClientFactory.create({
      displayName: "Scoped Search Client",
      clientType: "individual",
      status: "active",
    });

    const result = await runWithLawPersistenceContextAsync(tenantContext, async () => {
      getSharedClientRepository().create(client);
      return provider.query({ text: "Scoped" }, {});
    });

    expect(result.documents).toHaveLength(1);
    expect(result.documents[0]?.title).toBe("Scoped Search Client");
  });
});
