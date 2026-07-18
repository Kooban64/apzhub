/**
 * PostgreSQL document repositories (APZDOCS-002).
 * Uses Drizzle against platform_document* tables — no binary columns.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  platformDocument,
  platformDocumentAudit,
  platformDocumentMetadata,
  platformDocumentRelationship,
  platformDocumentStorageObject,
  platformDocumentTag,
  platformDocumentVersion,
} from "@apzhub/config";
import type {
  Document,
  DocumentAudit,
  DocumentContentVersionRecord,
  DocumentMetadata,
  DocumentRelationship,
  DocumentStorageObjectRecord,
  DocumentTag,
} from "@apzhub/document-contracts";
import {
  asDocumentId,
  asDocumentTagId,
  asDocumentAuditId,
  asDocumentMetadataId,
  asDocumentRelationshipId,
  asDocumentOwnerId,
} from "@apzhub/document-contracts";
import type {
  DocumentAuditRepositoryPort,
  DocumentMetadataRepositoryPort,
  DocumentRelationshipRepositoryPort,
  DocumentRepositoryPort,
  DocumentStorageObjectRepositoryPort,
  DocumentTagRepositoryPort,
  DocumentVersionRepositoryPort,
} from "@apzhub/document-core";
import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";

function mapDocument(row: typeof platformDocument.$inferSelect): Document {
  return {
    id: asDocumentId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    documentType: row.documentType as Document["documentType"],
    status: row.status as Document["status"],
    classification: {
      code: row.classificationCode as Document["classification"]["code"],
      label: row.classificationLabel ?? undefined,
      customCode: row.classificationCustomCode ?? undefined,
    },
    title: row.title,
    description: row.description ?? undefined,
    owner: row.ownerUserId
      ? {
          id: asDocumentOwnerId(`owner_${row.ownerUserId}`),
          userId: row.ownerUserId,
        }
      : undefined,
    creatorUserId: row.creatorUserId,
    mimeType: row.mimeType ?? undefined,
    byteLength: row.byteLength ?? undefined,
    checksum:
      row.checksumHex && row.checksumAlgorithm
        ? {
            algorithm: row.checksumAlgorithm as "sha256",
            hex: row.checksumHex,
          }
        : undefined,
    storageRef:
      row.storageProviderId && row.storageKey
        ? {
            providerId: row.storageProviderId,
            storageKey: row.storageKey,
          }
        : undefined,
    categoryId: row.categoryId as Document["categoryId"],
    folderId: row.folderId as Document["folderId"],
    tagIds: (row.tagIdsJson ?? []).map((id) => asDocumentTagId(id)),
    permissions: (row.permissionsJson ?? []) as unknown as Document["permissions"],
    lifecycle: {
      state: row.lifecycleState as Document["lifecycle"]["state"],
      changedAt: row.lifecycleChangedAt.toISOString(),
      changedBy: row.lifecycleChangedBy,
      reason: row.lifecycleReason ?? undefined,
    },
    retentionId: row.retentionId as Document["retentionId"],
    currentVersionId: row.currentVersionId as Document["currentVersionId"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    archivedAt: row.archivedAt?.toISOString(),
    deletedAt: row.deletedAt?.toISOString(),
  };
}

function mapVersion(
  row: typeof platformDocumentVersion.$inferSelect,
): DocumentContentVersionRecord {
  return {
    id: row.id,
    documentId: row.documentId,
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    versionNumber: row.versionNumber,
    mimeType: row.mimeType,
    byteLength: row.byteLength,
    checksumAlgorithm: row.checksumAlgorithm as "sha256",
    checksumHex: row.checksumHex,
    storageProviderId: row.storageProviderId,
    storageKey: row.storageKey,
    storageStatus: row.storageStatus as DocumentContentVersionRecord["storageStatus"],
    etag: row.etag ?? undefined,
    encryptionKeyRef: row.encryptionKeyRef ?? undefined,
    immutable: true,
    displayFilename: row.displayFilename ?? undefined,
    declaredMimeType: row.declaredMimeType ?? undefined,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    verifiedAt: row.verifiedAt?.toISOString(),
    revision: row.revision,
  };
}

function mapStorageObject(
  row: typeof platformDocumentStorageObject.$inferSelect,
): DocumentStorageObjectRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    documentId: row.documentId,
    versionId: row.versionId,
    providerId: row.providerId,
    storageKey: row.storageKey,
    byteLength: row.byteLength,
    mimeType: row.mimeType,
    checksumHex: row.checksumHex,
    checksumAlgorithm: row.checksumAlgorithm as "sha256",
    status: row.status as DocumentStorageObjectRecord["status"],
    etag: row.etag ?? undefined,
    encryptionKeyRef: row.encryptionKeyRef ?? undefined,
    verifiedAt: row.verifiedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    revision: row.revision,
  };
}

export function createPostgresDocumentRepositories(db: DatabaseExecutor): {
  documents: DocumentRepositoryPort;
  metadata: DocumentMetadataRepositoryPort;
  tags: DocumentTagRepositoryPort;
  relationships: DocumentRelationshipRepositoryPort;
  audits: DocumentAuditRepositoryPort;
  versions: DocumentVersionRepositoryPort;
  storageObjects: DocumentStorageObjectRepositoryPort;
} {
  return {
    documents: {
      async create(ctx, document) {
        await db.insert(platformDocument).values({
          id: document.id,
          tenantId: ctx.tenantId,
          organisationId: document.organisationId,
          documentType: document.documentType,
          status: document.status,
          classificationCode: document.classification.code,
          classificationLabel: document.classification.label,
          classificationCustomCode: document.classification.customCode,
          title: document.title,
          description: document.description,
          ownerUserId: document.owner?.userId,
          creatorUserId: document.creatorUserId,
          mimeType: document.mimeType,
          byteLength: document.byteLength,
          checksumAlgorithm: document.checksum?.algorithm,
          checksumHex: document.checksum?.hex,
          storageProviderId: document.storageRef?.providerId,
          storageKey: document.storageRef?.storageKey,
          categoryId: document.categoryId,
          folderId: document.folderId,
          retentionId: document.retentionId,
          currentVersionId: document.currentVersionId,
          tagIdsJson: [...document.tagIds],
          permissionsJson: [...document.permissions],
          lifecycleState: document.lifecycle.state,
          lifecycleChangedAt: new Date(document.lifecycle.changedAt),
          lifecycleChangedBy: document.lifecycle.changedBy,
          lifecycleReason: document.lifecycle.reason,
          createdAt: new Date(document.createdAt),
          updatedAt: new Date(document.updatedAt),
          archivedAt: document.archivedAt ? new Date(document.archivedAt) : null,
          deletedAt: document.deletedAt ? new Date(document.deletedAt) : null,
        });
        return document;
      },
      async get(ctx, documentId) {
        const rows = await db
          .select()
          .from(platformDocument)
          .where(
            and(
              eq(platformDocument.tenantId, ctx.tenantId),
              eq(platformDocument.id, documentId),
            ),
          )
          .limit(1);
        const row = rows[0];
        if (!row) return null;
        if (
          ctx.organisationId &&
          row.organisationId &&
          row.organisationId !== ctx.organisationId
        ) {
          return null;
        }
        return mapDocument(row);
      },
      async update(ctx, document) {
        await db
          .update(platformDocument)
          .set({
            title: document.title,
            description: document.description,
            status: document.status,
            classificationCode: document.classification.code,
            classificationLabel: document.classification.label,
            classificationCustomCode: document.classification.customCode,
            mimeType: document.mimeType,
            byteLength: document.byteLength,
            tagIdsJson: [...document.tagIds],
            lifecycleState: document.lifecycle.state,
            lifecycleChangedAt: new Date(document.lifecycle.changedAt),
            lifecycleChangedBy: document.lifecycle.changedBy,
            lifecycleReason: document.lifecycle.reason,
            currentVersionId: document.currentVersionId,
            updatedAt: new Date(document.updatedAt),
            archivedAt: document.archivedAt ? new Date(document.archivedAt) : null,
            deletedAt: document.deletedAt ? new Date(document.deletedAt) : null,
          })
          .where(
            and(
              eq(platformDocument.tenantId, ctx.tenantId),
              eq(platformDocument.id, document.id),
            ),
          );
        return document;
      },
      async list(ctx) {
        const rows = await db
          .select()
          .from(platformDocument)
          .where(
            and(
              eq(platformDocument.tenantId, ctx.tenantId),
              isNull(platformDocument.deletedAt),
            ),
          )
          .orderBy(desc(platformDocument.updatedAt));
        return rows
          .filter(
            (row) =>
              !ctx.organisationId ||
              !row.organisationId ||
              row.organisationId === ctx.organisationId,
          )
          .map(mapDocument);
      },
    },
    metadata: {
      async upsert(ctx, metadata) {
        await db
          .insert(platformDocumentMetadata)
          .values({
            id: metadata.id,
            documentId: metadata.documentId,
            tenantId: ctx.tenantId,
            organisationId: metadata.organisationId,
            title: metadata.title,
            description: metadata.description,
            mimeType: metadata.mimeType,
            byteLength: metadata.byteLength,
            language: metadata.language,
            customJson: { ...metadata.custom },
            createdAt: new Date(metadata.createdAt),
            updatedAt: new Date(metadata.updatedAt),
          })
          .onConflictDoUpdate({
            target: platformDocumentMetadata.id,
            set: {
              title: metadata.title,
              description: metadata.description,
              mimeType: metadata.mimeType,
              byteLength: metadata.byteLength,
              customJson: { ...metadata.custom },
              updatedAt: new Date(metadata.updatedAt),
            },
          });
        return metadata;
      },
      async getByDocumentId(ctx, documentId) {
        const rows = await db
          .select()
          .from(platformDocumentMetadata)
          .where(
            and(
              eq(platformDocumentMetadata.tenantId, ctx.tenantId),
              eq(platformDocumentMetadata.documentId, documentId),
            ),
          )
          .limit(1);
        const row = rows[0];
        if (!row) return null;
        return {
          id: asDocumentMetadataId(row.id),
          documentId: asDocumentId(row.documentId),
          tenantId: row.tenantId,
          organisationId: row.organisationId ?? undefined,
          title: row.title,
          description: row.description ?? undefined,
          mimeType: row.mimeType ?? undefined,
          byteLength: row.byteLength ?? undefined,
          language: row.language ?? undefined,
          custom: row.customJson ?? {},
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        } satisfies DocumentMetadata;
      },
    },
    tags: {
      async list(ctx) {
        const rows = await db
          .select()
          .from(platformDocumentTag)
          .where(eq(platformDocumentTag.tenantId, ctx.tenantId))
          .orderBy(asc(platformDocumentTag.name));
        return rows.map((row): DocumentTag => ({
          id: asDocumentTagId(row.id),
          tenantId: row.tenantId,
          name: row.name,
          createdAt: row.createdAt.toISOString(),
        }));
      },
      async get(ctx, tagId) {
        const rows = await db
          .select()
          .from(platformDocumentTag)
          .where(
            and(
              eq(platformDocumentTag.tenantId, ctx.tenantId),
              eq(platformDocumentTag.id, tagId),
            ),
          )
          .limit(1);
        const row = rows[0];
        if (!row) return null;
        return {
          id: asDocumentTagId(row.id),
          tenantId: row.tenantId,
          name: row.name,
          createdAt: row.createdAt.toISOString(),
        };
      },
      async ensure(ctx, name) {
        const normalized = name.trim();
        if (!normalized) throw new Error("tag name is required");
        const existing = await db
          .select()
          .from(platformDocumentTag)
          .where(
            and(
              eq(platformDocumentTag.tenantId, ctx.tenantId),
              eq(platformDocumentTag.name, normalized),
            ),
          )
          .limit(1);
        if (existing[0]) {
          return {
            id: asDocumentTagId(existing[0].id),
            tenantId: existing[0].tenantId,
            name: existing[0].name,
            createdAt: existing[0].createdAt.toISOString(),
          };
        }
        const id = `tag_${crypto.randomUUID()}`;
        const createdAt = new Date();
        await db.insert(platformDocumentTag).values({
          id,
          tenantId: ctx.tenantId,
          name: normalized,
          createdAt,
        });
        return {
          id: asDocumentTagId(id),
          tenantId: ctx.tenantId,
          name: normalized,
          createdAt: createdAt.toISOString(),
        };
      },
    },
    relationships: {
      async create(ctx, relationship) {
        await db.insert(platformDocumentRelationship).values({
          id: relationship.id,
          tenantId: ctx.tenantId,
          sourceDocumentId: relationship.sourceDocumentId,
          targetDocumentId: relationship.targetDocumentId,
          kind: relationship.kind,
          referenceProduct: relationship.reference?.product,
          referenceExternalId: relationship.reference?.externalId,
          referenceLabel: relationship.reference?.label,
          createdAt: new Date(relationship.createdAt),
          createdBy: relationship.createdBy,
        });
        return relationship;
      },
      async listByDocument(ctx, documentId) {
        const rows = await db
          .select()
          .from(platformDocumentRelationship)
          .where(
            and(
              eq(platformDocumentRelationship.tenantId, ctx.tenantId),
              sql`(${platformDocumentRelationship.sourceDocumentId} = ${documentId} OR ${platformDocumentRelationship.targetDocumentId} = ${documentId})`,
            ),
          );
        return rows.map((row): DocumentRelationship => ({
          id: asDocumentRelationshipId(row.id),
          tenantId: row.tenantId,
          sourceDocumentId: asDocumentId(row.sourceDocumentId),
          targetDocumentId: row.targetDocumentId
            ? asDocumentId(row.targetDocumentId)
            : undefined,
          kind: row.kind as DocumentRelationship["kind"],
          reference:
            row.referenceProduct && row.referenceExternalId
              ? {
                  product: row.referenceProduct as NonNullable<
                    DocumentRelationship["reference"]
                  >["product"],
                  externalId: row.referenceExternalId,
                  label: row.referenceLabel ?? undefined,
                }
              : undefined,
          createdAt: row.createdAt.toISOString(),
          createdBy: row.createdBy,
        }));
      },
    },
    audits: {
      async append(ctx, audit) {
        await db.insert(platformDocumentAudit).values({
          id: audit.id,
          documentId: audit.documentId,
          tenantId: ctx.tenantId,
          action: audit.action,
          actorUserId: audit.actorUserId,
          correlationId: audit.correlationId,
          detailsJson: { ...audit.details },
          createdAt: new Date(audit.createdAt),
        });
        return audit;
      },
      async listByDocument(ctx, documentId) {
        const rows = await db
          .select()
          .from(platformDocumentAudit)
          .where(
            and(
              eq(platformDocumentAudit.tenantId, ctx.tenantId),
              eq(platformDocumentAudit.documentId, documentId),
            ),
          )
          .orderBy(asc(platformDocumentAudit.createdAt));
        return rows.map((row): DocumentAudit => ({
          id: asDocumentAuditId(row.id),
          documentId: asDocumentId(row.documentId),
          tenantId: row.tenantId,
          action: row.action,
          actorUserId: row.actorUserId,
          correlationId: row.correlationId ?? undefined,
          details: row.detailsJson ?? {},
          createdAt: row.createdAt.toISOString(),
        }));
      },
    },
    versions: {
      async create(ctx, version) {
        if (!version.immutable) {
          throw new Error("Content versions must be immutable");
        }
        await db.insert(platformDocumentVersion).values({
          id: version.id,
          documentId: version.documentId,
          tenantId: ctx.tenantId,
          organisationId: version.organisationId,
          versionNumber: version.versionNumber,
          mimeType: version.mimeType,
          byteLength: version.byteLength,
          checksumAlgorithm: version.checksumAlgorithm,
          checksumHex: version.checksumHex,
          storageProviderId: version.storageProviderId,
          storageKey: version.storageKey,
          storageStatus: version.storageStatus,
          etag: version.etag,
          encryptionKeyRef: version.encryptionKeyRef,
          immutable: true,
          displayFilename: version.displayFilename,
          declaredMimeType: version.declaredMimeType,
          createdAt: new Date(version.createdAt),
          createdBy: version.createdBy,
          verifiedAt: version.verifiedAt ? new Date(version.verifiedAt) : null,
          revision: version.revision,
        });
        return version;
      },
      async get(ctx, documentId, versionId) {
        const rows = await db
          .select()
          .from(platformDocumentVersion)
          .where(
            and(
              eq(platformDocumentVersion.tenantId, ctx.tenantId),
              eq(platformDocumentVersion.documentId, documentId),
              eq(platformDocumentVersion.id, versionId),
            ),
          )
          .limit(1);
        return rows[0] ? mapVersion(rows[0]) : null;
      },
      async listByDocument(ctx, documentId) {
        const rows = await db
          .select()
          .from(platformDocumentVersion)
          .where(
            and(
              eq(platformDocumentVersion.tenantId, ctx.tenantId),
              eq(platformDocumentVersion.documentId, documentId),
            ),
          )
          .orderBy(asc(platformDocumentVersion.versionNumber));
        return rows.map(mapVersion);
      },
      async nextVersionNumber(ctx, documentId) {
        const rows = await db
          .select({
            max: sql<number>`coalesce(max(${platformDocumentVersion.versionNumber}), 0)`,
          })
          .from(platformDocumentVersion)
          .where(
            and(
              eq(platformDocumentVersion.tenantId, ctx.tenantId),
              eq(platformDocumentVersion.documentId, documentId),
            ),
          );
        return Number(rows[0]?.max ?? 0) + 1;
      },
      async findByChecksum(ctx, checksumHex) {
        const rows = await db
          .select()
          .from(platformDocumentVersion)
          .where(
            and(
              eq(platformDocumentVersion.tenantId, ctx.tenantId),
              eq(platformDocumentVersion.checksumHex, checksumHex),
            ),
          );
        return rows.map(mapVersion);
      },
      async updateStatus(ctx, documentId, versionId, status, options) {
        const existing = await this.get(ctx, documentId, versionId);
        if (!existing) throw new Error(`document_version not found: ${versionId}`);
        if (
          options?.expectedRevision !== undefined &&
          existing.revision !== options.expectedRevision
        ) {
          throw new Error("revision_conflict");
        }
        // Only status/verifiedAt/revision may change — content fields immutable.
        await db
          .update(platformDocumentVersion)
          .set({
            storageStatus: status,
            verifiedAt: options?.verifiedAt ? new Date(options.verifiedAt) : undefined,
            revision: existing.revision + 1,
          })
          .where(
            and(
              eq(platformDocumentVersion.tenantId, ctx.tenantId),
              eq(platformDocumentVersion.id, versionId),
            ),
          );
        return {
          ...existing,
          storageStatus: status,
          verifiedAt: options?.verifiedAt ?? existing.verifiedAt,
          revision: existing.revision + 1,
        };
      },
    },
    storageObjects: {
      async create(ctx, record) {
        await db.insert(platformDocumentStorageObject).values({
          id: record.id,
          tenantId: ctx.tenantId,
          organisationId: record.organisationId,
          documentId: record.documentId,
          versionId: record.versionId,
          providerId: record.providerId,
          storageKey: record.storageKey,
          byteLength: record.byteLength,
          mimeType: record.mimeType,
          checksumHex: record.checksumHex,
          checksumAlgorithm: record.checksumAlgorithm,
          status: record.status,
          etag: record.etag,
          encryptionKeyRef: record.encryptionKeyRef,
          verifiedAt: record.verifiedAt ? new Date(record.verifiedAt) : null,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
          revision: record.revision,
        });
        return record;
      },
      async getByVersion(ctx, versionId) {
        const rows = await db
          .select()
          .from(platformDocumentStorageObject)
          .where(
            and(
              eq(platformDocumentStorageObject.tenantId, ctx.tenantId),
              eq(platformDocumentStorageObject.versionId, versionId),
            ),
          )
          .limit(1);
        return rows[0] ? mapStorageObject(rows[0]) : null;
      },
      async updateStatus(ctx, id, status, options) {
        const rows = await db
          .select()
          .from(platformDocumentStorageObject)
          .where(
            and(
              eq(platformDocumentStorageObject.tenantId, ctx.tenantId),
              eq(platformDocumentStorageObject.id, id),
            ),
          )
          .limit(1);
        const existing = rows[0];
        if (!existing) throw new Error(`storage_object not found: ${id}`);
        if (
          options?.expectedRevision !== undefined &&
          existing.revision !== options.expectedRevision
        ) {
          throw new Error("revision_conflict");
        }
        await db
          .update(platformDocumentStorageObject)
          .set({
            status,
            verifiedAt: options?.verifiedAt
              ? new Date(options.verifiedAt)
              : existing.verifiedAt,
            updatedAt: new Date(),
            revision: existing.revision + 1,
          })
          .where(
            and(
              eq(platformDocumentStorageObject.tenantId, ctx.tenantId),
              eq(platformDocumentStorageObject.id, id),
            ),
          );
        return {
          ...mapStorageObject(existing),
          status,
          verifiedAt: options?.verifiedAt ?? existing.verifiedAt?.toISOString(),
          revision: existing.revision + 1,
          updatedAt: new Date().toISOString(),
        };
      },
      async listReconciliationCandidates(ctx) {
        const rows = await db
          .select()
          .from(platformDocumentStorageObject)
          .where(
            and(
              eq(platformDocumentStorageObject.tenantId, ctx.tenantId),
              inArray(platformDocumentStorageObject.status, [
                "failed",
                "reconciliation_required",
                "writing",
              ]),
            ),
          );
        return rows.map(mapStorageObject);
      },
    },
  };
}
