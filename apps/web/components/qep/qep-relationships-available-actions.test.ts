import { describe, expect, it } from "vitest";

import { computeQepRelationshipAvailableActions } from "@apzhub/qep-contracts";

/**
 * Contract: Workbench must map only server-style availableActions.
 * This mirrors computeQepRelationshipAvailableActions used by the API adapter.
 */
describe("QepRelationship availableActions contract (Part 3)", () => {
  it("draft + transition permission yields activate only among lifecycle actions", () => {
    const actions = computeQepRelationshipAvailableActions("draft", [
      "qep.requirements.relationships.transition",
    ]);
    expect(actions).toContain("activate");
    expect(actions).not.toContain("deprecate");
    expect(actions).not.toContain("retire");
    expect(actions).not.toContain("updateRationale");
  });

  it("active + modify yields profile updates and deprecate", () => {
    const actions = computeQepRelationshipAvailableActions("active", [
      "qep.requirements.relationships.modify",
      "qep.requirements.relationships.transition",
    ]);
    expect(actions).toContain("deprecate");
    expect(actions).toContain("updateRationale");
    expect(actions).not.toContain("activate");
    expect(actions).not.toContain("retire");
  });

  it("retired yields no mutating actions", () => {
    const actions = computeQepRelationshipAvailableActions("retired", [
      "qep.requirements.relationships.modify",
      "qep.requirements.relationships.transition",
      "qep.requirements.relationships.retire",
    ]);
    expect(actions).toEqual([]);
  });

  it("view-only permissions yield no actions", () => {
    const actions = computeQepRelationshipAvailableActions("draft", [
      "qep.requirements.relationships.view",
    ]);
    expect(actions).toEqual([]);
  });
});
