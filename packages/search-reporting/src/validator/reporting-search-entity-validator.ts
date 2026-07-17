/**
 * ReportingSearchEntityValidator — Reporting-specific pre-publication checks (APZSEARCH-014).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { ReportingSearchPublicationContext } from "../context/reporting-search-publication-context";
import { scanMetadataForReportingLeakage } from "../security/safe-fields";
import {
  isReportingSearchEntityType,
  looksLikeReportingLeak,
  resolveReportingSearchEntityType,
  type ReportingSearchEntityType,
} from "../types/entity-types";

export type ReportingSearchValidationIssue = {
  readonly field: string;
  readonly code: string;
  readonly message: string;
};

export type ReportingSearchValidationResult = {
  readonly valid: boolean;
  readonly issues: readonly ReportingSearchValidationIssue[];
};

const MANDATORY_BY_TYPE: Readonly<
  Partial<Record<ReportingSearchEntityType, readonly string[]>>
> = {
  report_template: ["reportType", "version"],
  report_generation: [
    "reportType",
    "outputFormat",
    "byteLength",
    "checksumPresent",
  ],
  report_generation_metadata: [
    "reportType",
    "outputFormat",
    "byteLength",
    "checksumPresent",
  ],
  report_output_metadata: ["outputFormat", "byteLength", "checksumPresent"],
};

export class ReportingSearchEntityValidator {
  validateDraft(
    context: ReportingSearchPublicationContext,
    draft: SearchEntityDraft,
  ): ReportingSearchValidationResult {
    const issues: ReportingSearchValidationIssue[] = [];

    if (!draft.entityId || draft.entityId.trim().length === 0) {
      issues.push({
        field: "entityId",
        code: "required",
        message: "canonical entity ID is required",
      });
    } else if (looksLikeReportingLeak(draft.entityId)) {
      issues.push({
        field: "entityId",
        code: "content_leakage",
        message: "rendered content / credential identifiers must not be published",
      });
    }

    if (!isReportingSearchEntityType(draft.entityType)) {
      issues.push({
        field: "entityType",
        code: "unsupported",
        message: `unsupported Reporting search entity type: ${draft.entityType}`,
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
    issues.push(...scanMetadataForReportingLeakage(metadata));

    for (const [key, value] of Object.entries(metadata)) {
      if (/meili|opensearch|elasticsearch|typesense|primaryKey/i.test(key)) {
        issues.push({
          field: `metadata.${key}`,
          code: "provider_leakage",
          message: "provider-specific metadata keys are forbidden",
        });
      }
      if (
        /parametersJson|checksumSha256|checksumHex|renderedBody|body|sections|header|footer|branding/i.test(
          key,
        )
      ) {
        issues.push({
          field: `metadata.${key}`,
          code: "content_leakage",
          message: "rendered content / parameter / checksum metadata keys are forbidden",
        });
      }
      if (typeof value === "string" && looksLikeReportingLeak(value)) {
        issues.push({
          field: `metadata.${key}`,
          code: "content_leakage",
          message: "content leakage in metadata value",
        });
      }
      if (
        typeof value === "string" &&
        /^[a-f0-9]{32,128}$/i.test(value.trim()) &&
        /checksum/i.test(key)
      ) {
        issues.push({
          field: `metadata.${key}`,
          code: "content_leakage",
          message: "checksum hex must never be published",
        });
      }
    }

    const resolved = resolveReportingSearchEntityType(draft.entityType);
    if (resolved) {
      for (const key of MANDATORY_BY_TYPE[resolved] ?? []) {
        if (
          metadata[key] === undefined ||
          String(metadata[key]).trim().length === 0
        ) {
          issues.push({
            field: `metadata.${key}`,
            code: "required",
            message: `${key} is mandatory metadata for ${resolved}`,
          });
        }
      }
    }

    return { valid: issues.length === 0, issues };
  }
}
