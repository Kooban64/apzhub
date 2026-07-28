/**
 * Nested Observability Platform gateway facets (APZOBSERVE-002).
 * Metadata / lifecycle only — no Grafana / Prometheus / Loki / OTel / AlertManager execution.
 */

import type {
  AcknowledgeAlertStateInput,
  ObserveAlertEvaluationBatchResult,
  ObserveAlertEvaluationDiagnostics,
  ObserveAlertEvaluationHealth,
  ResolveAlertStateInput,
  SuppressAlertStateInput,
} from "../domain/alert-rule";
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
} from "../domain/observability";
import type {
  HealthCheckId,
  ReadinessCheckId,
  LivenessCheckId,
  ServiceHealthId,
  ServiceStatusId,
  ComponentStatusId,
  MetricDefinitionId,
  MetricSampleId,
  AlertDefinitionId,
  AlertStateId,
  DashboardDefinitionId,
  LogSourceId,
  TraceDefinitionId,
  TraceSpanId,
  IncidentReferenceId,
  MaintenanceWindowId,
  HealthSummaryId,
  PlatformDiagnosticId,
  ObservabilityMetadataId,
} from "../identifiers";
import type {
  ObserveAlertSeverity,
  ObserveAlertStateKind,
  ObserveHealthStatus,
  ObserveLivenessStatus,
  ObserveLogSourceKind,
  ObserveMetadataStatus,
  ObserveMetricKind,
  ObserveProviderKind,
  ObserveReadinessStatus,
} from "../enums/catalogue";

/** Structurally compatible with ServiceRequestContext — mapped in platform-services. */
export type ObservePlatformServiceContext = {
  readonly tenantId: string;
  readonly userId: string;
  readonly correlationId: string;
  readonly permissions: readonly string[];
  readonly organisationId?: string;
  readonly workspaceId?: string;
  readonly requestId?: string;
};

export type CreateHealthCheckInput = {
  readonly serviceKey: string;
  readonly name: string;
  readonly status: ObserveHealthStatus;
  readonly providerKind: ObserveProviderKind;
  readonly organisationId?: string;
  readonly description?: string;
  readonly checkedAt?: string;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateHealthCheckInput = {
  readonly id: HealthCheckId;
  readonly serviceKey?: string | null;
  readonly name?: string;
  readonly status?: ObserveHealthStatus;
  readonly providerKind?: ObserveProviderKind;
  readonly organisationId?: string | null;
  readonly description?: string | null;
  readonly checkedAt?: string | null;
  readonly providerRef?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveHealthChecksService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly HealthCheck[]>;
  get(ctx: ObservePlatformServiceContext, id: HealthCheckId): Promise<HealthCheck>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateHealthCheckInput,
  ): Promise<HealthCheck>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateHealthCheckInput,
  ): Promise<HealthCheck>;
};

export type CreateReadinessCheckInput = {
  readonly serviceKey: string;
  readonly name: string;
  readonly status: ObserveReadinessStatus;
  readonly providerKind: ObserveProviderKind;
  readonly organisationId?: string;
  readonly checkedAt?: string;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateReadinessCheckInput = {
  readonly id: ReadinessCheckId;
  readonly serviceKey?: string | null;
  readonly name?: string;
  readonly status?: ObserveReadinessStatus;
  readonly providerKind?: ObserveProviderKind;
  readonly organisationId?: string | null;
  readonly checkedAt?: string | null;
  readonly providerRef?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveReadinessChecksService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly ReadinessCheck[]>;
  get(
    ctx: ObservePlatformServiceContext,
    id: ReadinessCheckId,
  ): Promise<ReadinessCheck>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateReadinessCheckInput,
  ): Promise<ReadinessCheck>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateReadinessCheckInput,
  ): Promise<ReadinessCheck>;
};

