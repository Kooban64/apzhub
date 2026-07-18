/**
 * In-memory Observability Platform repositories (APZOBSERVE-001).
 * Metadata only — never stores TSDB samples, log bodies, or credentials.
 */

import type {
  HealthCheck,
  ReadinessCheck,
  LivenessCheck,
  ServiceHealth,
  ServiceStatus,
  ComponentStatus,
  MetricDefinition,
  MetricSample,
  AlertDefinition,
  AlertState,
  DashboardDefinition,
  LogSource,
  TraceDefinition,
  TraceSpan,
  IncidentReference,
  MaintenanceWindow,
  HealthSummary,
  PlatformDiagnostic,
  ObservabilityMetadata,
  ObserveRequestContext,
} from "@apzhub/observe-contracts";
import type {
  HealthCheckRepositoryPort,
  ReadinessCheckRepositoryPort,
  LivenessCheckRepositoryPort,
  ServiceHealthRepositoryPort,
  ServiceStatusRepositoryPort,
  ComponentStatusRepositoryPort,
  MetricDefinitionRepositoryPort,
  MetricSampleRepositoryPort,
  AlertDefinitionRepositoryPort,
  AlertStateRepositoryPort,
  DashboardDefinitionRepositoryPort,
  LogSourceRepositoryPort,
  TraceDefinitionRepositoryPort,
  TraceSpanRepositoryPort,
  IncidentReferenceRepositoryPort,
  MaintenanceWindowRepositoryPort,
  HealthSummaryRepositoryPort,
  PlatformDiagnosticRepositoryPort,
  ObservabilityMetadataRepositoryPort,
  ObserveFoundationRepos,
} from "@apzhub/observe-core";

export type ObserveInMemoryStores = {
  readonly healthChecks: Map<string, HealthCheck>;
  readonly readinessChecks: Map<string, ReadinessCheck>;
  readonly livenessChecks: Map<string, LivenessCheck>;
  readonly serviceHealth: Map<string, ServiceHealth>;
  readonly serviceStatuses: Map<string, ServiceStatus>;
  readonly componentStatuses: Map<string, ComponentStatus>;
  readonly metricDefinitions: Map<string, MetricDefinition>;
  readonly metricSamples: Map<string, MetricSample>;
  readonly alertDefinitions: Map<string, AlertDefinition>;
  readonly alertStates: Map<string, AlertState>;
  readonly dashboards: Map<string, DashboardDefinition>;
  readonly logSources: Map<string, LogSource>;
  readonly traceDefinitions: Map<string, TraceDefinition>;
  readonly traceSpans: Map<string, TraceSpan>;
  readonly incidentReferences: Map<string, IncidentReference>;
  readonly maintenanceWindows: Map<string, MaintenanceWindow>;
  readonly healthSummaries: Map<string, HealthSummary>;
  readonly diagnostics: Map<string, PlatformDiagnostic>;
  readonly metadata: Map<string, ObservabilityMetadata>;
};

export function createEmptyObserveInMemoryStores(): ObserveInMemoryStores {
  return {
    healthChecks: new Map(),
    readinessChecks: new Map(),
    livenessChecks: new Map(),
    serviceHealth: new Map(),
    serviceStatuses: new Map(),
    componentStatuses: new Map(),
    metricDefinitions: new Map(),
    metricSamples: new Map(),
    alertDefinitions: new Map(),
    alertStates: new Map(),
    dashboards: new Map(),
    logSources: new Map(),
    traceDefinitions: new Map(),
    traceSpans: new Map(),
    incidentReferences: new Map(),
    maintenanceWindows: new Map(),
    healthSummaries: new Map(),
    diagnostics: new Map(),
    metadata: new Map(),
  };
}

function assertTenant(ctx: ObserveRequestContext, tenantId: string): void {
  if (tenantId !== ctx.tenantId) {
    throw new Error("tenant_mismatch");
  }
}

function createCrud<T extends { id: string; tenantId: string }>(
  store: Map<string, T>,
): {
  create(ctx: ObserveRequestContext, entity: T): Promise<T>;
  get(ctx: ObserveRequestContext, id: string): Promise<T | null>;
  update(ctx: ObserveRequestContext, entity: T): Promise<T>;
  list(ctx: ObserveRequestContext): Promise<readonly T[]>;
} {
  return {
    async create(ctx, entity) {
      assertTenant(ctx, entity.tenantId);
      store.set(entity.id, entity);
      return entity;
    },
    async get(ctx, id) {
      const row = store.get(id) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async update(ctx, entity) {
      assertTenant(ctx, entity.tenantId);
      store.set(entity.id, entity);
      return entity;
    },
    async list(ctx) {
      return [...store.values()].filter((row) => row.tenantId === ctx.tenantId);
    },
  };
}

export type InMemoryObserveRepositories = ObserveFoundationRepos;

export function createInMemoryObserveRepositories(
  stores: ObserveInMemoryStores,
): InMemoryObserveRepositories {
  return {
    healthChecks: createCrud(
      stores.healthChecks,
    ) as unknown as HealthCheckRepositoryPort,
    readinessChecks: createCrud(
      stores.readinessChecks,
    ) as unknown as ReadinessCheckRepositoryPort,
    livenessChecks: createCrud(
      stores.livenessChecks,
    ) as unknown as LivenessCheckRepositoryPort,
    serviceHealth: createCrud(
      stores.serviceHealth,
    ) as unknown as ServiceHealthRepositoryPort,
    serviceStatuses: createCrud(
      stores.serviceStatuses,
    ) as unknown as ServiceStatusRepositoryPort,
    componentStatuses: createCrud(
      stores.componentStatuses,
    ) as unknown as ComponentStatusRepositoryPort,
    metricDefinitions: createCrud(
      stores.metricDefinitions,
    ) as unknown as MetricDefinitionRepositoryPort,
    metricSamples: createCrud(
      stores.metricSamples,
    ) as unknown as MetricSampleRepositoryPort,
    alertDefinitions: createCrud(
      stores.alertDefinitions,
    ) as unknown as AlertDefinitionRepositoryPort,
    alertStates: createCrud(stores.alertStates) as unknown as AlertStateRepositoryPort,
    dashboards: createCrud(
      stores.dashboards,
    ) as unknown as DashboardDefinitionRepositoryPort,
    logSources: createCrud(stores.logSources) as unknown as LogSourceRepositoryPort,
    traceDefinitions: createCrud(
      stores.traceDefinitions,
    ) as unknown as TraceDefinitionRepositoryPort,
    traceSpans: createCrud(stores.traceSpans) as unknown as TraceSpanRepositoryPort,
    incidentReferences: createCrud(
      stores.incidentReferences,
    ) as unknown as IncidentReferenceRepositoryPort,
    maintenanceWindows: createCrud(
      stores.maintenanceWindows,
    ) as unknown as MaintenanceWindowRepositoryPort,
    healthSummaries: createCrud(
      stores.healthSummaries,
    ) as unknown as HealthSummaryRepositoryPort,
    diagnostics: createCrud(
      stores.diagnostics,
    ) as unknown as PlatformDiagnosticRepositoryPort,
    metadata: createCrud(
      stores.metadata,
    ) as unknown as ObservabilityMetadataRepositoryPort,
  };
}
