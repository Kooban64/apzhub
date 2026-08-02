/**
 * PostgreSQL Evidence collection repository — APZQEP-120-S05.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import { qepEvidenceCollection } from "@apzhub/config";
import { and, asc, count, eq } from "drizzle-orm";

import type { EvidenceCollection } from "../../domain/evidence/collection";
import { EvidenceConcurrencyError } from "../../shared/errors";
import type {
  EvidenceCollectionRepository,
  PageRequest,
  StoredEvidenceCollection,
} from "../../domain/ports/repositories";
import {
  fromPersistenceCollection,
  toPersistenceCollection,
} from "../persistence/mappers";

export function createPostgresEvidenceCollectionRepository(
  db: DatabaseExecutor,
): EvidenceCollectionRepository {
  function rowToStored(
    row: typeof qepEvidenceCollection.$inferSelect,
  ): StoredEvidenceCollection {
    return fromPersistenceCollection({
      id: row.id,
      tenantId: row.tenantId,
      projectId: row.projectId,
      name: row.name,
      purpose: row.purpose,
      status: row.status,
      memberEvidenceIds: row.memberEvidenceIdsJson,
      sealedSetId: row.sealedSetId ?? undefined,
      revision: row.revision,
      historyEntries: row.historyJson,
      createdAt: row.createdAt.toISOString(),
      createdBy: row.createdBy,
      updatedAt: row.updatedAt.toISOString(),
      updatedBy: row.updatedBy,
    });
  }

  function toValues(collection: EvidenceCollection | StoredEvidenceCollection) {
    const record = toPersistenceCollection(collection);
    return {
      id: record.id,
      tenantId: record.tenantId,
      projectId: record.projectId,
      name: record.name,
      purpose: record.purpose,
      status: record.status,
      memberEvidenceIdsJson: [...record.memberEvidenceIds],
      sealedSetId: record.sealedSetId ?? null,
      revision: record.revision,
      historyJson: record.historyEntries.map((h) => ({ ...h })),
      createdAt: new Date(record.createdAt),
      createdBy: record.createdBy,
      updatedAt: new Date(record.updatedAt),
      updatedBy: record.updatedBy,
    };
  }

  return {
    portId: "EvidenceCollectionRepository",

    async save(collection, expectedRevision) {
      const [existing] = await db
        .select()
        .from(qepEvidenceCollection)
        .where(
          and(
            eq(qepEvidenceCollection.tenantId, collection.tenantId),
            eq(qepEvidenceCollection.id, collection.id),
          ),
        )
        .limit(1);

      const values = toValues(collection);

      if (!existing) {
        if (expectedRevision !== 0) {
          throw new EvidenceConcurrencyError(collection.id, expectedRevision, -1);
        }
        await db.insert(qepEvidenceCollection).values(values);
        const created = await this.getById(collection.tenantId, collection.id);
        return created!;
      }

      if (existing.revision !== expectedRevision) {
        throw new EvidenceConcurrencyError(
          collection.id,
          expectedRevision,
          existing.revision,
        );
      }

      const updated = await db
        .update(qepEvidenceCollection)
        .set(values)
        .where(
          and(
            eq(qepEvidenceCollection.tenantId, collection.tenantId),
            eq(qepEvidenceCollection.id, collection.id),
            eq(qepEvidenceCollection.revision, expectedRevision),
          ),
        )
        .returning();

      if (updated.length === 0) {
        throw new EvidenceConcurrencyError(
          collection.id,
          expectedRevision,
          existing.revision,
        );
      }
      return rowToStored(updated[0]!);
    },

    async getById(tenantId, id) {
      const [row] = await db
        .select()
        .from(qepEvidenceCollection)
        .where(
          and(
            eq(qepEvidenceCollection.tenantId, tenantId),
            eq(qepEvidenceCollection.id, id),
          ),
        )
        .limit(1);
      return row ? rowToStored(row) : null;
    },

    async list(tenantId, projectId, page: PageRequest = {}) {
      const limit = Math.min(Math.max(page.limit ?? 50, 1), 100);
      const offset = Math.max(page.offset ?? 0, 0);
      const conditions = [eq(qepEvidenceCollection.tenantId, tenantId)];
      if (projectId) {
        conditions.push(eq(qepEvidenceCollection.projectId, projectId));
      }
      const whereClause = and(...conditions);

      const [totalRow] = await db
        .select({ value: count() })
        .from(qepEvidenceCollection)
        .where(whereClause);

      const rows = await db
        .select()
        .from(qepEvidenceCollection)
        .where(whereClause)
        .orderBy(asc(qepEvidenceCollection.createdAt), asc(qepEvidenceCollection.id))
        .limit(limit)
        .offset(offset);

      return {
        items: rows.map(rowToStored),
        total: Number(totalRow?.value ?? 0),
        limit,
        offset,
      };
    },
  };
}
