import type { KnowledgeDiscoveryOrchestrator } from "../../orchestrator/knowledge-discovery-orchestrator";
import type {
  InstrumentedKnowledgeQueryClient,
  KnowledgeQueryClientResult,
  KnowledgeQueryInput,
} from "./knowledge-query-client";

/** Adapts {@link KnowledgeDiscoveryOrchestrator} to the client query boundary. */
export function createKnowledgeQueryClientFromOrchestrator(
  orchestrator: KnowledgeDiscoveryOrchestrator,
): InstrumentedKnowledgeQueryClient {
  return {
    async query(input: KnowledgeQueryInput): Promise<KnowledgeQueryClientResult> {
      const result = await orchestrator.query({
        text: input.text,
        context: input.context,
        limit: input.limit,
      });

      return {
        documents: result.documents,
        diagnostics: result.diagnostics,
        providerResults: result.providerResults,
      };
    },
    getDiagnostics() {
      return {
        kind: "orchestrator",
        ready: true,
      };
    },
  };
}
