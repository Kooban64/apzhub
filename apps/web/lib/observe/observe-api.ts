/**
 * Module-level Platform Observability client accessor (APZOBSERVE-003/004).
 */

import {
  createHttpObserveClient,
  type ObserveClient,
} from "./observe-client";
import { createMockObserveClient } from "./mock-observe-client";
import type { ObserveClientRequestOptions } from "./observe-types";

let observeClient: ObserveClient =
  typeof process !== "undefined" && process.env.NODE_ENV === "test"
    ? createMockObserveClient()
    : createHttpObserveClient();

export function setObserveClient(client: ObserveClient): void {
  observeClient = client;
}

export function getObserveClient(): ObserveClient {
  return observeClient;
}

export function resetObserveClient(): void {
  observeClient = createMockObserveClient();
}

type ListQuery = { readonly limit?: number };

export function listHealthChecks(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().healthChecks.list(query, options);
}
export function getHealthCheck(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().healthChecks.get(id, options);
}
export function createHealthCheck(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().healthChecks.create(input, options);
}
export function updateHealthCheck(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().healthChecks.update(id, input, options);
}

export function listReadinessChecks(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().readinessChecks.list(query, options);
}
export function getReadinessCheck(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().readinessChecks.get(id, options);
}
export function createReadinessCheck(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().readinessChecks.create(input, options);
}
export function updateReadinessCheck(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().readinessChecks.update(id, input, options);
}

export function listLivenessChecks(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().livenessChecks.list(query, options);
}
export function getLivenessCheck(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().livenessChecks.get(id, options);
}
export function createLivenessCheck(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().livenessChecks.create(input, options);
}
export function updateLivenessCheck(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().livenessChecks.update(id, input, options);
}

export function listServiceHealth(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().serviceHealth.list(query, options);
}
export function getServiceHealth(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().serviceHealth.get(id, options);
}
export function createServiceHealth(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().serviceHealth.create(input, options);
}
export function updateServiceHealth(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().serviceHealth.update(id, input, options);
}

export function listServiceStatus(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().serviceStatus.list(query, options);
}
export function getServiceStatus(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().serviceStatus.get(id, options);
}
export function createServiceStatus(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().serviceStatus.create(input, options);
}
export function updateServiceStatus(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().serviceStatus.update(id, input, options);
}

export function listComponentStatus(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().componentStatus.list(query, options);
}
export function getComponentStatus(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().componentStatus.get(id, options);
}
export function createComponentStatus(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().componentStatus.create(input, options);
}
export function updateComponentStatus(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().componentStatus.update(id, input, options);
}

export function listMetricDefinitions(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().metricDefinitions.list(query, options);
}
export function getMetricDefinition(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().metricDefinitions.get(id, options);
}
export function createMetricDefinition(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().metricDefinitions.create(input, options);
}
export function updateMetricDefinition(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().metricDefinitions.update(id, input, options);
}

export function listMetricSamples(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().metricSamples.list(query, options);
}
export function getMetricSample(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().metricSamples.get(id, options);
}
export function createMetricSample(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().metricSamples.create(input, options);
}
export function updateMetricSample(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().metricSamples.update(id, input, options);
}

export function listAlertDefinitions(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().alertDefinitions.list(query, options);
}
export function getAlertDefinition(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().alertDefinitions.get(id, options);
}
export function createAlertDefinition(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().alertDefinitions.create(input, options);
}
export function updateAlertDefinition(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().alertDefinitions.update(id, input, options);
}

export function listAlertStates(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().alertStates.list(query, options);
}
export function getAlertState(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().alertStates.get(id, options);
}
export function createAlertState(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().alertStates.create(input, options);
}
export function updateAlertState(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().alertStates.update(id, input, options);
}

export function listDashboardDefinitions(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().dashboardDefinitions.list(query, options);
}
export function getDashboardDefinition(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().dashboardDefinitions.get(id, options);
}
export function createDashboardDefinition(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().dashboardDefinitions.create(input, options);
}
export function updateDashboardDefinition(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().dashboardDefinitions.update(id, input, options);
}

export function listLogSources(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().logSources.list(query, options);
}
export function getLogSource(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().logSources.get(id, options);
}
export function createLogSource(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().logSources.create(input, options);
}
export function updateLogSource(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().logSources.update(id, input, options);
}

export function listTraceDefinitions(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().traceDefinitions.list(query, options);
}
export function getTraceDefinition(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().traceDefinitions.get(id, options);
}
export function createTraceDefinition(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().traceDefinitions.create(input, options);
}
export function updateTraceDefinition(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().traceDefinitions.update(id, input, options);
}

export function listTraceSpans(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().traceSpans.list(query, options);
}
export function getTraceSpan(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().traceSpans.get(id, options);
}
export function createTraceSpan(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().traceSpans.create(input, options);
}
export function updateTraceSpan(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().traceSpans.update(id, input, options);
}

export function listIncidentReferences(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().incidentReferences.list(query, options);
}
export function getIncidentReference(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().incidentReferences.get(id, options);
}
export function createIncidentReference(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().incidentReferences.create(input, options);
}
export function updateIncidentReference(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().incidentReferences.update(id, input, options);
}

export function listMaintenanceWindows(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().maintenanceWindows.list(query, options);
}
export function getMaintenanceWindow(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().maintenanceWindows.get(id, options);
}
export function createMaintenanceWindow(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().maintenanceWindows.create(input, options);
}
export function updateMaintenanceWindow(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().maintenanceWindows.update(id, input, options);
}

export function listHealthSummaries(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().healthSummaries.list(query, options);
}
export function getHealthSummary(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().healthSummaries.get(id, options);
}
export function createHealthSummary(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().healthSummaries.create(input, options);
}
export function updateHealthSummary(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().healthSummaries.update(id, input, options);
}

export function listObservabilityMetadata(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().metadata.list(query, options);
}
export function getObservabilityMetadata(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().metadata.get(id, options);
}
export function createObservabilityMetadata(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().metadata.create(input, options);
}
export function updateObservabilityMetadata(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().metadata.update(id, input, options);
}

export function listPlatformDiagnostics(query?: ListQuery, options?: ObserveClientRequestOptions) {
  return getObserveClient().diagnostics.list(query, options);
}
export function getPlatformDiagnostic(id: string, options?: ObserveClientRequestOptions) {
  return getObserveClient().diagnostics.get(id, options);
}
export function createPlatformDiagnostic(input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().diagnostics.create(input, options);
}
export function updatePlatformDiagnostic(id: string, input: Record<string, unknown>, options?: ObserveClientRequestOptions) {
  return getObserveClient().diagnostics.update(id, input, options);
}

export function getObserveCapabilities(options?: ObserveClientRequestOptions) {
  return getObserveClient().getCapabilities(options);
}
export function getObserveHealth(options?: ObserveClientRequestOptions) {
  return getObserveClient().getHealth(options);
}
export function getObserveReadiness(options?: ObserveClientRequestOptions) {
  return getObserveClient().getReadiness(options);
}
export function getObserveDiagnostics(options?: ObserveClientRequestOptions) {
  return getObserveClient().diagnostics.management(options);
}

export {
  createHttpObserveClient,
  createMockObserveClient,
  type ObserveClient,
} from "./observe-client";
export * from "./observe-types";
export * from "./observe-errors";
export * from "./routes";
export * from "./query-keys";
