import type { KnowledgeDocument } from "./knowledge-document";

export type KnowledgeResultStatus = "ok" | "empty" | "not_implemented" | "error";

/** Provider query outcome — no execution; documents carry navigation/action references only. */
export interface KnowledgeResult {
  readonly status: KnowledgeResultStatus;
  readonly sourceId: string;
  readonly documents: readonly KnowledgeDocument[];
  readonly message?: string;
  readonly durationMs?: number;
}
