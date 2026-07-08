import type { KnowledgeDiscoveryOrchestratorQueryResult } from "../../orchestrator/knowledge-discovery-orchestrator";
import type { KnowledgeContext } from "../../types/knowledge-context";
import type { KnowledgeDocument } from "../../types/knowledge-document";
import type { KnowledgeQueryDiagnostics } from "../../orchestrator/knowledge-query-diagnostics";
import type { KnowledgeResult } from "../../types/knowledge-result";

/** Presentation-agnostic query input for client experiences (DF-011). */
export interface KnowledgeQueryInput {
  readonly text: string;
  readonly context?: KnowledgeContext;
  readonly limit?: number;
}

export interface KnowledgeQueryClientResult {
  readonly documents: readonly KnowledgeDocument[];
  readonly diagnostics: KnowledgeQueryDiagnostics;
  readonly providerResults: readonly KnowledgeResult[];
}

/** Orchestrator boundary — injected by app wiring; mocked in tests (DF-011). */
export interface KnowledgeQueryClient {
  query(input: KnowledgeQueryInput): Promise<KnowledgeQueryClientResult>;
}

export interface KnowledgeQueryClientDiagnostics {
  readonly kind: "orchestrator" | "placeholder";
  readonly ready: boolean;
  readonly message?: string;
}

export interface InstrumentedKnowledgeQueryClient extends KnowledgeQueryClient {
  getDiagnostics(): KnowledgeQueryClientDiagnostics;
}

export type { KnowledgeDiscoveryOrchestratorQueryResult };
