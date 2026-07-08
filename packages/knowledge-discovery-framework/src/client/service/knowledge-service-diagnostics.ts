import type { KnowledgeDiscoveryFrameworkStatus } from "../../status";
import type { ClientKnowledgeRegistryDiagnostics } from "../client-knowledge-registry-diagnostics";
import type { KnowledgeQueryClientDiagnostics } from "../query/knowledge-query-client";

export type KnowledgeServiceStatus = "ready" | "unavailable";

/** Public Knowledge Service observability — stable health and runtime fields (DF-015). */
export interface KnowledgeServiceDiagnostics {
  readonly frameworkStatus: KnowledgeDiscoveryFrameworkStatus;
  readonly serviceStatus: KnowledgeServiceStatus;
  readonly registryStatus?: ClientKnowledgeRegistryDiagnostics["status"];
  readonly registryReady: boolean;
  readonly queryAvailable: boolean;
  readonly queryClient: KnowledgeQueryClientDiagnostics;
}

export function buildKnowledgeServiceHealthSummary(options: {
  readonly frameworkStatus: KnowledgeDiscoveryFrameworkStatus;
  readonly serviceDiagnostics: KnowledgeServiceDiagnostics;
  readonly registeredCount: number;
  readonly filteredCount: number;
  readonly activeSourceCount: number;
  readonly registeredProviderCount: number;
}): KnowledgeDiscoveryHealthSummary {
  const { serviceDiagnostics } = options;
  let status: KnowledgeDiscoveryHealthSummary["status"] = "healthy";

  if (options.registeredCount === 0 || !serviceDiagnostics.queryAvailable) {
    status = "unhealthy";
  } else if (options.filteredCount === 0 && options.registeredCount > 0) {
    status = "degraded";
  }

  return {
    status,
    frameworkStatus: options.frameworkStatus,
    registeredCount: options.registeredCount,
    filteredCount: options.filteredCount,
    activeSourceCount: options.activeSourceCount,
    registeredProviderCount: options.registeredProviderCount,
    serviceStatus: serviceDiagnostics.serviceStatus,
    queryAvailable: serviceDiagnostics.queryAvailable,
  };
}

/** Platform health summary shape — mirrored in `@apzhub/types` for apps/web. */
export interface KnowledgeDiscoveryHealthSummary {
  readonly status: "healthy" | "degraded" | "unhealthy";
  readonly frameworkStatus: string;
  readonly registeredCount: number;
  readonly filteredCount: number;
  readonly activeSourceCount: number;
  readonly registeredProviderCount: number;
  readonly serviceStatus: KnowledgeServiceStatus;
  readonly queryAvailable: boolean;
}
