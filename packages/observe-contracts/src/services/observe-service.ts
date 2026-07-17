/**
 * Observability service port stubs (APZOBSERVE-001).
 * Full Platform Services / Gateway wiring deferred to APZOBSERVE-002.
 */

import type {
  AlertDefinition,
  AlertState,
  ComponentStatus,
  DashboardDefinition,
  HealthCheck,
  HealthSummary,
  IncidentReference,
  LivenessCheck,
  LogSource,
  MaintenanceWindow,
  MetricDefinition,
  MetricSample,
  ObservabilityMetadata,
  PlatformDiagnostic,
  ReadinessCheck,
  ServiceHealth,
  ServiceStatus,
  TraceDefinition,
  TraceSpan,
} from "../domain/observability";
import type { ObserveRequestContext } from "../common/context";

/** Foundation-era service surface — metadata CRUD ports composed later via Core. */
export type PlatformObserveService = {
  readonly listHealthChecks: (
    ctx: ObserveRequestContext,
  ) => Promise<readonly HealthCheck[]>;
  readonly listServiceHealth: (
    ctx: ObserveRequestContext,
  ) => Promise<readonly ServiceHealth[]>;
  readonly listMetricDefinitions: (
    ctx: ObserveRequestContext,
  ) => Promise<readonly MetricDefinition[]>;
  readonly listAlertDefinitions: (
    ctx: ObserveRequestContext,
  ) => Promise<readonly AlertDefinition[]>;
  readonly listDashboards: (
    ctx: ObserveRequestContext,
  ) => Promise<readonly DashboardDefinition[]>;
  readonly listLogSources: (
    ctx: ObserveRequestContext,
  ) => Promise<readonly LogSource[]>;
  readonly listTraceDefinitions: (
    ctx: ObserveRequestContext,
  ) => Promise<readonly TraceDefinition[]>;
  readonly listDiagnostics: (
    ctx: ObserveRequestContext,
  ) => Promise<readonly PlatformDiagnostic[]>;
};

export type {
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
};
