import type { KnowledgeDocumentKind } from "./knowledge-source";

export interface KnowledgeNavigationTarget {
  readonly type: "workbench-route" | "deep-link" | "panel";
  readonly target: string;
  readonly workspaceId?: string;
}

export interface KnowledgeActionRef {
  readonly actionId: string;
  readonly handlerContext?: Readonly<Record<string, unknown>>;
}

/**
 * Normalised discoverable item projected from platform or business knowledge.
 * Maps to DF-001 KnowledgeEntity — renamed KnowledgeDocument in the domain model.
 */
export interface KnowledgeDocument {
  readonly documentId: string;
  readonly sourceId: string;
  readonly kind: KnowledgeDocumentKind;
  readonly title: string;
  readonly description?: string;
  readonly keywords?: readonly string[];
  readonly category?: string;
  readonly icon?: string;
  readonly score?: number;
  readonly navigation?: KnowledgeNavigationTarget;
  readonly actionRef?: KnowledgeActionRef;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly permission?: string;
}
