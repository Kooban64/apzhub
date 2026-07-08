"use client";

import {
  useKnowledgeRegistry,
  useKnowledgeService,
} from "@apzhub/knowledge-discovery-framework/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  COMMAND_PALETTE_QUERY_DEBOUNCE_MS,
  useDebouncedValue,
} from "../command-palette";
import {
  buildSourceLabelLookup,
  countOverlayDocuments,
  groupKnowledgeDocuments,
} from "./group-knowledge-documents";
import { KnowledgeOverlay } from "./knowledge-overlay";
import { buildKnowledgeOverlayDiagnostics } from "./knowledge-overlay-diagnostics";
import {
  delegateKnowledgeOverlaySelection,
  type WorkbenchKnowledgeSelectionHandlers,
} from "./knowledge-overlay-selection";
import {
  useKnowledgeOverlayState,
  type UseKnowledgeOverlayStateOptions,
} from "./use-knowledge-overlay-state";
import type {
  KnowledgeOverlayEmptyState,
  KnowledgeOverlayErrorState,
  KnowledgeOverlayLoadingState,
} from "./types";

export interface KnowledgeOverlayExperienceProps extends UseKnowledgeOverlayStateOptions {
  readonly selectionHandlers: WorkbenchKnowledgeSelectionHandlers;
  readonly onDocumentSelected?: (documentId: string) => void;
  readonly emptyState?: KnowledgeOverlayEmptyState;
  readonly loadingState?: KnowledgeOverlayLoadingState;
  readonly errorState?: KnowledgeOverlayErrorState;
  readonly title?: string;
}

/**
 * Knowledge Experience surface — consumes `useKnowledgeService()` and delegates selection via DI.
 * Does not execute actions or navigate; see {@link delegateKnowledgeOverlaySelection}.
 */
export function KnowledgeOverlayExperience({
  selectionHandlers,
  onDocumentSelected,
  emptyState,
  loadingState,
  errorState,
  title,
  ...overlayStateOptions
}: KnowledgeOverlayExperienceProps) {
  const overlayState = useKnowledgeOverlayState(overlayStateOptions);
  const { sources, isReady: isRegistryReady } = useKnowledgeRegistry();
  const {
    status: queryStatus,
    documents,
    query: runQuery,
    error: queryError,
    diagnostics: queryDiagnostics,
  } = useKnowledgeService();
  const [inputQuery, setInputQuery] = useState("");
  const debouncedQuery = useDebouncedValue(
    inputQuery,
    COMMAND_PALETTE_QUERY_DEBOUNCE_MS,
  );
  const [lastSelectedDocumentId, setLastSelectedDocumentId] = useState<
    string | undefined
  >();

  const sourceLabels = useMemo(() => buildSourceLabelLookup(sources), [sources]);
  const groups = useMemo(
    () => groupKnowledgeDocuments(documents, { sourceLabels }),
    [documents, sourceLabels],
  );

  useEffect(() => {
    if (!overlayState.open) {
      return;
    }

    void runQuery({ text: debouncedQuery });
  }, [debouncedQuery, overlayState.open, runQuery]);

  const handleSelectDocument = useCallback(
    async (document: (typeof documents)[number]) => {
      setLastSelectedDocumentId(document.documentId);
      await delegateKnowledgeOverlaySelection(document, selectionHandlers);
      onDocumentSelected?.(document.documentId);
      overlayState.onOpenChange(false);
    },
    [selectionHandlers, onDocumentSelected, overlayState],
  );

  const diagnostics = useMemo(
    () =>
      buildKnowledgeOverlayDiagnostics({
        open: overlayState.open,
        queryText: debouncedQuery,
        queryStatus,
        groupCount: groups.length,
        visibleDocumentCount: countOverlayDocuments(groups),
        registryReady: isRegistryReady,
        queryDiagnostics,
        lastSelectedDocumentId,
      }),
    [
      overlayState.open,
      debouncedQuery,
      queryStatus,
      groups,
      isRegistryReady,
      queryDiagnostics,
      lastSelectedDocumentId,
    ],
  );

  return (
    <KnowledgeOverlay
      open={overlayState.open}
      onOpenChange={overlayState.onOpenChange}
      query={inputQuery}
      onQueryChange={setInputQuery}
      groups={groups}
      queryStatus={queryStatus}
      registryReady={isRegistryReady}
      errorMessage={queryError?.message}
      onSelectDocument={handleSelectDocument}
      diagnostics={diagnostics}
      emptyState={emptyState}
      loadingState={loadingState}
      errorState={errorState}
      title={title}
    />
  );
}
