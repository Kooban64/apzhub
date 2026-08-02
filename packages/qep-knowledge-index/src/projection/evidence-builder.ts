/**
 * Evidence projection builder — builds index docs from events only (never SoR queries).
 */

import type { QepEvidenceEventEnvelope } from "@apzhub/qep-evidence/application";

import type {
  KnowledgeIndexDocument,
  KnowledgeProjectionStatus,
} from "../domain/types";
import { QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION } from "../version";

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function statusFromEvent(
  eventId: string,
  payload: Record<string, unknown>,
): KnowledgeProjectionStatus {
  if (eventId === "qep.evidence.deleted") return "deleted";
  if (eventId === "qep.evidence.archived") return "archived";
  if (eventId === "qep.evidence.superseded") return "superseded";
  const lifecycle = asString(payload.lifecycleState) ?? asString(payload.targetState);
  if (lifecycle === "archived") return "archived";
  if (lifecycle === "superseded") return "superseded";
  if (lifecycle === "deleted") return "deleted";
  return "active";
}

export type BuildEvidenceProjectionInput = {
  readonly envelope?: QepEvidenceEventEnvelope;
  readonly eventType: string;
  readonly tenantId: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
  readonly now: string;
  readonly previous?: KnowledgeIndexDocument;
};

export function buildEvidenceProjection(
  input: BuildEvidenceProjectionInput,
):
  | KnowledgeIndexDocument
  | { readonly remove: true; readonly entityId: string; readonly tenantId: string } {
  const payload = {
    ...(input.previous?.metadata ?? {}),
    ...input.payload,
    ...(input.envelope?.payload ?? {}),
  };

  const evidenceId =
    asString(payload.evidenceId) ??
    input.previous?.entityId ??
    asString(input.envelope?.payload?.evidenceId);

  if (!evidenceId) {
    throw new Error("MISSING_EVIDENCE_ID");
  }

  const tenantId = input.tenantId || asString(payload.tenantId) || "";
  if (!tenantId) throw new Error("MISSING_TENANT_ID");

  if (input.eventType === "qep.evidence.deleted") {
    return { remove: true, entityId: evidenceId, tenantId };
  }

  const title =
    asString(payload.title) ??
    asString(payload.name) ??
    input.previous?.title ??
    `Evidence ${evidenceId}`;

  const summary =
    asString(payload.summary) ??
    asString(payload.description) ??
    input.previous?.summary ??
    title;

  const keywords = [
    ...new Set([
      ...(input.previous?.keywords ?? []),
      ...asStringArray(payload.keywords),
      ...asStringArray(payload.tags),
      evidenceId,
      title,
    ]),
  ];

  const tags = [
    ...new Set([...(input.previous?.tags ?? []), ...asStringArray(payload.tags)]),
  ];

  const relationshipRefs = [
    ...new Set([
      ...(input.previous?.relationshipRefs ?? []),
      ...asStringArray(payload.relationshipRefs),
      ...asStringArray(payload.relationships),
    ]),
  ];

  const auditRefs = [
    ...new Set([
      ...(input.previous?.auditRefs ?? []),
      ...asStringArray(payload.auditRefs),
      ...(asString(payload.auditId) ? [payload.auditId as string] : []),
    ]),
  ];

  const lifecycleState =
    asString(payload.lifecycleState) ??
    asString(payload.targetState) ??
    input.previous?.lifecycleState;

  const integrityState =
    asString(payload.integrityState) ??
    (input.eventType === "qep.evidence.integrity_established"
      ? "established"
      : input.eventType === "qep.evidence.integrity_verified"
        ? "verified"
        : input.previous?.integrityState);

  return {
    documentId: `qki:evidence:${tenantId}:${evidenceId}`,
    entityKind: "evidence",
    entityId: evidenceId,
    tenantId,
    title,
    summary,
    keywords,
    tags,
    classification: asString(payload.classification) ?? input.previous?.classification,
    ownerId: asString(payload.ownerId) ?? input.previous?.ownerId,
    lifecycleState,
    integrityState,
    relationshipRefs,
    auditRefs,
    status: statusFromEvent(input.eventType, payload),
    projectionVersion: QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION,
    sourceEventId: input.envelope?.envelopeId,
    sourceEventType: input.eventType,
    ...(input.correlationId || input.envelope?.correlationId
      ? {
          correlationId: input.correlationId ?? input.envelope?.correlationId,
        }
      : {}),
    indexedAt: input.previous?.indexedAt ?? input.now,
    updatedAt: input.now,
    metadata: payload,
  };
}
