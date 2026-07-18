/**
 * SupportSearchEntityValidator — Support-specific pre-publication checks (APZSEARCH-011).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { SupportSearchPublicationContext } from "../context/support-search-publication-context";
import {
  isSupportSearchEntityType,
  looksLikeZammadIdentifier,
  type SupportSearchEntityType,
} from "../types/entity-types";

export type SupportSearchValidationIssue = {
  readonly field: string;
  readonly code: string;
  readonly message: string;
};

export type SupportSearchValidationResult = {
  readonly valid: boolean;
  readonly issues: readonly SupportSearchValidationIssue[];
};

const MANDATORY_BY_TYPE: Readonly<Record<SupportSearchEntityType, readonly string[]>> =
  {
    support_request: ["status", "priority", "groupId", "requesterId"],
    support_article: ["supportTicketId", "channel", "visibility", "senderType"],
    support_organisation: ["active"],
    support_group: ["active"],
    support_user: ["role", "active"],
  };

export class SupportSearchEntityValidator {
  validateDraft(
    context: SupportSearchPublicationContext,
    draft: SearchEntityDraft,
  ): SupportSearchValidationResult {
    const issues: SupportSearchValidationIssue[] = [];

    if (!draft.entityId || draft.entityId.trim().length === 0) {
      issues.push({
        field: "entityId",
        code: "required",
        message: "canonical entity ID is required",
      });
    } else if (looksLikeZammadIdentifier(draft.entityId)) {
      issues.push({
        field: "entityId",
        code: "zammad_id_forbidden",
        message: "Zammad identifiers must not be published",
      });
    }

    if (!isSupportSearchEntityType(draft.entityType)) {
      issues.push({
        field: "entityType",
        code: "unsupported",
        message: `unsupported Support search entity type: ${draft.entityType}`,
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
    }

    if (!draft.classification) {
      issues.push({
        field: "classification",
        code: "required",
        message: "classification is required",
      });
    }

    const metadata = draft.metadata ?? {};
    for (const [key, value] of Object.entries(metadata)) {
      if (
        looksLikeZammadIdentifier(value) ||
        looksLikeZammadIdentifier(key) ||
        /zammad/i.test(key)
      ) {
        issues.push({
          field: `metadata.${key}`,
          code: "zammad_id_forbidden",
          message: "Zammad identifiers must not appear in metadata",
        });
      }
      if (/meili|opensearch|elasticsearch|typesense|primaryKey/i.test(key)) {
        issues.push({
          field: `metadata.${key}`,
          code: "provider_leakage",
          message: "provider-specific metadata keys are forbidden",
        });
      }
      if (/originMetadata/i.test(key)) {
        issues.push({
          field: `metadata.${key}`,
          code: "origin_leakage",
          message: "originMetadata must not be published to search",
        });
      }
    }

    if (isSupportSearchEntityType(draft.entityType)) {
      for (const key of MANDATORY_BY_TYPE[draft.entityType]) {
        if (metadata[key] === undefined || String(metadata[key]).trim().length === 0) {
          issues.push({
            field: `metadata.${key}`,
            code: "required",
            message: `${key} is mandatory metadata for ${draft.entityType}`,
          });
        } else if (looksLikeZammadIdentifier(String(metadata[key]))) {
          issues.push({
            field: `metadata.${key}`,
            code: "zammad_id_forbidden",
            message: `${key} must be a platform canonical id`,
          });
        }
      }
    }

    return { valid: issues.length === 0, issues };
  }
}
