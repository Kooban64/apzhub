/**
 * Requirement projection builder — APZQEP-140-E.
 * Events only; never queries Requirement SoR.
 */

import type { KnowledgeIndexDocument } from "../domain/types";
import { QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION } from "../version";

export function buildRequirementProjection(input: {
  readonly eventType: string;
  readonly tenantId: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
  readonly now: string;
  readonly previous?: KnowledgeIndexDocument;
}):
  | KnowledgeIndexDocument
  | { readonly remove: true; readonly tenantId: string; readonly entityId: string } {
  const requirementId =
    typeof input.payload.requirementId === "string"
      ? input.payload.requirementId
      : input.previous?.entityId;
  if (!requirementId) {
    throw new Error("MISSING_REQUIREMENT_ID");
  }

  const prev = input.previous;
  const title =
    typeof input.payload.title === "string"
      ? input.payload.title
      : (prev?.title ?? requirementId);
  const description =
    typeof input.payload.description === "string"
      ? input.payload.description
      : (prev?.summary ?? "");
  const statusRaw =
    typeof input.payload.status === "string"
      ? input.payload.status
      : (prev?.lifecycleState ?? "draft");
  const tags = Array.isArray(input.payload.tags)
    ? input.payload.tags.filter((t): t is string => typeof t === "string")
    : (prev?.tags ?? []);

  const projectionStatus =
    statusRaw === "retired" || statusRaw === "archived" ? "archived" : "active";

  return {
    documentId: `requirement:${input.tenantId}:${requirementId}`,
    entityKind: "requirement",
    entityId: requirementId,
    tenantId: input.tenantId,
    title,
    summary: description,
    keywords: [
      title,
      ...(typeof input.payload.priority === "string" ? [input.payload.priority] : []),
      ...(typeof input.payload.risk === "string" ? [input.payload.risk] : []),
      ...tags,
    ],
    tags,
    ...(typeof input.payload.ownerId === "string"
      ? { ownerId: input.payload.ownerId }
      : prev?.ownerId
        ? { ownerId: prev.ownerId }
        : {}),
    lifecycleState: statusRaw,
    relationshipRefs: prev?.relationshipRefs ?? [],
    auditRefs: prev?.auditRefs ?? [],
    status: projectionStatus,
    projectionVersion: QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION,
    sourceEventType: input.eventType,
    ...(input.correlationId ? { correlationId: input.correlationId } : {}),
    indexedAt: prev?.indexedAt ?? input.now,
    updatedAt: input.now,
    metadata: {
      ...(prev?.metadata ?? {}),
      category: input.payload.category,
      priority: input.payload.priority,
      criticality: input.payload.criticality,
      risk: input.payload.risk,
      suiteIds: input.payload.suiteIds,
      overallCoverage: input.payload.overallCoverage,
      verificationStatus: input.payload.verificationStatus,
      uncovered: input.payload.uncovered,
      highRiskGap: input.payload.highRiskGap,
      projectId: input.payload.projectId,
    },
  };
}
