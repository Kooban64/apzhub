import type { LifecyclePolicy } from "@apzhub/lifecycle-engine";

import type { RequirementStatus } from "../value-objects/requirement-status";

export const REQUIREMENT_LIFECYCLE_POLICY_ID = "qep.requirement.lifecycle";

export const REQUIREMENT_LIFECYCLE_ACTIONS = [
  "submit",
  "review",
  "start_review",
  "approve",
  "reject",
  "mark_implemented",
  "mark_verified",
  "deprecate",
  "archive",
  "revise",
] as const;

export type RequirementLifecycleAction = (typeof REQUIREMENT_LIFECYCLE_ACTIONS)[number];

export const requirementLifecyclePolicy: LifecyclePolicy<RequirementStatus> = {
  id: REQUIREMENT_LIFECYCLE_POLICY_ID,
  states: [
    "draft",
    "proposed",
    "in_review",
    "approved",
    "rejected",
    "implemented",
    "verified",
    "deprecated",
    "archived",
  ],
  transitions: [
    { from: "draft", to: "proposed", action: "submit" },
    { from: "proposed", to: "in_review", action: "review" },
    { from: "proposed", to: "in_review", action: "start_review" },
    { from: "in_review", to: "approved", action: "approve" },
    { from: "in_review", to: "rejected", action: "reject" },
    { from: "approved", to: "implemented", action: "mark_implemented" },
    { from: "implemented", to: "verified", action: "mark_verified" },
    { from: "verified", to: "deprecated", action: "deprecate" },
    { from: "deprecated", to: "archived", action: "archive" },
    { from: "rejected", to: "draft", action: "revise" },
    { from: "rejected", to: "archived", action: "archive" },
  ],
  canTransition(from, to) {
    if (from === "archived") {
      return "Cannot transition from archived";
    }
    if (to === "verified" && from === "draft") {
      return "Cannot verify draft requirement";
    }
    if (to === "implemented" && from === "rejected") {
      return "Cannot implement rejected requirement";
    }
    if (to === "archived" && from !== "deprecated" && from !== "rejected") {
      return "Archive only allowed from deprecated or rejected";
    }
    return true;
  },
};

export const REQUIREMENT_LIFECYCLE_TRANSITION_MATRIX = requirementLifecyclePolicy.transitions;