export type CreateLivenessCheckInput = {
  readonly serviceKey: string;
  readonly name: string;
  readonly status: ObserveLivenessStatus;
  readonly providerKind: ObserveProviderKind;
  readonly organisationId?: string;
  readonly checkedAt?: string;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateLivenessCheckInput = {
  readonly id: LivenessCheckId;
  readonly serviceKey?: string | null;
  readonly name?: string;
  readonly status?: ObserveLivenessStatus;
  readonly providerKind?: ObserveProviderKind;
  readonly organisationId?: string | null;
  readonly checkedAt?: string | null;
  readonly providerRef?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveLivenessChecksService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly LivenessCheck[]>;
  get(ctx: ObservePlatformServiceContext, id: LivenessCheckId): Promise<LivenessCheck>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateLivenessCheckInput,
  ): Promise<LivenessCheck>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateLivenessCheckInput,
  ): Promise<LivenessCheck>;
};

export type CreateServiceHealthInput = {
  readonly serviceKey: string;
  readonly displayName: string;
  readonly overallStatus: ObserveHealthStatus;
  readonly readinessStatus: ObserveReadinessStatus;
  readonly livenessStatus: ObserveLivenessStatus;
  readonly organisationId?: string;
  readonly lastEvaluatedAt?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateServiceHealthInput = {
  readonly id: ServiceHealthId;
  readonly serviceKey?: string | null;
  readonly displayName?: string;
  readonly overallStatus?: ObserveHealthStatus;
  readonly readinessStatus?: ObserveReadinessStatus;
  readonly livenessStatus?: ObserveLivenessStatus;
  readonly organisationId?: string | null;
  readonly lastEvaluatedAt?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveServiceHealthFacetService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly ServiceHealth[]>;
  get(ctx: ObservePlatformServiceContext, id: ServiceHealthId): Promise<ServiceHealth>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateServiceHealthInput,
  ): Promise<ServiceHealth>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateServiceHealthInput,
  ): Promise<ServiceHealth>;
};

export type CreateServiceStatusInput = {
  readonly serviceKey: string;
  readonly status: ObserveHealthStatus;
  readonly organisationId?: string;
  readonly message?: string;
  readonly observedAt?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateServiceStatusInput = {
  readonly id: ServiceStatusId;
  readonly serviceKey?: string | null;
  readonly status?: ObserveHealthStatus;
  readonly organisationId?: string | null;
  readonly message?: string | null;
  readonly observedAt?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveServiceStatusFacetService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly ServiceStatus[]>;
  get(ctx: ObservePlatformServiceContext, id: ServiceStatusId): Promise<ServiceStatus>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateServiceStatusInput,
  ): Promise<ServiceStatus>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateServiceStatusInput,
  ): Promise<ServiceStatus>;
};

export type CreateComponentStatusInput = {
  readonly serviceKey: string;
  readonly componentKey: string;
  readonly name: string;
  readonly status: ObserveHealthStatus;
  readonly organisationId?: string;
  readonly message?: string;
  readonly observedAt?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateComponentStatusInput = {
  readonly id: ComponentStatusId;
  readonly serviceKey?: string | null;
  readonly componentKey?: string;
  readonly name?: string;
  readonly status?: ObserveHealthStatus;
  readonly organisationId?: string | null;
  readonly message?: string | null;
  readonly observedAt?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveComponentStatusFacetService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly ComponentStatus[]>;
  get(
    ctx: ObservePlatformServiceContext,
    id: ComponentStatusId,
  ): Promise<ComponentStatus>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateComponentStatusInput,
  ): Promise<ComponentStatus>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateComponentStatusInput,
  ): Promise<ComponentStatus>;
};

