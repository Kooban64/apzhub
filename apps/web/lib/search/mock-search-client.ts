/**
 * In-memory Platform Search client for tests / Workbench (APZSEARCH-007).
 */

import type { SearchClient } from "./search-client";
import type {
  SearchHitViewModel,
  SearchProviderViewModel,
  SearchResponseViewModel,
} from "./search-types";

export const MOCK_SEARCH_HIT: SearchHitViewModel = {
  id: "hit_mock_1",
  title: "Policy Handbook",
  entityType: "document",
  entityId: "doc_mock_1",
  productId: "documents",
  score: 0.92,
  classification: "internal",
  navigationTarget: "/workspace/documents",
  highlightSnippets: ["Policy Handbook"],
};

export const MOCK_SEARCH_PROVIDER: SearchProviderViewModel = {
  id: "prov_mock_1",
  kind: "meilisearch",
  label: "Mock Search Provider",
  enabled: true,
  active: true,
  ownership: "tenant",
};

function mockPage(hits: readonly SearchHitViewModel[]): SearchResponseViewModel {
  return {
    hits,
    page: 1,
    pageSize: 20,
    totalEstimated: hits.length,
    hasMore: false,
    suggestions: [{ text: "policy", kind: "query" }],
    providerId: MOCK_SEARCH_PROVIDER.id,
  };
}

export function createMockSearchClient(
  overrides: Partial<SearchClient> = {},
): SearchClient {
  const base: SearchClient = {
    async executeQuery(input) {
      const q = input.query.keywords?.toLowerCase() ?? "";
      const hits =
        !q || MOCK_SEARCH_HIT.title.toLowerCase().includes(q)
          ? [MOCK_SEARCH_HIT]
          : [];
      return mockPage(hits);
    },
    async validateQuery() {
      return { valid: true, issues: [] };
    },
    async suggest(input) {
      return {
        ...mockPage([]),
        suggestions: [{ text: input.keywords, kind: "query" }],
      };
    },
    async getCapabilities() {
      return {
        keywords: true,
        phrases: true,
        filters: true,
        sorting: true,
        pagination: true,
        facets: true,
        highlighting: true,
        suggestions: true,
        semantic: false,
        vector: false,
      };
    },
    async getHealth() {
      return {
        status: "available",
        checkedAt: "2026-07-14T12:00:00.000Z",
        message: "mock",
      };
    },
    async getReadiness() {
      return {
        executionEnabled: true,
        providerBound: true,
        healthy: true,
        providerId: MOCK_SEARCH_PROVIDER.id,
        providerKind: "meilisearch",
      };
    },
    async getDiagnostics() {
      return {
        health: {
          status: "available",
          checkedAt: "2026-07-14T12:00:00.000Z",
        },
        capabilities: await this.getCapabilities(),
        statistics: await this.getStatistics(),
        notes: ["mock"],
      };
    },
    async getStatistics() {
      return {
        declaredIndexCount: 1,
        declaredProviderCount: 1,
        declaredCollectionCount: 1,
        declaredSourceCount: 1,
      };
    },
    async listProviders() {
      return { items: [MOCK_SEARCH_PROVIDER], page: { limit: 1, hasMore: false } };
    },
    async getProvider(providerId) {
      return { ...MOCK_SEARCH_PROVIDER, id: providerId };
    },
    async listConfigurations() {
      return {
        items: [
          {
            id: "cfg_mock_1",
            label: "Default",
            status: "active",
            active: true,
            currentVersion: 1,
            defaultPageSize: 20,
            maxPageSize: 100,
          },
        ],
        page: { limit: 1, hasMore: false },
      };
    },
    async getConfiguration(configurationId) {
      return {
        id: configurationId,
        label: "Default",
        status: "active",
        active: true,
        currentVersion: 1,
        defaultPageSize: 20,
        maxPageSize: 100,
      };
    },
    async listCollections() {
      return {
        items: [
          {
            id: "col_mock_1",
            name: "Documents",
            scope: "tenant",
            enabled: true,
          },
        ],
        page: { limit: 1, hasMore: false },
      };
    },
    async listSources() {
      return {
        items: [
          {
            id: "src_mock_1",
            label: "Documents",
            productId: "documents",
            enabled: true,
          },
        ],
        page: { limit: 1, hasMore: false },
      };
    },
    async listScopes() {
      return {
        items: [
          {
            id: "scope_mock_1",
            scope: "tenant",
            label: "Tenant",
            enabled: true,
          },
        ],
        page: { limit: 1, hasMore: false },
      };
    },
    async listProfiles() {
      return {
        items: [{ id: "profile_mock_1", name: "Default" }],
        page: { limit: 1, hasMore: false },
      };
    },
    async getManagementHealth() {
      return this.getHealth();
    },
    async getManagementDiagnostics() {
      return this.getDiagnostics();
    },
    async listAudit() {
      return {
        items: [
          {
            id: "audit_mock_1",
            action: "search.query.execute",
            actorUserId: "user_1",
            createdAt: "2026-07-14T12:00:00.000Z",
          },
        ],
        page: { limit: 1, hasMore: false },
      };
    },
  };

  return { ...base, ...overrides };
}
