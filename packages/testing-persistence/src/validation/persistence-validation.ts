import {
  APPROVAL_STATUSES,
  AUTOMATION_ADAPTER_KINDS,
  AUTOMATION_IMPORT_STATUSES,
  AUTOMATION_TYPES,
  BUSINESS_CRITICALITIES,
  CASE_VERSION_REASONS,
  CERTIFICATION_STATUSES,
  COVERAGE_METRIC_KINDS,
  DEFECT_PROVIDER_KINDS,
  DEFECT_STATUSES,
  EVIDENCE_LIFECYCLE_STATUSES,
  EVIDENCE_TYPES,
  EXECUTION_APPROVAL_STATES,
  EXECUTION_STATUSES,
  EXECUTION_TYPES,
  IMPACTS,
  LIKELIHOODS,
  NORMALIZED_RESULT_STATUSES,
  PIPELINE_IMPORT_STATUSES,
  PIPELINE_PROVIDER_KINDS,
  PIPELINE_RUN_STATUSES,
  PRIORITIES,
  REGRESSION_IMPORTANCES,
  RELEASE_APPROVAL_STAGE_KINDS,
  RELEASE_GOVERNANCE_STATUSES,
  RELEASE_READINESS_STATUSES,
  RELEASE_SCOPE_KINDS,
  RISK_LEVELS,
  SEVERITIES,
  TEST_RESULT_STATUSES,
  TEST_STATUSES,
  TRACEABILITY_LINK_TYPES,
  WORK_ITEM_REF_KINDS,
  isEnumMember,
} from "@apzhub/testing-contracts";

import { validationError } from "../errors";
import type { RepositoryContext } from "../types";

export function assertTenantOwnership(
  ctx: RepositoryContext,
  tenantId: string,
  entityKind: string,
  id?: string,
): void {
  if (tenantId !== ctx.tenantId) {
    throw validationError(`Tenant mismatch for ${entityKind}`, {
      expectedTenantId: ctx.tenantId,
      actualTenantId: tenantId,
      id,
    });
  }
}

export function assertOrganisationFilter(
  ctx: RepositoryContext,
  organisationId: string | undefined,
): void {
  if (ctx.organisationId && organisationId && organisationId !== ctx.organisationId) {
    throw validationError("Organisation filter mismatch", {
      expectedOrganisationId: ctx.organisationId,
      actualOrganisationId: organisationId,
    });
  }
}

export function assertRevisionMatch(
  expected: number,
  actual: number,
  entityKind: string,
  id: string,
): void {
  if (expected !== actual) {
    throw validationError(`Revision mismatch for ${entityKind}`, {
      id,
      expected,
      actual,
    });
  }
}

export function assertRequiredString(
  value: unknown,
  field: string,
): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw validationError(`Missing required field: ${field}`, { field });
  }
}

export function assertNonNegativeInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw validationError(`${field} must be a non-negative integer`, { field, value });
  }
}

export function assertEnumValue<T extends string>(
  values: readonly T[],
  candidate: string,
  field: string,
): asserts candidate is T {
  if (!isEnumMember(values, candidate)) {
    throw validationError(`Invalid ${field}: ${candidate}`, {
      field,
      candidate,
      allowed: values,
    });
  }
}

export function validatePriority(value: string): void {
  assertEnumValue(PRIORITIES, value, "priority");
}

export function validateRiskLevel(value: string): void {
  assertEnumValue(RISK_LEVELS, value, "level");
}

export function validateTestStatus(value: string): void {
  assertEnumValue(TEST_STATUSES, value, "status");
}

export function validateExecutionStatus(value: string): void {
  assertEnumValue(EXECUTION_STATUSES, value, "status");
}

export function validateExecutionType(value: string): void {
  assertEnumValue(EXECUTION_TYPES, value, "executionType");
}

export function validateEvidenceType(value: string): void {
  assertEnumValue(EVIDENCE_TYPES, value, "type");
}

export function validateEvidenceLifecycleStatus(value: string): void {
  assertEnumValue(EVIDENCE_LIFECYCLE_STATUSES, value, "lifecycleStatus");
}

