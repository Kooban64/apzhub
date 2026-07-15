import { describe, expect, it } from "vitest";

import {
  PersistenceError,
  notFoundError,
  revisionConflictError,
  tenantMismatchError,
  unauthorizedError,
  validationError,
} from "./errors";
import {
  assertEnumValue,
  assertNonNegativeInteger,
  assertOrganisationFilter,
  assertRevisionMatch,
  assertTenantOwnership,
  validateApprovalStatus,
  validateAutomationType,
  validateCertificationStatus,
  validateCoverageKind,
  validateEvidenceType,
  validateExecutionStatus,
  validateExecutionType,
  validateReleaseReadinessStatus,
  validateTraceabilityType,
} from "./validation/persistence-validation";
import {
  compareValues,
  matchesFilters,
  matchesSearch,
  normalizeListQuery,
  paginateItems,
} from "./repositories/types";
import type { RepositoryContext } from "./types";

describe("errors helpers", () => {
  it("builds typed persistence errors", () => {
    expect(notFoundError("requirement", "r1").code).toBe("NOT_FOUND");
    expect(revisionConflictError("requirement", "r1", 1, 2).code).toBe(
      "REVISION_CONFLICT",
    );
    expect(tenantMismatchError("requirement", "r1", "t1").code).toBe("TENANT_MISMATCH");
    expect(unauthorizedError("testing.admin", "u1")).toBeInstanceOf(PersistenceError);
    expect(validationError("bad", { field: "x" }).details).toEqual({ field: "x" });
  });
});

describe("validation helpers", () => {
  const ctx: RepositoryContext = {
    tenantId: "t1",
    organisationId: "o1",
    actorUserId: "u1",
    permissions: [],
  };

  it("covers remaining validators", () => {
    expect(() => validateExecutionStatus("planned")).not.toThrow();
    expect(() => validateExecutionType("hybrid")).not.toThrow();
    expect(() => validateEvidenceType("log")).not.toThrow();
    expect(() => validateCertificationStatus("certified")).not.toThrow();
    expect(() => validateApprovalStatus("approved")).not.toThrow();
    expect(() => validateReleaseReadinessStatus("ready")).not.toThrow();
    expect(() => validateCoverageKind("plan")).not.toThrow();
    expect(() => validateAutomationType("e2e")).not.toThrow();
    expect(() => validateTraceabilityType("verifies")).not.toThrow();
    expect(() => assertNonNegativeInteger(0, "n")).not.toThrow();
    expect(() => assertNonNegativeInteger(-1, "n")).toThrow(PersistenceError);
    expect(() => assertEnumValue(["a", "b"] as const, "a", "field")).not.toThrow();
    expect(() => assertOrganisationFilter(ctx, "o1")).not.toThrow();
    expect(() => assertOrganisationFilter(ctx, "other")).toThrow(PersistenceError);
    expect(() => assertRevisionMatch(2, 2, "requirement", "r1")).not.toThrow();
    expect(() => assertRevisionMatch(1, 2, "requirement", "r1")).toThrow(
      PersistenceError,
    );
    expect(() => assertTenantOwnership(ctx, "t1", "requirement")).not.toThrow();
  });
});

describe("list query helpers", () => {
  it("normalizes, paginates, sorts, and filters", () => {
    const q = normalizeListQuery({ page: 0, pageSize: 999, search: "x" });
    expect(q.page).toBe(1);
    expect(q.pageSize).toBe(200);
    expect(paginateItems([1, 2, 3, 4], 2, 2).items).toEqual([3, 4]);
    expect(compareValues(1, 2, "asc")).toBeLessThan(0);
    expect(compareValues("b", "a", "desc")).toBeLessThan(0);
    expect(compareValues(null, 1, "asc")).toBeLessThan(0);
    expect(compareValues(1, null, "asc")).toBeGreaterThan(0);
    expect(compareValues(null, null)).toBe(0);
    expect(matchesSearch({ title: "Hello" }, "hel", ["title"])).toBe(true);
    expect(matchesSearch({ title: "Hello" }, undefined, ["title"])).toBe(true);
    expect(matchesFilters({ status: "ready" }, { status: "ready" })).toBe(true);
    expect(matchesFilters({ status: "ready" }, { status: undefined })).toBe(true);
    expect(matchesFilters({ status: "ready" }, undefined)).toBe(true);
  });
});
