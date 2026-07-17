/**
 * Platform Observability domain models (APZOBSERVE-001).
 * Metadata System of Record only — not TSDB / log store / dashboard runtime.
 */

import type { ObserveAuditFields } from "../common/context";
import type {
  AlertDefinitionId,
  AlertStateId,
  ComponentStatusId,
  DashboardDefinitionId,
  HealthCheckId,
  HealthSummaryId,
  IncidentReferenceId,
  LivenessCheckId,
  LogSourceId,
  MaintenanceWindowId,
  MetricDefinitionId,
  MetricSampleId,
  ObservabilityMetadataId,
  PlatformDiagnosticId,
  ReadinessCheckId,
  ServiceHealthId,
  ServiceStatusId,
  TraceDefinitionId,
  TraceSpanId,
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

export type HealthCheck = ObserveAuditFields & {
  readonly id: HealthCheckId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly serviceKey: string;
  readonly name: string;
  readonly description?: string;
  readonly status: ObserveHealthStatus;
  readonly checkedAt?: string;
  readonly providerKind: ObserveProviderKind;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type ReadinessCheck = ObserveAuditFields & {
  readonly id: ReadinessCheckId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly serviceKey: string;
  readonly name: string;
  readonly status: ObserveReadinessStatus;
  readonly checkedAt?: string;
  readonly providerKind: ObserveProviderKind;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type LivenessCheck = ObserveAuditFields & {
  readonly id: LivenessCheckId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly serviceKey: string;
  readonly name: string;
  readonly status: ObserveLivenessStatus;
  readonly checkedAt?: string;
  readonly providerKind: ObserveProviderKind;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type ServiceHealth = ObserveAuditFields & {
  readonly id: ServiceHealthId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly serviceKey: string;
  readonly displayName: string;
  readonly overallStatus: ObserveHealthStatus;
  readonly readinessStatus: ObserveReadinessStatus;
  readonly livenessStatus: ObserveLivenessStatus;
  readonly lastEvaluatedAt?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type ServiceStatus = ObserveAuditFields & {
  readonly id: ServiceStatusId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly serviceKey: string;
  readonly status: ObserveHealthStatus;
  readonly message?: string;
  readonly observedAt?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type ComponentStatus = ObserveAuditFields & {
  readonly id: ComponentStatusId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly serviceKey: string;
  readonly componentKey: string;
  readonly name: string;
  readonly status: ObserveHealthStatus;
  readonly message?: string;
  readonly observedAt?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

/** Metric catalogue metadata — not Prometheus time-series storage. */
export type MetricDefinition = ObserveAuditFields & {
  readonly id: MetricDefinitionId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly kind: ObserveMetricKind;
  readonly unit?: string;
  readonly providerKind: ObserveProviderKind;
  readonly providerRef?: string;
  readonly status: ObserveMetadataStatus;
  readonly labels?: Readonly<Record<string, string>>;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

/** Sample metadata reference — not TSDB samples. */
export type MetricSample = ObserveAuditFields & {
  readonly id: MetricSampleId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly metricDefinitionId: MetricDefinitionId;
  readonly sampledAt: string;
  readonly valueLabel?: string;
  readonly providerKind: ObserveProviderKind;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type AlertDefinition = ObserveAuditFields & {
  readonly id: AlertDefinitionId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly severity: ObserveAlertSeverity;
  readonly providerKind: ObserveProviderKind;
  readonly providerRef?: string;
  readonly status: ObserveMetadataStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type AlertState = ObserveAuditFields & {
  readonly id: AlertStateId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly alertDefinitionId: AlertDefinitionId;
  readonly state: ObserveAlertStateKind;
  readonly firedAt?: string;
  readonly resolvedAt?: string;
  readonly message?: string;
  readonly providerKind: ObserveProviderKind;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

/** Dashboard registration metadata — not Grafana dashboard JSON ownership. */
export type DashboardDefinition = ObserveAuditFields & {
  readonly id: DashboardDefinitionId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly providerKind: ObserveProviderKind;
  readonly providerRef?: string;
  readonly status: ObserveMetadataStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type LogSource = ObserveAuditFields & {
  readonly id: LogSourceId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly kind: ObserveLogSourceKind;
  readonly providerKind: ObserveProviderKind;
  readonly providerRef?: string;
  readonly status: ObserveMetadataStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type TraceDefinition = ObserveAuditFields & {
  readonly id: TraceDefinitionId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly providerKind: ObserveProviderKind;
  readonly providerRef?: string;
  readonly status: ObserveMetadataStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

/** Span metadata reference — not OpenTelemetry span storage. */
export type TraceSpan = ObserveAuditFields & {
  readonly id: TraceSpanId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly traceDefinitionId: TraceDefinitionId;
  readonly spanName: string;
  readonly serviceKey?: string;
  readonly startedAt?: string;
  readonly endedAt?: string;
  readonly providerKind: ObserveProviderKind;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type IncidentReference = ObserveAuditFields & {
  readonly id: IncidentReferenceId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly title: string;
  readonly serviceKey?: string;
  readonly alertDefinitionId?: AlertDefinitionId;
  readonly status: ObserveMetadataStatus;
  readonly externalRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MaintenanceWindow = ObserveAuditFields & {
  readonly id: MaintenanceWindowId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly serviceKey?: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly status: ObserveMetadataStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type HealthSummary = ObserveAuditFields & {
  readonly id: HealthSummaryId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly scopeKey: string;
  readonly overallStatus: ObserveHealthStatus;
  readonly healthyCount: number;
  readonly degradedCount: number;
  readonly unhealthyCount: number;
  readonly evaluatedAt: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type PlatformDiagnostic = ObserveAuditFields & {
  readonly id: PlatformDiagnosticId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly serviceKey?: string;
  readonly status: ObserveHealthStatus;
  readonly detail?: string;
  readonly providerKind: ObserveProviderKind;
  readonly providerRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type ObservabilityMetadata = ObserveAuditFields & {
  readonly id: ObservabilityMetadataId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly category: string;
  readonly status: ObserveMetadataStatus;
  readonly payload?: Readonly<Record<string, unknown>>;
};
