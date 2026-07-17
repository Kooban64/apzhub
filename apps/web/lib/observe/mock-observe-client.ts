/**
 * In-memory Observability client for tests (APZOBSERVE-003).
 */

import type { ObserveClient } from "./observe-client";
import type {
  ObserveCollectionResult,
  ObserveEntityViewModel,
  ObserveManagementPlaneViewModel,
} from "./observe-types";

const NOW = "2026-07-17T00:00:00.000Z";

function entity(id: string, extra: Record<string, unknown> = {}): ObserveEntityViewModel {
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

function collection<T>(items: readonly T[]): ObserveCollectionResult<T> {
  return { items, page: { limit: items.length, hasMore: false } };
}

function mockFacet(sampleId: string, createId: string) {
  let current = entity(sampleId, { name: "mock", status: "healthy", providerKind: "internal" });
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

const management: ObserveManagementPlaneViewModel = {
  observeEnabled: true,
  managementPlaneReady: true,
  persistenceReady: true,
  providerExecutionEnabled: false,
  workbenchReady: false,
  grafanaIntegrationReady: false,
  prometheusIntegrationReady: false,
  lokiIntegrationReady: false,
  otelIntegrationReady: false,
  alertManagerIntegrationReady: false,
  metadataCompleteness: "foundation",
  registrationState: "registered",
  persistenceMode: "memory",
  capabilities: {
    metadataCrud: true,
    providerExecution: false,
    workbench: false,
  },
};

export function createMockObserveClient(): ObserveClient {
  const healthChecks = mockFacet("hc_mock_1", "hc_new");
  return {
    healthChecks,
    readinessChecks: mockFacet("rc_mock_1", "rc_new"),
    livenessChecks: mockFacet("lc_mock_1", "lc_new"),
    serviceHealth: mockFacet("sh_mock_1", "sh_new"),
    serviceStatus: mockFacet("ss_mock_1", "ss_new"),
    componentStatus: mockFacet("cs_mock_1", "cs_new"),
    metricDefinitions: mockFacet("md_mock_1", "md_new"),
    metricSamples: mockFacet("ms_mock_1", "ms_new"),
    alertDefinitions: mockFacet("ad_mock_1", "ad_new"),
    alertStates: mockFacet("as_mock_1", "as_new"),
    dashboardDefinitions: mockFacet("dd_mock_1", "dd_new"),
    logSources: mockFacet("ls_mock_1", "ls_new"),
    traceDefinitions: mockFacet("td_mock_1", "td_new"),
    traceSpans: mockFacet("ts_mock_1", "ts_new"),
    incidentReferences: mockFacet("ir_mock_1", "ir_new"),
    maintenanceWindows: mockFacet("mw_mock_1", "mw_new"),
    healthSummaries: mockFacet("hs_mock_1", "hs_new"),
    metadata: mockFacet("om_mock_1", "om_new"),
    diagnostics: {
      ...mockFacet("pd_mock_1", "pd_new"),
      async health() {
        return {
          status: "healthy",
          persistenceMode: "memory",
          providerExecutionEnabled: false,
          checkedAt: NOW,
        };
      },
      async readiness() {
        return {
          ready: true,
          observeEnabled: true as const,
          persistenceMode: "memory",
          providerExecutionEnabled: false as const,
          capabilities: ["healthChecks", "metadata", "diagnostics"],
        };
      },
      async capabilities() {
        return management;
      },
      async management() {
        return management;
      },
    },
    async getHealth() {
      return {
        status: "healthy",
        persistenceMode: "memory",
        providerExecutionEnabled: false,
        checkedAt: NOW,
      };
    },
    async getReadiness() {
      return {
        ready: true,
        observeEnabled: true as const,
        persistenceMode: "memory",
        providerExecutionEnabled: false as const,
        capabilities: ["healthChecks", "metadata", "diagnostics"],
      };
    },
    async getCapabilities() {
      return management;
    },
  };
}
