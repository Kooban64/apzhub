/**
 * Projection Engine — applies events to the Quality Knowledge Index.
 * Never queries business services.
 */

import type { QepEvidenceEventEnvelope } from "@apzhub/qep-evidence/application";

import type { KnowledgeIndexDocument } from "../domain/types";
import { buildEvidenceProjection } from "./evidence-builder";
import { buildExecutionProjection } from "./execution-builder";
import { buildExecutionPlanProjection } from "./execution-plan-builder";
import { buildSuiteProjection } from "./suite-builder";
import type { ProjectionRegistry } from "./registry";
import type { ProjectionRepository } from "./repository";
import { QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION } from "../version";

export type ProjectionApplyResult =
  | {
      readonly ok: true;
      readonly action: "upserted" | "removed" | "noop";
      readonly documentId?: string;
    }
  | { readonly ok: false; readonly error: string; readonly retryable?: boolean };

export type ProjectionDiagnostics = {
  readonly projectionVersion: string;
  readonly indexedEntityCount: number;
  readonly evidenceCount: number;
  readonly registeredProjections: number;
  readonly lastAppliedAt?: string;
  readonly lastError?: string;
  readonly health: "healthy" | "degraded" | "unavailable";
};

export type ProjectionEngine = {
  applyEvent(input: {
    readonly eventType: string;
    readonly tenantId: string;
    readonly payload: Readonly<Record<string, unknown>>;
    readonly envelope?: QepEvidenceEventEnvelope;
    readonly correlationId?: string;
    readonly now: string;
  }): Promise<ProjectionApplyResult>;
  rebuildFromEvents(
    events: ReadonlyArray<{
      readonly eventType: string;
      readonly tenantId: string;
      readonly payload: Readonly<Record<string, unknown>>;
      readonly envelope?: QepEvidenceEventEnvelope;
      readonly correlationId?: string;
      readonly occurredAt: string;
    }>,
    options?: { readonly tenantId?: string },
  ): Promise<{ readonly applied: number; readonly failed: number }>;
  diagnostics(): Promise<ProjectionDiagnostics>;
  readonly repository: ProjectionRepository;
  readonly registry: ProjectionRegistry;
};

