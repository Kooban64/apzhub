/**
 * Defect projection builder — APZQEP-140-D.
 * Events only; never queries Defect SoR.
 */

import type { KnowledgeIndexDocument } from "../domain/types";
import { QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION } from "../version";

export function buildDefectProjection(input: {
  readonly eventType: string;
  readonly tenantId: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
  readonly now: string;
  readonly previous?: KnowledgeIndexDocument;
}):
  | KnowledgeIndexDocument
  | { readonly remove: true; readonly tenantId: string; readonly entityId: string } {
  const defectId =
    typeof input.payload.defectId === "string"
      ? input.payload.defectId
      : input.previous?.entityId;
  if (!defectId) {
    throw new Error("MISSING_DEFECT_ID");
  }

  const prev = input.previous;
  const title =
    typeof input.payload.title === "string"
      ? input.payload.title
      : (prev?.title ?? defectId);
  const description =
    typeof input.payload.description === "string"
      ? input.payload.description
      : (prev?.summary ?? "");
  const statusRaw =
    typeof input.payload.status === "string"
      ? input.payload.status
      : (prev?.lifecycleState ?? "new");
  const tags = Array.isArray(input.payload.tags)
    ? input.payload.tags.filter((t): t is string => typeof t === "string")
    : (prev?.tags ?? []);

  const projectionStatus =
    statusRaw === "archived"
      ? "archived"
      : statusRaw === "closed"
        ? "archived"
        : "active";

  return {
    documentId: `defect:${input.tenantId}:${defectId}`,
    entityKind: "defect",
    entityId: defectId,
    tenantId: input.tenantId,
    title,
    summary: description,
    keywords: [
      title,
      ...(typeof input.payload.severity === "string" ? [input.payload.severity] : []),
      ...tags,
    ],
    tags,
    ...(typeof input.payload.assigneeId === "string"
      ? { ownerId: input.payload.assigneeId }
      : typeof input.payload.reporterId === "string"
        ? { ownerId: input.payload.reporterId }
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
      severity: input.payload.severity,
      priority: input.payload.priority,
      assigneeId: input.payload.assigneeId,
      sessionId: input.payload.sessionId,
      stepId: input.payload.stepId,
      suiteId: input.payload.suiteId,
      evidenceIds: input.payload.evidenceIds,
      projectId: input.payload.projectId,
    },
  };
}
