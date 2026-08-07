import type { BusinessProcessTemplate } from "@apzhub/platform-service-contracts";

type SeedTemplate = Omit<BusinessProcessTemplate, "id">;

/**
 * Wave A template library — business language only.
 * Keys are stable; versions bump when seeded content changes.
 */
export const BUSINESS_PROCESS_TEMPLATE_SEEDS: readonly SeedTemplate[] = [
  {
    key: "project-approval",
    name: "Project Approval",
    summary:
      "Decide whether a proposed project should proceed and under what conditions.",
    defaultOutcomes: Object.freeze([
      "Proposal reviewed",
      "Decision recorded",
      "Work authorised or declined",
    ]),
    defaultStages: Object.freeze([
      {
        name: "Request submitted",
        order: 1,
        responsibility: "Requester",
        entryCondition: "Proposal available",
      },
      {
        name: "Sponsor review",
        order: 2,
        responsibility: "Sponsor",
        exitCondition: "Recommendation ready",
      },
      {
        name: "Approval decision",
        order: 3,
        responsibility: "Approver",
        exitCondition: "Decision recorded",
      },
    ]),
    defaultTransitions: Object.freeze([
      { name: "Submit for sponsor review", outcome: "In review" },
      { name: "Recommend decision", outcome: "Ready for approval" },
      { name: "Record decision", outcome: "Complete" },
    ]),
    version: 1,
    editable: true,
  },
  {
    key: "change-request",
    name: "Change Request",
    summary: "Assess and approve a change to an agreed delivery baseline.",
    defaultOutcomes: Object.freeze([
      "Impact assessed",
      "Decision recorded",
      "Baseline updated or declined",
    ]),
    defaultStages: Object.freeze([
      { name: "Change raised", order: 1, responsibility: "Requester" },
      { name: "Impact assessment", order: 2, responsibility: "Change steward" },
      { name: "Change decision", order: 3, responsibility: "Approver" },
    ]),
    defaultTransitions: Object.freeze([
      { name: "Assess impact", outcome: "Assessed" },
      { name: "Decide change", outcome: "Approved or declined" },
    ]),
    version: 1,
    editable: true,
  },
  {
    key: "incident-resolution",
    name: "Incident Resolution",
    summary:
      "Receive, investigate, and resolve an operational incident with clear ownership.",
    defaultOutcomes: Object.freeze([
      "Incident logged",
      "Owner assigned",
      "Resolution agreed",
      "Closed",
    ]),
    defaultStages: Object.freeze([
      { name: "Logged", order: 1, responsibility: "Service agent" },
      { name: "Investigation", order: 2, responsibility: "Service lead" },
      { name: "Resolution", order: 3, responsibility: "Owner" },
      {
        name: "Closed",
        order: 4,
        responsibility: "Service lead",
        exitCondition: "Customer informed",
      },
    ]),
    defaultTransitions: Object.freeze([
      { name: "Assign for investigation", outcome: "Owned" },
      { name: "Propose resolution", outcome: "Resolved pending close" },
      { name: "Close incident", outcome: "Closed" },
    ]),
    version: 1,
    editable: true,
  },
  {
    key: "employee-onboarding",
    name: "Employee Onboarding",
    summary: "Bring a new colleague from offer accepted to productive first weeks.",
    defaultOutcomes: Object.freeze([
      "Account ready",
      "Access granted",
      "Buddy assigned",
      "Onboarding complete",
    ]),
    defaultStages: Object.freeze([
      { name: "Offer accepted", order: 1, responsibility: "People ops" },
      { name: "Access prepared", order: 2, responsibility: "IT" },
      { name: "First-week support", order: 3, responsibility: "Hiring manager" },
      { name: "Onboarding complete", order: 4, responsibility: "People ops" },
    ]),
    defaultTransitions: Object.freeze([
      { name: "Prepare access", outcome: "Ready for day one" },
      { name: "Start first week", outcome: "Supported" },
      { name: "Confirm complete", outcome: "Complete" },
    ]),
    version: 1,
    editable: true,
  },
  {
    key: "procurement",
    name: "Procurement",
    summary: "Request, review, and approve a purchase within organisational policy.",
    defaultOutcomes: Object.freeze([
      "Request submitted",
      "Budget check",
      "Approval",
      "Order authorised",
    ]),
    defaultStages: Object.freeze([
      { name: "Request submitted", order: 1, responsibility: "Requester" },
      { name: "Budget check", order: 2, responsibility: "Budget owner" },
      { name: "Procurement approval", order: 3, responsibility: "Procurement" },
    ]),
    defaultTransitions: Object.freeze([
      { name: "Check budget", outcome: "Budget confirmed" },
      { name: "Authorise order", outcome: "Order authorised" },
    ]),
    version: 1,
    editable: true,
  },
  {
    key: "leave-approval",
    name: "Leave Approval",
    summary: "Request time away and receive a clear approve or decline decision.",
    defaultOutcomes: Object.freeze([
      "Request submitted",
      "Coverage noted",
      "Decision",
      "Calendar updated",
    ]),
    defaultStages: Object.freeze([
      { name: "Request submitted", order: 1, responsibility: "Employee" },
      { name: "Manager review", order: 2, responsibility: "Manager" },
      { name: "Decision recorded", order: 3, responsibility: "Manager" },
    ]),
    defaultTransitions: Object.freeze([
      { name: "Send for review", outcome: "In review" },
      { name: "Record decision", outcome: "Approved or declined" },
    ]),
    version: 1,
    editable: true,
  },
  {
    key: "contract-review",
    name: "Contract Review",
    summary:
      "Review a contract, capture decisions, and reach an approved or returned outcome.",
    defaultOutcomes: Object.freeze([
      "Contract received",
      "Review complete",
      "Decision",
      "Signed or returned",
    ]),
    defaultStages: Object.freeze([
      { name: "Contract received", order: 1, responsibility: "Owner" },
      { name: "Legal review", order: 2, responsibility: "Legal / reviewer" },
      { name: "Approval decision", order: 3, responsibility: "Approver" },
    ]),
    defaultTransitions: Object.freeze([
      { name: "Start review", outcome: "In review" },
      { name: "Decide outcome", outcome: "Approved or returned" },
    ]),
    version: 1,
    editable: true,
  },
  {
    key: "quality-review",
    name: "Quality Review",
    summary:
      "Complete a quality review with evidence and a clear pass or remediation outcome.",
    defaultOutcomes: Object.freeze([
      "Review opened",
      "Evidence attached",
      "Findings",
      "Complete or remediation",
    ]),
    defaultStages: Object.freeze([
      { name: "Review opened", order: 1, responsibility: "Author" },
      { name: "Evidence review", order: 2, responsibility: "Reviewer" },
      { name: "Findings recorded", order: 3, responsibility: "Quality lead" },
    ]),
    defaultTransitions: Object.freeze([
      { name: "Attach evidence", outcome: "Ready for findings" },
      { name: "Record findings", outcome: "Pass or remediation" },
    ]),
    version: 1,
    editable: true,
  },
] as const;
