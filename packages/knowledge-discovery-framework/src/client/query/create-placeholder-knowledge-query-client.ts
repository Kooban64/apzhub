import type {
  InstrumentedKnowledgeQueryClient,
  KnowledgeQueryClientResult,
  KnowledgeQueryInput,
} from "./knowledge-query-client";

const PLACEHOLDER_MESSAGE =
  "Knowledge query client is not configured — inject an orchestrator adapter in app wiring (DF-015).";

/** Default no-op client until app wiring provides an orchestrator adapter (DF-011). */
export function createPlaceholderKnowledgeQueryClient(): InstrumentedKnowledgeQueryClient {
  return {
    async query(_input: KnowledgeQueryInput): Promise<KnowledgeQueryClientResult> {
      throw new Error(PLACEHOLDER_MESSAGE);
    },
    getDiagnostics() {
      return {
        kind: "placeholder",
        ready: false,
        message: PLACEHOLDER_MESSAGE,
      };
    },
  };
}

export { PLACEHOLDER_MESSAGE as KNOWLEDGE_QUERY_CLIENT_PLACEHOLDER_MESSAGE };
