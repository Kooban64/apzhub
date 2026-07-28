/**
 * TimeSearchEntityValidator — Time-specific pre-publication checks (R12-SEARCH-01).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { TimeSearchPublicationContext } from "../context/time-search-publication-context";
import {
  isTimeSearchEntityType,
  looksLikeKimaiIdentifier,
  type TimeSearchEntityType,
} from "../types/entity-types";

export type TimeSearchValidationIssue = {
  readonly field: string;
  readonly code: string;
  readonly message: string;
};

export type TimeSearchValidationResult = {
  readonly valid: boolean;
  readonly issues: readonly TimeSearchValidationIssue[];
};

const MANDATORY_BY_TYPE: Readonly<Record<TimeSearchEntityType, readonly string[]>> = {
  time_entry: ["status", "durationMinutes", "startedAt", "userId"],
  time_activity: ["status"],
  time_customer: ["status"],
  time_project: ["status"],
  time_tag: ["status"],
};

const FINANCIAL_KEYS =
  /^(rate|hourlyRate|amount|cost|price|currency|invoice|billing|financial)/i;

export class TimeSearchEntityValidator {
  validateDraft(
    context: TimeSearchPublicationContext,
    draft: SearchEntityDraft,
  ): TimeSearchValidationResult {
    const issues: TimeSearchValidationIssue[] = [];

    if (!draft.entityId || draft.entityId.trim().length === 0) {
      issues.push({
        field: "entityId",
        code: "required",
        message: "canonical entity ID is required",
      });
    } else if (looksLikeKimaiIdentifier(draft.entityId)) {
      issues.push({
        field: "entityId",
        code: "kimai_id_forbidden",
        message: "Kimai identifiers must not be published",
      });
    }

    if (!isTimeSearchEntityType(draft.entityType)) {
      issues.push({
        field: "entityType",
        code: "unsupported",
        message: `unsupported Time search entity type: ${draft.entityType}`,
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
        looksLikeKimaiIdentifier(value) ||
        looksLikeKimaiIdentifier(key) ||
        /kimai/i.test(key)
      ) {
        issues.push({
          field: `metadata.${key}`,
          code: "kimai_id_forbidden",
          message: "Kimai identifiers must not appear in metadata",
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
      if (FINANCIAL_KEYS.test(key) || /billable/i.test(key)) {
        issues.push({
          field: `metadata.${key}`,
          code: "financial_forbidden",
          message: "billing, rates, and financial fields must not be published",
        });
      }
    }

    if (isTimeSearchEntityType(draft.entityType)) {
      for (const key of MANDATORY_BY_TYPE[draft.entityType]) {
        if (metadata[key] === undefined || String(metadata[key]).trim().length === 0) {
          issues.push({
            field: `metadata.${key}`,
            code: "required",
            message: `${key} is mandatory metadata for ${draft.entityType}`,
          });
        } else if (looksLikeKimaiIdentifier(String(metadata[key]))) {
          issues.push({
            field: `metadata.${key}`,
            code: "kimai_id_forbidden",
            message: `${key} must be a platform canonical id`,
          });
        }
      }
    }

    return { valid: issues.length === 0, issues };
  }
}
