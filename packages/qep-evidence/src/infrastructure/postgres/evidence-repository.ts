/**
 * PostgreSQL Evidence Catalogue repository — APZQEP-120-S05.
 * Implements EvidenceRepository (Catalogue Repository Port).
 */

import type { DatabaseExecutor } from "@apzhub/config";
import { qepEvidence, qepEvidenceVersion } from "@apzhub/config";
import { and, asc, count, eq, inArray } from "drizzle-orm";

import type { Evidence } from "../../domain/evidence";
import { EvidenceConcurrencyError, EvidenceConflictError } from "../../shared/errors";
import type {
  EvidenceListFilter,
  EvidenceRepository,
  PageRequest,
  StoredEvidence,
} from "../../domain/ports/repositories";
import { fromPersistenceEvidence } from "../persistence/mappers";
import type { PersistenceEvidenceVersionRecord } from "../persistence/models";
import {
  evidenceToRowValues,
  newVersionRowId,
  rowToPersistenceRecord,
} from "./row-mappers";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export function createPostgresEvidenceRepository(
  db: DatabaseExecutor,
): EvidenceRepository {
  async function loadVersions(
    tenantId: string,
    evidenceId: string,
  ): Promise<PersistenceEvidenceVersionRecord[]> {
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
    return rows.map((row) => ({
      version: row.version,
      mediaType: row.mediaType,
      byteSize: row.byteSize,
      contentHash: row.contentHash,
      hashAlgorithm: row.hashAlgorithm,
      storageLocator: row.storageLocator,
      integrityVerificationState: row.integrityVerificationState,
      integritySealed: row.integritySealed,
      integrityLastVerifiedAt: row.integrityLastVerifiedAt?.toISOString(),
      replacedAt: row.replacedAt.toISOString(),
      replacedBy: row.replacedBy,
    }));
  }

  async function syncVersions(evidence: Evidence): Promise<void> {
    await db
      .delete(qepEvidenceVersion)
      .where(
        and(
          eq(qepEvidenceVersion.tenantId, evidence.tenantId),
          eq(qepEvidenceVersion.evidenceId, evidence.id),
        ),
      );
    if (evidence.versions.length === 0) return;
    await db.insert(qepEvidenceVersion).values(
      evidence.versions.map((version) => ({
        id: newVersionRowId(),
        tenantId: evidence.tenantId,
        evidenceId: evidence.id,
        version: version.version,
        mediaType: version.content.mediaType,
        byteSize: version.content.byteSize,
        contentHash: version.content.contentHash,
        hashAlgorithm: version.content.hashAlgorithm,
        storageLocator: version.content.storageLocator,
        integrityVerificationState: version.integrity.verificationState,
        integritySealed: version.integrity.sealed,
        integrityLastVerifiedAt: version.integrity.lastVerifiedAt
          ? new Date(version.integrity.lastVerifiedAt)
          : null,
        replacedAt: new Date(version.replacedAt),
        replacedBy: version.replacedBy,
      })),
    );
  }

  async function loadStored(
    tenantId: string,
    id: string,
  ): Promise<StoredEvidence | null> {
    const [row] = await db
      .select()
      .from(qepEvidence)
      .where(and(eq(qepEvidence.tenantId, tenantId), eq(qepEvidence.id, id)))
      .limit(1);
    if (!row) return null;
    const versions = await loadVersions(tenantId, id);
    return fromPersistenceEvidence(rowToPersistenceRecord(row, versions));
  }

  return {
    portId: "EvidenceRepository",

    async save(evidence, expectedRevision) {
      const existing = await loadStored(evidence.tenantId, evidence.id);
      const values = evidenceToRowValues(evidence);

      if (!existing) {
        if (expectedRevision !== 0) {
          throw new EvidenceConcurrencyError(evidence.id, expectedRevision, -1);
        }
        try {
          await db.insert(qepEvidence).values(values);
        } catch (error) {
          if (isUniqueViolation(error)) {
            throw new EvidenceConflictError(
              `Evidence catalogue record already exists: ${evidence.id}`,
            );
          }
          throw error;
        }
        await syncVersions(evidence);
        return (await loadStored(evidence.tenantId, evidence.id))!;
      }

      if (existing.revision !== expectedRevision) {
        throw new EvidenceConcurrencyError(
          evidence.id,
          expectedRevision,
          existing.revision,
        );
      }

      const updated = await db
        .update(qepEvidence)
        .set(values)
        .where(
          and(
            eq(qepEvidence.tenantId, evidence.tenantId),
            eq(qepEvidence.id, evidence.id),
            eq(qepEvidence.revision, expectedRevision),
          ),
        )
        .returning({ id: qepEvidence.id });

      if (updated.length === 0) {
        const current = await loadStored(evidence.tenantId, evidence.id);
        throw new EvidenceConcurrencyError(
          evidence.id,
          expectedRevision,
          current?.revision ?? -1,
        );
      }

      await syncVersions(evidence);
      return (await loadStored(evidence.tenantId, evidence.id))!;
    },

    async getById(tenantId, id) {
      return loadStored(tenantId, id);
    },

    async list(tenantId, filter: EvidenceListFilter = {}, page: PageRequest = {}) {
      const limit = Math.min(Math.max(page.limit ?? 50, 1), 100);
      const offset = Math.max(page.offset ?? 0, 0);

      const conditions = [eq(qepEvidence.tenantId, tenantId)];
      if (filter.projectId) {
        conditions.push(eq(qepEvidence.projectId, filter.projectId));
      }
      if (filter.workspaceId) {
        conditions.push(eq(qepEvidence.workspaceId, filter.workspaceId));
      }
      if (filter.ownerId) {
        conditions.push(eq(qepEvidence.ownerId, filter.ownerId));
      }
      if (filter.classification) {
        conditions.push(eq(qepEvidence.classificationCategory, filter.classification));
      }
      if (filter.legalHold !== undefined) {
        conditions.push(eq(qepEvidence.legalHold, filter.legalHold));
      }
      if (filter.status) {
        const statuses = Array.isArray(filter.status)
          ? [...filter.status]
          : [filter.status];
        conditions.push(inArray(qepEvidence.status, statuses));
      }

      const whereClause = and(...conditions);

      const [totalRow] = await db
        .select({ value: count() })
        .from(qepEvidence)
        .where(whereClause);

      const rows = await db
        .select()
        .from(qepEvidence)
        .where(whereClause)
        .orderBy(asc(qepEvidence.createdAt), asc(qepEvidence.id))
        .limit(limit)
        .offset(offset);

      const ids = rows.map((row) => row.id);
      const versionRows =
        ids.length === 0
          ? []
          : await db
              .select()
              .from(qepEvidenceVersion)
              .where(
                and(
                  eq(qepEvidenceVersion.tenantId, tenantId),
                  inArray(qepEvidenceVersion.evidenceId, ids),
                ),
              )
              .orderBy(asc(qepEvidenceVersion.version));

      const versionsByEvidence = new Map<string, PersistenceEvidenceVersionRecord[]>();
      for (const versionRow of versionRows) {
        const list = versionsByEvidence.get(versionRow.evidenceId) ?? [];
        list.push({
          version: versionRow.version,
          mediaType: versionRow.mediaType,
          byteSize: versionRow.byteSize,
          contentHash: versionRow.contentHash,
          hashAlgorithm: versionRow.hashAlgorithm,
          storageLocator: versionRow.storageLocator,
          integrityVerificationState: versionRow.integrityVerificationState,
          integritySealed: versionRow.integritySealed,
          integrityLastVerifiedAt: versionRow.integrityLastVerifiedAt?.toISOString(),
          replacedAt: versionRow.replacedAt.toISOString(),
          replacedBy: versionRow.replacedBy,
        });
        versionsByEvidence.set(versionRow.evidenceId, list);
      }

      const items = rows.map((row) =>
        fromPersistenceEvidence(
          rowToPersistenceRecord(row, versionsByEvidence.get(row.id) ?? []),
        ),
      );

      return {
        items,
        total: Number(totalRow?.value ?? 0),
        limit,
        offset,
      };
    },
  };
}
