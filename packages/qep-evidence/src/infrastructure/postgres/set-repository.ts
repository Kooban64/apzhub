/**
 * PostgreSQL Evidence set repository — APZQEP-120-S05.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import { qepEvidenceSet } from "@apzhub/config";
import { and, asc, eq } from "drizzle-orm";

import { EvidenceConcurrencyError } from "../../shared/errors";
import type {
  EvidenceSetRepository,
  StoredEvidenceSet,
} from "../../domain/ports/repositories";
import { fromPersistenceSet, toPersistenceSet } from "../persistence/mappers";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export function createPostgresEvidenceSetRepository(
  db: DatabaseExecutor,
): EvidenceSetRepository {
  function rowToStored(row: typeof qepEvidenceSet.$inferSelect): StoredEvidenceSet {
    return fromPersistenceSet({
      id: row.id,
      tenantId: row.tenantId,
      projectId: row.projectId,
      sourceCollectionId: row.sourceCollectionId,
      memberEvidenceIds: row.memberEvidenceIdsJson,
      sealHash: row.sealHash,
      sealedAt: row.sealedAt.toISOString(),
      sealedBy: row.sealedBy,
      purpose: row.purpose,
      revision: row.revision,
    });
  }

  return {
    portId: "EvidenceSetRepository",

    async insert(set) {
      const record = toPersistenceSet(set);
      try {
        await db.insert(qepEvidenceSet).values({
          id: record.id,
          tenantId: record.tenantId,
          projectId: record.projectId,
          sourceCollectionId: record.sourceCollectionId,
          memberEvidenceIdsJson: [...record.memberEvidenceIds],
          sealHash: record.sealHash,
          sealedAt: new Date(record.sealedAt),
          sealedBy: record.sealedBy,
          purpose: record.purpose,
          revision: record.revision,
        });
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new EvidenceConcurrencyError(set.id, 0, 1);
        }
        throw error;
      }
      const found = await this.getById(set.tenantId, set.id);
      return found!;
    },

    async getById(tenantId, id) {
      const [row] = await db
        .select()
        .from(qepEvidenceSet)
        .where(and(eq(qepEvidenceSet.tenantId, tenantId), eq(qepEvidenceSet.id, id)))
        .limit(1);
      return row ? rowToStored(row) : null;
    },

    async listByCollection(tenantId, collectionId) {
      const rows = await db
        .select()
        .from(qepEvidenceSet)
        .where(
          and(
            eq(qepEvidenceSet.tenantId, tenantId),
            eq(qepEvidenceSet.sourceCollectionId, collectionId),
          ),
        )
        .orderBy(asc(qepEvidenceSet.sealedAt), asc(qepEvidenceSet.id));
      return rows.map(rowToStored);
    },
  };
}
