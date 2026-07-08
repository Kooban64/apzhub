import type { ClientKnowledgeQueryDiagnostics } from "@apzhub/knowledge-discovery-framework/react";

import type { KnowledgeOverlayDiagnostics } from "./types";

export interface KnowledgeOverlaySurfaceDiagnostics extends KnowledgeOverlayDiagnostics {
  readonly surface: "knowledge-overlay";
  readonly queryDiagnostics?: ClientKnowledgeQueryDiagnostics;
}

export function buildKnowledgeOverlayDiagnostics(input: {
  readonly open: boolean;
  readonly queryText: string;
  readonly queryStatus: KnowledgeOverlayDiagnostics["queryStatus"];
  readonly groupCount: number;
  readonly visibleDocumentCount: number;
  readonly registryReady: boolean;
  readonly queryDiagnostics?: ClientKnowledgeQueryDiagnostics;
  readonly lastSelectedDocumentId?: string;
}): KnowledgeOverlaySurfaceDiagnostics {
  return {
    surface: "knowledge-overlay",
    open: input.open,
    queryText: input.queryText,
    queryStatus: input.queryStatus,
    groupCount: input.groupCount,
    visibleDocumentCount: input.visibleDocumentCount,
    registryReady: input.registryReady,
    queryDiagnostics: input.queryDiagnostics,
    lastSelectedDocumentId: input.lastSelectedDocumentId,
  };
}