export function validateCertificationStatus(value: string): void {
  assertEnumValue(CERTIFICATION_STATUSES, value, "status");
}

export function validateCertificationGateOutcome(value: string): void {
  assertEnumValue(
    ["pass", "fail", "warning", "not_applicable", "unknown", "pending"] as const,
    value,
    "status",
  );
}

export function validateApprovalStatus(value: string): void {
  assertEnumValue(APPROVAL_STATUSES, value, "status");
}

export function validateReleaseReadinessStatus(value: string): void {
  assertEnumValue(RELEASE_READINESS_STATUSES, value, "status");
}

export function validateReleaseGovernanceStatus(value: string): void {
  assertEnumValue(RELEASE_GOVERNANCE_STATUSES, value, "status");
}

export function validateReleaseScopeKind(value: string): void {
  assertEnumValue(RELEASE_SCOPE_KINDS, value, "kind");
}

export function validateReleaseApprovalStageKind(value: string): void {
  assertEnumValue(RELEASE_APPROVAL_STAGE_KINDS, value, "stageKind");
}

export function validateReleaseApprovalStatus(value: string): void {
  assertEnumValue(
    ["pending", "approved", "rejected", "withdrawn", "conditional"] as const,
    value,
    "status",
  );
}

export function validateReleaseDecisionVerdict(value: string): void {
  assertEnumValue(
    ["approved", "conditionally_approved", "rejected"] as const,
    value,
    "verdict",
  );
}

export function validateCoverageKind(value: string): void {
  assertEnumValue(COVERAGE_METRIC_KINDS, value, "kind");
}

export function validateDefectProviderKind(value: string): void {
  assertEnumValue(DEFECT_PROVIDER_KINDS, value, "providerKind");
}

export function validateDefectStatus(value: string): void {
  assertEnumValue(DEFECT_STATUSES, value, "status");
}

export function validateAutomationType(value: string): void {
  assertEnumValue(AUTOMATION_TYPES, value, "automationType");
}

export function validateAutomationAdapterKind(value: string): void {
  assertEnumValue(AUTOMATION_ADAPTER_KINDS, value, "adapterKind");
}

export function validateAutomationImportStatus(value: string): void {
  assertEnumValue(AUTOMATION_IMPORT_STATUSES, value, "status");
}

export function validateNormalizedResultStatus(value: string): void {
  assertEnumValue(NORMALIZED_RESULT_STATUSES, value, "status");
}

export function validateTraceabilityType(value: string): void {
  assertEnumValue(TRACEABILITY_LINK_TYPES, value, "type");
}

export function validateWorkItemKind(value: string): void {
  assertEnumValue(WORK_ITEM_REF_KINDS, value, "kind");
}

export function validateLikelihood(value: string): void {
  assertEnumValue(LIKELIHOODS, value, "likelihood");
}

export function validateImpact(value: string): void {
  assertEnumValue(IMPACTS, value, "impact");
}

export function validateBusinessCriticality(value: string): void {
  assertEnumValue(BUSINESS_CRITICALITIES, value, "businessCriticality");
}

export function validateRegressionImportance(value: string): void {
  assertEnumValue(REGRESSION_IMPORTANCES, value, "regressionImportance");
}

export function validateCaseVersionReason(value: string): void {
  assertEnumValue(CASE_VERSION_REASONS, value, "reason");
}

export function validateSeverity(value: string): void {
  assertEnumValue(SEVERITIES, value, "severity");
}

export function validateTestResultStatus(value: string): void {
  assertEnumValue(TEST_RESULT_STATUSES, value, "status");
}

export function validateExecutionApprovalState(value: string): void {
  assertEnumValue(EXECUTION_APPROVAL_STATES, value, "approvalState");
}

export function validatePipelineProviderKind(value: string): void {
  assertEnumValue(PIPELINE_PROVIDER_KINDS, value, "providerKind");
}

export function validatePipelineRunStatus(value: string): void {
  assertEnumValue(PIPELINE_RUN_STATUSES, value, "status");
}

export function validatePipelineImportStatus(value: string): void {
  assertEnumValue(PIPELINE_IMPORT_STATUSES, value, "status");
}
