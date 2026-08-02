/**
 * Execution Session projection builder — APZQEP-140-C.
 * Events only; never queries Execution Workspace SoR.
 */

import type { KnowledgeIndexDocument } from "../domain/types";
import { QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION } from "../version";

export function buildExecutionProjection(input: {
  readonly eventType: string;
  readonly tenantId: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
  readonly now: string;
  readonly previous?: KnowledgeIndexDocument;
}):
  | KnowledgeIndexDocument
  | { readonly remove: true; readonly tenantId: string; readonly entityId: string } {
  const sessionId =
    typeof input.payload.sessionId === "string"
      ? input.payload.sessionId
      : input.previous?.entityId;
  if (!sessionId) {
    throw new Error("MISSING_SESSION_ID");
  }

  const prev = input.previous;
  const name =
    typeof input.payload.name === "string"
      ? input.payload.name
      : (prev?.title ?? sessionId);
  const statusRaw =
    typeof input.payload.status === "string"
      ? input.payload.status
      : (prev?.lifecycleState ?? "not_started");

  const projectionStatus =
    statusRaw === "archived"
      ? "archived"
      : statusRaw === "cancelled"
        ? "archived"
        : "active";

  return {
    documentId: `execution:${input.tenantId}:${sessionId}`,
    entityKind: "execution",
    entityId: sessionId,
    tenantId: input.tenantId,
    title: name,
    summary:
      typeof input.payload.suiteName === "string"
        ? String(input.payload.suiteName)
        : (prev?.summary ?? ""),
    keywords: [
      name,
      ...(typeof input.payload.suiteName === "string" ? [input.payload.suiteName] : []),
      ...(typeof input.payload.handoffId === "string" ? [input.payload.handoffId] : []),
    ],
    tags: prev?.tags ?? [],
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
      planId: input.payload.planId,
      handoffId: input.payload.handoffId,
      suiteId: input.payload.suiteId,
      suiteName: input.payload.suiteName,
      percentComplete: input.payload.percentComplete,
      projectId: input.payload.projectId,
      assigneeIds: input.payload.assigneeIds,
    },
  };
}
