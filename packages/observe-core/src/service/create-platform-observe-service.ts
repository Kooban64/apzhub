/**
 * Platform Observability domain service (APZOBSERVE-002).
 * Metadata CRUD / validate / lifecycle only — NEVER provider execution.
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
  ObservabilityMetadata,
  PlatformDiagnostic,
  ObserveRequestContext,
} from "@apzhub/observe-contracts";
import type {
  CreateHealthCheckInput,
  UpdateHealthCheckInput,
  CreateReadinessCheckInput,
  UpdateReadinessCheckInput,
  CreateLivenessCheckInput,
  UpdateLivenessCheckInput,
  CreateServiceHealthInput,
  UpdateServiceHealthInput,
  CreateServiceStatusInput,
  UpdateServiceStatusInput,
  CreateComponentStatusInput,
  UpdateComponentStatusInput,
  CreateMetricDefinitionInput,
  UpdateMetricDefinitionInput,
  CreateMetricSampleInput,
  UpdateMetricSampleInput,
  CreateAlertDefinitionInput,
  UpdateAlertDefinitionInput,
  CreateAlertStateInput,
  UpdateAlertStateInput,
  CreateDashboardDefinitionInput,
  UpdateDashboardDefinitionInput,
  CreateLogSourceInput,
  UpdateLogSourceInput,
  CreateTraceDefinitionInput,
  UpdateTraceDefinitionInput,
  CreateTraceSpanInput,
  UpdateTraceSpanInput,
  CreateIncidentReferenceInput,
  UpdateIncidentReferenceInput,
  CreateMaintenanceWindowInput,
  UpdateMaintenanceWindowInput,
  CreateHealthSummaryInput,
  UpdateHealthSummaryInput,
  CreateObservabilityMetadataInput,
  UpdateObservabilityMetadataInput,
  CreatePlatformDiagnosticInput,
  UpdatePlatformDiagnosticInput,
} from "@apzhub/observe-contracts";
import {
  asHealthCheckId,
  asReadinessCheckId,
  asLivenessCheckId,
  asServiceHealthId,
  asServiceStatusId,
  asComponentStatusId,
  asMetricDefinitionId,
  asMetricSampleId,
  asAlertDefinitionId,
  asAlertStateId,
  asDashboardDefinitionId,
  asLogSourceId,
  asTraceDefinitionId,
  asTraceSpanId,
  asIncidentReferenceId,
  asMaintenanceWindowId,
  asHealthSummaryId,
  asObservabilityMetadataId,
  asPlatformDiagnosticId,
} from "@apzhub/observe-contracts";

import {
  assertObserveAlertStateTransition,
  assertObserveHealthTransition,
  assertObserveMetadataTransition,
} from "../lifecycle/transitions";
import {
  ObserveDomainError,
  requireFound,
  type ObserveFoundationRepos,
} from "../ports/repository-ports";
import {
  assertNoCredentialPayload,
  validateAlertDefinition,
  validateHealthCheck,
  validateMetricDefinition,
  validateServiceHealth,
} from "../validation/validate-observe";

export type PlatformObserveServiceDeps = {
  readonly repos: ObserveFoundationRepos;
  readonly now: () => string;
  readonly id: () => string;
  readonly persistenceMode?: "postgres" | "memory";
};

function assertCtx(ctx: ObserveRequestContext): void {
  if (!ctx.tenantId?.trim()) {
    throw new ObserveDomainError("validation_error", "tenantId is required");
  }
  if (!ctx.userId?.trim()) {
    throw new ObserveDomainError("validation_error", "userId is required");
  }
}

function requireString(value: string | undefined, field: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    throw new ObserveDomainError("validation_error", `${field} is required`, {
      field,
    });
  }
  return trimmed;
}

export type PlatformObserveDomainService = {
  listHealthChecks(ctx: ObserveRequestContext): Promise<readonly HealthCheck[]>;
  getHealthCheck(ctx: ObserveRequestContext, id: HealthCheck["id"]): Promise<HealthCheck>;
  createHealthCheck(ctx: ObserveRequestContext, input: CreateHealthCheckInput): Promise<HealthCheck>;
  updateHealthCheck(ctx: ObserveRequestContext, input: UpdateHealthCheckInput): Promise<HealthCheck>;
  listReadinessChecks(ctx: ObserveRequestContext): Promise<readonly ReadinessCheck[]>;
  getReadinessCheck(ctx: ObserveRequestContext, id: ReadinessCheck["id"]): Promise<ReadinessCheck>;
  createReadinessCheck(ctx: ObserveRequestContext, input: CreateReadinessCheckInput): Promise<ReadinessCheck>;
  updateReadinessCheck(ctx: ObserveRequestContext, input: UpdateReadinessCheckInput): Promise<ReadinessCheck>;
  listLivenessChecks(ctx: ObserveRequestContext): Promise<readonly LivenessCheck[]>;
  getLivenessCheck(ctx: ObserveRequestContext, id: LivenessCheck["id"]): Promise<LivenessCheck>;
  createLivenessCheck(ctx: ObserveRequestContext, input: CreateLivenessCheckInput): Promise<LivenessCheck>;
  updateLivenessCheck(ctx: ObserveRequestContext, input: UpdateLivenessCheckInput): Promise<LivenessCheck>;
  listServiceHealths(ctx: ObserveRequestContext): Promise<readonly ServiceHealth[]>;
  getServiceHealth(ctx: ObserveRequestContext, id: ServiceHealth["id"]): Promise<ServiceHealth>;
  createServiceHealth(ctx: ObserveRequestContext, input: CreateServiceHealthInput): Promise<ServiceHealth>;
  updateServiceHealth(ctx: ObserveRequestContext, input: UpdateServiceHealthInput): Promise<ServiceHealth>;
  listServiceStatuss(ctx: ObserveRequestContext): Promise<readonly ServiceStatus[]>;
  getServiceStatus(ctx: ObserveRequestContext, id: ServiceStatus["id"]): Promise<ServiceStatus>;
  createServiceStatus(ctx: ObserveRequestContext, input: CreateServiceStatusInput): Promise<ServiceStatus>;
  updateServiceStatus(ctx: ObserveRequestContext, input: UpdateServiceStatusInput): Promise<ServiceStatus>;
  listComponentStatuss(ctx: ObserveRequestContext): Promise<readonly ComponentStatus[]>;
  getComponentStatus(ctx: ObserveRequestContext, id: ComponentStatus["id"]): Promise<ComponentStatus>;
  createComponentStatus(ctx: ObserveRequestContext, input: CreateComponentStatusInput): Promise<ComponentStatus>;
  updateComponentStatus(ctx: ObserveRequestContext, input: UpdateComponentStatusInput): Promise<ComponentStatus>;
  listMetricDefinitions(ctx: ObserveRequestContext): Promise<readonly MetricDefinition[]>;
  getMetricDefinition(ctx: ObserveRequestContext, id: MetricDefinition["id"]): Promise<MetricDefinition>;
  createMetricDefinition(ctx: ObserveRequestContext, input: CreateMetricDefinitionInput): Promise<MetricDefinition>;
  updateMetricDefinition(ctx: ObserveRequestContext, input: UpdateMetricDefinitionInput): Promise<MetricDefinition>;
  listMetricSamples(ctx: ObserveRequestContext): Promise<readonly MetricSample[]>;
  getMetricSample(ctx: ObserveRequestContext, id: MetricSample["id"]): Promise<MetricSample>;
  createMetricSample(ctx: ObserveRequestContext, input: CreateMetricSampleInput): Promise<MetricSample>;
  updateMetricSample(ctx: ObserveRequestContext, input: UpdateMetricSampleInput): Promise<MetricSample>;
  listAlertDefinitions(ctx: ObserveRequestContext): Promise<readonly AlertDefinition[]>;
  getAlertDefinition(ctx: ObserveRequestContext, id: AlertDefinition["id"]): Promise<AlertDefinition>;
  createAlertDefinition(ctx: ObserveRequestContext, input: CreateAlertDefinitionInput): Promise<AlertDefinition>;
  updateAlertDefinition(ctx: ObserveRequestContext, input: UpdateAlertDefinitionInput): Promise<AlertDefinition>;
  listAlertStates(ctx: ObserveRequestContext): Promise<readonly AlertState[]>;
  getAlertState(ctx: ObserveRequestContext, id: AlertState["id"]): Promise<AlertState>;
  createAlertState(ctx: ObserveRequestContext, input: CreateAlertStateInput): Promise<AlertState>;
  updateAlertState(ctx: ObserveRequestContext, input: UpdateAlertStateInput): Promise<AlertState>;
  listDashboardDefinitions(ctx: ObserveRequestContext): Promise<readonly DashboardDefinition[]>;
  getDashboardDefinition(ctx: ObserveRequestContext, id: DashboardDefinition["id"]): Promise<DashboardDefinition>;
  createDashboardDefinition(ctx: ObserveRequestContext, input: CreateDashboardDefinitionInput): Promise<DashboardDefinition>;
  updateDashboardDefinition(ctx: ObserveRequestContext, input: UpdateDashboardDefinitionInput): Promise<DashboardDefinition>;
  listLogSources(ctx: ObserveRequestContext): Promise<readonly LogSource[]>;
  getLogSource(ctx: ObserveRequestContext, id: LogSource["id"]): Promise<LogSource>;
  createLogSource(ctx: ObserveRequestContext, input: CreateLogSourceInput): Promise<LogSource>;
  updateLogSource(ctx: ObserveRequestContext, input: UpdateLogSourceInput): Promise<LogSource>;
  listTraceDefinitions(ctx: ObserveRequestContext): Promise<readonly TraceDefinition[]>;
  getTraceDefinition(ctx: ObserveRequestContext, id: TraceDefinition["id"]): Promise<TraceDefinition>;
  createTraceDefinition(ctx: ObserveRequestContext, input: CreateTraceDefinitionInput): Promise<TraceDefinition>;
  updateTraceDefinition(ctx: ObserveRequestContext, input: UpdateTraceDefinitionInput): Promise<TraceDefinition>;
  listTraceSpans(ctx: ObserveRequestContext): Promise<readonly TraceSpan[]>;
  getTraceSpan(ctx: ObserveRequestContext, id: TraceSpan["id"]): Promise<TraceSpan>;
  createTraceSpan(ctx: ObserveRequestContext, input: CreateTraceSpanInput): Promise<TraceSpan>;
  updateTraceSpan(ctx: ObserveRequestContext, input: UpdateTraceSpanInput): Promise<TraceSpan>;
  listIncidentReferences(ctx: ObserveRequestContext): Promise<readonly IncidentReference[]>;
  getIncidentReference(ctx: ObserveRequestContext, id: IncidentReference["id"]): Promise<IncidentReference>;
  createIncidentReference(ctx: ObserveRequestContext, input: CreateIncidentReferenceInput): Promise<IncidentReference>;
  updateIncidentReference(ctx: ObserveRequestContext, input: UpdateIncidentReferenceInput): Promise<IncidentReference>;
  listMaintenanceWindows(ctx: ObserveRequestContext): Promise<readonly MaintenanceWindow[]>;
  getMaintenanceWindow(ctx: ObserveRequestContext, id: MaintenanceWindow["id"]): Promise<MaintenanceWindow>;
  createMaintenanceWindow(ctx: ObserveRequestContext, input: CreateMaintenanceWindowInput): Promise<MaintenanceWindow>;
  updateMaintenanceWindow(ctx: ObserveRequestContext, input: UpdateMaintenanceWindowInput): Promise<MaintenanceWindow>;
  listHealthSummarys(ctx: ObserveRequestContext): Promise<readonly HealthSummary[]>;
  getHealthSummary(ctx: ObserveRequestContext, id: HealthSummary["id"]): Promise<HealthSummary>;
  createHealthSummary(ctx: ObserveRequestContext, input: CreateHealthSummaryInput): Promise<HealthSummary>;
  updateHealthSummary(ctx: ObserveRequestContext, input: UpdateHealthSummaryInput): Promise<HealthSummary>;
  listObservabilityMetadatas(ctx: ObserveRequestContext): Promise<readonly ObservabilityMetadata[]>;
  getObservabilityMetadata(ctx: ObserveRequestContext, id: ObservabilityMetadata["id"]): Promise<ObservabilityMetadata>;
  createObservabilityMetadata(ctx: ObserveRequestContext, input: CreateObservabilityMetadataInput): Promise<ObservabilityMetadata>;
  updateObservabilityMetadata(ctx: ObserveRequestContext, input: UpdateObservabilityMetadataInput): Promise<ObservabilityMetadata>;
  listPlatformDiagnostics(ctx: ObserveRequestContext): Promise<readonly PlatformDiagnostic[]>;
  getPlatformDiagnostic(ctx: ObserveRequestContext, id: PlatformDiagnostic["id"]): Promise<PlatformDiagnostic>;
  createPlatformDiagnostic(ctx: ObserveRequestContext, input: CreatePlatformDiagnosticInput): Promise<PlatformDiagnostic>;
  updatePlatformDiagnostic(ctx: ObserveRequestContext, input: UpdatePlatformDiagnosticInput): Promise<PlatformDiagnostic>;
  diagnosticsHealth(ctx: ObserveRequestContext): Promise<{
    readonly status: "healthy" | "degraded" | "unavailable";
    readonly persistenceMode: "postgres" | "memory";
    readonly providerExecutionEnabled: false;
    readonly checkedAt: string;
  }>;
  diagnosticsReadiness(ctx: ObserveRequestContext): Promise<{
    readonly ready: boolean;
    readonly observeEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
    readonly providerExecutionEnabled: false;
    readonly capabilities: readonly string[];
  }>;
  diagnosticsCapabilities(ctx: ObserveRequestContext): Promise<{
    readonly providerExecution: false;
    readonly facets: readonly string[];
    readonly metadataCompleteness: "foundation";
  }>;
};

const FACET_NAMES = [
  "healthChecks",
  "readinessChecks",
  "livenessChecks",
  "serviceHealth",
  "serviceStatus",
  "componentStatus",
  "metricDefinitions",
  "metricSamples",
  "alertDefinitions",
  "alertStates",
  "dashboardDefinitions",
  "logSources",
  "traceDefinitions",
  "traceSpans",
  "incidentReferences",
  "maintenanceWindows",
  "healthSummaries",
  "metadata",
  "diagnostics",
] as const;

export function createPlatformObserveService(
  deps: PlatformObserveServiceDeps,
): PlatformObserveDomainService {
  const mode = deps.persistenceMode ?? "memory";

  return {
    async listHealthChecks(ctx) {
      assertCtx(ctx);
      return deps.repos.healthChecks.list(ctx);
    },
    async getHealthCheck(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.healthChecks.get(ctx, id), "HealthCheck", id);
    },
    async createHealthCheck(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asHealthCheckId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        serviceKey: typeof input.serviceKey === "string" ? requireString(input.serviceKey, "serviceKey") : input.serviceKey,
        name: typeof input.name === "string" ? requireString(input.name, "name") : input.name,
        status: typeof input.status === "string" ? requireString(input.status, "status") : input.status,
        providerKind: typeof input.providerKind === "string" ? requireString(input.providerKind, "providerKind") : input.providerKind,
        description: input.description,
        checkedAt: input.checkedAt,
        providerRef: input.providerRef,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as HealthCheck;
      const validated = validateHealthCheck(entity);
      return deps.repos.healthChecks.create(ctx, validated);
    },
    async updateHealthCheck(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.healthChecks.get(ctx, input.id),
        "HealthCheck",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        serviceKey: input.serviceKey === null ? undefined : input.serviceKey ?? existing.serviceKey,
        name: input.name ?? existing.name,
        status: input.status ?? existing.status,
        providerKind: input.providerKind ?? existing.providerKind,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        description: input.description === null ? undefined : input.description ?? existing.description,
        checkedAt: input.checkedAt === null ? undefined : input.checkedAt ?? existing.checkedAt,
        providerRef: input.providerRef === null ? undefined : input.providerRef ?? existing.providerRef,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as HealthCheck;
      if (existing.status !== next.status) {
        assertObserveHealthTransition(existing.status, next.status);
      }
      const validated = validateHealthCheck(next);
      return deps.repos.healthChecks.update(ctx, validated);
    },
    async listReadinessChecks(ctx) {
      assertCtx(ctx);
      return deps.repos.readinessChecks.list(ctx);
    },
    async getReadinessCheck(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.readinessChecks.get(ctx, id), "ReadinessCheck", id);
    },
    async createReadinessCheck(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asReadinessCheckId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        serviceKey: typeof input.serviceKey === "string" ? requireString(input.serviceKey, "serviceKey") : input.serviceKey,
        name: typeof input.name === "string" ? requireString(input.name, "name") : input.name,
        status: typeof input.status === "string" ? requireString(input.status, "status") : input.status,
        providerKind: typeof input.providerKind === "string" ? requireString(input.providerKind, "providerKind") : input.providerKind,
        checkedAt: input.checkedAt,
        providerRef: input.providerRef,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as ReadinessCheck;
      const validated = entity;
      return deps.repos.readinessChecks.create(ctx, validated);
    },
    async updateReadinessCheck(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.readinessChecks.get(ctx, input.id),
        "ReadinessCheck",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        serviceKey: input.serviceKey === null ? undefined : input.serviceKey ?? existing.serviceKey,
        name: input.name ?? existing.name,
        status: input.status ?? existing.status,
        providerKind: input.providerKind ?? existing.providerKind,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        checkedAt: input.checkedAt === null ? undefined : input.checkedAt ?? existing.checkedAt,
        providerRef: input.providerRef === null ? undefined : input.providerRef ?? existing.providerRef,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as ReadinessCheck;

      const validated = next;
      return deps.repos.readinessChecks.update(ctx, validated);
    },
    async listLivenessChecks(ctx) {
      assertCtx(ctx);
      return deps.repos.livenessChecks.list(ctx);
    },
    async getLivenessCheck(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.livenessChecks.get(ctx, id), "LivenessCheck", id);
    },
    async createLivenessCheck(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asLivenessCheckId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        serviceKey: typeof input.serviceKey === "string" ? requireString(input.serviceKey, "serviceKey") : input.serviceKey,
        name: typeof input.name === "string" ? requireString(input.name, "name") : input.name,
        status: typeof input.status === "string" ? requireString(input.status, "status") : input.status,
        providerKind: typeof input.providerKind === "string" ? requireString(input.providerKind, "providerKind") : input.providerKind,
        checkedAt: input.checkedAt,
        providerRef: input.providerRef,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as LivenessCheck;
      const validated = entity;
      return deps.repos.livenessChecks.create(ctx, validated);
    },
    async updateLivenessCheck(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.livenessChecks.get(ctx, input.id),
        "LivenessCheck",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        serviceKey: input.serviceKey === null ? undefined : input.serviceKey ?? existing.serviceKey,
        name: input.name ?? existing.name,
        status: input.status ?? existing.status,
        providerKind: input.providerKind ?? existing.providerKind,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        checkedAt: input.checkedAt === null ? undefined : input.checkedAt ?? existing.checkedAt,
        providerRef: input.providerRef === null ? undefined : input.providerRef ?? existing.providerRef,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as LivenessCheck;

      const validated = next;
      return deps.repos.livenessChecks.update(ctx, validated);
    },
    async listServiceHealths(ctx) {
      assertCtx(ctx);
      return deps.repos.serviceHealth.list(ctx);
    },
    async getServiceHealth(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.serviceHealth.get(ctx, id), "ServiceHealth", id);
    },
    async createServiceHealth(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asServiceHealthId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        serviceKey: typeof input.serviceKey === "string" ? requireString(input.serviceKey, "serviceKey") : input.serviceKey,
        displayName: typeof input.displayName === "string" ? requireString(input.displayName, "displayName") : input.displayName,
        overallStatus: typeof input.overallStatus === "string" ? requireString(input.overallStatus, "overallStatus") : input.overallStatus,
        readinessStatus: typeof input.readinessStatus === "string" ? requireString(input.readinessStatus, "readinessStatus") : input.readinessStatus,
        livenessStatus: typeof input.livenessStatus === "string" ? requireString(input.livenessStatus, "livenessStatus") : input.livenessStatus,
        lastEvaluatedAt: input.lastEvaluatedAt,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as ServiceHealth;
      const validated = validateServiceHealth(entity);
      return deps.repos.serviceHealth.create(ctx, validated);
    },
    async updateServiceHealth(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.serviceHealth.get(ctx, input.id),
        "ServiceHealth",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        serviceKey: input.serviceKey === null ? undefined : input.serviceKey ?? existing.serviceKey,
        displayName: input.displayName ?? existing.displayName,
        overallStatus: input.overallStatus ?? existing.overallStatus,
        readinessStatus: input.readinessStatus ?? existing.readinessStatus,
        livenessStatus: input.livenessStatus ?? existing.livenessStatus,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        lastEvaluatedAt: input.lastEvaluatedAt === null ? undefined : input.lastEvaluatedAt ?? existing.lastEvaluatedAt,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as ServiceHealth;
      if (existing.overallStatus !== next.overallStatus) {
        assertObserveHealthTransition(existing.overallStatus, next.overallStatus);
      }
      const validated = validateServiceHealth(next);
      return deps.repos.serviceHealth.update(ctx, validated);
    },
    async listServiceStatuss(ctx) {
      assertCtx(ctx);
      return deps.repos.serviceStatuses.list(ctx);
    },
    async getServiceStatus(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.serviceStatuses.get(ctx, id), "ServiceStatus", id);
    },
    async createServiceStatus(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asServiceStatusId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        serviceKey: typeof input.serviceKey === "string" ? requireString(input.serviceKey, "serviceKey") : input.serviceKey,
        status: typeof input.status === "string" ? requireString(input.status, "status") : input.status,
        message: input.message,
        observedAt: input.observedAt,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as ServiceStatus;
      const validated = entity;
      return deps.repos.serviceStatuses.create(ctx, validated);
    },
    async updateServiceStatus(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.serviceStatuses.get(ctx, input.id),
        "ServiceStatus",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        serviceKey: input.serviceKey === null ? undefined : input.serviceKey ?? existing.serviceKey,
        status: input.status ?? existing.status,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        message: input.message === null ? undefined : input.message ?? existing.message,
        observedAt: input.observedAt === null ? undefined : input.observedAt ?? existing.observedAt,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as ServiceStatus;
      if (existing.status !== next.status) {
        assertObserveHealthTransition(existing.status, next.status);
      }
      const validated = next;
      return deps.repos.serviceStatuses.update(ctx, validated);
    },
    async listComponentStatuss(ctx) {
      assertCtx(ctx);
      return deps.repos.componentStatuses.list(ctx);
    },
    async getComponentStatus(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.componentStatuses.get(ctx, id), "ComponentStatus", id);
    },
    async createComponentStatus(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asComponentStatusId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        serviceKey: typeof input.serviceKey === "string" ? requireString(input.serviceKey, "serviceKey") : input.serviceKey,
        componentKey: typeof input.componentKey === "string" ? requireString(input.componentKey, "componentKey") : input.componentKey,
        name: typeof input.name === "string" ? requireString(input.name, "name") : input.name,
        status: typeof input.status === "string" ? requireString(input.status, "status") : input.status,
        message: input.message,
        observedAt: input.observedAt,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as ComponentStatus;
      const validated = entity;
      return deps.repos.componentStatuses.create(ctx, validated);
    },
    async updateComponentStatus(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.componentStatuses.get(ctx, input.id),
        "ComponentStatus",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        serviceKey: input.serviceKey === null ? undefined : input.serviceKey ?? existing.serviceKey,
        componentKey: input.componentKey ?? existing.componentKey,
        name: input.name ?? existing.name,
        status: input.status ?? existing.status,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        message: input.message === null ? undefined : input.message ?? existing.message,
        observedAt: input.observedAt === null ? undefined : input.observedAt ?? existing.observedAt,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as ComponentStatus;
      if (existing.status !== next.status) {
        assertObserveHealthTransition(existing.status, next.status);
      }
      const validated = next;
      return deps.repos.componentStatuses.update(ctx, validated);
    },
    async listMetricDefinitions(ctx) {
      assertCtx(ctx);
      return deps.repos.metricDefinitions.list(ctx);
    },
    async getMetricDefinition(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.metricDefinitions.get(ctx, id), "MetricDefinition", id);
    },
    async createMetricDefinition(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asMetricDefinitionId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        key: typeof input.key === "string" ? requireString(input.key, "key") : input.key,
        name: typeof input.name === "string" ? requireString(input.name, "name") : input.name,
        kind: typeof input.kind === "string" ? requireString(input.kind, "kind") : input.kind,
        providerKind: typeof input.providerKind === "string" ? requireString(input.providerKind, "providerKind") : input.providerKind,
        status: typeof input.status === "string" ? requireString(input.status, "status") : input.status,
        description: input.description,
        unit: input.unit,
        providerRef: input.providerRef,
        labels: input.labels,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as MetricDefinition;
      const validated = validateMetricDefinition(entity);
      return deps.repos.metricDefinitions.create(ctx, validated);
    },
    async updateMetricDefinition(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.metricDefinitions.get(ctx, input.id),
        "MetricDefinition",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        key: input.key ?? existing.key,
        name: input.name ?? existing.name,
        kind: input.kind ?? existing.kind,
        providerKind: input.providerKind ?? existing.providerKind,
        status: input.status ?? existing.status,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        description: input.description === null ? undefined : input.description ?? existing.description,
        unit: input.unit === null ? undefined : input.unit ?? existing.unit,
        providerRef: input.providerRef === null ? undefined : input.providerRef ?? existing.providerRef,
        labels: input.labels === null ? undefined : input.labels ?? existing.labels,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as MetricDefinition;
      if (existing.status !== next.status) {
        assertObserveMetadataTransition(existing.status, next.status);
      }
      const validated = validateMetricDefinition(next);
      return deps.repos.metricDefinitions.update(ctx, validated);
    },
    async listMetricSamples(ctx) {
      assertCtx(ctx);
      return deps.repos.metricSamples.list(ctx);
    },
    async getMetricSample(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.metricSamples.get(ctx, id), "MetricSample", id);
    },
    async createMetricSample(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asMetricSampleId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        metricDefinitionId: input.metricDefinitionId,
        sampledAt: typeof input.sampledAt === "string" ? requireString(input.sampledAt, "sampledAt") : input.sampledAt,
        providerKind: typeof input.providerKind === "string" ? requireString(input.providerKind, "providerKind") : input.providerKind,
        valueLabel: input.valueLabel,
        providerRef: input.providerRef,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as MetricSample;
      const validated = entity;
      return deps.repos.metricSamples.create(ctx, validated);
    },
    async updateMetricSample(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.metricSamples.get(ctx, input.id),
        "MetricSample",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        metricDefinitionId: input.metricDefinitionId ?? existing.metricDefinitionId,
        sampledAt: input.sampledAt ?? existing.sampledAt,
        providerKind: input.providerKind ?? existing.providerKind,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        valueLabel: input.valueLabel === null ? undefined : input.valueLabel ?? existing.valueLabel,
        providerRef: input.providerRef === null ? undefined : input.providerRef ?? existing.providerRef,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as MetricSample;

      const validated = next;
      return deps.repos.metricSamples.update(ctx, validated);
    },
    async listAlertDefinitions(ctx) {
      assertCtx(ctx);
      return deps.repos.alertDefinitions.list(ctx);
    },
    async getAlertDefinition(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.alertDefinitions.get(ctx, id), "AlertDefinition", id);
    },
    async createAlertDefinition(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asAlertDefinitionId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        key: typeof input.key === "string" ? requireString(input.key, "key") : input.key,
        name: typeof input.name === "string" ? requireString(input.name, "name") : input.name,
        severity: typeof input.severity === "string" ? requireString(input.severity, "severity") : input.severity,
        providerKind: typeof input.providerKind === "string" ? requireString(input.providerKind, "providerKind") : input.providerKind,
        status: typeof input.status === "string" ? requireString(input.status, "status") : input.status,
        description: input.description,
        providerRef: input.providerRef,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as AlertDefinition;
      const validated = validateAlertDefinition(entity);
      return deps.repos.alertDefinitions.create(ctx, validated);
    },
    async updateAlertDefinition(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.alertDefinitions.get(ctx, input.id),
        "AlertDefinition",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        key: input.key ?? existing.key,
        name: input.name ?? existing.name,
        severity: input.severity ?? existing.severity,
        providerKind: input.providerKind ?? existing.providerKind,
        status: input.status ?? existing.status,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        description: input.description === null ? undefined : input.description ?? existing.description,
        providerRef: input.providerRef === null ? undefined : input.providerRef ?? existing.providerRef,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as AlertDefinition;
      if (existing.status !== next.status) {
        assertObserveMetadataTransition(existing.status, next.status);
      }
      const validated = validateAlertDefinition(next);
      return deps.repos.alertDefinitions.update(ctx, validated);
    },
    async listAlertStates(ctx) {
      assertCtx(ctx);
      return deps.repos.alertStates.list(ctx);
    },
    async getAlertState(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.alertStates.get(ctx, id), "AlertState", id);
    },
    async createAlertState(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asAlertStateId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        alertDefinitionId: input.alertDefinitionId,
        state: typeof input.state === "string" ? requireString(input.state, "state") : input.state,
        providerKind: typeof input.providerKind === "string" ? requireString(input.providerKind, "providerKind") : input.providerKind,
        firedAt: input.firedAt,
        resolvedAt: input.resolvedAt,
        message: input.message,
        providerRef: input.providerRef,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as AlertState;
      const validated = entity;
      return deps.repos.alertStates.create(ctx, validated);
    },
    async updateAlertState(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.alertStates.get(ctx, input.id),
        "AlertState",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        alertDefinitionId: input.alertDefinitionId === null ? undefined : input.alertDefinitionId ?? existing.alertDefinitionId,
        state: input.state ?? existing.state,
        providerKind: input.providerKind ?? existing.providerKind,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        firedAt: input.firedAt === null ? undefined : input.firedAt ?? existing.firedAt,
        resolvedAt: input.resolvedAt === null ? undefined : input.resolvedAt ?? existing.resolvedAt,
        message: input.message === null ? undefined : input.message ?? existing.message,
        providerRef: input.providerRef === null ? undefined : input.providerRef ?? existing.providerRef,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as AlertState;
      if (existing.state !== next.state) {
        assertObserveAlertStateTransition(existing.state, next.state);
      }
      const validated = next;
      return deps.repos.alertStates.update(ctx, validated);
    },
    async listDashboardDefinitions(ctx) {
      assertCtx(ctx);
      return deps.repos.dashboards.list(ctx);
    },
    async getDashboardDefinition(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.dashboards.get(ctx, id), "DashboardDefinition", id);
    },
    async createDashboardDefinition(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asDashboardDefinitionId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        key: typeof input.key === "string" ? requireString(input.key, "key") : input.key,
        name: typeof input.name === "string" ? requireString(input.name, "name") : input.name,
        providerKind: typeof input.providerKind === "string" ? requireString(input.providerKind, "providerKind") : input.providerKind,
        status: typeof input.status === "string" ? requireString(input.status, "status") : input.status,
        description: input.description,
        providerRef: input.providerRef,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as DashboardDefinition;
      const validated = entity;
      return deps.repos.dashboards.create(ctx, validated);
    },
    async updateDashboardDefinition(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.dashboards.get(ctx, input.id),
        "DashboardDefinition",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        key: input.key ?? existing.key,
        name: input.name ?? existing.name,
        providerKind: input.providerKind ?? existing.providerKind,
        status: input.status ?? existing.status,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        description: input.description === null ? undefined : input.description ?? existing.description,
        providerRef: input.providerRef === null ? undefined : input.providerRef ?? existing.providerRef,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as DashboardDefinition;
      if (existing.status !== next.status) {
        assertObserveMetadataTransition(existing.status, next.status);
      }
      const validated = next;
      return deps.repos.dashboards.update(ctx, validated);
    },
    async listLogSources(ctx) {
      assertCtx(ctx);
      return deps.repos.logSources.list(ctx);
    },
    async getLogSource(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.logSources.get(ctx, id), "LogSource", id);
    },
    async createLogSource(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asLogSourceId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        key: typeof input.key === "string" ? requireString(input.key, "key") : input.key,
        name: typeof input.name === "string" ? requireString(input.name, "name") : input.name,
        kind: typeof input.kind === "string" ? requireString(input.kind, "kind") : input.kind,
        providerKind: typeof input.providerKind === "string" ? requireString(input.providerKind, "providerKind") : input.providerKind,
        status: typeof input.status === "string" ? requireString(input.status, "status") : input.status,
        providerRef: input.providerRef,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as LogSource;
      const validated = entity;
      return deps.repos.logSources.create(ctx, validated);
    },
    async updateLogSource(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.logSources.get(ctx, input.id),
        "LogSource",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        key: input.key ?? existing.key,
        name: input.name ?? existing.name,
        kind: input.kind ?? existing.kind,
        providerKind: input.providerKind ?? existing.providerKind,
        status: input.status ?? existing.status,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        providerRef: input.providerRef === null ? undefined : input.providerRef ?? existing.providerRef,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as LogSource;
      if (existing.status !== next.status) {
        assertObserveMetadataTransition(existing.status, next.status);
      }
      const validated = next;
      return deps.repos.logSources.update(ctx, validated);
    },
    async listTraceDefinitions(ctx) {
      assertCtx(ctx);
      return deps.repos.traceDefinitions.list(ctx);
    },
    async getTraceDefinition(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.traceDefinitions.get(ctx, id), "TraceDefinition", id);
    },
    async createTraceDefinition(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asTraceDefinitionId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        key: typeof input.key === "string" ? requireString(input.key, "key") : input.key,
        name: typeof input.name === "string" ? requireString(input.name, "name") : input.name,
        providerKind: typeof input.providerKind === "string" ? requireString(input.providerKind, "providerKind") : input.providerKind,
        status: typeof input.status === "string" ? requireString(input.status, "status") : input.status,
        description: input.description,
        providerRef: input.providerRef,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as TraceDefinition;
      const validated = entity;
      return deps.repos.traceDefinitions.create(ctx, validated);
    },
    async updateTraceDefinition(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.traceDefinitions.get(ctx, input.id),
        "TraceDefinition",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        key: input.key ?? existing.key,
        name: input.name ?? existing.name,
        providerKind: input.providerKind ?? existing.providerKind,
        status: input.status ?? existing.status,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        description: input.description === null ? undefined : input.description ?? existing.description,
        providerRef: input.providerRef === null ? undefined : input.providerRef ?? existing.providerRef,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as TraceDefinition;
      if (existing.status !== next.status) {
        assertObserveMetadataTransition(existing.status, next.status);
      }
      const validated = next;
      return deps.repos.traceDefinitions.update(ctx, validated);
    },
    async listTraceSpans(ctx) {
      assertCtx(ctx);
      return deps.repos.traceSpans.list(ctx);
    },
    async getTraceSpan(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.traceSpans.get(ctx, id), "TraceSpan", id);
    },
    async createTraceSpan(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asTraceSpanId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        traceDefinitionId: input.traceDefinitionId,
        spanName: typeof input.spanName === "string" ? requireString(input.spanName, "spanName") : input.spanName,
        providerKind: typeof input.providerKind === "string" ? requireString(input.providerKind, "providerKind") : input.providerKind,
        serviceKey: input.serviceKey,
        startedAt: input.startedAt,
        endedAt: input.endedAt,
        providerRef: input.providerRef,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as TraceSpan;
      const validated = entity;
      return deps.repos.traceSpans.create(ctx, validated);
    },
    async updateTraceSpan(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.traceSpans.get(ctx, input.id),
        "TraceSpan",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        traceDefinitionId: input.traceDefinitionId ?? existing.traceDefinitionId,
        spanName: input.spanName ?? existing.spanName,
        providerKind: input.providerKind ?? existing.providerKind,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        serviceKey: input.serviceKey === null ? undefined : input.serviceKey ?? existing.serviceKey,
        startedAt: input.startedAt === null ? undefined : input.startedAt ?? existing.startedAt,
        endedAt: input.endedAt === null ? undefined : input.endedAt ?? existing.endedAt,
        providerRef: input.providerRef === null ? undefined : input.providerRef ?? existing.providerRef,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as TraceSpan;

      const validated = next;
      return deps.repos.traceSpans.update(ctx, validated);
    },
    async listIncidentReferences(ctx) {
      assertCtx(ctx);
      return deps.repos.incidentReferences.list(ctx);
    },
    async getIncidentReference(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.incidentReferences.get(ctx, id), "IncidentReference", id);
    },
    async createIncidentReference(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asIncidentReferenceId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        key: typeof input.key === "string" ? requireString(input.key, "key") : input.key,
        title: typeof input.title === "string" ? requireString(input.title, "title") : input.title,
        status: typeof input.status === "string" ? requireString(input.status, "status") : input.status,
        serviceKey: input.serviceKey,
        alertDefinitionId: input.alertDefinitionId,
        externalRef: input.externalRef,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as IncidentReference;
      const validated = entity;
      return deps.repos.incidentReferences.create(ctx, validated);
    },
    async updateIncidentReference(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.incidentReferences.get(ctx, input.id),
        "IncidentReference",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        key: input.key ?? existing.key,
        title: input.title ?? existing.title,
        status: input.status ?? existing.status,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        serviceKey: input.serviceKey === null ? undefined : input.serviceKey ?? existing.serviceKey,
        alertDefinitionId: input.alertDefinitionId === null ? undefined : input.alertDefinitionId ?? existing.alertDefinitionId,
        externalRef: input.externalRef === null ? undefined : input.externalRef ?? existing.externalRef,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as IncidentReference;
      if (existing.status !== next.status) {
        assertObserveMetadataTransition(existing.status, next.status);
      }
      const validated = next;
      return deps.repos.incidentReferences.update(ctx, validated);
    },
    async listMaintenanceWindows(ctx) {
      assertCtx(ctx);
      return deps.repos.maintenanceWindows.list(ctx);
    },
    async getMaintenanceWindow(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.maintenanceWindows.get(ctx, id), "MaintenanceWindow", id);
    },
    async createMaintenanceWindow(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asMaintenanceWindowId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        key: typeof input.key === "string" ? requireString(input.key, "key") : input.key,
        name: typeof input.name === "string" ? requireString(input.name, "name") : input.name,
        startsAt: typeof input.startsAt === "string" ? requireString(input.startsAt, "startsAt") : input.startsAt,
        endsAt: typeof input.endsAt === "string" ? requireString(input.endsAt, "endsAt") : input.endsAt,
        status: typeof input.status === "string" ? requireString(input.status, "status") : input.status,
        serviceKey: input.serviceKey,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as MaintenanceWindow;
      const validated = entity;
      return deps.repos.maintenanceWindows.create(ctx, validated);
    },
    async updateMaintenanceWindow(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.maintenanceWindows.get(ctx, input.id),
        "MaintenanceWindow",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        key: input.key ?? existing.key,
        name: input.name ?? existing.name,
        startsAt: input.startsAt ?? existing.startsAt,
        endsAt: input.endsAt ?? existing.endsAt,
        status: input.status ?? existing.status,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        serviceKey: input.serviceKey === null ? undefined : input.serviceKey ?? existing.serviceKey,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as MaintenanceWindow;
      if (existing.status !== next.status) {
        assertObserveMetadataTransition(existing.status, next.status);
      }
      const validated = next;
      return deps.repos.maintenanceWindows.update(ctx, validated);
    },
    async listHealthSummarys(ctx) {
      assertCtx(ctx);
      return deps.repos.healthSummaries.list(ctx);
    },
    async getHealthSummary(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.healthSummaries.get(ctx, id), "HealthSummary", id);
    },
    async createHealthSummary(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asHealthSummaryId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        scopeKey: typeof input.scopeKey === "string" ? requireString(input.scopeKey, "scopeKey") : input.scopeKey,
        overallStatus: typeof input.overallStatus === "string" ? requireString(input.overallStatus, "overallStatus") : input.overallStatus,
        healthyCount: input.healthyCount,
        degradedCount: input.degradedCount,
        unhealthyCount: input.unhealthyCount,
        evaluatedAt: typeof input.evaluatedAt === "string" ? requireString(input.evaluatedAt, "evaluatedAt") : input.evaluatedAt,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as HealthSummary;
      const validated = entity;
      return deps.repos.healthSummaries.create(ctx, validated);
    },
    async updateHealthSummary(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.healthSummaries.get(ctx, input.id),
        "HealthSummary",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        scopeKey: input.scopeKey ?? existing.scopeKey,
        overallStatus: input.overallStatus ?? existing.overallStatus,
        healthyCount: input.healthyCount ?? existing.healthyCount,
        degradedCount: input.degradedCount ?? existing.degradedCount,
        unhealthyCount: input.unhealthyCount ?? existing.unhealthyCount,
        evaluatedAt: input.evaluatedAt ?? existing.evaluatedAt,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as HealthSummary;
      if (existing.overallStatus !== next.overallStatus) {
        assertObserveHealthTransition(existing.overallStatus, next.overallStatus);
      }
      const validated = next;
      return deps.repos.healthSummaries.update(ctx, validated);
    },
    async listObservabilityMetadatas(ctx) {
      assertCtx(ctx);
      return deps.repos.metadata.list(ctx);
    },
    async getObservabilityMetadata(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.metadata.get(ctx, id), "ObservabilityMetadata", id);
    },
    async createObservabilityMetadata(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.payload);
      const now = deps.now();
      const entity = {
        id: asObservabilityMetadataId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        key: typeof input.key === "string" ? requireString(input.key, "key") : input.key,
        name: typeof input.name === "string" ? requireString(input.name, "name") : input.name,
        category: typeof input.category === "string" ? requireString(input.category, "category") : input.category,
        status: typeof input.status === "string" ? requireString(input.status, "status") : input.status,
        payload: input.payload,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as ObservabilityMetadata;
      const validated = entity;
      return deps.repos.metadata.create(ctx, validated);
    },
    async updateObservabilityMetadata(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.metadata.get(ctx, input.id),
        "ObservabilityMetadata",
        input.id,
      );
      assertNoCredentialPayload((input.payload === null ? undefined : input.payload ?? existing.payload));
      const next = {
        ...existing,
        key: input.key ?? existing.key,
        name: input.name ?? existing.name,
        category: input.category ?? existing.category,
        status: input.status ?? existing.status,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        payload: input.payload === null ? undefined : input.payload ?? existing.payload,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as ObservabilityMetadata;
      if (existing.status !== next.status) {
        assertObserveMetadataTransition(existing.status, next.status);
      }
      const validated = next;
      return deps.repos.metadata.update(ctx, validated);
    },
    async listPlatformDiagnostics(ctx) {
      assertCtx(ctx);
      return deps.repos.diagnostics.list(ctx);
    },
    async getPlatformDiagnostic(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.diagnostics.get(ctx, id), "PlatformDiagnostic", id);
    },
    async createPlatformDiagnostic(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asPlatformDiagnosticId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        key: typeof input.key === "string" ? requireString(input.key, "key") : input.key,
        name: typeof input.name === "string" ? requireString(input.name, "name") : input.name,
        status: typeof input.status === "string" ? requireString(input.status, "status") : input.status,
        providerKind: typeof input.providerKind === "string" ? requireString(input.providerKind, "providerKind") : input.providerKind,
        serviceKey: input.serviceKey,
        detail: input.detail,
        providerRef: input.providerRef,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as PlatformDiagnostic;
      const validated = entity;
      return deps.repos.diagnostics.create(ctx, validated);
    },
    async updatePlatformDiagnostic(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.diagnostics.get(ctx, input.id),
        "PlatformDiagnostic",
        input.id,
      );
      assertNoCredentialPayload((input.metadata === null ? undefined : input.metadata ?? existing.metadata));
      const next = {
        ...existing,
        key: input.key ?? existing.key,
        name: input.name ?? existing.name,
        status: input.status ?? existing.status,
        providerKind: input.providerKind ?? existing.providerKind,
        organisationId: input.organisationId === null ? undefined : input.organisationId ?? existing.organisationId,
        serviceKey: input.serviceKey === null ? undefined : input.serviceKey ?? existing.serviceKey,
        detail: input.detail === null ? undefined : input.detail ?? existing.detail,
        providerRef: input.providerRef === null ? undefined : input.providerRef ?? existing.providerRef,
        metadata: input.metadata === null ? undefined : input.metadata ?? existing.metadata,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      } as PlatformDiagnostic;
      if (existing.status !== next.status) {
        assertObserveHealthTransition(existing.status, next.status);
      }
      const validated = next;
      return deps.repos.diagnostics.update(ctx, validated);
    },
    async diagnosticsHealth(ctx) {
      assertCtx(ctx);
      return {
        status: "healthy",
        persistenceMode: mode,
        providerExecutionEnabled: false,
        checkedAt: deps.now(),
      };
    },
    async diagnosticsReadiness(ctx) {
      assertCtx(ctx);
      return {
        ready: true,
        observeEnabled: true,
        persistenceMode: mode,
        providerExecutionEnabled: false,
        capabilities: [...FACET_NAMES],
      };
    },
    async diagnosticsCapabilities(ctx) {
      assertCtx(ctx);
      return {
        providerExecution: false,
        facets: [...FACET_NAMES],
        metadataCompleteness: "foundation",
      };
    },
  };
}