export type CreateMetricDefinitionInput = {
  readonly key: string;
  readonly name: string;
  readonly kind: ObserveMetricKind;
  readonly providerKind: ObserveProviderKind;
  readonly status: ObserveMetadataStatus;
  readonly organisationId?: string;
  readonly description?: string;
  readonly unit?: string;
  readonly providerRef?: string;
  readonly labels?: Readonly<Record<string, string>>;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricDefinitionInput = {
  readonly id: MetricDefinitionId;
  readonly key?: string;
  readonly name?: string;
  readonly kind?: ObserveMetricKind;
  readonly providerKind?: ObserveProviderKind;
  readonly status?: ObserveMetadataStatus;
  readonly organisationId?: string | null;
  readonly description?: string | null;
  readonly unit?: string | null;
  readonly providerRef?: string | null;
  readonly labels?: Readonly<Record<string, string>> | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveMetricDefinitionsService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly MetricDefinition[]>;
  get(
    ctx: ObservePlatformServiceContext,
    id: MetricDefinitionId,
  ): Promise<MetricDefinition>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateMetricDefinitionInput,
  ): Promise<MetricDefinition>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateMetricDefinitionInput,
  ): Promise<MetricDefinition>;
};

export type CreateMetricSampleInput = {
  readonly metricDefinitionId: MetricDefinitionId;
  readonly sampledAt: string;
  readonly providerKind: ObserveProviderKind;
  readonly organisationId?: string;
  readonly valueLabel?: string;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricSampleInput = {
  readonly id: MetricSampleId;
  readonly metricDefinitionId?: MetricDefinitionId;
  readonly sampledAt?: string | null;
  readonly providerKind?: ObserveProviderKind;
  readonly organisationId?: string | null;
  readonly valueLabel?: string | null;
  readonly providerRef?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveMetricSamplesService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly MetricSample[]>;
  get(ctx: ObservePlatformServiceContext, id: MetricSampleId): Promise<MetricSample>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateMetricSampleInput,
  ): Promise<MetricSample>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateMetricSampleInput,
  ): Promise<MetricSample>;
};

export type CreateAlertDefinitionInput = {
  readonly key: string;
  readonly name: string;
  readonly severity: ObserveAlertSeverity;
  readonly providerKind: ObserveProviderKind;
  readonly status: ObserveMetadataStatus;
  readonly organisationId?: string;
  readonly description?: string;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateAlertDefinitionInput = {
  readonly id: AlertDefinitionId;
  readonly key?: string;
  readonly name?: string;
  readonly severity?: ObserveAlertSeverity;
  readonly providerKind?: ObserveProviderKind;
  readonly status?: ObserveMetadataStatus;
  readonly organisationId?: string | null;
  readonly description?: string | null;
  readonly providerRef?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveAlertDefinitionsService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly AlertDefinition[]>;
  get(
    ctx: ObservePlatformServiceContext,
    id: AlertDefinitionId,
  ): Promise<AlertDefinition>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateAlertDefinitionInput,
  ): Promise<AlertDefinition>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateAlertDefinitionInput,
  ): Promise<AlertDefinition>;
};

export type CreateAlertStateInput = {
  readonly alertDefinitionId: AlertDefinitionId;
  readonly state: ObserveAlertStateKind;
  readonly providerKind: ObserveProviderKind;
  readonly organisationId?: string;
  readonly firedAt?: string;
  readonly resolvedAt?: string;
  readonly message?: string;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateAlertStateInput = {
  readonly id: AlertStateId;
  readonly alertDefinitionId?: AlertDefinitionId | null;
  readonly state?: ObserveAlertStateKind;
  readonly providerKind?: ObserveProviderKind;
  readonly organisationId?: string | null;
  readonly firedAt?: string | null;
  readonly resolvedAt?: string | null;
  readonly message?: string | null;
  readonly providerRef?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveAlertStatesService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly AlertState[]>;
  get(ctx: ObservePlatformServiceContext, id: AlertStateId): Promise<AlertState>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateAlertStateInput,
  ): Promise<AlertState>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateAlertStateInput,
  ): Promise<AlertState>;
  /** Operator acknowledgement — does not resolve (ADR-0070). */
  acknowledge(
    ctx: ObservePlatformServiceContext,
    input: AcknowledgeAlertStateInput,
  ): Promise<AlertState>;
  /** Manual or evaluation-driven resolution. */
  resolve(
    ctx: ObservePlatformServiceContext,
    input: ResolveAlertStateInput,
  ): Promise<AlertState>;
  /** Suppression → silenced; not represented as healthy. */
  suppress(
    ctx: ObservePlatformServiceContext,
    input: SuppressAlertStateInput,
  ): Promise<AlertState>;
};

