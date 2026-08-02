/**
 * Document projection builder — Cap F saved reports / reporting artefacts.
 * Events only; never queries Reporting SoR for business domains.
 */

import type { KnowledgeIndexDocument } from "../domain/types";
import { QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION } from "../version";

export function buildDocumentProjection(input: {
  readonly eventType: string;
  readonly tenantId: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
  readonly now: string;
  readonly previous?: KnowledgeIndexDocument;
}):
  | KnowledgeIndexDocument
  | { readonly remove: true; readonly tenantId: string; readonly entityId: string } {
  const entityId =
    typeof input.payload.reportId === "string"
      ? input.payload.reportId
      : typeof input.payload.documentId === "string"
        ? input.payload.documentId
        : input.previous?.entityId;
  if (!entityId) {
    throw new Error("MISSING_DOCUMENT_ID");
  }

  const prev = input.previous;
  const title =
    typeof input.payload.name === "string"
      ? input.payload.name
      : typeof input.payload.title === "string"
        ? input.payload.title
        : (prev?.title ?? entityId);
  const templateId =
    typeof input.payload.templateId === "string" ? input.payload.templateId : undefined;

  return {
    documentId: `document:${input.tenantId}:${entityId}`,
    entityKind: "document",
    entityId,
    tenantId: input.tenantId,
    title,
    summary: templateId ? `Saved report · ${templateId}` : "Reporting document",
    keywords: [title, ...(templateId ? [templateId, "report"] : ["report"])],
    tags: templateId ? [templateId, "reporting"] : ["reporting"],
    ...(typeof input.payload.ownerId === "string"
      ? { ownerId: input.payload.ownerId }
      : prev?.ownerId
        ? { ownerId: prev.ownerId }
        : {}),
    lifecycleState: "active",
    relationshipRefs: prev?.relationshipRefs ?? [],
    auditRefs: prev?.auditRefs ?? [],
    status: "active",
    projectionVersion: QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION,
    sourceEventType: input.eventType,
    ...(input.correlationId ? { correlationId: input.correlationId } : {}),
    indexedAt: prev?.indexedAt ?? input.now,
    updatedAt: input.now,
    metadata: {
      ...(prev?.metadata ?? {}),
      templateId: input.payload.templateId,
      projectId: input.payload.projectId,
      kind: "saved_report",
    },
  };
}
