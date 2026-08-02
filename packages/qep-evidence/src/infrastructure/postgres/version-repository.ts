/**
 * PostgreSQL Evidence version query repository — APZQEP-120-S05.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import { qepEvidenceVersion } from "@apzhub/config";
import { and, asc, eq } from "drizzle-orm";

import type { EvidenceVersion } from "../../domain/evidence";
import type { EvidenceVersionRepository } from "../../domain/ports/repositories";
import type {
  HashAlgorithm,
  VerificationState,
} from "../../domain/evidence/value-objects";

export function createPostgresEvidenceVersionRepository(
  db: DatabaseExecutor,
): EvidenceVersionRepository {
  function toVersion(row: typeof qepEvidenceVersion.$inferSelect): EvidenceVersion {
    return {
      version: row.version,
      content: {
        mediaType: row.mediaType,
        byteSize: row.byteSize,
        contentHash: row.contentHash,
        hashAlgorithm: row.hashAlgorithm as HashAlgorithm,
        storageLocator: row.storageLocator,
      },
      integrity: {
        hashAlgorithm: row.hashAlgorithm as HashAlgorithm,
        contentHash: row.contentHash,
        verificationState: row.integrityVerificationState as VerificationState,
        lastVerifiedAt: row.integrityLastVerifiedAt?.toISOString(),
        sealed: row.integritySealed,
      },
      replacedAt: row.replacedAt.toISOString(),
      replacedBy: row.replacedBy,
    };
  }

  return {
    portId: "EvidenceVersionRepository",

    async listByEvidence(tenantId, evidenceId) {
      const rows = await db
        .select()
        .from(qepEvidenceVersion)
        .where(
          and(
            eq(qepEvidenceVersion.tenantId, tenantId),
            eq(qepEvidenceVersion.evidenceId, evidenceId),
          ),
        )
        .orderBy(asc(qepEvidenceVersion.version));
      return rows.map(toVersion);
    },

    async getVersion(tenantId, evidenceId, version) {
      const [row] = await db
        .select()
        .from(qepEvidenceVersion)
        .where(
          and(
            eq(qepEvidenceVersion.tenantId, tenantId),
            eq(qepEvidenceVersion.evidenceId, evidenceId),
            eq(qepEvidenceVersion.version, version),
          ),
        )
        .limit(1);
      return row ? toVersion(row) : null;
    },
  };
}
