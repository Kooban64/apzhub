import type { KnowledgeProvider } from "./knowledge-provider";
import type { KnowledgeContext } from "../types/knowledge-context";
import type { KnowledgeQuery } from "../types/knowledge-query";
import type { KnowledgeResult } from "../types/knowledge-result";
import type { KnowledgeSource } from "../types/knowledge-source";

const SCAFFOLD_MESSAGE =
  "Knowledge provider scaffold — search orchestration deferred to DF-006";

/** Scaffold provider — returns structured not_implemented without throwing. */
export class ScaffoldKnowledgeProvider implements KnowledgeProvider {
  readonly source: KnowledgeSource;

  constructor(source: KnowledgeSource) {
    this.source = source;
  }

  async query(
    _query: KnowledgeQuery,
    _context: KnowledgeContext,
  ): Promise<KnowledgeResult> {
    return {
      status: "not_implemented",
      sourceId: this.source.id,
      documents: [],
      message: SCAFFOLD_MESSAGE,
      durationMs: 0,
    };
  }
}

export function createScaffoldKnowledgeProvider(
  source: KnowledgeSource,
): KnowledgeProvider {
  return new ScaffoldKnowledgeProvider(source);
}
