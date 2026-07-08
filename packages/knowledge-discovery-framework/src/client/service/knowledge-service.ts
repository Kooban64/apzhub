import type { KnowledgeQueryDiagnostics } from "../../orchestrator/knowledge-query-diagnostics";
import type { KnowledgeDocument } from "../../types/knowledge-document";
import type { KnowledgeResult } from "../../types/knowledge-result";
import type { KnowledgeQueryInput } from "../query/knowledge-query-client";
import type { KnowledgeServiceDiagnostics } from "./knowledge-service-diagnostics";

export interface KnowledgeServiceQueryResult {
  readonly documents: readonly KnowledgeDocument[];
  readonly diagnostics: KnowledgeQueryDiagnostics;
  readonly providerResults: readonly KnowledgeResult[];
}

/** Public client boundary between Knowledge Experiences and query implementation (DF-015). */
export interface KnowledgeService {
  query(input: KnowledgeQueryInput): Promise<KnowledgeServiceQueryResult>;
  getDiagnostics(): KnowledgeServiceDiagnostics;
}
