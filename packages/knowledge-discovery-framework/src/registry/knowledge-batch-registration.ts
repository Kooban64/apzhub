import type { KnowledgeRegistrationIssue } from "../types/knowledge-diagnostics";

/** Structured issue for atomic batch registration failures. */
export interface KnowledgeBatchRegistrationResult {
  readonly ok: boolean;
  readonly registeredCount: number;
  readonly errors: readonly KnowledgeRegistrationIssue[];
}
