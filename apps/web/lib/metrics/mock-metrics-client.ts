/**
 * In-memory Metrics client for tests (APZMETRICS-003).
 */

import type { MetricsClient } from "./metrics-client";
import type {
  MetricsCollectionResult,
  MetricsEntityViewModel,
  MetricsManagementPlaneViewModel,
} from "./metrics-types";

const NOW = "2026-07-17T00:00:00.000Z";

function entity(
  id: string,
  extra: Record<string, unknown> = {},
): MetricsEntityViewModel {
  return {
    id,
    tenantId: "tenant_mock",
    createdAt: NOW,
    updatedAt: NOW,
    createdBy: "user_mock",
    updatedBy: "user_mock",
    revision: 1,
    ...extra,
  };
}

function collection<T>(items: readonly T[]): MetricsCollectionResult<T> {
  return { items, page: { limit: items.length, hasMore: false } };
}

function mockFacet(sampleId: string, createId: string) {
  let current = entity(sampleId, { name: "mock", status: "active" });
  return {
    async list() {
      return collection([current]);
    },
    async get() {
      return current;
    },
    async create(input: Record<string, unknown>) {
      current = entity(createId, { ...input, revision: 1 });
      return current;
    },
    async update(_id: string, input: Record<string, unknown>) {
      current = { ...current, ...input, revision: (current.revision ?? 1) + 1 };
      return current;
    },
  };
}

const management: MetricsManagementPlaneViewModel = {
  metricsEnabled: true,
  managementPlaneReady: true,
  persistenceReady: true,
  formulaExecutionEnabled: false,
  kpiExecutionEnabled: false,
  providerIntegrationEnabled: false,
  workbenchReady: false,
  metadataCompleteness: "platform-services",
  registrationState: "registered",
  persistenceMode: "memory",
  capabilities: {
    metadataCrud: true,
    formulaExecution: false,
    kpiExecution: false,
    workbench: false,
  },
};

export function createMockMetricsClient(): MetricsClient {
  const client = {
    metrics: mockFacet("metrics_mock_1", "metrics_new"),
    definitions: mockFacet("definitions_mock_1", "definitions_new"),
    versions: mockFacet("versions_mock_1", "versions_new"),
    categories: mockFacet("categories_mock_1", "categories_new"),
    groups: mockFacet("groups_mock_1", "groups_new"),
    dimensions: mockFacet("dimensions_mock_1", "dimensions_new"),
    labels: mockFacet("labels_mock_1", "labels_new"),
    units: mockFacet("units_mock_1", "units_new"),
    formulas: mockFacet("formulas_mock_1", "formulas_new"),
    aggregations: mockFacet("aggregations_mock_1", "aggregations_new"),
    thresholds: mockFacet("thresholds_mock_1", "thresholds_new"),
    owners: mockFacet("owners_mock_1", "owners_new"),
    consumers: mockFacet("consumers_mock_1", "consumers_new"),
    retentionPolicies: mockFacet("retention-policies_mock_1", "retention-policies_new"),
    classifications: mockFacet("classifications_mock_1", "classifications_new"),
    dependencies: mockFacet("dependencies_mock_1", "dependencies_new"),
    kpis: mockFacet("kpis_mock_1", "kpis_new"),
    kpiGroups: mockFacet("kpi-groups_mock_1", "kpi-groups_new"),
    kpiTargets: mockFacet("kpi-targets_mock_1", "kpi-targets_new"),
    relationships: mockFacet("relationships_mock_1", "relationships_new"),
    metadata: mockFacet("metadata_mock_1", "metadata_new"),
    diagnostics: {
      async health() {
        return {
          status: "healthy" as const,
          persistenceMode: "memory" as const,
          formulaExecutionEnabled: false as const,
          kpiExecutionEnabled: false as const,
          providerIntegrationEnabled: false as const,
          checkedAt: NOW,
        };
      },
      async readiness() {
        return {
          ready: true,
          metricsEnabled: true as const,
          persistenceMode: "memory" as const,
          formulaExecutionEnabled: false as const,
          kpiExecutionEnabled: false as const,
          providerIntegrationEnabled: false as const,
          capabilities: ["metrics", "definitions", "kpis", "diagnostics"],
        };
      },
      async capabilities() {
        return management;
      },
      async management() {
        return management;
      },
    },
  };
  return {
    ...client,
    getHealth() {
      return client.diagnostics.health();
    },
    getReadiness() {
      return client.diagnostics.readiness();
    },
    getCapabilities() {
      return client.diagnostics.capabilities();
    },
  };
}
