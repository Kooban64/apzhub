/**
 * PostgreSQL Evidence access grant repository — APZQEP-120-S05.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import { qepEvidenceAccessGrant } from "@apzhub/config";
import { and, eq, isNull } from "drizzle-orm";

import type {
  EvidenceAccessGrant,
  EvidenceAccessGrantRepository,
} from "../../domain/ports/repositories";

export function createPostgresEvidenceAccessGrantRepository(
  db: DatabaseExecutor,
): EvidenceAccessGrantRepository {
  function toGrant(
    row: typeof qepEvidenceAccessGrant.$inferSelect,
  ): EvidenceAccessGrant {
    return {
      id: row.id,
      tenantId: row.tenantId,
      evidenceId: row.evidenceId ?? undefined,
      scope: row.scope ?? undefined,
      principalId: row.principalId,
      action: row.action,
      effect: "allow",
      createdAt: row.createdAt.toISOString(),
      createdBy: row.createdBy,
      revokedAt: row.revokedAt?.toISOString(),
    };
  }

  return {
    portId: "EvidenceAccessGrantRepository",

    async save(grant) {
      await db.insert(qepEvidenceAccessGrant).values({
        id: grant.id,
        tenantId: grant.tenantId,
        evidenceId: grant.evidenceId ?? null,
        scope: grant.scope ?? null,
        principalId: grant.principalId,
        action: grant.action,
        effect: grant.effect,
        createdAt: new Date(grant.createdAt),
        createdBy: grant.createdBy,
        revokedAt: grant.revokedAt ? new Date(grant.revokedAt) : null,
      });
      return grant;
    },

    async revoke(tenantId, grantId, revokedAt) {
      await db
        .update(qepEvidenceAccessGrant)
        .set({ revokedAt: new Date(revokedAt) })
        .where(
          and(
            eq(qepEvidenceAccessGrant.tenantId, tenantId),
            eq(qepEvidenceAccessGrant.id, grantId),
          ),
        );
    },

    async findGrants(tenantId, query) {
      const conditions = [
        eq(qepEvidenceAccessGrant.tenantId, tenantId),
        eq(qepEvidenceAccessGrant.principalId, query.principalId),
        isNull(qepEvidenceAccessGrant.revokedAt),
      ];
      if (query.evidenceId) {
        conditions.push(eq(qepEvidenceAccessGrant.evidenceId, query.evidenceId));
      }
      if (query.scope) {
        conditions.push(eq(qepEvidenceAccessGrant.scope, query.scope));
      }
      const rows = await db
        .select()
        .from(qepEvidenceAccessGrant)
        .where(and(...conditions));
      return rows.map(toGrant);
    },
  };
}
