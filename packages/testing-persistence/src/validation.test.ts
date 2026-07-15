import { describe, expect, it } from "vitest";

import {
  assertNonNegativeInteger,
  assertOrganisationFilter,
  assertRequiredString,
  assertRevisionMatch,
  assertTenantOwnership,
  validateApprovalStatus,
  validateAutomationType,
  validateBusinessCriticality,
  validateCaseVersionReason,
  validateCertificationStatus,
  validateCoverageKind,
  validateEvidenceType,
  validateExecutionApprovalState,
  validateExecutionStatus,
  validateExecutionType,
  validateImpact,
  validateLikelihood,
  validatePriority,
  validateRegressionImportance,
  validateReleaseReadinessStatus,
  validateRiskLevel,
  validateSeverity,
  validateTestResultStatus,
  validateTestStatus,
  validateTraceabilityType,
  validateWorkItemKind,
} from "./validation/persistence-validation";
import { PersistenceError } from "./errors";
import type { RepositoryContext } from "./types";

const ctx: RepositoryContext = {
  tenantId: "tenant-a",
  organisationId: "org-1",
  actorUserId: "user-1",
  permissions: ["testing.*"],
};

describe("persistence validation", () => {
  it("validates enums and required fields", () => {
    expect(() => validatePriority("high")).not.toThrow();
    expect(() => validatePriority("urgent")).toThrow(PersistenceError);
    expect(() => validateTestStatus("draft")).not.toThrow();
    expect(() => validateWorkItemKind("epic")).not.toThrow();
    expect(() => assertRequiredString("", "title")).toThrow(PersistenceError);
    expect(() => assertRequiredString("ok", "title")).not.toThrow();
  });

  it("enforces tenant ownership", () => {
    expect(() => assertTenantOwnership(ctx, "tenant-a", "requirement")).not.toThrow();
    expect(() => assertTenantOwnership(ctx, "other", "requirement", "id-1")).toThrow(
      PersistenceError,
    );
  });

  it("validates remaining enum helpers and guards", () => {
    expect(() => validateRiskLevel("high")).not.toThrow();
    expect(() => validateExecutionStatus("planned")).not.toThrow();
    expect(() => validateExecutionType("manual")).not.toThrow();
    expect(() => validateEvidenceType("screenshot")).not.toThrow();
    expect(() => validateCertificationStatus("certified")).not.toThrow();
    expect(() => validateApprovalStatus("pending")).not.toThrow();
    expect(() => validateReleaseReadinessStatus("ready")).not.toThrow();
    expect(() => validateCoverageKind("requirement")).not.toThrow();
    expect(() => validateAutomationType("api")).not.toThrow();
    expect(() => validateTraceabilityType("covers")).not.toThrow();
    expect(() => validateLikelihood("likely")).not.toThrow();
    expect(() => validateImpact("major")).not.toThrow();
    expect(() => validateBusinessCriticality("high")).not.toThrow();
    expect(() => validateRegressionImportance("mandatory")).not.toThrow();
    expect(() => validateCaseVersionReason("edited")).not.toThrow();
    expect(() => validateSeverity("critical")).not.toThrow();
    expect(() => validateTestResultStatus("pass")).not.toThrow();
    expect(() => validateExecutionApprovalState("none")).not.toThrow();

    expect(() => validateTestResultStatus("nope")).toThrow(PersistenceError);
    expect(() => validateExecutionApprovalState("nope")).toThrow(PersistenceError);
    expect(() => validateLikelihood("nope")).toThrow(PersistenceError);

    expect(() => assertNonNegativeInteger(0, "count")).not.toThrow();
    expect(() => assertNonNegativeInteger(-1, "count")).toThrow(PersistenceError);
    expect(() => assertNonNegativeInteger(1.5, "count")).toThrow(PersistenceError);

    expect(() => assertRevisionMatch(1, 1, "requirement", "id-1")).not.toThrow();
    expect(() => assertRevisionMatch(1, 2, "requirement", "id-1")).toThrow(
      PersistenceError,
    );

    expect(() => assertOrganisationFilter(ctx, "org-1")).not.toThrow();
    expect(() => assertOrganisationFilter(ctx, undefined)).not.toThrow();
    expect(() => assertOrganisationFilter(ctx, "other-org")).toThrow(PersistenceError);
  });
});
