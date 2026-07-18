/**
 * DocumentsSearchEntityValidator — Documents-specific pre-publication checks (APZSEARCH-012).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { DocumentsSearchPublicationContext } from "../context/documents-search-publication-context";
import { scanMetadataForStorageLeakage } from "../security/safe-fields";
import {
  isDocumentsSearchEntityType,
  looksLikeStorageLeak,
  type DocumentsSearchEntityType,
} from "../types/entity-types";

export type DocumentsSearchValidationIssue = {
  readonly field: string;
  readonly code: string;
  readonly message: string;
};

export type DocumentsSearchValidationResult = {
  readonly valid: boolean;
  readonly issues: readonly DocumentsSearchValidationIssue[];
};

const MANDATORY_BY_TYPE: Readonly<
  Record<DocumentsSearchEntityType, readonly string[]>
> = {
  document: ["documentType", "status"],
  document_version: ["documentId", "versionNumber", "checksumPresent"],
  document_collection: ["documentCount"],
  document_folder: [],
  document_category: [],
  document_tag: [],
};

export class DocumentsSearchEntityValidator {
  validateDraft(
    context: DocumentsSearchPublicationContext,
    draft: SearchEntityDraft,
  ): DocumentsSearchValidationResult {
    const issues: DocumentsSearchValidationIssue[] = [];

    if (!draft.entityId || draft.entityId.trim().length === 0) {
      issues.push({
        field: "entityId",
        code: "required",
        message: "canonical entity ID is required",
      });
    } else if (looksLikeStorageLeak(draft.entityId)) {
      issues.push({
        field: "entityId",
        code: "storage_leakage",
        message: "storage/credential identifiers must not be published",
      });
    }

    if (!isDocumentsSearchEntityType(draft.entityType)) {
      issues.push({
        field: "entityType",
        code: "unsupported",
        message: `unsupported Documents search entity type: ${draft.entityType}`,
      });
    }

    if (!draft.title || draft.title.trim().length === 0) {
      issues.push({
        field: "title",
        code: "required",
        message: "title is required",
      });
    }

    if (!context.tenantId) {
      issues.push({
        field: "tenantId",
        code: "required",
        message: "tenant is required on publication context",
      });
    }

    if (!context.permissions) {
      issues.push({
        field: "permissions",
        code: "required",
        message: "permissions metadata is required",
      });
    } else if (
      (!draft.permissions || draft.permissions.length === 0) &&
      context.permissions.length === 0
    ) {
      issues.push({
        field: "permissions",
        code: "required",
        message: "at least one permission token is required",
      });
    }

    if (!draft.classification) {
      issues.push({
        field: "classification",
        code: "required",
        message: "classification is required",
      });
    }

    const metadata = draft.metadata ?? {};
    issues.push(...scanMetadataForStorageLeakage(metadata));

    for (const [key, value] of Object.entries(metadata)) {
      if (/meili|opensearch|elasticsearch|typesense|primaryKey/i.test(key)) {
        issues.push({
          field: `metadata.${key}`,
          code: "provider_leakage",
          message: "provider-specific metadata keys are forbidden",
        });
      }
      if (/storageRef|checksumHex|signedUrl|objectKey/i.test(key)) {
        issues.push({
          field: `metadata.${key}`,
          code: "storage_leakage",
          message: "storage metadata keys are forbidden",
        });
      }
      if (/notes/i.test(key) && /retention/i.test(key)) {
        issues.push({
          field: `metadata.${key}`,
          code: "retention_notes_forbidden",
          message: "retention notes must not be published to search",
        });
      }
      if (typeof value === "string" && looksLikeStorageLeak(value)) {
        issues.push({
          field: `metadata.${key}`,
          code: "storage_leakage",
          message: "storage leakage in metadata value",
        });
      }
    }

    // Draft documents are allowed to publish — do not block on status=draft.
    if (isDocumentsSearchEntityType(draft.entityType)) {
      for (const key of MANDATORY_BY_TYPE[draft.entityType]) {
        if (metadata[key] === undefined || String(metadata[key]).trim().length === 0) {
          issues.push({
            field: `metadata.${key}`,
            code: "required",
            message: `${key} is mandatory metadata for ${draft.entityType}`,
          });
        }
      }
    }

    return { valid: issues.length === 0, issues };
  }
}