/** Observe Live Alerts Phase A — evaluation orchestration (ADR-0070). */
export type ObserveAlertEvaluationService = {
  evaluateBatch(
    ctx: ObservePlatformServiceContext,
  ): Promise<ObserveAlertEvaluationBatchResult>;
  getDiagnostics(
    ctx: ObservePlatformServiceContext,
  ): Promise<ObserveAlertEvaluationDiagnostics>;
  getHealth(ctx: ObservePlatformServiceContext): Promise<ObserveAlertEvaluationHealth>;
};

export type CreateDashboardDefinitionInput = {
  readonly key: string;
  readonly name: string;
  readonly providerKind: ObserveProviderKind;
  readonly status: ObserveMetadataStatus;
  readonly organisationId?: string;
  readonly description?: string;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateDashboardDefinitionInput = {
  readonly id: DashboardDefinitionId;
  readonly key?: string;
  readonly name?: string;
  readonly providerKind?: ObserveProviderKind;
  readonly status?: ObserveMetadataStatus;
  readonly organisationId?: string | null;
  readonly description?: string | null;
  readonly providerRef?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveDashboardDefinitionsService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly DashboardDefinition[]>;
  get(
    ctx: ObservePlatformServiceContext,
    id: DashboardDefinitionId,
  ): Promise<DashboardDefinition>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateDashboardDefinitionInput,
  ): Promise<DashboardDefinition>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateDashboardDefinitionInput,
  ): Promise<DashboardDefinition>;
};

export type CreateLogSourceInput = {
  readonly key: string;
  readonly name: string;
  readonly kind: ObserveLogSourceKind;
  readonly providerKind: ObserveProviderKind;
  readonly status: ObserveMetadataStatus;
  readonly organisationId?: string;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateLogSourceInput = {
  readonly id: LogSourceId;
  readonly key?: string;
  readonly name?: string;
  readonly kind?: ObserveLogSourceKind;
  readonly providerKind?: ObserveProviderKind;
  readonly status?: ObserveMetadataStatus;
  readonly organisationId?: string | null;
  readonly providerRef?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveLogSourcesService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly LogSource[]>;
  get(ctx: ObservePlatformServiceContext, id: LogSourceId): Promise<LogSource>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateLogSourceInput,
  ): Promise<LogSource>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateLogSourceInput,
  ): Promise<LogSource>;
};

export type CreateTraceDefinitionInput = {
  readonly key: string;
  readonly name: string;
  readonly providerKind: ObserveProviderKind;
  readonly status: ObserveMetadataStatus;
  readonly organisationId?: string;
  readonly description?: string;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateTraceDefinitionInput = {
  readonly id: TraceDefinitionId;
  readonly key?: string;
  readonly name?: string;
  readonly providerKind?: ObserveProviderKind;
  readonly status?: ObserveMetadataStatus;
  readonly organisationId?: string | null;
  readonly description?: string | null;
  readonly providerRef?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveTraceDefinitionsService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly TraceDefinition[]>;
  get(
    ctx: ObservePlatformServiceContext,
    id: TraceDefinitionId,
  ): Promise<TraceDefinition>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateTraceDefinitionInput,
  ): Promise<TraceDefinition>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateTraceDefinitionInput,
  ): Promise<TraceDefinition>;
};

