import { useCallback, useMemo, useState } from "react";

import {
  buildClientKnowledgeQueryDiagnostics,
  createInitialKnowledgeQueryState,
  createLoadingKnowledgeQueryState,
  executeKnowledgeQuery,
  type ClientKnowledgeQueryDiagnostics,
  type KnowledgeQueryInput,
  type KnowledgeQueryState,
} from "../client/query";
import type { KnowledgeDocument } from "../types/knowledge-document";
import { useKnowledgeServiceContext } from "./knowledge-discovery-context";
import { useKnowledgeRegistryContext } from "./knowledge-registry-context";

export interface UseKnowledgeServiceResult {
  readonly status: KnowledgeQueryState["status"];
  readonly text: string;
  readonly documents: readonly KnowledgeDocument[];
  readonly isRegistryReady: boolean;
  readonly isLoading: boolean;
  readonly diagnostics: ClientKnowledgeQueryDiagnostics;
  readonly serviceDiagnostics: ReturnType<
    ReturnType<typeof useKnowledgeServiceContext>["getDiagnostics"]
  >;
  readonly error: KnowledgeQueryState["error"];
  readonly query: (input: KnowledgeQueryInput) => Promise<void>;
  readonly reset: () => void;
}

/**
 * Public Knowledge Service hook for Experience surfaces (DF-015).
 *
 * Experiences must consume this hook — not KnowledgeQueryClient or the orchestrator.
 */
export function useKnowledgeService(): UseKnowledgeServiceResult {
  const service = useKnowledgeServiceContext();
  const { isReady, diagnostics: registryDiagnostics } = useKnowledgeRegistryContext();
  const [state, setState] = useState<KnowledgeQueryState>(
    createInitialKnowledgeQueryState,
  );
  const [queriedAt, setQueriedAt] = useState<string | undefined>();

  const serviceDiagnostics = useMemo(() => {
    const base = service.getDiagnostics();

    return {
      ...base,
      registryReady: isReady,
      registryStatus: registryDiagnostics.status,
      queryAvailable: isReady && base.queryClient.ready,
    };
  }, [service, isReady, registryDiagnostics.status, state.status]);

  const diagnostics = useMemo(
    () =>
      buildClientKnowledgeQueryDiagnostics({
        status: state.status,
        registryDiagnostics,
        registryReady: isReady,
        queryClientDiagnostics: serviceDiagnostics.queryClient,
        query: state.diagnostics,
        error: state.error,
        queriedAt,
      }),
    [
      state.status,
      state.diagnostics,
      state.error,
      registryDiagnostics,
      isReady,
      serviceDiagnostics.queryClient,
      queriedAt,
    ],
  );

  const query = useCallback(
    async (input: KnowledgeQueryInput) => {
      const text = input.text ?? "";
      setState(createLoadingKnowledgeQueryState(text));

      const result = await executeKnowledgeQuery({
        input,
        service,
        registryReady: isReady,
        registryDiagnostics,
      });

      setState(result.state);
      setQueriedAt(result.queriedAt);
    },
    [service, isReady, registryDiagnostics],
  );

  const reset = useCallback(() => {
    setState(createInitialKnowledgeQueryState());
    setQueriedAt(undefined);
  }, []);

  return {
    status: state.status,
    text: state.text,
    documents: state.documents,
    isRegistryReady: isReady,
    isLoading: state.status === "loading",
    diagnostics,
    serviceDiagnostics,
    error: state.error,
    query,
    reset,
  };
}
