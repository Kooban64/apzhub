/**
 * Execution Plan projection builder — events only; never queries plan SoR.
 * QKI entity kind: `run` (Capability B reserved kind; stakeholder: Execution Planning).
 */

import type { KnowledgeIndexDocument } from "../domain/types";
import { QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION } from "../version";

export function buildExecutionPlanProjection(input: {
  readonly eventType: string;
  readonly tenantId: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
  readonly now: string;
  readonly previous?: KnowledgeIndexDocument;
}):
  | KnowledgeIndexDocument
  | { readonly remove: true; readonly tenantId: string; readonly entityId: string } {
  const planId =
    typeof input.payload.planId === "string"
      ? input.payload.planId
      : input.previous?.entityId;
  if (!planId) {
    throw new Error("MISSING_PLAN_ID");
  }

  if (input.eventType === "qep.execution-plan.cancelled") {
    // Keep searchable as cancelled — do not remove
  }

  const prev = input.previous;
  const name =
    typeof input.payload.name === "string"
      ? input.payload.name
      : (prev?.title ?? planId);
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
      : statusRaw === "cancelled"
        ? "archived"
        : "active";

  const suiteName =
    typeof input.payload.suiteName === "string" ? input.payload.suiteName : undefined;

  return {
    documentId: `run:${input.tenantId}:${planId}`,
    entityKind: "run",
    entityId: planId,
    tenantId: input.tenantId,
    title: name,
    summary: description || suiteName || "",
    keywords: [name, ...(suiteName ? [suiteName] : []), ...tags],
    tags,
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
      suiteId: input.payload.suiteId,
      suiteVersion: input.payload.suiteVersion,
      suiteName: input.payload.suiteName,
      readinessState: input.payload.readinessState,
      priority: input.payload.priority,
      projectId: input.payload.projectId,
      plannedStartAt: input.payload.plannedStartAt,
      plannedEndAt: input.payload.plannedEndAt,
      assigneeIds: input.payload.assigneeIds,
      handoffId: input.payload.handoffId,
      version: input.payload.version,
    },
  };
}
