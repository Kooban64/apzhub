/**
 * PostgreSQL OrchestrationDocumentStore — QX-PR-05.
 */
import {
  getDatabaseExecutor,
  qepQoDocument,
  type DatabaseExecutor,
} from "@apzhub/config";
import { and, desc, eq } from "drizzle-orm";

import type {
  OrchestrationArtefactKind,
  OrchestrationDocument,
  OrchestrationDocumentStore,
  UpsertOrchestrationDocumentInput,
} from "./document-store";

function rowToDoc(row: typeof qepQoDocument.$inferSelect): OrchestrationDocument {
  return {
    id: row.id,
    artefactKind: row.artefactKind as OrchestrationArtefactKind,
    artefactKey: row.artefactKey,
    tenantId: row.tenantId,
    projectId: row.projectId ?? undefined,
    orchestrationId: row.orchestrationId,
    correlationId: row.correlationId ?? undefined,
    status: row.status ?? undefined,
    payload: row.payloadJson,
    revision: row.revision,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function createPostgresOrchestrationDocumentStore(
  db: DatabaseExecutor,
): OrchestrationDocumentStore {
  const exec = () => getDatabaseExecutor(db);

  return {
    async upsert(
      input: UpsertOrchestrationDocumentInput,
    ): Promise<OrchestrationDocument> {
      const id = `${input.artefactKind}:${input.artefactKey}`;
      const now = new Date();
      const actor = input.actorId?.trim() || "system";
      const existing = await exec()
        .select()
        .from(qepQoDocument)
        .where(
          and(
            eq(qepQoDocument.artefactKind, input.artefactKind),
            eq(qepQoDocument.artefactKey, input.artefactKey),
          ),
        )
        .limit(1);

      if (existing[0]) {
        const revision = existing[0].revision + 1;
        await exec()
          .update(qepQoDocument)
          .set({
            tenantId: input.tenantId,
            projectId: input.projectId ?? null,
            orchestrationId: input.orchestrationId ?? "orch_default",
            correlationId: input.correlationId ?? null,
            status: input.status ?? null,
            payloadJson: input.payload,
            revision,
            updatedAt: now,
            updatedBy: actor,
          })
          .where(eq(qepQoDocument.id, existing[0].id));
        return {
          id: existing[0].id,
          artefactKind: input.artefactKind,
          artefactKey: input.artefactKey,
          tenantId: input.tenantId,
          projectId: input.projectId,
          orchestrationId: input.orchestrationId ?? "orch_default",
          correlationId: input.correlationId,
          status: input.status,
          payload: input.payload,
          revision,
          createdAt: existing[0].createdAt.toISOString(),
          updatedAt: now.toISOString(),
          createdBy: existing[0].createdBy,
          updatedBy: actor,
        };
      }

      await exec()
        .insert(qepQoDocument)
        .values({
          id,
          artefactKind: input.artefactKind,
          artefactKey: input.artefactKey,
          tenantId: input.tenantId,
          projectId: input.projectId ?? null,
          orchestrationId: input.orchestrationId ?? "orch_default",
          correlationId: input.correlationId ?? null,
          status: input.status ?? null,
          payloadJson: input.payload,
          revision: 1,
          createdAt: now,
          updatedAt: now,
          createdBy: actor,
          updatedBy: actor,
        });

      return {
        id,
        artefactKind: input.artefactKind,
        artefactKey: input.artefactKey,
        tenantId: input.tenantId,
        projectId: input.projectId,
        orchestrationId: input.orchestrationId ?? "orch_default",
        correlationId: input.correlationId,
        status: input.status,
        payload: input.payload,
        revision: 1,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: actor,
        updatedBy: actor,
      };
    },

    async get(artefactKind, artefactKey) {
      const rows = await exec()
        .select()
        .from(qepQoDocument)
        .where(
          and(
            eq(qepQoDocument.artefactKind, artefactKind),
            eq(qepQoDocument.artefactKey, artefactKey),
          ),
        )
        .limit(1);
      return rows[0] ? rowToDoc(rows[0]) : undefined;
    },

    async listByKind(artefactKind, tenantId) {
      const rows = tenantId
        ? await exec()
            .select()
            .from(qepQoDocument)
            .where(
              and(
                eq(qepQoDocument.artefactKind, artefactKind),
                eq(qepQoDocument.tenantId, tenantId),
              ),
            )
            .orderBy(desc(qepQoDocument.updatedAt))
        : await exec()
            .select()
            .from(qepQoDocument)
            .where(eq(qepQoDocument.artefactKind, artefactKind))
            .orderBy(desc(qepQoDocument.updatedAt));
      return rows.map(rowToDoc);
    },

    async delete(artefactKind, artefactKey) {
      await exec()
        .delete(qepQoDocument)
        .where(
          and(
            eq(qepQoDocument.artefactKind, artefactKind),
            eq(qepQoDocument.artefactKey, artefactKey),
          ),
        );
    },
  };
}