export type CreateTraceSpanInput = {
  readonly traceDefinitionId: TraceDefinitionId;
  readonly spanName: string;
  readonly providerKind: ObserveProviderKind;
  readonly organisationId?: string;
  readonly serviceKey?: string;
  readonly startedAt?: string;
  readonly endedAt?: string;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateTraceSpanInput = {
  readonly id: TraceSpanId;
  readonly traceDefinitionId?: TraceDefinitionId;
  readonly spanName?: string;
  readonly providerKind?: ObserveProviderKind;
  readonly organisationId?: string | null;
  readonly serviceKey?: string | null;
  readonly startedAt?: string | null;
  readonly endedAt?: string | null;
  readonly providerRef?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveTraceSpansService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly TraceSpan[]>;
  get(ctx: ObservePlatformServiceContext, id: TraceSpanId): Promise<TraceSpan>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateTraceSpanInput,
  ): Promise<TraceSpan>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateTraceSpanInput,
  ): Promise<TraceSpan>;
};

export type CreateIncidentReferenceInput = {
  readonly key: string;
  readonly title: string;
  readonly status: ObserveMetadataStatus;
  readonly organisationId?: string;
  readonly serviceKey?: string;
  readonly alertDefinitionId?: AlertDefinitionId;
  readonly externalRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateIncidentReferenceInput = {
  readonly id: IncidentReferenceId;
  readonly key?: string;
  readonly title?: string;
  readonly status?: ObserveMetadataStatus;
  readonly organisationId?: string | null;
  readonly serviceKey?: string | null;
  readonly alertDefinitionId?: AlertDefinitionId | null;
  readonly externalRef?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveIncidentReferencesService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly IncidentReference[]>;
  get(
    ctx: ObservePlatformServiceContext,
    id: IncidentReferenceId,
  ): Promise<IncidentReference>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateIncidentReferenceInput,
  ): Promise<IncidentReference>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateIncidentReferenceInput,
  ): Promise<IncidentReference>;
};

export type CreateMaintenanceWindowInput = {
  readonly key: string;
  readonly name: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly status: ObserveMetadataStatus;
  readonly organisationId?: string;
  readonly serviceKey?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMaintenanceWindowInput = {
  readonly id: MaintenanceWindowId;
  readonly key?: string;
  readonly name?: string;
  readonly startsAt?: string | null;
  readonly endsAt?: string | null;
  readonly status?: ObserveMetadataStatus;
  readonly organisationId?: string | null;
  readonly serviceKey?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveMaintenanceWindowsService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly MaintenanceWindow[]>;
  get(
    ctx: ObservePlatformServiceContext,
    id: MaintenanceWindowId,
  ): Promise<MaintenanceWindow>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateMaintenanceWindowInput,
  ): Promise<MaintenanceWindow>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateMaintenanceWindowInput,
  ): Promise<MaintenanceWindow>;
};

export type CreateHealthSummaryInput = {
  readonly scopeKey: string;
  readonly overallStatus: ObserveHealthStatus;
  readonly healthyCount: number;
  readonly degradedCount: number;
  readonly unhealthyCount: number;
  readonly evaluatedAt: string;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateHealthSummaryInput = {
  readonly id: HealthSummaryId;
  readonly scopeKey?: string;
  readonly overallStatus?: ObserveHealthStatus;
  readonly healthyCount?: number;
  readonly degradedCount?: number;
  readonly unhealthyCount?: number;
  readonly evaluatedAt?: string | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveHealthSummariesService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly HealthSummary[]>;
  get(ctx: ObservePlatformServiceContext, id: HealthSummaryId): Promise<HealthSummary>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateHealthSummaryInput,
  ): Promise<HealthSummary>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateHealthSummaryInput,
  ): Promise<HealthSummary>;
};

export type CreateObservabilityMetadataInput = {
  readonly key: string;
  readonly name: string;
  readonly category: string;
  readonly status: ObserveMetadataStatus;
  readonly organisationId?: string;
  readonly payload?: Readonly<Record<string, unknown>>;
};

export type UpdateObservabilityMetadataInput = {
  readonly id: ObservabilityMetadataId;
  readonly key?: string;
  readonly name?: string;
  readonly category?: string;
  readonly status?: ObserveMetadataStatus;
  readonly organisationId?: string | null;
  readonly payload?: Readonly<Record<string, unknown>> | null;
};

