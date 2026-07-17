/** TanStack Query keys for Observability (APZOBSERVE-003). */

import type { QueryClient } from "@tanstack/react-query";

const ROOT = ["observe"] as const;

export const observeQueryKeys = {
  all: ROOT,
  healthChecks: {
    all: [...ROOT, "health-checks"] as const,
    list: () => [...ROOT, "health-checks", "list"] as const,
    detail: (id: string) => [...ROOT, "health-checks", "detail", id] as const,
  },
  readinessChecks: {
    all: [...ROOT, "readiness-checks"] as const,
    list: () => [...ROOT, "readiness-checks", "list"] as const,
    detail: (id: string) => [...ROOT, "readiness-checks", "detail", id] as const,
  },
  livenessChecks: {
    all: [...ROOT, "liveness-checks"] as const,
    list: () => [...ROOT, "liveness-checks", "list"] as const,
    detail: (id: string) => [...ROOT, "liveness-checks", "detail", id] as const,
  },
  serviceHealth: {
    all: [...ROOT, "service-health"] as const,
    list: () => [...ROOT, "service-health", "list"] as const,
    detail: (id: string) => [...ROOT, "service-health", "detail", id] as const,
  },
  serviceStatus: {
    all: [...ROOT, "service-status"] as const,
    list: () => [...ROOT, "service-status", "list"] as const,
    detail: (id: string) => [...ROOT, "service-status", "detail", id] as const,
  },
  componentStatus: {
    all: [...ROOT, "component-status"] as const,
    list: () => [...ROOT, "component-status", "list"] as const,
    detail: (id: string) => [...ROOT, "component-status", "detail", id] as const,
  },
  metricDefinitions: {
    all: [...ROOT, "metric-definitions"] as const,
    list: () => [...ROOT, "metric-definitions", "list"] as const,
    detail: (id: string) => [...ROOT, "metric-definitions", "detail", id] as const,
  },
  metricSamples: {
    all: [...ROOT, "metric-samples"] as const,
    list: () => [...ROOT, "metric-samples", "list"] as const,
    detail: (id: string) => [...ROOT, "metric-samples", "detail", id] as const,
  },
  alertDefinitions: {
    all: [...ROOT, "alert-definitions"] as const,
    list: () => [...ROOT, "alert-definitions", "list"] as const,
    detail: (id: string) => [...ROOT, "alert-definitions", "detail", id] as const,
  },
  alertStates: {
    all: [...ROOT, "alert-states"] as const,
    list: () => [...ROOT, "alert-states", "list"] as const,
    detail: (id: string) => [...ROOT, "alert-states", "detail", id] as const,
  },
  dashboardDefinitions: {
    all: [...ROOT, "dashboard-definitions"] as const,
    list: () => [...ROOT, "dashboard-definitions", "list"] as const,
    detail: (id: string) => [...ROOT, "dashboard-definitions", "detail", id] as const,
  },
  logSources: {
    all: [...ROOT, "log-sources"] as const,
    list: () => [...ROOT, "log-sources", "list"] as const,
    detail: (id: string) => [...ROOT, "log-sources", "detail", id] as const,
  },
  traceDefinitions: {
    all: [...ROOT, "trace-definitions"] as const,
    list: () => [...ROOT, "trace-definitions", "list"] as const,
    detail: (id: string) => [...ROOT, "trace-definitions", "detail", id] as const,
  },
  traceSpans: {
    all: [...ROOT, "trace-spans"] as const,
    list: () => [...ROOT, "trace-spans", "list"] as const,
    detail: (id: string) => [...ROOT, "trace-spans", "detail", id] as const,
  },
  incidentReferences: {
    all: [...ROOT, "incident-references"] as const,
    list: () => [...ROOT, "incident-references", "list"] as const,
    detail: (id: string) => [...ROOT, "incident-references", "detail", id] as const,
  },
  maintenanceWindows: {
    all: [...ROOT, "maintenance-windows"] as const,
    list: () => [...ROOT, "maintenance-windows", "list"] as const,
    detail: (id: string) => [...ROOT, "maintenance-windows", "detail", id] as const,
  },
  healthSummaries: {
    all: [...ROOT, "health-summaries"] as const,
    list: () => [...ROOT, "health-summaries", "list"] as const,
    detail: (id: string) => [...ROOT, "health-summaries", "detail", id] as const,
  },
  metadata: {
    all: [...ROOT, "metadata"] as const,
    list: () => [...ROOT, "metadata", "list"] as const,
    detail: (id: string) => [...ROOT, "metadata", "detail", id] as const,
  },
  diagnostics: {
    all: [...ROOT, "diagnostics"] as const,
    list: () => [...ROOT, "diagnostics", "list"] as const,
    detail: (id: string) => [...ROOT, "diagnostics", "detail", id] as const,
    health: () => [...ROOT, "diagnostics", "health"] as const,
    readiness: () => [...ROOT, "diagnostics", "readiness"] as const,
    capabilities: () => [...ROOT, "diagnostics", "capabilities"] as const,
    management: () => [...ROOT, "management-diagnostics"] as const,
  },
  health: () => [...ROOT, "health"] as const,
  readiness: () => [...ROOT, "readiness"] as const,
  capabilities: () => [...ROOT, "capabilities"] as const,
} as const;

export function clearObserveQueries(queryClient: QueryClient): void {
  void queryClient.removeQueries({ queryKey: observeQueryKeys.all });
}
