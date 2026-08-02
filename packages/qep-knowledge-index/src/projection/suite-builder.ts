/**
 * Suite projection builder — events only; never queries Suite SoR.
 */

import type { KnowledgeIndexDocument } from "../domain/types";
import { QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION } from "../version";

export function buildSuiteProjection(input: {
  readonly eventType: string;
  readonly tenantId: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
  readonly now: string;
  readonly previous?: KnowledgeIndexDocument;
}):
  | KnowledgeIndexDocument
  | { readonly remove: true; readonly tenantId: string; readonly entityId: string } {
  const suiteId =
    typeof input.payload.suiteId === "string"
      ? input.payload.suiteId
      : input.previous?.entityId;
  if (!suiteId) {
    throw new Error("MISSING_SUITE_ID");
  }

  if (input.eventType === "qep.suite.deleted") {
    return { remove: true, tenantId: input.tenantId, entityId: suiteId };
  }

  const prev = input.previous;
  const name =
    typeof input.payload.name === "string"
      ? input.payload.name
      : (prev?.title ?? suiteId);
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
  const ownerId =
    typeof input.payload.ownerId === "string" ? input.payload.ownerId : prev?.ownerId;

  const projectionStatus =
    statusRaw === "archived" || statusRaw === "retired"
      ? "archived"
      : statusRaw === "deleted"
        ? "deleted"
        : "active";

  return {
    documentId: `suite:${input.tenantId}:${suiteId}`,
    entityKind: "suite",
    entityId: suiteId,
    tenantId: input.tenantId,
    title: name,
    summary: description,
    keywords: [name, ...tags],
    tags,
    ...(typeof input.payload.classification === "string"
      ? { classification: input.payload.classification }
      : prev?.classification
        ? { classification: prev.classification }
        : {}),
    ...(ownerId ? { ownerId } : {}),
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
      kind: input.payload.kind,
      version: input.payload.version,
      priority: input.payload.priority,
      folderPath: input.payload.folderPath,
      parentSuiteId: input.payload.parentSuiteId,
      projectId: input.payload.projectId,
    },
  };
}
