import type { KnowledgeDocument } from "../../types/knowledge-document";
import type { KnowledgeQueryDiagnostics } from "../../orchestrator/knowledge-query-diagnostics";

/** Client query lifecycle states — presentation-agnostic (DF-011). */
export type KnowledgeQueryStatus = "idle" | "loading" | "success" | "error";

export interface KnowledgeQueryError {
  readonly code: "REGISTRY_NOT_READY" | "QUERY_CLIENT_ERROR" | "QUERY_FAILED";
  readonly message: string;
}

export interface KnowledgeQueryState {
  readonly status: KnowledgeQueryStatus;
  readonly text: string;
  readonly documents: readonly KnowledgeDocument[];
  readonly diagnostics: KnowledgeQueryDiagnostics | undefined;
  readonly error: KnowledgeQueryError | undefined;
}

export function createInitialKnowledgeQueryState(): KnowledgeQueryState {
  return {
    status: "idle",
    text: "",
    documents: [],
    diagnostics: undefined,
    error: undefined,
  };
}

export function createLoadingKnowledgeQueryState(text: string): KnowledgeQueryState {
  return {
    status: "loading",
    text,
    documents: [],
    diagnostics: undefined,
    error: undefined,
  };
}
