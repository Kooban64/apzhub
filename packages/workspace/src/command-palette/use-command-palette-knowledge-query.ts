import type { KnowledgeDocument } from "@apzhub/knowledge-discovery-framework";
import type {
  ClientKnowledgeQueryDiagnostics,
  KnowledgeQueryStatus,
} from "@apzhub/knowledge-discovery-framework/react";
import {
  useKnowledgeRegistry,
  useKnowledgeService,
} from "@apzhub/knowledge-discovery-framework/react";
import { useEffect, useMemo } from "react";

import {
  buildSourceLabelLookup,
  groupKnowledgeDocuments,
} from "../knowledge-overlay/group-knowledge-documents";
import type { KnowledgeOverlayGroup } from "../knowledge-overlay/types";

export interface UseCommandPaletteKnowledgeQueryOptions {
  readonly enabled: boolean;
  readonly query: string;
}

export interface UseCommandPaletteKnowledgeQueryResult {
  readonly groups: readonly KnowledgeOverlayGroup[];
  readonly documentById: ReadonlyMap<string, KnowledgeDocument>;
  readonly status: KnowledgeQueryStatus;
  readonly errorMessage?: string;
  readonly isRegistryReady: boolean;
  readonly queryDiagnostics: ClientKnowledgeQueryDiagnostics;
}

/** Command Palette knowledge mode — consumes useKnowledgeService() without Action Registry listing. */
export function useCommandPaletteKnowledgeQuery(
  options: UseCommandPaletteKnowledgeQueryOptions,
): UseCommandPaletteKnowledgeQueryResult {
  const { sources, isReady: isRegistryReady } = useKnowledgeRegistry();
  const {
    status,
    documents,
    query: runQuery,
    error,
    diagnostics: queryDiagnostics,
  } = useKnowledgeService();

  const sourceLabels = useMemo(() => buildSourceLabelLookup(sources), [sources]);
  const groups = useMemo(
    () => groupKnowledgeDocuments(documents, { sourceLabels }),
    [documents, sourceLabels],
  );

  const documentById = useMemo(
    () => new Map(documents.map((document) => [document.documentId, document])),
    [documents],
  );

  useEffect(() => {
    if (!options.enabled) {
      return;
    }

    void runQuery({ text: options.query });
  }, [options.enabled, options.query, runQuery]);

  return {
    groups,
    documentById,
    status,
    errorMessage: error?.message,
    isRegistryReady,
    queryDiagnostics,
  };
}
