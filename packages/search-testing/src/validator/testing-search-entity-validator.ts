/**
 * TestingSearchEntityValidator — Testing-specific pre-publication checks (APZSEARCH-013).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import { scanMetadataForStorageLeakage } from "../security/safe-fields";
import {
  isTestingSearchEntityType,
  looksLikeStorageLeak,
  type TestingSearchEntityType,
} from "../types/entity-types";

export type TestingSearchValidationIssue = {
  readonly field: string;
  readonly code: string;
  readonly message: string;
};

export type TestingSearchValidationResult = {
  readonly valid: boolean;
  readonly issues: readonly TestingSearchValidationIssue[];
};

const MANDATORY_BY_TYPE: Readonly<
  Partial<Record<TestingSearchEntityType, readonly string[]>>
> = {
  test_plan: ["key", "status"],
  test_suite: ["key", "status"],
  test_case: ["key", "status", "priority"],
  test_execution: ["status", "caseId", "sessionId"],
  test_run: ["status", "sessionId"],
  execution_step: ["caseId", "ordinal"],
  evidence: ["type", "checksumPresent"],
  approval: ["status", "certificationRecordId"],
  requirement: ["key", "priority"],
  defect: ["status", "providerKind"],
  automation_run: ["status", "executionId"],
  imported_result: ["status", "adapterKind", "externalRunRef"],
  coverage_summary: ["coveredCount", "totalCount"],
  certification: ["key", "status"],
  certification_approval: ["status", "certificationRecordId"],
  certification_decision: ["decisionStatus", "certificationRecordId"],
  release: ["key", "status"],
  release_candidate: ["status", "releaseId"],
  release_package: ["releaseId", "versionLabel"],
  release_scope: ["releaseId", "scopeKind", "refId"],
  release_approval: ["status", "releaseId", "stageKind"],
  release_decision: ["verdict", "releaseId"],
  release_manifest: ["releaseId", "isDecision"],
  release_summary: ["releaseId", "recommendationCode"],
  engineering_snapshot: ["status", "overallScore"],
  engineering_trend: ["trendKind", "direction"],
  benchmark: ["metricKey"],
  historical_snapshot: ["periodKind", "immutable"],
  risk_summary: ["overallLevel", "overallScore"],
  quality_summary: ["computedAt", "openDefectCount"],
  quality_coverage_summary: ["coveredCount", "totalCount", "kind"],
  defect_summary: ["openCount"],
  report_metadata: ["reportType", "outputFormat", "templateId"],
  report_template: ["reportType", "name"],
  pipeline: ["key", "status", "providerKind"],
  pipeline_run: ["status", "pipelineId", "providerKind"],
  pipeline_import: ["status", "providerKind", "externalRunRef"],
};

export class TestingSearchEntityValidator {
  validateDraft(
    context: TestingSearchPublicationContext,
    draft: SearchEntityDraft,
  ): TestingSearchValidationResult {
    const issues: TestingSearchValidationIssue[] = [];

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

    if (!isTestingSearchEntityType(draft.entityType)) {
      issues.push({
        field: "entityType",
        code: "unsupported",
        message: `unsupported Testing search entity type: ${draft.entityType}`,
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
      if (
        /storageRef|checksumHex|signedUrl|objectKey|payloadFingerprint|bytesBase64/i.test(
          key,
        )
      ) {
        issues.push({
          field: `metadata.${key}`,
          code: "storage_leakage",
          message: "storage metadata keys are forbidden",
        });
      }
      if (/^(body|screenshot|logBody)$/i.test(key)) {
        issues.push({
          field: `metadata.${key}`,
          code: "payload_forbidden",
          message: "report/evidence payload bodies must not be published",
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

    if (isTestingSearchEntityType(draft.entityType)) {
      const mandatory = MANDATORY_BY_TYPE[draft.entityType] ?? [];
      for (const key of mandatory) {
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
