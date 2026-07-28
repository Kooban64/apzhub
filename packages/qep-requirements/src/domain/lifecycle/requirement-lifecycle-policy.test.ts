import { describe, expect, it } from "vitest";

import { LifecycleTransitionError } from "@apzhub/lifecycle-engine";

import { requirementLifecycleEngine } from "./requirement-lifecycle-engine";
import type { RequirementStatus } from "../value-objects/requirement-status";

const ctx = {
  actorUserId: "user_1",
  tenantId: "tenant_1",
  correlationId: "corr_1",
  now: "2026-07-24T10:00:00.000Z",
};

describe("requirement lifecycle policy", () => {
  it("allows the documented happy-path transitions", () => {
    const path: Array<{ from: RequirementStatus; action: string; to: RequirementStatus }> = [
      { from: "draft", action: "submit", to: "proposed" },
      { from: "proposed", action: "review", to: "in_review" },
      { from: "in_review", action: "approve", to: "approved" },
      { from: "approved", action: "mark_implemented", to: "implemented" },
      { from: "implemented", action: "mark_verified", to: "verified" },
      { from: "verified", action: "deprecate", to: "deprecated" },
      { from: "deprecated", action: "archive", to: "archived" },
    ];

    for (const step of path) {
      const result = requirementLifecycleEngine.transition(step.from, step.action, ctx);
      expect(result.newState).toBe(step.to);
    }
  });

  it("supports reject and revise", () => {
    const rejected = requirementLifecycleEngine.transition("in_review", "reject", {
      ...ctx,
      reason: "Incomplete acceptance criteria",
    });
    expect(rejected.newState).toBe("rejected");

    const revised = requirementLifecycleEngine.transition("rejected", "revise", ctx);
    expect(revised.newState).toBe("draft");
  });

  it("archives from rejected", () => {
    const rejected = requirementLifecycleEngine.transition("in_review", "reject", {
      ...ctx,
      reason: "Withdrawn",
    });
    const archived = requirementLifecycleEngine.transition(rejected.newState, "archive", ctx);
    expect(archived.newState).toBe("archived");
  });

  it("blocks invalid transitions via guards", () => {
    expect(() => requirementLifecycleEngine.transition("draft", "mark_verified", ctx)).toThrow(
      LifecycleTransitionError,
    );
    expect(() => requirementLifecycleEngine.transition("rejected", "mark_implemented", ctx)).toThrow(
      LifecycleTransitionError,
    );
    expect(() => requirementLifecycleEngine.transition("approved", "archive", ctx)).toThrow(
      LifecycleTransitionError,
    );
    expect(() => requirementLifecycleEngine.transition("archived", "submit", ctx)).toThrow(
      LifecycleTransitionError,
    );
  });

  it("lists available transitions for the current state", () => {
    const fromProposed = requirementLifecycleEngine.availableTransitions("proposed", ctx);
    expect(fromProposed.map((item) => item.action).sort()).toEqual(["review", "start_review"]);
  });
});
