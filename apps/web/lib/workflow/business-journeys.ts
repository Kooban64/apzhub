/**
 * APZ Workflow — Business Journey Catalogue (N-03).
 * Describes business intent only. No execution / provider / engine design.
 */

export type BusinessJourney = {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  readonly outcomes: readonly string[];
  readonly typicalParticipants: readonly string[];
};

/**
 * Catalogue organised around business journeys (Workflow Test: no software nouns).
 */
export const BUSINESS_JOURNEY_CATALOGUE: readonly BusinessJourney[] = [
  {
    id: "employee-onboarding",
    name: "Employee Onboarding",
    summary: "Bring a new colleague from offer accepted to productive first weeks.",
    outcomes: [
      "Account ready",
      "Access granted",
      "Buddy assigned",
      "Onboarding complete",
    ],
    typicalParticipants: ["Hiring manager", "People ops", "IT", "New hire"],
  },
  {
    id: "customer-complaint-resolution",
    name: "Customer Complaint Resolution",
    summary:
      "Receive, investigate, and resolve a customer complaint with clear ownership.",
    outcomes: ["Complaint logged", "Owner assigned", "Resolution agreed", "Closed"],
    typicalParticipants: ["Service agent", "Service lead", "Customer"],
  },
  {
    id: "project-approval",
    name: "Project Approval",
    summary:
      "Decide whether a proposed project should proceed and under what conditions.",
    outcomes: ["Proposal reviewed", "Decision recorded", "Work authorised or declined"],
    typicalParticipants: ["Requester", "Sponsor", "Approver"],
  },
  {
    id: "procurement-request",
    name: "Procurement Request",
    summary: "Request, review, and approve a purchase within organisational policy.",
    outcomes: ["Request submitted", "Budget check", "Approval", "Order authorised"],
    typicalParticipants: ["Requester", "Budget owner", "Procurement"],
  },
  {
    id: "leave-approval",
    name: "Leave Approval",
    summary: "Request time away and receive a clear approve or decline decision.",
    outcomes: ["Request submitted", "Coverage noted", "Decision", "Calendar updated"],
    typicalParticipants: ["Employee", "Manager"],
  },
  {
    id: "contract-review",
    name: "Contract Review",
    summary:
      "Review a contract, capture decisions, and reach an approved or returned outcome.",
    outcomes: [
      "Contract received",
      "Review complete",
      "Decision",
      "Signed or returned",
    ],
    typicalParticipants: ["Owner", "Legal / reviewer", "Approver"],
  },
  {
    id: "quality-review",
    name: "Quality Review",
    summary:
      "Complete a quality review with evidence and a clear pass or remediation outcome.",
    outcomes: [
      "Review opened",
      "Evidence attached",
      "Findings",
      "Complete or remediation",
    ],
    typicalParticipants: ["Author", "Reviewer", "Quality lead"],
  },
] as const;

export function getBusinessJourney(id: string): BusinessJourney | undefined {
  return BUSINESS_JOURNEY_CATALOGUE.find((journey) => journey.id === id);
}
