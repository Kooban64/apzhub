import { describe, expect, it } from "vitest";

import {
  DomainRuleError,
  assertApprovalDecisionAllowed,
  assertExecutionStatusTransition,
  assertNonEmpty,
  assertOwnershipId,
  assertTestStatusTransition,
  assertTraceabilityKinds,
  assertValidCaseVersionReason,
  assertValidExecutionApprovalState,
  assertValidLikelihood,
  assertValidPriority,
  assertValidTestResultStatus,
  assertValidTestStatus,
  assertVersionBump,
  canTransitionExecutionStatus,
  canTransitionTestStatus,
  isKnownTraceabilityKind,
  isTerminalExecutionStatus,
  nextStatusAfterCancel,
} from "./index";

describe("lifecycle exhaustive", () => {
  it("covers ready/approved equivalence and terminals", () => {
    expect(canTransitionTestStatus("ready", "approved")).toBe(true);
    expect(canTransitionTestStatus("approved", "approved")).toBe(true);
    expect(canTransitionTestStatus("deprecated", "approved")).toBe(true);
    expect(() => assertTestStatusTransition("draft", "deprecated")).toThrow(
      DomainRuleError,
    );
    expect(canTransitionExecutionStatus("queued", "aborted")).toBe(true);
    expect(canTransitionExecutionStatus("failed", "in_progress")).toBe(true);
    expect(isTerminalExecutionStatus("completed")).toBe(false);
    expect(isTerminalExecutionStatus("cancelled")).toBe(true);
    expect(isTerminalExecutionStatus("aborted")).toBe(true);
    expect(isTerminalExecutionStatus("archived")).toBe(true);
    expect(isTerminalExecutionStatus("paused")).toBe(false);
    expect(nextStatusAfterCancel("in_progress")).toBe("cancelled");
    expect(() => nextStatusAfterCancel("completed")).toThrow(DomainRuleError);
    expect(() => assertExecutionStatusTransition("aborted", "in_progress")).toThrow(
      DomainRuleError,
    );
    expect(canTransitionExecutionStatus("cancelled", "draft")).toBe(true);
  });
});

describe("validation exhaustive", () => {
  it("validates enums and ownership helpers", () => {
    expect(() => assertNonEmpty("", "x")).toThrow(DomainRuleError);
    expect(assertNonEmpty("ok", "x")).toBe("ok");
    expect(() => assertValidTestStatus("nope")).toThrow(DomainRuleError);
    expect(() => assertValidTestStatus("draft")).not.toThrow();
    expect(() => assertValidPriority("nope")).toThrow(DomainRuleError);
    expect(() => assertValidPriority("high")).not.toThrow();
    expect(() => assertValidTestResultStatus("not_executed")).not.toThrow();
    expect(() => assertValidTestResultStatus("wat")).toThrow(DomainRuleError);
    expect(() => assertValidLikelihood("likely")).not.toThrow();
    expect(() => assertValidLikelihood("wat")).toThrow(DomainRuleError);
    expect(() => assertValidCaseVersionReason("cloned")).not.toThrow();
    expect(() => assertValidCaseVersionReason("x")).toThrow(DomainRuleError);
    expect(() => assertValidExecutionApprovalState("none")).not.toThrow();
    expect(() => assertValidExecutionApprovalState("x")).toThrow(DomainRuleError);
    assertTraceabilityKinds("requirement", "test_case");
    assertTraceabilityKinds("requirement", "requirement");
    expect(() => assertTraceabilityKinds("", "test_case")).toThrow(DomainRuleError);
    expect(() => assertTraceabilityKinds("requirement", "")).toThrow(DomainRuleError);
    expect(() =>
      assertApprovalDecisionAllowed("pending", "not_a_status" as never),
    ).toThrow(DomainRuleError);
    expect(() => assertApprovalDecisionAllowed("pending", "pending")).not.toThrow();
    expect(() => assertOwnershipId("u1", "ownerId")).not.toThrow();
    expect(() => assertOwnershipId("", "ownerId")).toThrow(DomainRuleError);
    expect(() => assertVersionBump(1, 2)).not.toThrow();
    expect(() => assertVersionBump(3, 2)).toThrow(DomainRuleError);
    expect(isKnownTraceabilityKind("defect")).toBe(true);
    expect(isKnownTraceabilityKind("unknown_kind")).toBe(false);
    expect(() => assertApprovalDecisionAllowed("pending", "conditional")).not.toThrow();
    expect(() => assertApprovalDecisionAllowed("approved", "rejected")).toThrow(
      DomainRuleError,
    );
    expect(() => assertApprovalDecisionAllowed("rework", "pending")).not.toThrow();
  });
});
