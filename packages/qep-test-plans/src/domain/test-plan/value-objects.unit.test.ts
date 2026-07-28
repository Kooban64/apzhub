import { describe, expect, it } from "vitest";

import { PlanValidationError } from "../../shared/errors";
import { createEmptyTestPlanAssignment, createTestPlanAssignment } from "./plan-assignment";
import { createTestPlanApproval } from "./plan-approval";
import { createEmptyTestPlanSchedule, createTestPlanSchedule } from "./plan-schedule";
import { ItemPolicy, projectApprovalState } from "./plan-policy";
import {
  cloneTitleFromSource,
  computeItemFingerprint,
  createExecutionWindow,
  createPlanNumber,
  createPlanObjective,
  createPlanScope,
  createPlanTitle,
  createPriority,
  deriveApprovalState,
  isScopeValid,
  nextSealedVersionLabel,
} from "./value-objects";
import { createTestPlanItem } from "./plan-item";

describe("value objects and helpers", () => {
  it("validates title, objective, number, priority, scope", () => {
    expect(createPlanTitle("  Hello  ")).toBe("Hello");
    expect(() => createPlanTitle("")).toThrow(PlanValidationError);
    expect(createPlanObjective("Obj")).toBe("Obj");
    expect(() => createPlanObjective("  ")).toThrow(PlanValidationError);
    expect(createPlanNumber("TP-1")).toBe("TP-1");
    expect(() => createPlanNumber("bad!")).toThrow(PlanValidationError);
    expect(createPriority("high")).toBe("high");
    expect(() => createPriority("nope")).toThrow(PlanValidationError);
    expect(createPlanScope({ class: "release" }).class).toBe("release");
    expect(isScopeValid({ class: "custom", label: "X" })).toBe(true);
    expect(isScopeValid({ class: "custom" })).toBe(false);
  });

  it("validates execution window and schedule helpers", () => {
    expect(() =>
      createExecutionWindow({
        plannedStart: "2026-02-01T00:00:00.000Z",
        plannedEnd: "2026-01-01T00:00:00.000Z",
      }),
    ).toThrow(PlanValidationError);
    expect(createEmptyTestPlanSchedule()).toEqual({});
    const schedule = createTestPlanSchedule({
      plannedStart: "2026-01-01T00:00:00.000Z",
      plannedEnd: "2026-01-02T00:00:00.000Z",
      timezone: "UTC",
    });
    expect(schedule.timezone).toBe("UTC");
  });

  it("handles assignment empty factory and approval reject length", () => {
    expect(createEmptyTestPlanAssignment("t", "u").assigneeIds).toEqual([]);
    expect(
      createTestPlanAssignment({
        leadId: "lead",
        assigneeIds: ["a", "a", "b"],
        updatedAt: "t",
        updatedBy: "u",
      }).assigneeIds,
    ).toEqual(["a", "b"]);
    expect(() =>
      createTestPlanApproval({
        id: "1",
        decision: "rejected",
        decidedBy: "r",
        decidedAt: "t",
        comment: "no",
        fromStatus: "review",
        toStatus: "rejected",
      }),
    ).toThrow(PlanValidationError);
  });

  it("computes fingerprints, version labels, clone titles, approval projection", () => {
    expect(
      computeItemFingerprint([
        { id: "1", itemStatus: "included", specificationId: "s", specificationVersionPin: "1" },
        { id: "2", itemStatus: "removed", specificationId: "x" },
      ]),
    ).toContain("s:1:included");
    expect(nextSealedVersionLabel()).toBe("1.0");
    expect(nextSealedVersionLabel("3.0")).toBe("4.0");
    expect(nextSealedVersionLabel("x")).toBe("1.0");
    expect(cloneTitleFromSource("Copy of A")).toBe("Copy of A");
    expect(cloneTitleFromSource("A")).toBe("Copy of A");
    expect(deriveApprovalState("review", [])).toBe("pending_review");
    expect(deriveApprovalState("draft", [])).toBe("none");
    expect(deriveApprovalState("approved", [{ decision: "approved" }])).toBe("approved");
    expect(projectApprovalState("rejected", [
      {
        id: "1",
        decision: "rejected",
        decidedBy: "r",
        decidedAt: "t",
        fromStatus: "review",
        toStatus: "rejected",
        comment: "bad enough",
      },
    ])).toBe("rejected");
  });

  it("item policy allows excludeId when updating same item", () => {
    const item = createTestPlanItem({
      id: "i1",
      specificationId: "s1",
      sequence: 0,
      itemStatus: "included",
      specificationVersionPin: "1",
    });
    expect(() => ItemPolicy.assertNoDuplicateSpecPin([item], item, "i1")).not.toThrow();
  });
});
