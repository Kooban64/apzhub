import { describe, expect, it } from "vitest";

import { DomainPolicyDefaults } from "../domain/test-execution/policies";
import { computeAvailableActions } from "./available-actions";
import { EXECUTION_PERMISSIONS } from "./permissions";

function base(
  status: Parameters<typeof computeAvailableActions>[0]["execution"]["status"],
) {
  return {
    status,
    assignment: {
      ownerId: "owner_1",
      executorId: "exec_1",
      reviewerId: "rev_1",
    },
  };
}

describe("computeAvailableActions", () => {
  it("exposes prepare only in draft", () => {
    const actions = computeAvailableActions({
      execution: base("draft"),
      actorId: "owner_1",
    });
    expect(actions.map((a) => a.action)).toContain("prepareExecution");
    expect(actions.map((a) => a.action)).not.toContain("startExecution");
  });

  it("filters by permission", () => {
    const actions = computeAvailableActions({
      execution: base("draft"),
      actorId: "owner_1",
      permissions: [EXECUTION_PERMISSIONS.READ],
    });
    expect(actions).toHaveLength(0);
  });

  it("requires review permission and reviewer role for accept", () => {
    const asReviewer = computeAvailableActions({
      execution: base("submitted_for_review"),
      actorId: "rev_1",
      permissions: [EXECUTION_PERMISSIONS.REVIEW],
    });
    expect(asReviewer.map((a) => a.action)).toContain("acceptExecution");

    const asExecutor = computeAvailableActions({
      execution: base("submitted_for_review"),
      actorId: "exec_1",
      permissions: [EXECUTION_PERMISSIONS.REVIEW],
      policy: DomainPolicyDefaults,
    });
    expect(asExecutor.map((a) => a.action)).not.toContain("acceptExecution");
  });

  it("hides submitForReview when review is not required", () => {
    const actions = computeAvailableActions({
      execution: base("completed"),
      actorId: "exec_1",
      permissions: [EXECUTION_PERMISSIONS.EXECUTE],
      policy: { ...DomainPolicyDefaults, reviewRequired: false },
    });
    expect(actions.map((a) => a.action)).not.toContain("submitForReview");
  });

  it("allows fast-path accept from completed only when policy permits", () => {
    const denied = computeAvailableActions({
      execution: base("completed"),
      actorId: "rev_1",
      permissions: [EXECUTION_PERMISSIONS.REVIEW],
      policy: DomainPolicyDefaults,
    });
    expect(denied.map((a) => a.action)).not.toContain("acceptExecution");

    const allowed = computeAvailableActions({
      execution: base("completed"),
      actorId: "rev_1",
      permissions: [EXECUTION_PERMISSIONS.REVIEW],
      policy: { ...DomainPolicyDefaults, fastPathAccept: true },
    });
    expect(allowed.map((a) => a.action)).toContain("acceptExecution");
  });
});
