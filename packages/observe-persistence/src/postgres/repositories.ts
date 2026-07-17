/**
 * PostgreSQL Observability repositories (APZOBSERVE-001).
 * Drizzle against platform_observe_* tables — metadata only.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  platformObserveHealthCheck,
  platformObserveReadinessCheck,
  platformObserveLivenessCheck,
  platformObserveServiceHealth,
  platformObserveServiceStatus,
  platformObserveComponentStatus,
  platformObserveMetricDefinition,
  platformObserveMetricSample,
  platformObserveAlertDefinition,
  platformObserveAlertState,
  platformObserveDashboard,
  platformObserveLogSource,
  platformObserveTraceDefinition,
  platformObserveTraceSpan,
  platformObserveIncidentReference,
  platformObserveMaintenanceWindow,
  platformObserveHealthSummary,
  platformObserveDiagnostic,
  platformObserveMetadata,
} from "@apzhub/config";
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
  asPlatformDiagnosticId,
  asObservabilityMetadataId,
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
import { and, asc, eq } from "drizzle-orm";

function toDate(value?: string): Date | null {
  return value ? new Date(value) : null;
}

function auditFrom(row: {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  revision: number;
}) {
  return {
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

function mapHealthCheck(row: typeof platformObserveHealthCheck.$inferSelect): HealthCheck {
  return {
    id: asHealthCheckId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    serviceKey: row.serviceKey,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status as HealthCheck["status"],
    checkedAt: row.checkedAt?.toISOString(),
    providerKind: row.providerKind as HealthCheck["providerKind"],
    providerRef: row.providerRef ?? undefined,
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as HealthCheck;
}

function toHealthCheckRow(entity: HealthCheck) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    serviceKey: entity.serviceKey,
    name: entity.name,
    description: entity.description ?? null,
    status: entity.status,
    checkedAt: toDate(entity.checkedAt),
    providerKind: entity.providerKind,
    providerRef: entity.providerRef ?? null,
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapReadinessCheck(row: typeof platformObserveReadinessCheck.$inferSelect): ReadinessCheck {
  return {
    id: asReadinessCheckId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    serviceKey: row.serviceKey,
    name: row.name,
    status: row.status as ReadinessCheck["status"],
    checkedAt: row.checkedAt?.toISOString(),
    providerKind: row.providerKind as ReadinessCheck["providerKind"],
    providerRef: row.providerRef ?? undefined,
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as ReadinessCheck;
}

function toReadinessCheckRow(entity: ReadinessCheck) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    serviceKey: entity.serviceKey,
    name: entity.name,
    status: entity.status,
    checkedAt: toDate(entity.checkedAt),
    providerKind: entity.providerKind,
    providerRef: entity.providerRef ?? null,
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapLivenessCheck(row: typeof platformObserveLivenessCheck.$inferSelect): LivenessCheck {
  return {
    id: asLivenessCheckId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    serviceKey: row.serviceKey,
    name: row.name,
    status: row.status as LivenessCheck["status"],
    checkedAt: row.checkedAt?.toISOString(),
    providerKind: row.providerKind as LivenessCheck["providerKind"],
    providerRef: row.providerRef ?? undefined,
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as LivenessCheck;
}

function toLivenessCheckRow(entity: LivenessCheck) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    serviceKey: entity.serviceKey,
    name: entity.name,
    status: entity.status,
    checkedAt: toDate(entity.checkedAt),
    providerKind: entity.providerKind,
    providerRef: entity.providerRef ?? null,
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapServiceHealth(row: typeof platformObserveServiceHealth.$inferSelect): ServiceHealth {
  return {
    id: asServiceHealthId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    serviceKey: row.serviceKey,
    displayName: row.displayName,
    overallStatus: row.overallStatus as ServiceHealth["overallStatus"],
    readinessStatus: row.readinessStatus as ServiceHealth["readinessStatus"],
    livenessStatus: row.livenessStatus as ServiceHealth["livenessStatus"],
    lastEvaluatedAt: row.lastEvaluatedAt?.toISOString(),
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as ServiceHealth;
}

function toServiceHealthRow(entity: ServiceHealth) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    serviceKey: entity.serviceKey,
    displayName: entity.displayName,
    overallStatus: entity.overallStatus,
    readinessStatus: entity.readinessStatus,
    livenessStatus: entity.livenessStatus,
    lastEvaluatedAt: toDate(entity.lastEvaluatedAt),
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapServiceStatus(row: typeof platformObserveServiceStatus.$inferSelect): ServiceStatus {
  return {
    id: asServiceStatusId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    serviceKey: row.serviceKey,
    status: row.status as ServiceStatus["status"],
    message: row.message ?? undefined,
    observedAt: row.observedAt?.toISOString(),
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as ServiceStatus;
}

function toServiceStatusRow(entity: ServiceStatus) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    serviceKey: entity.serviceKey,
    status: entity.status,
    message: entity.message ?? null,
    observedAt: toDate(entity.observedAt),
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapComponentStatus(row: typeof platformObserveComponentStatus.$inferSelect): ComponentStatus {
  return {
    id: asComponentStatusId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    serviceKey: row.serviceKey,
    componentKey: row.componentKey,
    name: row.name,
    status: row.status as ComponentStatus["status"],
    message: row.message ?? undefined,
    observedAt: row.observedAt?.toISOString(),
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as ComponentStatus;
}

function toComponentStatusRow(entity: ComponentStatus) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    serviceKey: entity.serviceKey,
    componentKey: entity.componentKey,
    name: entity.name,
    status: entity.status,
    message: entity.message ?? null,
    observedAt: toDate(entity.observedAt),
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricDefinition(row: typeof platformObserveMetricDefinition.$inferSelect): MetricDefinition {
  return {
    id: asMetricDefinitionId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    kind: row.kind as MetricDefinition["kind"],
    unit: row.unit ?? undefined,
    providerKind: row.providerKind as MetricDefinition["providerKind"],
    providerRef: row.providerRef ?? undefined,
    status: row.status as MetricDefinition["status"],
    labels: (row.labels ?? undefined) as Record<string, string> | undefined,
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as MetricDefinition;
}

function toMetricDefinitionRow(entity: MetricDefinition) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    description: entity.description ?? null,
    kind: entity.kind,
    unit: entity.unit ?? null,
    providerKind: entity.providerKind,
    providerRef: entity.providerRef ?? null,
    status: entity.status,
    labels: entity.labels ?? {},
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricSample(row: typeof platformObserveMetricSample.$inferSelect): MetricSample {
  return {
    id: asMetricSampleId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    metricDefinitionId: asMetricDefinitionId(row.metricDefinitionId),
    sampledAt: row.sampledAt.toISOString(),
    valueLabel: row.valueLabel ?? undefined,
    providerKind: row.providerKind as MetricSample["providerKind"],
    providerRef: row.providerRef ?? undefined,
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as MetricSample;
}

function toMetricSampleRow(entity: MetricSample) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    metricDefinitionId: entity.metricDefinitionId,
    sampledAt: new Date(entity.sampledAt),
    valueLabel: entity.valueLabel ?? null,
    providerKind: entity.providerKind,
    providerRef: entity.providerRef ?? null,
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapAlertDefinition(row: typeof platformObserveAlertDefinition.$inferSelect): AlertDefinition {
  return {
    id: asAlertDefinitionId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    severity: row.severity as AlertDefinition["severity"],
    providerKind: row.providerKind as AlertDefinition["providerKind"],
    providerRef: row.providerRef ?? undefined,
    status: row.status as AlertDefinition["status"],
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as AlertDefinition;
}

function toAlertDefinitionRow(entity: AlertDefinition) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    description: entity.description ?? null,
    severity: entity.severity,
    providerKind: entity.providerKind,
    providerRef: entity.providerRef ?? null,
    status: entity.status,
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapAlertState(row: typeof platformObserveAlertState.$inferSelect): AlertState {
  return {
    id: asAlertStateId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    alertDefinitionId: asAlertDefinitionId(row.alertDefinitionId),
    state: row.state as AlertState["state"],
    firedAt: row.firedAt?.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString(),
    message: row.message ?? undefined,
    providerKind: row.providerKind as AlertState["providerKind"],
    providerRef: row.providerRef ?? undefined,
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as AlertState;
}

function toAlertStateRow(entity: AlertState) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    alertDefinitionId: entity.alertDefinitionId,
    state: entity.state,
    firedAt: toDate(entity.firedAt),
    resolvedAt: toDate(entity.resolvedAt),
    message: entity.message ?? null,
    providerKind: entity.providerKind,
    providerRef: entity.providerRef ?? null,
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapDashboardDefinition(row: typeof platformObserveDashboard.$inferSelect): DashboardDefinition {
  return {
    id: asDashboardDefinitionId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    providerKind: row.providerKind as DashboardDefinition["providerKind"],
    providerRef: row.providerRef ?? undefined,
    status: row.status as DashboardDefinition["status"],
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as DashboardDefinition;
}

function toDashboardDefinitionRow(entity: DashboardDefinition) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    description: entity.description ?? null,
    providerKind: entity.providerKind,
    providerRef: entity.providerRef ?? null,
    status: entity.status,
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapLogSource(row: typeof platformObserveLogSource.$inferSelect): LogSource {
  return {
    id: asLogSourceId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    name: row.name,
    kind: row.kind as LogSource["kind"],
    providerKind: row.providerKind as LogSource["providerKind"],
    providerRef: row.providerRef ?? undefined,
    status: row.status as LogSource["status"],
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as LogSource;
}

function toLogSourceRow(entity: LogSource) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    kind: entity.kind,
    providerKind: entity.providerKind,
    providerRef: entity.providerRef ?? null,
    status: entity.status,
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapTraceDefinition(row: typeof platformObserveTraceDefinition.$inferSelect): TraceDefinition {
  return {
    id: asTraceDefinitionId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    providerKind: row.providerKind as TraceDefinition["providerKind"],
    providerRef: row.providerRef ?? undefined,
    status: row.status as TraceDefinition["status"],
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as TraceDefinition;
}

function toTraceDefinitionRow(entity: TraceDefinition) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    description: entity.description ?? null,
    providerKind: entity.providerKind,
    providerRef: entity.providerRef ?? null,
    status: entity.status,
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapTraceSpan(row: typeof platformObserveTraceSpan.$inferSelect): TraceSpan {
  return {
    id: asTraceSpanId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    traceDefinitionId: asTraceDefinitionId(row.traceDefinitionId),
    spanName: row.spanName,
    serviceKey: row.serviceKey ?? undefined,
    startedAt: row.startedAt?.toISOString(),
    endedAt: row.endedAt?.toISOString(),
    providerKind: row.providerKind as TraceSpan["providerKind"],
    providerRef: row.providerRef ?? undefined,
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as TraceSpan;
}

function toTraceSpanRow(entity: TraceSpan) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    traceDefinitionId: entity.traceDefinitionId,
    spanName: entity.spanName,
    serviceKey: entity.serviceKey ?? null,
    startedAt: toDate(entity.startedAt),
    endedAt: toDate(entity.endedAt),
    providerKind: entity.providerKind,
    providerRef: entity.providerRef ?? null,
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapIncidentReference(row: typeof platformObserveIncidentReference.$inferSelect): IncidentReference {
  return {
    id: asIncidentReferenceId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    title: row.title,
    serviceKey: row.serviceKey ?? undefined,
    alertDefinitionId: row.alertDefinitionId ? asAlertDefinitionId(row.alertDefinitionId) : undefined,
    status: row.status as IncidentReference["status"],
    externalRef: row.externalRef ?? undefined,
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as IncidentReference;
}

function toIncidentReferenceRow(entity: IncidentReference) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    title: entity.title,
    serviceKey: entity.serviceKey ?? null,
    alertDefinitionId: entity.alertDefinitionId ?? null,
    status: entity.status,
    externalRef: entity.externalRef ?? null,
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMaintenanceWindow(row: typeof platformObserveMaintenanceWindow.$inferSelect): MaintenanceWindow {
  return {
    id: asMaintenanceWindowId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    name: row.name,
    serviceKey: row.serviceKey ?? undefined,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    status: row.status as MaintenanceWindow["status"],
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as MaintenanceWindow;
}

function toMaintenanceWindowRow(entity: MaintenanceWindow) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    serviceKey: entity.serviceKey ?? null,
    startsAt: new Date(entity.startsAt),
    endsAt: new Date(entity.endsAt),
    status: entity.status,
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapHealthSummary(row: typeof platformObserveHealthSummary.$inferSelect): HealthSummary {
  return {
    id: asHealthSummaryId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    scopeKey: row.scopeKey,
    overallStatus: row.overallStatus as HealthSummary["overallStatus"],
    healthyCount: row.healthyCount,
    degradedCount: row.degradedCount,
    unhealthyCount: row.unhealthyCount,
    evaluatedAt: row.evaluatedAt.toISOString(),
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as HealthSummary;
}

function toHealthSummaryRow(entity: HealthSummary) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    scopeKey: entity.scopeKey,
    overallStatus: entity.overallStatus,
    healthyCount: entity.healthyCount,
    degradedCount: entity.degradedCount,
    unhealthyCount: entity.unhealthyCount,
    evaluatedAt: new Date(entity.evaluatedAt),
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapPlatformDiagnostic(row: typeof platformObserveDiagnostic.$inferSelect): PlatformDiagnostic {
  return {
    id: asPlatformDiagnosticId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    name: row.name,
    serviceKey: row.serviceKey ?? undefined,
    status: row.status as PlatformDiagnostic["status"],
    detail: row.detail ?? undefined,
    providerKind: row.providerKind as PlatformDiagnostic["providerKind"],
    providerRef: row.providerRef ?? undefined,
    metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as PlatformDiagnostic;
}

function toPlatformDiagnosticRow(entity: PlatformDiagnostic) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    serviceKey: entity.serviceKey ?? null,
    status: entity.status,
    detail: entity.detail ?? null,
    providerKind: entity.providerKind,
    providerRef: entity.providerRef ?? null,
    metadata: entity.metadata ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapObservabilityMetadata(row: typeof platformObserveMetadata.$inferSelect): ObservabilityMetadata {
  return {
    id: asObservabilityMetadataId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    name: row.name,
    category: row.category,
    status: row.status as ObservabilityMetadata["status"],
    payload: (row.payload ?? undefined) as Record<string, unknown> | undefined,
    ...auditFrom(row),
  } as ObservabilityMetadata;
}

function toObservabilityMetadataRow(entity: ObservabilityMetadata) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    category: entity.category,
    status: entity.status,
    payload: entity.payload ?? {},
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

export type PostgresObserveRepositories = ObserveFoundationRepos;

export function createPostgresObserveRepositories(
  db: DatabaseExecutor,
): PostgresObserveRepositories {
  const healthChecks: HealthCheckRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveHealthCheck).values(toHealthCheckRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveHealthCheck)
        .where(and(eq(platformObserveHealthCheck.id, id), eq(platformObserveHealthCheck.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapHealthCheck(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveHealthCheck)
        .set(toHealthCheckRow(entity))
        .where(eq(platformObserveHealthCheck.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveHealthCheck)
        .where(eq(platformObserveHealthCheck.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveHealthCheck.id));
      return rows.map(mapHealthCheck);
    },
  };

  const readinessChecks: ReadinessCheckRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveReadinessCheck).values(toReadinessCheckRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveReadinessCheck)
        .where(and(eq(platformObserveReadinessCheck.id, id), eq(platformObserveReadinessCheck.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapReadinessCheck(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveReadinessCheck)
        .set(toReadinessCheckRow(entity))
        .where(eq(platformObserveReadinessCheck.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveReadinessCheck)
        .where(eq(platformObserveReadinessCheck.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveReadinessCheck.id));
      return rows.map(mapReadinessCheck);
    },
  };

  const livenessChecks: LivenessCheckRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveLivenessCheck).values(toLivenessCheckRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveLivenessCheck)
        .where(and(eq(platformObserveLivenessCheck.id, id), eq(platformObserveLivenessCheck.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapLivenessCheck(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveLivenessCheck)
        .set(toLivenessCheckRow(entity))
        .where(eq(platformObserveLivenessCheck.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveLivenessCheck)
        .where(eq(platformObserveLivenessCheck.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveLivenessCheck.id));
      return rows.map(mapLivenessCheck);
    },
  };

  const serviceHealth: ServiceHealthRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveServiceHealth).values(toServiceHealthRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveServiceHealth)
        .where(and(eq(platformObserveServiceHealth.id, id), eq(platformObserveServiceHealth.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapServiceHealth(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveServiceHealth)
        .set(toServiceHealthRow(entity))
        .where(eq(platformObserveServiceHealth.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveServiceHealth)
        .where(eq(platformObserveServiceHealth.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveServiceHealth.id));
      return rows.map(mapServiceHealth);
    },
  };

  const serviceStatuses: ServiceStatusRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveServiceStatus).values(toServiceStatusRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveServiceStatus)
        .where(and(eq(platformObserveServiceStatus.id, id), eq(platformObserveServiceStatus.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapServiceStatus(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveServiceStatus)
        .set(toServiceStatusRow(entity))
        .where(eq(platformObserveServiceStatus.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveServiceStatus)
        .where(eq(platformObserveServiceStatus.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveServiceStatus.id));
      return rows.map(mapServiceStatus);
    },
  };

  const componentStatuses: ComponentStatusRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveComponentStatus).values(toComponentStatusRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveComponentStatus)
        .where(and(eq(platformObserveComponentStatus.id, id), eq(platformObserveComponentStatus.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapComponentStatus(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveComponentStatus)
        .set(toComponentStatusRow(entity))
        .where(eq(platformObserveComponentStatus.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveComponentStatus)
        .where(eq(platformObserveComponentStatus.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveComponentStatus.id));
      return rows.map(mapComponentStatus);
    },
  };

  const metricDefinitions: MetricDefinitionRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveMetricDefinition).values(toMetricDefinitionRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveMetricDefinition)
        .where(and(eq(platformObserveMetricDefinition.id, id), eq(platformObserveMetricDefinition.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapMetricDefinition(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveMetricDefinition)
        .set(toMetricDefinitionRow(entity))
        .where(eq(platformObserveMetricDefinition.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveMetricDefinition)
        .where(eq(platformObserveMetricDefinition.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveMetricDefinition.id));
      return rows.map(mapMetricDefinition);
    },
  };

  const metricSamples: MetricSampleRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveMetricSample).values(toMetricSampleRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveMetricSample)
        .where(and(eq(platformObserveMetricSample.id, id), eq(platformObserveMetricSample.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapMetricSample(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveMetricSample)
        .set(toMetricSampleRow(entity))
        .where(eq(platformObserveMetricSample.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveMetricSample)
        .where(eq(platformObserveMetricSample.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveMetricSample.id));
      return rows.map(mapMetricSample);
    },
  };

  const alertDefinitions: AlertDefinitionRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveAlertDefinition).values(toAlertDefinitionRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveAlertDefinition)
        .where(and(eq(platformObserveAlertDefinition.id, id), eq(platformObserveAlertDefinition.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapAlertDefinition(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveAlertDefinition)
        .set(toAlertDefinitionRow(entity))
        .where(eq(platformObserveAlertDefinition.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveAlertDefinition)
        .where(eq(platformObserveAlertDefinition.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveAlertDefinition.id));
      return rows.map(mapAlertDefinition);
    },
  };

  const alertStates: AlertStateRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveAlertState).values(toAlertStateRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveAlertState)
        .where(and(eq(platformObserveAlertState.id, id), eq(platformObserveAlertState.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapAlertState(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveAlertState)
        .set(toAlertStateRow(entity))
        .where(eq(platformObserveAlertState.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveAlertState)
        .where(eq(platformObserveAlertState.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveAlertState.id));
      return rows.map(mapAlertState);
    },
  };

  const dashboards: DashboardDefinitionRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveDashboard).values(toDashboardDefinitionRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveDashboard)
        .where(and(eq(platformObserveDashboard.id, id), eq(platformObserveDashboard.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapDashboardDefinition(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveDashboard)
        .set(toDashboardDefinitionRow(entity))
        .where(eq(platformObserveDashboard.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveDashboard)
        .where(eq(platformObserveDashboard.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveDashboard.id));
      return rows.map(mapDashboardDefinition);
    },
  };

  const logSources: LogSourceRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveLogSource).values(toLogSourceRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveLogSource)
        .where(and(eq(platformObserveLogSource.id, id), eq(platformObserveLogSource.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapLogSource(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveLogSource)
        .set(toLogSourceRow(entity))
        .where(eq(platformObserveLogSource.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveLogSource)
        .where(eq(platformObserveLogSource.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveLogSource.id));
      return rows.map(mapLogSource);
    },
  };

  const traceDefinitions: TraceDefinitionRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveTraceDefinition).values(toTraceDefinitionRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveTraceDefinition)
        .where(and(eq(platformObserveTraceDefinition.id, id), eq(platformObserveTraceDefinition.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapTraceDefinition(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveTraceDefinition)
        .set(toTraceDefinitionRow(entity))
        .where(eq(platformObserveTraceDefinition.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveTraceDefinition)
        .where(eq(platformObserveTraceDefinition.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveTraceDefinition.id));
      return rows.map(mapTraceDefinition);
    },
  };

  const traceSpans: TraceSpanRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveTraceSpan).values(toTraceSpanRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveTraceSpan)
        .where(and(eq(platformObserveTraceSpan.id, id), eq(platformObserveTraceSpan.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapTraceSpan(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveTraceSpan)
        .set(toTraceSpanRow(entity))
        .where(eq(platformObserveTraceSpan.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveTraceSpan)
        .where(eq(platformObserveTraceSpan.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveTraceSpan.id));
      return rows.map(mapTraceSpan);
    },
  };

  const incidentReferences: IncidentReferenceRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveIncidentReference).values(toIncidentReferenceRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveIncidentReference)
        .where(and(eq(platformObserveIncidentReference.id, id), eq(platformObserveIncidentReference.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapIncidentReference(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveIncidentReference)
        .set(toIncidentReferenceRow(entity))
        .where(eq(platformObserveIncidentReference.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveIncidentReference)
        .where(eq(platformObserveIncidentReference.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveIncidentReference.id));
      return rows.map(mapIncidentReference);
    },
  };

  const maintenanceWindows: MaintenanceWindowRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveMaintenanceWindow).values(toMaintenanceWindowRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveMaintenanceWindow)
        .where(and(eq(platformObserveMaintenanceWindow.id, id), eq(platformObserveMaintenanceWindow.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapMaintenanceWindow(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveMaintenanceWindow)
        .set(toMaintenanceWindowRow(entity))
        .where(eq(platformObserveMaintenanceWindow.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveMaintenanceWindow)
        .where(eq(platformObserveMaintenanceWindow.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveMaintenanceWindow.id));
      return rows.map(mapMaintenanceWindow);
    },
  };

  const healthSummaries: HealthSummaryRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveHealthSummary).values(toHealthSummaryRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveHealthSummary)
        .where(and(eq(platformObserveHealthSummary.id, id), eq(platformObserveHealthSummary.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapHealthSummary(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveHealthSummary)
        .set(toHealthSummaryRow(entity))
        .where(eq(platformObserveHealthSummary.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveHealthSummary)
        .where(eq(platformObserveHealthSummary.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveHealthSummary.id));
      return rows.map(mapHealthSummary);
    },
  };

  const diagnostics: PlatformDiagnosticRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveDiagnostic).values(toPlatformDiagnosticRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveDiagnostic)
        .where(and(eq(platformObserveDiagnostic.id, id), eq(platformObserveDiagnostic.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapPlatformDiagnostic(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveDiagnostic)
        .set(toPlatformDiagnosticRow(entity))
        .where(eq(platformObserveDiagnostic.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveDiagnostic)
        .where(eq(platformObserveDiagnostic.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveDiagnostic.id));
      return rows.map(mapPlatformDiagnostic);
    },
  };

  const metadata: ObservabilityMetadataRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformObserveMetadata).values(toObservabilityMetadataRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformObserveMetadata)
        .where(and(eq(platformObserveMetadata.id, id), eq(platformObserveMetadata.tenantId, ctx.tenantId)))
        .limit(1);
      const row = rows[0];
      return row ? mapObservabilityMetadata(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformObserveMetadata)
        .set(toObservabilityMetadataRow(entity))
        .where(eq(platformObserveMetadata.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformObserveMetadata)
        .where(eq(platformObserveMetadata.tenantId, ctx.tenantId))
        .orderBy(asc(platformObserveMetadata.id));
      return rows.map(mapObservabilityMetadata);
    },
  };

  return {
    healthChecks,
    readinessChecks,
    livenessChecks,
    serviceHealth,
    serviceStatuses,
    componentStatuses,
    metricDefinitions,
    metricSamples,
    alertDefinitions,
    alertStates,
    dashboards,
    logSources,
    traceDefinitions,
    traceSpans,
    incidentReferences,
    maintenanceWindows,
    healthSummaries,
    diagnostics,
    metadata,
  };
}
