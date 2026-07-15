import { describe, expect, it } from "vitest";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";
import { PersistenceError } from "@apzhub/testing-persistence";
import { DomainRuleError } from "@apzhub/testing-services";

import { mapTestingDomainError } from "./map-testing-error";

const CORRELATION_ID = "corr_testing_error";
const LEAK_PATTERN = /testing_(test_plan|manual_execution|evidence)|select\s+|insert\s+|update\s+|delete\s+|from\s+|where\s+|public\./i;

function expectMapped(
  error: unknown,
  expected: { readonly code: string; readonly category?: string },
): void {
  const mapped = mapTestingDomainError(error, CORRELATION_ID);

  expect(mapped).toBeInstanceOf(PlatformServiceError);
  expect(mapped.code).toBe(expected.code);
  if (expected.category) {
    expect(mapped.category).toBe(expected.category);
  }
  expect(mapped.correlationId).toBe(CORRELATION_ID);
  expect(mapped.message).not.toMatch(LEAK_PATTERN);
}

describe("mapTestingDomainError", () => {
  it.each([
    [
      new PersistenceError(
        "NOT_FOUND",
        "select * from testing_test_plan where id = missing",
      ),
      { category: "not_found", code: "NOT_FOUND" },
    ],
    [
      new PersistenceError("VALIDATION", "testing_test_plan.name failed validation"),
      { category: "validation", code: "VALIDATION_FAILED" },
    ],
    [
      new PersistenceError(
        "REVISION_CONFLICT",
        "update testing_test_plan set revision = 2",
      ),
      { category: "conflict", code: "CONFLICT" },
    ],
    [
      new PersistenceError("TENANT_MISMATCH", "testing_test_plan tenant mismatch"),
      { category: "authorization", code: "TENANT_MISMATCH" },
    ],
    [
      new PersistenceError("UNAUTHORIZED", "Missing permission from repository"),
      { category: "authorization", code: "PERMISSION_DENIED" },
    ],
  ])("maps persistence errors without leaking backend details", (error, expected) => {
    expectMapped(error, expected);
  });

  it.each([
    [
      new DomainRuleError("validation", "select * from testing_test_case"),
      { category: "validation", code: "VALIDATION_FAILED" },
    ],
    [
      new DomainRuleError("invalid_execution_transition", "completed to paused"),
      { category: "business_rule", code: "INVALID_STATE_TRANSITION" },
    ],
    [
      new DomainRuleError("duplicate_automation_import", "duplicate automation import"),
      { category: "conflict", code: "DUPLICATE_AUTOMATION_IMPORT" },
    ],
    [
      new DomainRuleError("missing_evidence", "evidence incomplete"),
      { category: "business_rule", code: "EVIDENCE_INCOMPLETE" },
    ],
    [
      new DomainRuleError("certification_not_ready", "certification not ready"),
      { category: "business_rule", code: "CERTIFICATION_NOT_READY" },
    ],
    [
      new DomainRuleError("business_rule", "organisation mismatch"),
      { category: "business_rule", code: "BUSINESS_RULE_VIOLATION" },
    ],
  ])("maps domain rule errors without leaking backend details", (error, expected) => {
    expectMapped(error, expected);
  });

  it("maps unexpected errors to a generic internal platform error", () => {
    expectMapped(new Error("delete from testing_test_plan"), {
      category: "system",
      code: "INTERNAL_ERROR",
    });
  });

  it("passes through an existing PlatformServiceError", () => {
    const original = new PlatformServiceError({
      category: "authorization",
      code: "PERMISSION_DENIED",
      message: "Permission denied",
      correlationId: "corr_existing",
      retryable: false,
    });

    expect(mapTestingDomainError(original, CORRELATION_ID)).toBe(original);
  });
});
