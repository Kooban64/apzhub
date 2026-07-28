import { describe, expect, it } from "vitest";

import {
  LifecycleEngine,
  LifecyclePolicyError,
  LifecycleTransitionError,
  type LifecycleContext,
  type LifecyclePolicy,
} from "./index";

type TestState = "draft" | "review" | "approved" | "archived";

const policy: LifecyclePolicy<TestState> = {
  id: "test-policy",
  states: ["draft", "review", "approved", "archived"],
  transitions: [
    { from: "draft", to: "review", action: "submit" },
    { from: "review", to: "approved", action: "approve" },
    { from: "review", to: "draft", action: "revise" },
    { from: "approved", to: "archived", action: "archive" },
  ],
  canTransition(from, to) {
    if (from === "archived") return "Cannot transition from archived";
    if (from === "draft" && to === "approved") return false;
    return true;
  },
};

const ctx: LifecycleContext = {
  actorUserId: "user_1",
  tenantId: "tenant_1",
  correlationId: "corr_1",
  now: "2026-07-24T10:00:00.000Z",
};

describe("@apzhub/lifecycle-engine", () => {
  it("transitions by action and by target state", () => {
    const byAction = LifecycleEngine.transition(policy, "draft", "submit", ctx);
    expect(byAction.newState).toBe("review");
    expect(byAction.action).toBe("submit");

    const byTarget = LifecycleEngine.transition(policy, "review", "approved", ctx);
    expect(byTarget.newState).toBe("approved");
    expect(byTarget.action).toBe("approve");
  });

  it("builds history entries with context metadata", () => {
    const result = LifecycleEngine.transition(policy, "draft", "submit", {
      ...ctx,
      reason: "Ready for review",
      comments: "Please review",
      revision: 2,
      metadata: { source: "unit-test" },
    });
    expect(result.historyEntry).toMatchObject({
      previousState: "draft",
      newState: "review",
      action: "submit",
      reason: "Ready for review",
      comments: "Please review",
      revision: 2,
      metadata: { source: "unit-test" },
    });
  });

  it("lists available transitions respecting guards", () => {
    const fromDraft = LifecycleEngine.availableTransitions(policy, "draft", ctx);
    expect(fromDraft.map((item) => item.action)).toEqual(["submit"]);

    const fromReview = LifecycleEngine.availableTransitions(policy, "review", ctx);
    expect(fromReview.map((item) => item.action).sort()).toEqual(["approve", "revise"]);
  });

  it("throws on invalid transitions and guarded paths", () => {
    expect(() => LifecycleEngine.transition(policy, "draft", "approve", ctx)).toThrow(
      LifecycleTransitionError,
    );
    expect(() => LifecycleEngine.transition(policy, "archived", "draft", ctx)).toThrow(
      LifecycleTransitionError,
    );
    expect(() =>
      LifecycleEngine.transition(policy, "draft", "unknown_action", ctx),
    ).toThrow(LifecycleTransitionError);
    expect(() =>
      LifecycleEngine.availableTransitions(policy, "invalid" as TestState, ctx),
    ).toThrow(LifecyclePolicyError);
  });

  it("assertTransition matches transition", () => {
    const asserted = LifecycleEngine.assertTransition(policy, "draft", "submit", ctx);
    expect(asserted.newState).toBe("review");
  });
});
