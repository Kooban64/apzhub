/**
 * Quality Knowledge Index domain — APZQEP-120-S11.
 * Enterprise read model. Write model remains business domains.
 */

/** Extensible entity kinds — Evidence today; Suites/Runs/Defects later without redesign. */
export const KNOWLEDGE_ENTITY_KINDS = [
  "evidence",
  "suite",
  "run",
  "execution",
  "defect",
  "requirement",
  "document",
  "audit",
  "event",
  "quality_intelligence",
  "ai_context",
] as const;

export type KnowledgeEntityKind = (typeof KNOWLEDGE_ENTITY_KINDS)[number];

export type KnowledgeProjectionStatus =
  "active" | "archived" | "superseded" | "deleted" | "unknown";

export type KnowledgeIndexDocument = {
  readonly documentId: string;
  readonly entityKind: KnowledgeEntityKind;
  readonly entityId: string;
  readonly tenantId: string;
  readonly title: string;
  readonly summary: string;
  readonly keywords: readonly string[];
  readonly tags: readonly string[];
  readonly classification?: string;
  readonly ownerId?: string;
  readonly lifecycleState?: string;
  readonly integrityState?: string;
  readonly relationshipRefs: readonly string[];
  readonly auditRefs: readonly string[];
  readonly status: KnowledgeProjectionStatus;
  readonly projectionVersion: string;
  readonly sourceEventId?: string;
  readonly sourceEventType?: string;
  readonly correlationId?: string;
  readonly indexedAt: string;
  readonly updatedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
};

export type ProjectionDefinition = {
  readonly projectionId: string;
  readonly entityKind: KnowledgeEntityKind;
  readonly version: string;
  readonly description: string;
  readonly eventTypes: readonly string[];
};
