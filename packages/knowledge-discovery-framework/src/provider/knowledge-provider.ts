import type { KnowledgeContext } from "../types/knowledge-context";
import type { KnowledgeQuery } from "../types/knowledge-query";
import type { KnowledgeResult } from "../types/knowledge-result";
import type { KnowledgeSource } from "../types/knowledge-source";

/**
 * Knowledge provider — projects documents from a registered source.
 * Providers consume Runtime registries; they do not store authoritative metadata.
 */
export interface KnowledgeProvider {
  readonly source: KnowledgeSource;
  query(query: KnowledgeQuery, context: KnowledgeContext): Promise<KnowledgeResult>;
}

export function getKnowledgeProviderSourceId(provider: KnowledgeProvider): string {
  return provider.source.id;
}
