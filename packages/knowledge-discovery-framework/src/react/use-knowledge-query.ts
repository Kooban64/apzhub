import { useKnowledgeService } from "./use-knowledge-service";

/** @deprecated Use {@link useKnowledgeService} — Knowledge Service is the public query boundary (DF-015). */
export function useKnowledgeQuery() {
  const knowledgeService = useKnowledgeService();

  return {
    status: knowledgeService.status,
    text: knowledgeService.text,
    documents: knowledgeService.documents,
    isRegistryReady: knowledgeService.isRegistryReady,
    isLoading: knowledgeService.isLoading,
    diagnostics: knowledgeService.diagnostics,
    error: knowledgeService.error,
    query: knowledgeService.query,
    reset: knowledgeService.reset,
  };
}

export type { UseKnowledgeServiceResult as UseKnowledgeQueryResult } from "./use-knowledge-service";