export function createProjectionEngine(options: {
  readonly repository: ProjectionRepository;
  readonly registry: ProjectionRegistry;
}): ProjectionEngine {
  let lastAppliedAt: string | undefined;
  let lastError: string | undefined;

  return {
    repository: options.repository,
    registry: options.registry,

    async applyEvent(input) {
      const defs = options.registry.forEventType(input.eventType);
      if (defs.length === 0) {
        return { ok: true, action: "noop" };
      }

      try {
        if (defs.some((d) => d.entityKind === "evidence")) {
          const evidenceId =
            typeof input.payload.evidenceId === "string"
              ? input.payload.evidenceId
              : typeof input.envelope?.payload?.evidenceId === "string"
                ? input.envelope.payload.evidenceId
                : undefined;

          const previous =
            evidenceId != null
              ? await options.repository.get({
                  tenantId: input.tenantId,
                  entityKind: "evidence",
                  entityId: evidenceId,
                })
              : undefined;

          const built = buildEvidenceProjection({
            eventType: input.eventType,
            tenantId: input.tenantId,
            payload: input.payload,
            ...(input.envelope ? { envelope: input.envelope } : {}),
            ...(input.correlationId ? { correlationId: input.correlationId } : {}),
            now: input.now,
            ...(previous ? { previous } : {}),
          });

          if ("remove" in built && built.remove) {
            await options.repository.remove({
              tenantId: built.tenantId,
              entityKind: "evidence",
              entityId: built.entityId,
            });
            lastAppliedAt = input.now;
            return { ok: true, action: "removed", documentId: built.entityId };
          }

          const doc = built as KnowledgeIndexDocument;
          await options.repository.upsert(doc);
          lastAppliedAt = input.now;
          return { ok: true, action: "upserted", documentId: doc.documentId };
        }

        if (defs.some((d) => d.entityKind === "suite")) {
          const suiteId =
            typeof input.payload.suiteId === "string"
              ? input.payload.suiteId
              : undefined;
          const previous =
            suiteId != null
              ? await options.repository.get({
                  tenantId: input.tenantId,
                  entityKind: "suite",
                  entityId: suiteId,
                })
              : undefined;
          const built = buildSuiteProjection({
            eventType: input.eventType,
            tenantId: input.tenantId,
            payload: input.payload,
            ...(input.correlationId ? { correlationId: input.correlationId } : {}),
            now: input.now,
            ...(previous ? { previous } : {}),
          });
          if ("remove" in built && built.remove) {
            await options.repository.remove({
              tenantId: built.tenantId,
              entityKind: "suite",
              entityId: built.entityId,
            });
            lastAppliedAt = input.now;
            return { ok: true, action: "removed", documentId: built.entityId };
          }
          const doc = built as KnowledgeIndexDocument;
          await options.repository.upsert(doc);
          lastAppliedAt = input.now;
          return { ok: true, action: "upserted", documentId: doc.documentId };
        }

        if (defs.some((d) => d.entityKind === "run")) {
          const planId =
            typeof input.payload.planId === "string" ? input.payload.planId : undefined;
          const previous =
            planId != null
              ? await options.repository.get({
                  tenantId: input.tenantId,
                  entityKind: "run",
                  entityId: planId,
                })
              : undefined;
          const built = buildExecutionPlanProjection({
            eventType: input.eventType,
            tenantId: input.tenantId,
            payload: input.payload,
            ...(input.correlationId ? { correlationId: input.correlationId } : {}),
            now: input.now,
            ...(previous ? { previous } : {}),
          });
          if ("remove" in built && built.remove) {
            await options.repository.remove({
              tenantId: built.tenantId,
              entityKind: "run",
              entityId: built.entityId,
            });
            lastAppliedAt = input.now;
            return { ok: true, action: "removed", documentId: built.entityId };
          }
          const doc = built as KnowledgeIndexDocument;
          await options.repository.upsert(doc);
          lastAppliedAt = input.now;
          return { ok: true, action: "upserted", documentId: doc.documentId };
        }

        if (defs.some((d) => d.entityKind === "execution")) {
          const sessionId =
            typeof input.payload.sessionId === "string"
              ? input.payload.sessionId
              : undefined;
          const previous =
            sessionId != null
              ? await options.repository.get({
                  tenantId: input.tenantId,
                  entityKind: "execution",
                  entityId: sessionId,
                })
              : undefined;
          const built = buildExecutionProjection({
            eventType: input.eventType,
            tenantId: input.tenantId,
            payload: input.payload,
            ...(input.correlationId ? { correlationId: input.correlationId } : {}),
            now: input.now,
            ...(previous ? { previous } : {}),
          });
          if ("remove" in built && built.remove) {
            await options.repository.remove({
              tenantId: built.tenantId,
              entityKind: "execution",
              entityId: built.entityId,
            });
            lastAppliedAt = input.now;
            return { ok: true, action: "removed", documentId: built.entityId };
          }
          const doc = built as KnowledgeIndexDocument;
          await options.repository.upsert(doc);
          lastAppliedAt = input.now;
          return { ok: true, action: "upserted", documentId: doc.documentId };
        }

        return { ok: true, action: "noop" };
      } catch (error) {
        const message = error instanceof Error ? error.message : "PROJECTION_FAILED";
        lastError = message;
        const permanent = /MISSING_|INVALID_|NOT_/.test(message);
        return { ok: false, error: message, retryable: !permanent };
      }
    },

    async rebuildFromEvents(events, rebuildOptions = {}) {
      await options.repository.clear(
        rebuildOptions.tenantId ? { tenantId: rebuildOptions.tenantId } : undefined,
      );
      let applied = 0;
      let failed = 0;
      const ordered = [...events].sort((a, b) =>
        a.occurredAt.localeCompare(b.occurredAt),
      );
      for (const event of ordered) {
        if (rebuildOptions.tenantId && event.tenantId !== rebuildOptions.tenantId) {
          continue;
        }
        const result = await this.applyEvent({
          eventType: event.eventType,
          tenantId: event.tenantId,
          payload: event.payload,
          ...(event.envelope ? { envelope: event.envelope } : {}),
          ...(event.correlationId ? { correlationId: event.correlationId } : {}),
          now: event.occurredAt,
        });
        if (result.ok) applied += 1;
        else failed += 1;
      }
      return { applied, failed };
    },

    async diagnostics() {
      const evidenceCount = await options.repository.count({
        entityKind: "evidence",
      });
      const indexedEntityCount = await options.repository.count();
      return {
        projectionVersion: QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION,
        indexedEntityCount,
        evidenceCount,
        registeredProjections: options.registry.list().length,
        ...(lastAppliedAt ? { lastAppliedAt } : {}),
        ...(lastError ? { lastError } : {}),
        health: lastError ? "degraded" : "healthy",
      };
    },
  };
}
