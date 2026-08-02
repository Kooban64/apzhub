/**
 * PostgreSQL Evidence relationship repository — APZQEP-120-S05.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import { qepEvidenceRelationship } from "@apzhub/config";
import { and, asc, eq } from "drizzle-orm";

import { EvidenceConflictError } from "../../shared/errors";
import type {
  EvidenceRelationshipRepository,
  StoredEvidenceRelationship,
} from "../../domain/ports/repositories";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

function toStored(
  row: typeof qepEvidenceRelationship.$inferSelect,
): StoredEvidenceRelationship {
  return {
    id: row.id,
    tenantId: row.tenantId,
    evidenceId: row.evidenceId,
    targetCapability: row.targetCapability,
    targetId: row.targetId,
    relationType: row.relationType,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    revision: row.revision,
    uncommittedEvents: [],
  };
}

export function createPostgresEvidenceRelationshipRepository(
  db: DatabaseExecutor,
): EvidenceRelationshipRepository {
  return {
    portId: "EvidenceRelationshipRepository",

    async save(relationship) {
      try {
        await db.insert(qepEvidenceRelationship).values({
          id: relationship.id,
          tenantId: relationship.tenantId,
          evidenceId: relationship.evidenceId,
          targetCapability: relationship.targetCapability,
          targetId: relationship.targetId,
          relationType: relationship.relationType,
          createdAt: new Date(relationship.createdAt),
          createdBy: relationship.createdBy,
          revision: relationship.revision,
        });
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new EvidenceConflictError("Evidence relationship already exists", {
            evidenceId: relationship.evidenceId,
            targetCapability: relationship.targetCapability,
            targetId: relationship.targetId,
            relationType: relationship.relationType,
          });
        }
        throw error;
      }
      const found = await this.getById(relationship.tenantId, relationship.id);
      return found!;
    },

    async getById(tenantId, id) {
      const [row] = await db
        .select()
        .from(qepEvidenceRelationship)
        .where(
          and(
            eq(qepEvidenceRelationship.tenantId, tenantId),
            eq(qepEvidenceRelationship.id, id),
          ),
        )
        .limit(1);
      return row ? toStored(row) : null;
    },

    async listByEvidence(tenantId, evidenceId) {
      const rows = await db
        .select()
        .from(qepEvidenceRelationship)
        .where(
          and(
            eq(qepEvidenceRelationship.tenantId, tenantId),
            eq(qepEvidenceRelationship.evidenceId, evidenceId),
          ),
        )
        .orderBy(asc(qepEvidenceRelationship.createdAt));
      return rows.map(toStored);
    },

    async listByTarget(tenantId, targetCapability, targetId) {
      const rows = await db
        .select()
        .from(qepEvidenceRelationship)
        .where(
          and(
            eq(qepEvidenceRelationship.tenantId, tenantId),
            eq(qepEvidenceRelationship.targetCapability, targetCapability),
            eq(qepEvidenceRelationship.targetId, targetId),
          ),
        )
        .orderBy(asc(qepEvidenceRelationship.createdAt));
      return rows.map(toStored);
    },

    async delete(tenantId, relationshipId) {
      await db
        .delete(qepEvidenceRelationship)
        .where(
          and(
            eq(qepEvidenceRelationship.tenantId, tenantId),
            eq(qepEvidenceRelationship.id, relationshipId),
          ),
        );
    },
  };
}
