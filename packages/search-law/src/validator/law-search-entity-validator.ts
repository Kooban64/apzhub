/**
 * LawSearchEntityValidator — Law-specific pre-publication checks (R12-SEARCH-02).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { LawSearchPublicationContext } from "../context/law-search-publication-context";
import {
  isLawSearchEntityType,
  looksLikeExternalEngineIdentifier,
  type LawSearchEntityType,
} from "../types/entity-types";

export type LawSearchValidationIssue = {
  readonly field: string;
  readonly code: string;
  readonly message: string;
};

export type LawSearchValidationResult = {
  readonly valid: boolean;
  readonly issues: readonly LawSearchValidationIssue[];
};

const MANDATORY_BY_TYPE: Readonly<Record<LawSearchEntityType, readonly string[]>> = {
  law_matter: ["status", "priority", "clientId", "matterReference"],
  law_client: ["status", "clientType", "clientReference"],
  law_document: ["status", "documentType", "documentReference", "matterId"],
  law_task: ["status", "priority", "taskReference", "assigneeUserId"],
  law_knowledge_article: ["status", "articleCode"],
};

const FINANCIAL_KEYS =
  /^(rate|hourlyRate|amount|cost|price|currency|invoice|billing|financial|trust|payment|tax|fee)/i;

export class LawSearchEntityValidator {
  validateDraft(
    context: LawSearchPublicationContext,
    draft: SearchEntityDraft,
  ): LawSearchValidationResult {
    const issues: LawSearchValidationIssue[] = [];

    if (!draft.entityId || draft.entityId.trim().length === 0) {
      issues.push({
        field: "entityId",
        code: "required",
        message: "canonical entity ID is required",
      });
    } else if (looksLikeExternalEngineIdentifier(draft.entityId)) {
      issues.push({
        field: "entityId",
        code: "external_engine_id_forbidden",
        message: "external engine identifiers must not be published",
      });
    }

    if (!isLawSearchEntityType(draft.entityType)) {
      issues.push({
        field: "entityType",
        code: "unsupported",
        message: `unsupported Law search entity type: ${draft.entityType}`,
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
        looksLikeExternalEngineIdentifier(value) ||
        looksLikeExternalEngineIdentifier(key) ||
        /kimai|zammad|plane/i.test(key)
      ) {
        issues.push({
          field: `metadata.${key}`,
          code: "external_engine_id_forbidden",
          message: "external engine identifiers must not appear in metadata",
        });
      }
      if (/meili|opensearch|elasticsearch|typesense|primaryKey/i.test(key)) {
        issues.push({
          field: `metadata.${key}`,
          code: "provider_leakage",
          message: "provider-specific metadata keys are forbidden",
        });
      }
      if (/originMetadata|storageRef|fileBytes|binary/i.test(key)) {
        issues.push({
          field: `metadata.${key}`,
          code: "payload_leakage",
          message: "storage refs and binary payloads must not be published",
        });
      }
      if (FINANCIAL_KEYS.test(key)) {
        issues.push({
          field: `metadata.${key}`,
          code: "financial_forbidden",
          message: "billing, rates, trust, and financial fields must not be published",
        });
      }
    }

    if (isLawSearchEntityType(draft.entityType)) {
      for (const key of MANDATORY_BY_TYPE[draft.entityType]) {
        if (metadata[key] === undefined || String(metadata[key]).trim().length === 0) {
          issues.push({
            field: `metadata.${key}`,
            code: "required",
            message: `${key} is mandatory metadata for ${draft.entityType}`,
          });
        } else if (looksLikeExternalEngineIdentifier(String(metadata[key]))) {
          issues.push({
            field: `metadata.${key}`,
            code: "external_engine_id_forbidden",
            message: `${key} must be a platform canonical id`,
          });
        }
      }
    }

    return { valid: issues.length === 0, issues };
  }
}
