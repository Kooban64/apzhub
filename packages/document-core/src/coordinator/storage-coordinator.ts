/**
 * Storage coordinator — coordinates metadata + immutable binary writes (APZDOCS-002).
 * No distributed transactions; compensation via reconciliation_required states.
 */

import type {
  DeleteDocumentContentInput,
  DocumentBinaryResult,
  DocumentContentService,
  DocumentContentVersionRecord,
  DocumentId,
  DocumentRequestContext,
  DocumentStorageObjectRecord,
  DocumentStorageReference,
  ReadDocumentContentInput,
  StoreDocumentContentInput,
  StoreDocumentContentResult,
} from "@apzhub/document-contracts";
import {
  asDocumentVersionId,
} from "@apzhub/document-contracts";

import { createDocumentIntegrityService } from "../integrity/integrity-service";
import { DocumentDomainError, requireFound } from "../ports/types";
import type { DocumentRepositoryPort } from "../ports/types";
import type {
  DocumentStorageObjectRepositoryPort,
  DocumentVersionRepositoryPort,
} from "../ports/version-ports";
import type { DocumentStorageProvider } from "../storage/storage-provider";

export type DocumentStorageCoordinatorDeps = {
  readonly documents: DocumentRepositoryPort;
  readonly versions: DocumentVersionRepositoryPort;
  readonly storageObjects: DocumentStorageObjectRepositoryPort;
  readonly provider: DocumentStorageProvider;
  readonly now: () => string;
  readonly id: () => string;
  readonly maxObjectBytes: number;
  readonly allowBinaryDeletion: boolean;
  readonly integrity?: ReturnType<typeof createDocumentIntegrityService>;
};

function assertPermission(
  ctx: DocumentRequestContext,
  required: string,
): void {
  const granted = ctx.permissions;
  if (!granted || granted.length === 0) return;
  if (
    granted.includes("document.*") ||
    granted.includes(required) ||
    granted.includes("document.manage")
  ) {
    return;
  }
  throw new DocumentDomainError("forbidden", `Missing permission: ${required}`, {
    required,
  });
}

function buildStorageKey(input: {
  readonly tenantId: string;
  readonly documentId: string;
  readonly versionId: string;
}): string {
  // Deterministic opaque key — never derived from user filenames.
  return `tenants/${input.tenantId}/documents/${input.documentId}/versions/${input.versionId}/content.bin`;
}

