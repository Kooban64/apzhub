/** Branded platform identifiers for Observability Platform entities (APZOBSERVE-001). */

declare const brand: unique symbol;

type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

export type HealthCheckId = Brand<string, "HealthCheckId">;
export type ReadinessCheckId = Brand<string, "ReadinessCheckId">;
export type LivenessCheckId = Brand<string, "LivenessCheckId">;
export type ServiceHealthId = Brand<string, "ServiceHealthId">;
export type ServiceStatusId = Brand<string, "ServiceStatusId">;
export type ComponentStatusId = Brand<string, "ComponentStatusId">;
export type MetricDefinitionId = Brand<string, "MetricDefinitionId">;
export type MetricSampleId = Brand<string, "MetricSampleId">;
export type AlertDefinitionId = Brand<string, "AlertDefinitionId">;
export type AlertStateId = Brand<string, "AlertStateId">;
export type DashboardDefinitionId = Brand<string, "DashboardDefinitionId">;
export type LogSourceId = Brand<string, "LogSourceId">;
export type TraceDefinitionId = Brand<string, "TraceDefinitionId">;
export type TraceSpanId = Brand<string, "TraceSpanId">;
export type IncidentReferenceId = Brand<string, "IncidentReferenceId">;
export type MaintenanceWindowId = Brand<string, "MaintenanceWindowId">;
export type HealthSummaryId = Brand<string, "HealthSummaryId">;
export type PlatformDiagnosticId = Brand<string, "PlatformDiagnosticId">;
export type ObservabilityMetadataId = Brand<string, "ObservabilityMetadataId">;

const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/;

export function isPlatformObserveIdShape(value: string): boolean {
  return ID_PATTERN.test(value);
}

function brandId<T extends string>(value: string): T {
  if (!isPlatformObserveIdShape(value)) {
    throw new Error(`Invalid platform observe identifier shape: ${value}`);
  }
  return value as T;
}

export function asHealthCheckId(value: string): HealthCheckId {
  return brandId(value);
}
export function asReadinessCheckId(value: string): ReadinessCheckId {
  return brandId(value);
}
export function asLivenessCheckId(value: string): LivenessCheckId {
  return brandId(value);
}
export function asServiceHealthId(value: string): ServiceHealthId {
  return brandId(value);
}
export function asServiceStatusId(value: string): ServiceStatusId {
  return brandId(value);
}
export function asComponentStatusId(value: string): ComponentStatusId {
  return brandId(value);
}
export function asMetricDefinitionId(value: string): MetricDefinitionId {
  return brandId(value);
}
export function asMetricSampleId(value: string): MetricSampleId {
  return brandId(value);
}
export function asAlertDefinitionId(value: string): AlertDefinitionId {
  return brandId(value);
}
export function asAlertStateId(value: string): AlertStateId {
  return brandId(value);
}
export function asDashboardDefinitionId(value: string): DashboardDefinitionId {
  return brandId(value);
}
export function asLogSourceId(value: string): LogSourceId {
  return brandId(value);
}
export function asTraceDefinitionId(value: string): TraceDefinitionId {
  return brandId(value);
}
export function asTraceSpanId(value: string): TraceSpanId {
  return brandId(value);
}
export function asIncidentReferenceId(value: string): IncidentReferenceId {
  return brandId(value);
}
export function asMaintenanceWindowId(value: string): MaintenanceWindowId {
  return brandId(value);
}
export function asHealthSummaryId(value: string): HealthSummaryId {
  return brandId(value);
}
export function asPlatformDiagnosticId(value: string): PlatformDiagnosticId {
  return brandId(value);
}
export function asObservabilityMetadataId(
  value: string,
): ObservabilityMetadataId {
  return brandId(value);
}
