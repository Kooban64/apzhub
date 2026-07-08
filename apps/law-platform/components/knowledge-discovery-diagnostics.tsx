"use client";

import {
  useKnowledgeRegistry,
  useKnowledgeService,
} from "@apzhub/knowledge-discovery-framework/react";

/** Developer diagnostics for Knowledge Service integration (DF-016). */
export function KnowledgeDiscoveryDiagnostics() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const { isReady, diagnostics: registryDiagnostics } = useKnowledgeRegistry();
  const { serviceDiagnostics } = useKnowledgeService();

  return (
    <aside
      hidden
      data-testid="knowledge-discovery-diagnostics"
      data-framework-status={serviceDiagnostics.frameworkStatus}
      data-service-status={serviceDiagnostics.serviceStatus}
      data-registry-status={registryDiagnostics.status}
      data-registry-ready={String(isReady)}
      data-query-available={String(serviceDiagnostics.queryAvailable)}
      data-query-client-kind={serviceDiagnostics.queryClient.kind}
      data-query-client-ready={String(serviceDiagnostics.queryClient.ready)}
      data-source-count={registryDiagnostics.sourceCount}
      data-active-source-count={registryDiagnostics.activeSourceCount}
    />
  );
}
