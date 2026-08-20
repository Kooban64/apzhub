import { PROPOSAL_TYPES, type ProposalStatus, type ProposalType } from "./types";

export function isProposalType(value: string): value is ProposalType {
  return (PROPOSAL_TYPES as readonly string[]).includes(value);
}

export function requireText(value: string | undefined, code: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) throw new Error(code);
  return trimmed;
}

export function assertSameTenant(expected: string, actual: string): void {
  if (expected !== actual) throw new Error("ai.isolation.tenant");
}

export function assertSameApplication(expected: string, actual: string): void {
  if (expected !== actual) throw new Error("ai.isolation.application");
}

export function assertPending(status: ProposalStatus): void {
  if (status !== "pending" && status !== "modified") {
    throw new Error("ai.proposal.not_reviewable");
  }
}

export const DESTINATION_PERMISSION: Record<ProposalType, string | null> = {
  user_story: "qep.requirements.create",
  acceptance_criterion: "qep.requirements.create",
  test_case: "qep.specification.create",
  suite: "qep.suites.create",
  test_plan: "qep.plan.create",
  exploratory_charter: "qep.exploratory.manage",
  ui_ux_criteria: "qep.experience.manage",
  trace_link: "qep.traceability.trace_links.create",
  quality_risk: null,
  issue: "qep.experience.manage",
  defect: null,
  gate_evaluation: null,
  certification: null,
};

export function acceptActionFor(proposalType: ProposalType): "accept" | "forbidden" {
  return DESTINATION_PERMISSION[proposalType] ? "accept" : "forbidden";
}
