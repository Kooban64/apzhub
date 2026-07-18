/** TanStack Query keys for Platform Metrics (APZMETRICS-003). */

import type { QueryClient } from "@tanstack/react-query";

const ROOT = ["metrics"] as const;

export const metricsQueryKeys = {
  all: ROOT,
  metrics: {
    all: [...ROOT, "metrics"] as const,
    list: () => [...ROOT, "metrics", "list"] as const,
    detail: (id: string) => [...ROOT, "metrics", "detail", id] as const,
  },
  definitions: {
    all: [...ROOT, "definitions"] as const,
    list: () => [...ROOT, "definitions", "list"] as const,
    detail: (id: string) => [...ROOT, "definitions", "detail", id] as const,
  },
  versions: {
    all: [...ROOT, "versions"] as const,
    list: () => [...ROOT, "versions", "list"] as const,
    detail: (id: string) => [...ROOT, "versions", "detail", id] as const,
  },
  categories: {
    all: [...ROOT, "categories"] as const,
    list: () => [...ROOT, "categories", "list"] as const,
    detail: (id: string) => [...ROOT, "categories", "detail", id] as const,
  },
  groups: {
    all: [...ROOT, "groups"] as const,
    list: () => [...ROOT, "groups", "list"] as const,
    detail: (id: string) => [...ROOT, "groups", "detail", id] as const,
  },
  dimensions: {
    all: [...ROOT, "dimensions"] as const,
    list: () => [...ROOT, "dimensions", "list"] as const,
    detail: (id: string) => [...ROOT, "dimensions", "detail", id] as const,
  },
  labels: {
    all: [...ROOT, "labels"] as const,
    list: () => [...ROOT, "labels", "list"] as const,
    detail: (id: string) => [...ROOT, "labels", "detail", id] as const,
  },
  units: {
    all: [...ROOT, "units"] as const,
    list: () => [...ROOT, "units", "list"] as const,
    detail: (id: string) => [...ROOT, "units", "detail", id] as const,
  },
  formulas: {
    all: [...ROOT, "formulas"] as const,
    list: () => [...ROOT, "formulas", "list"] as const,
    detail: (id: string) => [...ROOT, "formulas", "detail", id] as const,
  },
  aggregations: {
    all: [...ROOT, "aggregations"] as const,
    list: () => [...ROOT, "aggregations", "list"] as const,
    detail: (id: string) => [...ROOT, "aggregations", "detail", id] as const,
  },
  thresholds: {
    all: [...ROOT, "thresholds"] as const,
    list: () => [...ROOT, "thresholds", "list"] as const,
    detail: (id: string) => [...ROOT, "thresholds", "detail", id] as const,
  },
  owners: {
    all: [...ROOT, "owners"] as const,
    list: () => [...ROOT, "owners", "list"] as const,
    detail: (id: string) => [...ROOT, "owners", "detail", id] as const,
  },
  consumers: {
    all: [...ROOT, "consumers"] as const,
    list: () => [...ROOT, "consumers", "list"] as const,
    detail: (id: string) => [...ROOT, "consumers", "detail", id] as const,
  },
  retentionPolicies: {
    all: [...ROOT, "retention-policies"] as const,
    list: () => [...ROOT, "retention-policies", "list"] as const,
    detail: (id: string) => [...ROOT, "retention-policies", "detail", id] as const,
  },
  classifications: {
    all: [...ROOT, "classifications"] as const,
    list: () => [...ROOT, "classifications", "list"] as const,
    detail: (id: string) => [...ROOT, "classifications", "detail", id] as const,
  },
  dependencies: {
    all: [...ROOT, "dependencies"] as const,
    list: () => [...ROOT, "dependencies", "list"] as const,
    detail: (id: string) => [...ROOT, "dependencies", "detail", id] as const,
  },
  kpis: {
    all: [...ROOT, "kpis"] as const,
    list: () => [...ROOT, "kpis", "list"] as const,
    detail: (id: string) => [...ROOT, "kpis", "detail", id] as const,
  },
  kpiGroups: {
    all: [...ROOT, "kpi-groups"] as const,
    list: () => [...ROOT, "kpi-groups", "list"] as const,
    detail: (id: string) => [...ROOT, "kpi-groups", "detail", id] as const,
  },
  kpiTargets: {
    all: [...ROOT, "kpi-targets"] as const,
    list: () => [...ROOT, "kpi-targets", "list"] as const,
    detail: (id: string) => [...ROOT, "kpi-targets", "detail", id] as const,
  },
  relationships: {
    all: [...ROOT, "relationships"] as const,
    list: () => [...ROOT, "relationships", "list"] as const,
    detail: (id: string) => [...ROOT, "relationships", "detail", id] as const,
  },
  metadata: {
    all: [...ROOT, "metadata"] as const,
    list: () => [...ROOT, "metadata", "list"] as const,
    detail: (id: string) => [...ROOT, "metadata", "detail", id] as const,
  },
  diagnostics: {
    all: [...ROOT, "diagnostics"] as const,
    health: () => [...ROOT, "diagnostics", "health"] as const,
    readiness: () => [...ROOT, "diagnostics", "readiness"] as const,
    capabilities: () => [...ROOT, "diagnostics", "capabilities"] as const,
    management: () => [...ROOT, "management-diagnostics"] as const,
  },
  health: () => [...ROOT, "health"] as const,
  readiness: () => [...ROOT, "readiness"] as const,
  capabilities: () => [...ROOT, "capabilities"] as const,
} as const;

export function clearMetricsQueries(queryClient: QueryClient): void {
  void queryClient.removeQueries({ queryKey: metricsQueryKeys.all });
}
