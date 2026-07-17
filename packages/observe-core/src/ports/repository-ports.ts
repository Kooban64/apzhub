/**
 * Observability repository ports (APZOBSERVE-001).
 * Interfaces only — no Drizzle / HTTP / memory defaults.
 */

import type {
  AlertDefinition,
  AlertDefinitionId,
  AlertState,
  AlertStateId,
  ComponentStatus,
  ComponentStatusId,
  DashboardDefinition,
  DashboardDefinitionId,
  HealthCheck,
  HealthCheckId,
  HealthSummary,
  HealthSummaryId,
  IncidentReference,
  IncidentReferenceId,
  LivenessCheck,
  LivenessCheckId,
  LogSource,
  LogSourceId,
  MaintenanceWindow,
  MaintenanceWindowId,
  MetricDefinition,
  MetricDefinitionId,
  MetricSample,
  MetricSampleId,
  ObservabilityMetadata,
  ObservabilityMetadataId,
  ObserveRequestContext,
  PlatformDiagnostic,
  PlatformDiagnosticId,
  ReadinessCheck,
  ReadinessCheckId,
  ServiceHealth,
  ServiceHealthId,
  ServiceStatus,
  ServiceStatusId,
  TraceDefinition,
  TraceDefinitionId,
  TraceSpan,
  TraceSpanId,
} from "@apzhub/observe-contracts";

export class ObserveDomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "ObserveDomainError";
  }
}

export function requireFound<T>(
  value: T | null | undefined,
  kind: string,
  id: string,
): T {
  if (value == null) {
    throw new ObserveDomainError("not_found", `${kind} not found: ${id}`, {
      kind,
      id,
    });
  }
  return value;
}

type CrudPort<TEntity, TId> = {
  create(ctx: ObserveRequestContext, entity: TEntity): Promise<TEntity>;
  get(ctx: ObserveRequestContext, id: TId): Promise<TEntity | null>;
  update(ctx: ObserveRequestContext, entity: TEntity): Promise<TEntity>;
  list(ctx: ObserveRequestContext): Promise<readonly TEntity[]>;
};

export type HealthCheckRepositoryPort = CrudPort<HealthCheck, HealthCheckId>;
export type ReadinessCheckRepositoryPort = CrudPort<
  ReadinessCheck,
  ReadinessCheckId
>;
export type LivenessCheckRepositoryPort = CrudPort<
  LivenessCheck,
  LivenessCheckId
>;
export type ServiceHealthRepositoryPort = CrudPort<
  ServiceHealth,
  ServiceHealthId
>;
export type ServiceStatusRepositoryPort = CrudPort<
  ServiceStatus,
  ServiceStatusId
>;
export type ComponentStatusRepositoryPort = CrudPort<
  ComponentStatus,
  ComponentStatusId
>;
export type MetricDefinitionRepositoryPort = CrudPort<
  MetricDefinition,
  MetricDefinitionId
>;
export type MetricSampleRepositoryPort = CrudPort<MetricSample, MetricSampleId>;
export type AlertDefinitionRepositoryPort = CrudPort<
  AlertDefinition,
  AlertDefinitionId
>;
export type AlertStateRepositoryPort = CrudPort<AlertState, AlertStateId>;
export type DashboardDefinitionRepositoryPort = CrudPort<
  DashboardDefinition,
  DashboardDefinitionId
>;
export type LogSourceRepositoryPort = CrudPort<LogSource, LogSourceId>;
export type TraceDefinitionRepositoryPort = CrudPort<
  TraceDefinition,
  TraceDefinitionId
>;
export type TraceSpanRepositoryPort = CrudPort<TraceSpan, TraceSpanId>;
export type IncidentReferenceRepositoryPort = CrudPort<
  IncidentReference,
  IncidentReferenceId
>;
export type MaintenanceWindowRepositoryPort = CrudPort<
  MaintenanceWindow,
  MaintenanceWindowId
>;
export type HealthSummaryRepositoryPort = CrudPort<
  HealthSummary,
  HealthSummaryId
>;
export type PlatformDiagnosticRepositoryPort = CrudPort<
  PlatformDiagnostic,
  PlatformDiagnosticId
>;
export type ObservabilityMetadataRepositoryPort = CrudPort<
  ObservabilityMetadata,
  ObservabilityMetadataId
>;

export type ObserveFoundationRepos = {
  readonly healthChecks: HealthCheckRepositoryPort;
  readonly readinessChecks: ReadinessCheckRepositoryPort;
  readonly livenessChecks: LivenessCheckRepositoryPort;
  readonly serviceHealth: ServiceHealthRepositoryPort;
  readonly serviceStatuses: ServiceStatusRepositoryPort;
  readonly componentStatuses: ComponentStatusRepositoryPort;
  readonly metricDefinitions: MetricDefinitionRepositoryPort;
  readonly metricSamples: MetricSampleRepositoryPort;
  readonly alertDefinitions: AlertDefinitionRepositoryPort;
  readonly alertStates: AlertStateRepositoryPort;
  readonly dashboards: DashboardDefinitionRepositoryPort;
  readonly logSources: LogSourceRepositoryPort;
  readonly traceDefinitions: TraceDefinitionRepositoryPort;
  readonly traceSpans: TraceSpanRepositoryPort;
  readonly incidentReferences: IncidentReferenceRepositoryPort;
  readonly maintenanceWindows: MaintenanceWindowRepositoryPort;
  readonly healthSummaries: HealthSummaryRepositoryPort;
  readonly diagnostics: PlatformDiagnosticRepositoryPort;
  readonly metadata: ObservabilityMetadataRepositoryPort;
};
