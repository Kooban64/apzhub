/** TanStack Query keys for Configuration (APZCONFIG-003 / APZCONFIG-004). */

import type { QueryClient } from "@tanstack/react-query";

import type { ListConfigurationsClientQuery } from "./configuration-types";

const ROOT = ["configuration"] as const;

function stableParams(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(entries));
}

export const configurationQueryKeys = {
  all: ROOT,
  lists: () => [...ROOT, "list"] as const,
  list: (params?: ListConfigurationsClientQuery) =>
    [
      ...ROOT,
      "list",
      stableParams(params as Record<string, unknown> | undefined),
    ] as const,
  details: () => [...ROOT, "detail"] as const,
  detail: (configurationId: string) =>
    [...ROOT, "detail", configurationId] as const,
  namespaces: {
    all: [...ROOT, "namespaces"] as const,
    list: () => [...ROOT, "namespaces", "list"] as const,
    detail: (namespaceId: string) =>
      [...ROOT, "namespaces", "detail", namespaceId] as const,
  },
  groups: {
    all: [...ROOT, "groups"] as const,
    list: () => [...ROOT, "groups", "list"] as const,
    detail: (groupId: string) =>
      [...ROOT, "groups", "detail", groupId] as const,
  },
  versions: (configurationId: string) =>
    [...ROOT, "versions", configurationId] as const,
  overrides: (configurationId?: string) =>
    [...ROOT, "overrides", configurationId ?? "all"] as const,
  scopes: {
    all: [...ROOT, "scopes"] as const,
    list: () => [...ROOT, "scopes", "list"] as const,
    detail: (scopeId: string) =>
      [...ROOT, "scopes", "detail", scopeId] as const,
  },
  validationRules: () => [...ROOT, "validation-rules"] as const,
  references: (configurationId: string) =>
    [...ROOT, "references", configurationId] as const,
  audit: {
    all: [...ROOT, "audit"] as const,
    list: () => [...ROOT, "audit", "list"] as const,
    configuration: (configurationId: string) =>
      [...ROOT, "audit", configurationId] as const,
  },
  capabilities: () => [...ROOT, "capabilities"] as const,
  health: () => [...ROOT, "health"] as const,
  readiness: () => [...ROOT, "readiness"] as const,
  diagnostics: () => [...ROOT, "diagnostics"] as const,
} as const;

export function clearConfigurationQueries(queryClient: QueryClient): void {
  void queryClient.removeQueries({ queryKey: configurationQueryKeys.all });
}
