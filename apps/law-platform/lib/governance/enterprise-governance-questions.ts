/**
 * APZ Law — Enterprise Governance Question Catalogue (N-03 Governance Companion).
 * Questions define the product. Practice administration does not.
 * Sourced from APPROVED ENTERPRISE-GOVERNANCE-QUESTIONS.
 */

export type GovernanceCapability =
  | "policies"
  | "obligations"
  | "compliance"
  | "approvals"
  | "regulatory"
  | "retention"
  | "evidence";

export type GovernanceQuestion = {
  readonly id: string;
  readonly question: string;
  readonly capability: GovernanceCapability;
  readonly whyItMatters: string;
  readonly appliesToWork: string;
  readonly possibleActions: readonly string[];
  readonly relatedProducts: readonly string[];
  readonly supportingEvidence: string;
};

export const GOVERNANCE_CAPABILITIES: readonly {
  readonly id: GovernanceCapability;
  readonly title: string;
  readonly summary: string;
}[] = [
  {
    id: "policies",
    title: "Policies",
    summary: "Which policies govern enterprise actions.",
  },
  {
    id: "obligations",
    title: "Obligations",
    summary: "What the organisation must do or not do.",
  },
  {
    id: "compliance",
    title: "Compliance Requirements",
    summary: "Requirements that keep work within obligations.",
  },
  {
    id: "approvals",
    title: "Approvals",
    summary: "Governance approvals required before action.",
  },
  {
    id: "regulatory",
    title: "Regulatory Duties",
    summary: "Regulatory requirements relevant to a context.",
  },
  {
    id: "retention",
    title: "Retention",
    summary: "What evidence and records must be kept.",
  },
  {
    id: "evidence",
    title: "Governance Evidence",
    summary: "Evidence retained to demonstrate compliance.",
  },
] as const;

/**
 * Home attention prompts — organise the Governance Companion entry.
 */
export const GOVERNANCE_HOME_PROMPTS: readonly {
  readonly id: string;
  readonly prompt: string;
  readonly relatedQuestionIds: readonly string[];
}[] = [
  {
    id: "obligations-today",
    prompt: "What obligations apply today?",
    relatedQuestionIds: ["GQ-02"],
  },
  {
    id: "approvals-outstanding",
    prompt: "Which approvals are outstanding?",
    relatedQuestionIds: ["GQ-01", "GQ-03"],
  },
  {
    id: "policies-affecting-work",
    prompt: "Which policies affect my work?",
    relatedQuestionIds: ["GQ-03"],
  },
  {
    id: "compliance-attention",
    prompt: "What compliance actions require attention?",
    relatedQuestionIds: ["GQ-01", "GQ-02", "GQ-05"],
  },
  {
    id: "governance-risks",
    prompt: "Which governance risks need review?",
    relatedQuestionIds: ["GQ-01", "GQ-05"],
  },
] as const;

export const ENTERPRISE_GOVERNANCE_QUESTION_CATALOGUE: readonly GovernanceQuestion[] = [
  {
    id: "GQ-01",
    question: "Are we allowed to do this?",
    capability: "approvals",
    whyItMatters: "Action without knowing permission creates organisational risk.",
    appliesToWork:
      "Ask before starting or changing work in Projects, Support, or Workflow.",
    possibleActions: [
      "Review applicable policies",
      "Request required approvals",
      "Defer action until obligations are clear",
    ],
    relatedProducts: ["APZ Projects", "APZ Workflow", "APZ Support"],
    supportingEvidence: "Policy applicability and approval status.",
  },
  {
    id: "GQ-02",
    question: "What obligations apply?",
    capability: "obligations",
    whyItMatters:
      "Obligations tell teams what must be done — not merely what is convenient.",
    appliesToWork: "Attach obligations to the business activity being performed.",
    possibleActions: [
      "List applicable obligations for the activity",
      "Assign owners for open obligations",
      "Escalate conflicting obligations",
    ],
    relatedProducts: ["APZ Projects", "APZ Workflow", "APZ Documents"],
    supportingEvidence: "Obligation catalogue linked to work context.",
  },
  {
    id: "GQ-03",
    question: "Which policies govern this action?",
    capability: "policies",
    whyItMatters: "Clear policy ownership prevents tribal compliance.",
    appliesToWork: "Surface the governing policy when a user is about to act.",
    possibleActions: [
      "Open the governing policy",
      "Confirm policy version in force",
      "Start a policy review if outdated",
    ],
    relatedProducts: ["APZ Workflow", "APZ Projects", "APZ Documents"],
    supportingEvidence: "Policy catalogue and applicability rules.",
  },
  {
    id: "GQ-04",
    question: "What evidence must be retained?",
    capability: "retention",
    whyItMatters: "Retention requirements are governance — not filing preference.",
    appliesToWork: "Documents and quality evidence must know retention before archive.",
    possibleActions: [
      "Apply retention requirement to the artefact",
      "Confirm evidence location",
      "Schedule retention review",
    ],
    relatedProducts: ["APZ Documents", "APZQEP", "APZ Support"],
    supportingEvidence: "Retention schedules and governance evidence records.",
  },
  {
    id: "GQ-05",
    question: "Which regulatory requirements are relevant?",
    capability: "regulatory",
    whyItMatters: "Teams need relevance signals — not automated legal advice.",
    appliesToWork:
      "Highlight regulatory duties that may apply to the activity context.",
    possibleActions: [
      "Review relevant regulatory duties",
      "Involve counsel for interpretation",
      "Record attestation when required",
    ],
    relatedProducts: ["APZ Support", "APZ Projects", "APZQEP"],
    supportingEvidence: "Regulatory duty catalogue (reference, not advice).",
  },
] as const;

export function getGovernanceQuestion(id: string): GovernanceQuestion | undefined {
  return ENTERPRISE_GOVERNANCE_QUESTION_CATALOGUE.find((item) => item.id === id);
}

export function listQuestionsByCapability(
  capability: GovernanceCapability,
): readonly GovernanceQuestion[] {
  return ENTERPRISE_GOVERNANCE_QUESTION_CATALOGUE.filter(
    (item) => item.capability === capability,
  );
}

export function getGovernanceCapability(id: string) {
  return GOVERNANCE_CAPABILITIES.find((item) => item.id === id);
}
