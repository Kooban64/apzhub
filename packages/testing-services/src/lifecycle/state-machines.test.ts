import { describe, expect, it } from "vitest";

import {
  assertEvidenceLifecycleTransition,
  assertExecutionStatusTransition,
  canTransitionEvidenceLifecycle,
  canTransitionExecutionStatus,
  DomainRuleError,
  isTerminalExecutionStatus,
  nextStatusAfterCancel,
} from "./index";

describe("execution state machine", () => {
  const legal: Array<[string, string]> = [
    ["draft", "assigned"],
    ["draft", "cancelled"],
    ["draft", "archived"],
    ["assigned", "ready"],
    ["assigned", "draft"],
    ["assigned", "cancelled"],
    ["assigned", "in_progress"],
    ["ready", "in_progress"],
    ["ready", "cancelled"],
    ["ready", "assigned"],
    ["in_progress", "paused"],
    ["in_progress", "blocked"],
    ["in_progress", "completed"],
    ["in_progress", "cancelled"],
    ["paused", "in_progress"],
    ["paused", "blocked"],
    ["paused", "cancelled"],
    ["blocked", "in_progress"],
    ["blocked", "cancelled"],
    ["completed", "under_review"],
    ["completed", "archived"],
    ["completed", "in_progress"],
    ["under_review", "approved"],
    ["under_review", "rejected"],
    ["under_review", "in_progress"],
    ["approved", "archived"],
    ["approved", "under_review"],
    ["rejected", "in_progress"],
    ["rejected", "cancelled"],
    ["rejected", "archived"],
    ["cancelled", "archived"],
    ["cancelled", "draft"],
  ];

  it.each(legal)("allows %s → %s", (from, to) => {
    expect(canTransitionExecutionStatus(from as never, to as never)).toBe(true);
    expect(() =>
      assertExecutionStatusTransition(from as never, to as never),
    ).not.toThrow();
  });

  const illegal: Array<[string, string]> = [
    ["draft", "completed"],
    ["draft", "in_progress"],
    ["archived", "draft"],
    ["archived", "in_progress"],
    ["approved", "in_progress"],
    ["completed", "paused"],
    ["ready", "completed"],
  ];

  it.each(illegal)("rejects %s → %s", (from, to) => {
    expect(canTransitionExecutionStatus(from as never, to as never)).toBe(false);
    expect(() =>
      assertExecutionStatusTransition(from as never, to as never),
    ).toThrow(DomainRuleError);
  });

  it("canonicalizes legacy statuses", () => {
    expect(canTransitionExecutionStatus("planned", "assigned")).toBe(true);
    expect(canTransitionExecutionStatus("queued", "ready")).toBe(true);
    expect(canTransitionExecutionStatus("aborted", "archived")).toBe(true);
    expect(canTransitionExecutionStatus("failed", "in_progress")).toBe(true);
  });

  it("treats cancel as cancelled and blocks terminal cancels", () => {
    expect(nextStatusAfterCancel("in_progress")).toBe("cancelled");
    expect(nextStatusAfterCancel("planned")).toBe("cancelled");
    expect(() => nextStatusAfterCancel("completed")).toThrow(DomainRuleError);
    expect(() => nextStatusAfterCancel("archived")).toThrow(DomainRuleError);
    expect(isTerminalExecutionStatus("cancelled")).toBe(true);
    expect(isTerminalExecutionStatus("archived")).toBe(true);
    expect(isTerminalExecutionStatus("completed")).toBe(false);
  });
});

describe("evidence lifecycle state machine", () => {
  it("allows the capture→submit→verify→approve path", () => {
    expect(canTransitionEvidenceLifecycle("pending", "captured")).toBe(true);
    expect(canTransitionEvidenceLifecycle("captured", "submitted")).toBe(true);
    expect(canTransitionEvidenceLifecycle("submitted", "verified")).toBe(true);
    expect(canTransitionEvidenceLifecycle("verified", "approved")).toBe(true);
    expect(canTransitionEvidenceLifecycle("approved", "archived")).toBe(true);
  });

  it("rejects illegal evidence jumps", () => {
    expect(() =>
      assertEvidenceLifecycleTransition("pending", "approved"),
    ).toThrow(DomainRuleError);
    expect(() =>
      assertEvidenceLifecycleTransition("archived", "pending"),
    ).toThrow(DomainRuleError);
  });
});