export function createDocumentStorageCoordinator(
  deps: DocumentStorageCoordinatorDeps,
): DocumentContentService {
  const integrity = deps.integrity ?? createDocumentIntegrityService();

  return {
    async storeContent(ctx, input: StoreDocumentContentInput) {
      assertPermission(ctx, "document.storage.write");
      assertPermission(ctx, "document.version.create");
      const document = requireFound(
        await deps.documents.get(ctx, input.documentId),
        "document",
        input.documentId,
      );
      if (document.lifecycle.state === "deleted") {
        throw new DocumentDomainError(
          "invalid_lifecycle_transition",
          "Cannot store content for deleted document",
        );
      }
      if (input.signal?.aborted) {
        throw new DocumentDomainError("cancelled", "Content store cancelled");
      }

      const bytes = await integrity.collect(input.source, {
        maxBytes: input.maxBytes ?? deps.maxObjectBytes,
        signal: input.signal,
      });
      const hash = integrity.hash(bytes);
      const duplicates = await deps.versions.findByChecksum(ctx, hash);
      const duplicateChecksumDetected = duplicates.some(
        (row) => row.tenantId === ctx.tenantId,
      );

      const versionId = deps.id();
      const versionNumber = await deps.versions.nextVersionNumber(
        ctx,
        input.documentId,
      );
      const now = deps.now();
      const storageKey = buildStorageKey({
        tenantId: ctx.tenantId,
        documentId: input.documentId,
        versionId,
      });
      const ref: DocumentStorageReference = {
        providerId: deps.provider.id,
        storageKey,
      };

      const pendingVersion: DocumentContentVersionRecord = {
        id: versionId,
        documentId: input.documentId,
        tenantId: ctx.tenantId,
        organisationId: document.organisationId ?? ctx.organisationId,
        versionNumber,
        mimeType: input.mimeType,
        byteLength: bytes.byteLength,
        checksumAlgorithm: "sha256",
        checksumHex: hash,
        storageProviderId: deps.provider.id,
        storageKey,
        storageStatus: "pending",
        immutable: true,
        displayFilename: input.displayFilename,
        declaredMimeType: input.declaredMimeType ?? input.mimeType,
        createdAt: now,
        createdBy: ctx.userId,
        revision: 1,
      };

      await deps.versions.create(ctx, pendingVersion);
      await deps.storageObjects.create(ctx, {
        id: deps.id(),
        tenantId: ctx.tenantId,
        organisationId: pendingVersion.organisationId,
        documentId: input.documentId,
        versionId,
        providerId: deps.provider.id,
        storageKey,
        byteLength: bytes.byteLength,
        mimeType: input.mimeType,
        checksumHex: hash,
        checksumAlgorithm: "sha256",
        status: "writing",
        createdAt: now,
        updatedAt: now,
        revision: 1,
      });

      let descriptor;
      try {
        await deps.versions.updateStatus(
          ctx,
          input.documentId,
          asDocumentVersionId(versionId),
          "writing",
          { expectedRevision: 1 },
        );
        descriptor = await deps.provider.putObject({
          ctx,
          ref,
          source: { kind: "bytes", bytes },
          mimeType: input.mimeType,
          byteLength: bytes.byteLength,
          checksumHex: hash,
          signal: input.signal,
          correlationId: ctx.correlationId,
          idempotencyKey: input.idempotencyKey,
        });
      } catch (error) {
        await deps.versions.updateStatus(
          ctx,
          input.documentId,
          asDocumentVersionId(versionId),
          "failed",
        );
        throw new DocumentDomainError(
          "storage_write_failed",
          error instanceof Error ? error.message : "Storage write failed",
        );
      }

      const verified = integrity.verify({
        bytes,
        expectedHex: hash,
        expectedByteLength: bytes.byteLength,
      });
      if (!verified.ok) {
        await deps.versions.updateStatus(
          ctx,
          input.documentId,
          asDocumentVersionId(versionId),
          "reconciliation_required",
        );
        throw new DocumentDomainError(
          "checksum_mismatch",
          "Stored content failed integrity verification",
          { classification: verified.classification },
        );
      }

      let committed: DocumentContentVersionRecord;
      try {
        committed = await deps.versions.updateStatus(
          ctx,
          input.documentId,
          asDocumentVersionId(versionId),
          "verified",
          { verifiedAt: deps.now() },
        );
        const object = await deps.storageObjects.getByVersion(
          ctx,
          asDocumentVersionId(versionId),
        );
        if (object) {
          await deps.storageObjects.updateStatus(ctx, object.id, "verified", {
            verifiedAt: deps.now(),
          });
        }
      } catch (error) {
        await deps.versions.updateStatus(
          ctx,
          input.documentId,
          asDocumentVersionId(versionId),
          "reconciliation_required",
        );
        throw new DocumentDomainError(
          "metadata_commit_failed",
          error instanceof Error ? error.message : "Metadata commit failed",
        );
      }

      // Immutable content fields are fixed; etag is observational only.
      void descriptor;

      const result: StoreDocumentContentResult = {
        version: committed,
        integrity: verified,
        duplicateChecksumDetected,
      };
      return result;
    },

    async readContent(ctx, input: ReadDocumentContentInput) {
      assertPermission(ctx, "document.storage.read");
      assertPermission(ctx, "document.version.read");
      const version = requireFound(
        await deps.versions.get(ctx, input.documentId, input.versionId),
        "document_version",
        input.versionId,
      );
      return deps.provider.getObject({
        ctx,
        ref: {
          providerId: version.storageProviderId,
          storageKey: version.storageKey,
        },
        as: input.as ?? "bytes",
        signal: input.signal,
      });
    },

    async verifyContent(ctx, input) {
      assertPermission(ctx, "document.storage.verify");
      const version = requireFound(
        await deps.versions.get(ctx, input.documentId, input.versionId),
        "document_version",
        input.versionId,
      );
      const binary = await deps.provider.getObject({
        ctx,
        ref: {
          providerId: version.storageProviderId,
          storageKey: version.storageKey,
        },
        as: "bytes",
      });
      if (binary.kind !== "bytes") {
        throw new DocumentDomainError(
          "unsupported",
          "Expected bytes for verification",
        );
      }
      return integrity.verify({
        bytes: binary.bytes,
        expectedHex: version.checksumHex,
        expectedByteLength: version.byteLength,
      });
    },

    async deleteContent(ctx, input: DeleteDocumentContentInput) {
      assertPermission(ctx, "document.storage.delete");
      const version = requireFound(
        await deps.versions.get(ctx, input.documentId, input.versionId),
        "document_version",
        input.versionId,
      );
      const document = requireFound(
        await deps.documents.get(ctx, input.documentId),
        "document",
        input.documentId,
      );
      if (
        !deps.allowBinaryDeletion &&
        !input.force &&
        (document.lifecycle.state === "retained" || document.retentionId)
      ) {
        throw new DocumentDomainError(
          "retention_lock",
          "Retained or locked content cannot be deleted",
        );
      }
      if (!deps.allowBinaryDeletion && !input.force) {
        throw new DocumentDomainError(
          "deletion_disabled",
          "Binary deletion is disabled by configuration",
        );
      }
      await deps.versions.updateStatus(
        ctx,
        input.documentId,
        input.versionId,
        "deletion_pending",
      );
      try {
        await deps.provider.deleteObject(ctx, {
          providerId: version.storageProviderId,
          storageKey: version.storageKey,
        });
      } catch (error) {
        await deps.versions.updateStatus(
          ctx,
          input.documentId,
          input.versionId,
          "reconciliation_required",
        );
        throw new DocumentDomainError(
          "storage_delete_failed",
          error instanceof Error ? error.message : "Storage delete failed",
        );
      }
      return deps.versions.updateStatus(
        ctx,
        input.documentId,
        input.versionId,
        "deleted",
      );
    },

    async listVersions(ctx, documentId: DocumentId) {
      assertPermission(ctx, "document.version.read");
      requireFound(await deps.documents.get(ctx, documentId), "document", documentId);
      return deps.versions.listByDocument(ctx, documentId);
    },

    async getVersion(ctx, documentId, versionId) {
      assertPermission(ctx, "document.version.read");
      return requireFound(
        await deps.versions.get(ctx, documentId, versionId),
        "document_version",
        versionId,
      );
    },

    async inspectReconciliation(ctx) {
      assertPermission(ctx, "document.reconciliation.read");
      const candidates = await deps.storageObjects.listReconciliationCandidates(ctx);
      const now = deps.now();
      return {
        inspectedAt: now,
        issues: candidates.map((row: DocumentStorageObjectRecord) => ({
          id: `issue_${row.id}`,
          kind:
            row.status === "failed"
              ? ("incomplete_version_commit" as const)
              : row.status === "reconciliation_required"
                ? ("checksum_mismatch" as const)
                : ("metadata_without_object" as const),
          tenantId: row.tenantId,
          documentId: row.documentId,
          versionId: row.versionId,
          storageKeyHint: row.storageKey.slice(0, 24),
          details: { status: row.status },
          detectedAt: now,
        })),
      };
    },

    async repairReconciliationIssue(ctx, issueId) {
      assertPermission(ctx, "document.reconciliation.repair");
      return {
        issueId,
        repaired: false,
        message:
          "Manual repair required — background reconciliation workers are out of scope for APZDOCS-002",
      };
    },
  };
}