export type ObserveMetadataFacetService = {
  list(ctx: ObservePlatformServiceContext): Promise<readonly ObservabilityMetadata[]>;
  get(
    ctx: ObservePlatformServiceContext,
    id: ObservabilityMetadataId,
  ): Promise<ObservabilityMetadata>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreateObservabilityMetadataInput,
  ): Promise<ObservabilityMetadata>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdateObservabilityMetadataInput,
  ): Promise<ObservabilityMetadata>;
};

export type ObserveDiagnosticsHealth = {
  readonly status: "healthy" | "degraded" | "unavailable";
  readonly persistenceMode: "postgres" | "memory";
  readonly providerExecutionEnabled: false;
  readonly checkedAt: string;
};

export type ObserveDiagnosticsReadiness = {
  readonly ready: boolean;
  readonly observeEnabled: true;
  readonly persistenceMode: "postgres" | "memory";
  readonly providerExecutionEnabled: false;
  readonly capabilities: readonly string[];
};

export type ObserveDiagnosticsCapabilities = {
  readonly providerExecution: false;
  readonly facets: readonly string[];
  readonly metadataCompleteness: "foundation";
};

export type CreatePlatformDiagnosticInput = {
  readonly key: string;
  readonly name: string;
  readonly status: ObserveHealthStatus;
  readonly providerKind: ObserveProviderKind;
  readonly organisationId?: string;
  readonly serviceKey?: string;
  readonly detail?: string;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdatePlatformDiagnosticInput = {
  readonly id: PlatformDiagnosticId;
  readonly key?: string;
  readonly name?: string;
  readonly status?: ObserveHealthStatus;
  readonly providerKind?: ObserveProviderKind;
  readonly organisationId?: string | null;
  readonly serviceKey?: string | null;
  readonly detail?: string | null;
  readonly providerRef?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type ObserveDiagnosticsService = {
  health(ctx: ObservePlatformServiceContext): Promise<ObserveDiagnosticsHealth>;
  readiness(ctx: ObservePlatformServiceContext): Promise<ObserveDiagnosticsReadiness>;
  capabilities(
    ctx: ObservePlatformServiceContext,
  ): Promise<ObserveDiagnosticsCapabilities>;
  list(ctx: ObservePlatformServiceContext): Promise<readonly PlatformDiagnostic[]>;
  get(
    ctx: ObservePlatformServiceContext,
    id: PlatformDiagnosticId,
  ): Promise<PlatformDiagnostic>;
  create(
    ctx: ObservePlatformServiceContext,
    input: CreatePlatformDiagnosticInput,
  ): Promise<PlatformDiagnostic>;
  update(
    ctx: ObservePlatformServiceContext,
    input: UpdatePlatformDiagnosticInput,
  ): Promise<PlatformDiagnostic>;
};

export type ObservePlatformGateway = {
  readonly healthChecks: ObserveHealthChecksService;
  readonly readinessChecks: ObserveReadinessChecksService;
  readonly livenessChecks: ObserveLivenessChecksService;
  readonly serviceHealth: ObserveServiceHealthFacetService;
  readonly serviceStatus: ObserveServiceStatusFacetService;
  readonly componentStatus: ObserveComponentStatusFacetService;
  readonly metricDefinitions: ObserveMetricDefinitionsService;
  readonly metricSamples: ObserveMetricSamplesService;
  readonly alertDefinitions: ObserveAlertDefinitionsService;
  readonly alertStates: ObserveAlertStatesService;
  readonly alertEvaluation: ObserveAlertEvaluationService;
  readonly dashboardDefinitions: ObserveDashboardDefinitionsService;
  readonly logSources: ObserveLogSourcesService;
  readonly traceDefinitions: ObserveTraceDefinitionsService;
  readonly traceSpans: ObserveTraceSpansService;
  readonly incidentReferences: ObserveIncidentReferencesService;
  readonly maintenanceWindows: ObserveMaintenanceWindowsService;
  readonly healthSummaries: ObserveHealthSummariesService;
  readonly metadata: ObserveMetadataFacetService;
  readonly diagnostics: ObserveDiagnosticsService;
};
