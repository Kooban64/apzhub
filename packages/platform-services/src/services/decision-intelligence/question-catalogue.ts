import type {
  DecisionAudienceRole,
  DecisionQuestion,
} from "@apzhub/platform-service-contracts";

/**
 * Expanded Executive Question Catalogue — role-grouped, evidence + actions.
 * Rule-based decision intelligence only (no AI).
 */
export const DECISION_QUESTION_CATALOGUE: readonly DecisionQuestion[] = [
  {
    id: "EQ-E01",
    question: "Are projects healthy?",
    audienceRoles: Object.freeze([
      "executive",
      "manager",
      "project_manager",
    ] as DecisionAudienceRole[]),
    domain: "projects",
    horizon: "operational",
    whyItMatters: "Leaders need a clear signal before they intervene in delivery.",
    evidenceSummary:
      "Project health, milestone status, and open-risk indicators from Projects.",
    recommendedActions: Object.freeze([
      "Escalate at-risk projects in APZ Projects",
      "Review blockers on the delivery dashboard",
      "Ask sponsors to remove a blocker",
    ]),
    relatedProducts: Object.freeze(["APZ Projects", "APZ Workflow"]),
  },
  {
    id: "EQ-E02",
    question: "Where is work blocked?",
    audienceRoles: Object.freeze([
      "executive",
      "manager",
      "project_manager",
      "team_member",
    ] as DecisionAudienceRole[]),
    domain: "projects",
    horizon: "operational",
    whyItMatters: "Blocked work is the fastest path to missed commitments.",
    evidenceSummary: "Blocked work and dependency signals from Projects.",
    recommendedActions: Object.freeze([
      "Unblock owners in APZ Projects",
      "Start a related business process in APZ Workflow",
      "Request a decision from the responsible approver",
    ]),
    relatedProducts: Object.freeze(["APZ Projects", "APZ Workflow", "APZ Support"]),
  },
  {
    id: "EQ-E03",
    question: "Which teams are overloaded?",
    audienceRoles: Object.freeze(["executive", "manager"] as DecisionAudienceRole[]),
    domain: "enterprise",
    horizon: "operational",
    whyItMatters: "Overload predicts quality risk and delivery slip.",
    evidenceSummary: "Workload and effort indicators across Projects and Time.",
    recommendedActions: Object.freeze([
      "Redistribute work in APZ Projects",
      "Review effort distribution in APZ Time",
      "Defer lower-priority work",
    ]),
    relatedProducts: Object.freeze(["APZ Projects", "APZ Time"]),
  },
  {
    id: "EQ-P01",
    question: "Which projects are at risk?",
    audienceRoles: Object.freeze([
      "executive",
      "project_manager",
      "manager",
    ] as DecisionAudienceRole[]),
    domain: "projects",
    horizon: "operational",
    whyItMatters: "Early risk visibility lets leaders intervene before failure.",
    evidenceSummary: "At-risk and intervention signals from Projects delivery health.",
    recommendedActions: Object.freeze([
      "Open the project delivery dashboard in APZ Projects",
      "Schedule a recovery review",
      "Adjust scope or timeline with the sponsor",
    ]),
    relatedProducts: Object.freeze(["APZ Projects"]),
  },
  {
    id: "EQ-M03",
    question: "Are SLAs improving?",
    audienceRoles: Object.freeze([
      "executive",
      "support_manager",
      "manager",
    ] as DecisionAudienceRole[]),
    domain: "support",
    horizon: "operational",
    whyItMatters: "SLA risk is a customer-trust signal that needs action today.",
    evidenceSummary: "SLA and queue indicators from Support (derived insight).",
    recommendedActions: Object.freeze([
      "Prioritise tickets in APZ Support",
      "Reassign overloaded queues",
      "Raise a process change in APZ Workflow",
    ]),
    relatedProducts: Object.freeze(["APZ Support", "APZ Workflow"]),
  },
  {
    id: "EQ-OP01",
    question: "What needs attention today?",
    audienceRoles: Object.freeze([
      "executive",
      "manager",
      "team_member",
    ] as DecisionAudienceRole[]),
    domain: "enterprise",
    horizon: "operational",
    whyItMatters:
      "A single attention list prevents leaders from hunting across dashboards.",
    evidenceSummary: "Cross-product operational attention signals.",
    recommendedActions: Object.freeze([
      "Act on the highest-risk item first",
      "Delegate follow-up in the related product",
      "Defer non-critical noise",
    ]),
    relatedProducts: Object.freeze([
      "APZ Projects",
      "APZ Support",
      "APZ Time",
      "APZ Workflow",
    ]),
  },
  {
    id: "EQ-M01",
    question: "Is delivery improving?",
    audienceRoles: Object.freeze([
      "executive",
      "manager",
      "project_manager",
    ] as DecisionAudienceRole[]),
    domain: "projects",
    horizon: "tactical",
    whyItMatters: "Trend direction tells managers whether interventions are working.",
    evidenceSummary: "Delivery trend indicators from Projects (period-over-period).",
    recommendedActions: Object.freeze([
      "Reinforce practices that improved throughput",
      "Investigate areas that slowed",
      "Adjust the tactical plan with project leads",
    ]),
    relatedProducts: Object.freeze(["APZ Projects"]),
  },
  {
    id: "EQ-M02",
    question: "Where are bottlenecks?",
    audienceRoles: Object.freeze([
      "manager",
      "project_manager",
      "support_manager",
    ] as DecisionAudienceRole[]),
    domain: "workflow",
    horizon: "tactical",
    whyItMatters: "Bottlenecks explain delay without blaming individual teams.",
    evidenceSummary: "Throughput and wait signals across Workflow and Projects.",
    recommendedActions: Object.freeze([
      "Inspect the related process in APZ Workflow",
      "Rebalance participants",
      "Remove a policy or approval friction",
    ]),
    relatedProducts: Object.freeze(["APZ Workflow", "APZ Projects"]),
  },
  {
    id: "EQ-S01",
    question: "What causes repeat incidents?",
    audienceRoles: Object.freeze([
      "support_manager",
      "manager",
      "executive",
    ] as DecisionAudienceRole[]),
    domain: "support",
    horizon: "tactical",
    whyItMatters: "Repeat incidents waste capacity and erode trust.",
    evidenceSummary: "Incident recurrence signals from Support (derived insight).",
    recommendedActions: Object.freeze([
      "Open a lasting fix in APZ Projects",
      "Update the support process in APZ Workflow",
      "Capture knowledge in APZ Documents",
    ]),
    relatedProducts: Object.freeze(["APZ Support", "APZ Projects", "APZ Documents"]),
  },
  {
    id: "EQ-W01",
    question: "Which processes create the most delay?",
    audienceRoles: Object.freeze([
      "manager",
      "executive",
      "project_manager",
    ] as DecisionAudienceRole[]),
    domain: "workflow",
    horizon: "tactical",
    whyItMatters: "Process delay is a governance issue, not a tooling issue.",
    evidenceSummary: "Process delay indicators from Workflow monitoring.",
    recommendedActions: Object.freeze([
      "Review the journey in APZ Workflow",
      "Simplify approvals",
      "Clarify ownership of slow stages",
    ]),
    relatedProducts: Object.freeze(["APZ Workflow"]),
  },
  {
    id: "EQ-T01",
    question: "Where is effort being spent?",
    audienceRoles: Object.freeze([
      "executive",
      "manager",
      "team_member",
    ] as DecisionAudienceRole[]),
    domain: "time",
    horizon: "tactical",
    whyItMatters: "Effort allocation reveals whether work matches strategy.",
    evidenceSummary: "Effort distribution from Time (derived insight).",
    recommendedActions: Object.freeze([
      "Rebalance capacity in APZ Time and Projects",
      "Stop low-value work",
      "Fund overloaded value streams",
    ]),
    relatedProducts: Object.freeze(["APZ Time", "APZ Projects"]),
  },
  {
    id: "EQ-TC01",
    question: "What changed this week?",
    audienceRoles: Object.freeze(["executive", "manager"] as DecisionAudienceRole[]),
    domain: "enterprise",
    horizon: "tactical",
    whyItMatters: "Leaders need a concise change narrative, not a chart gallery.",
    evidenceSummary: "Week-over-week change across operational products.",
    recommendedActions: Object.freeze([
      "Investigate the largest negative change",
      "Celebrate and reinforce positive movement",
      "Brief stakeholders with evidence",
    ]),
    relatedProducts: Object.freeze([
      "APZ Projects",
      "APZ Support",
      "APZ Time",
      "APZ Workflow",
    ]),
  },
  {
    id: "EQ-Q01",
    question: "Are releases becoming safer?",
    audienceRoles: Object.freeze(["executive", "manager"] as DecisionAudienceRole[]),
    domain: "quality",
    horizon: "strategic",
    whyItMatters: "Release safety is a capability maturity signal for the board.",
    evidenceSummary: "Release and quality indicators (derived metadata).",
    recommendedActions: Object.freeze([
      "Invest in quality capability",
      "Tighten release governance",
      "Fund remediation of systemic defects",
    ]),
    relatedProducts: Object.freeze(["APZ Projects", "APZ Support"]),
  },
  {
    id: "EQ-ST01",
    question: "Which investments produce the greatest value?",
    audienceRoles: Object.freeze(["executive"] as DecisionAudienceRole[]),
    domain: "portfolio",
    horizon: "strategic",
    whyItMatters: "Investment choices should follow evidenced value, not habit.",
    evidenceSummary: "Portfolio value and effort signals (derived insight).",
    recommendedActions: Object.freeze([
      "Reprioritise the portfolio with the Product Board",
      "Protect high-value streams",
      "Sunset low-value work",
    ]),
    relatedProducts: Object.freeze(["APZ Projects", "APZ Time"]),
  },
  {
    id: "EQ-ST02",
    question: "Which capability requires attention?",
    audienceRoles: Object.freeze(["executive", "manager"] as DecisionAudienceRole[]),
    domain: "enterprise",
    horizon: "strategic",
    whyItMatters: "Capability gaps compound into systemic risk.",
    evidenceSummary: "Cross-product capability health signals.",
    recommendedActions: Object.freeze([
      "Fund a capability improvement initiative",
      "Assign an owner in APZ Projects",
      "Review related processes in APZ Workflow",
    ]),
    relatedProducts: Object.freeze(["APZ Projects", "APZ Workflow", "APZ Support"]),
  },
  {
    id: "EQ-ST03",
    question: "What should the Product Board discuss?",
    audienceRoles: Object.freeze(["executive"] as DecisionAudienceRole[]),
    domain: "portfolio",
    horizon: "strategic",
    whyItMatters: "The board needs a decision agenda — not a dashboard tour.",
    evidenceSummary: "Strategic risks, opportunities, and trends.",
    recommendedActions: Object.freeze([
      "Set the board agenda from the top risks and opportunities",
      "Request deeper evidence on one question",
      "Record decisions and owners on the decision timeline",
    ]),
    relatedProducts: Object.freeze([
      "APZ Projects",
      "APZ Support",
      "APZ Time",
      "APZ Workflow",
    ]),
  },
  {
    id: "EQ-TM01",
    question: "What should I focus on today?",
    audienceRoles: Object.freeze(["team_member"] as DecisionAudienceRole[]),
    domain: "enterprise",
    horizon: "operational",
    whyItMatters: "Individuals need a clear priority signal without dashboard sprawl.",
    evidenceSummary: "My Work attention signals and open commitments.",
    recommendedActions: Object.freeze([
      "Complete the highest-priority open item in My Work",
      "Unblock a colleague if you own a dependency",
      "Escalate only when a commitment is at risk",
    ]),
    relatedProducts: Object.freeze(["APZ Projects", "APZ Support", "APZ Workflow"]),
  },
  {
    id: "EQ-SM01",
    question: "Is the support queue under control?",
    audienceRoles: Object.freeze([
      "support_manager",
      "manager",
    ] as DecisionAudienceRole[]),
    domain: "support",
    horizon: "operational",
    whyItMatters: "Queue control protects customer experience and agent capacity.",
    evidenceSummary: "Queue depth and ageing indicators from Support (derived).",
    recommendedActions: Object.freeze([
      "Rebalance agent load in APZ Support",
      "Escalate aged tickets",
      "Start an incident-resolution journey in APZ Workflow",
    ]),
    relatedProducts: Object.freeze(["APZ Support", "APZ Workflow"]),
  },
  {
    id: "EQ-PM01",
    question: "Are milestones on track?",
    audienceRoles: Object.freeze([
      "project_manager",
      "manager",
    ] as DecisionAudienceRole[]),
    domain: "projects",
    horizon: "operational",
    whyItMatters: "Milestone slip is an early delivery-risk signal.",
    evidenceSummary: "Milestone progress and overdue indicators from Projects.",
    recommendedActions: Object.freeze([
      "Review the delivery dashboard in APZ Projects",
      "Re-sequence dependent work",
      "Record a recovery decision on the timeline",
    ]),
    relatedProducts: Object.freeze(["APZ Projects"]),
  },
] as const;

export function listDecisionQuestionsByRole(
  role?: DecisionAudienceRole,
): readonly DecisionQuestion[] {
  if (!role) return DECISION_QUESTION_CATALOGUE;
  return DECISION_QUESTION_CATALOGUE.filter((q) => q.audienceRoles.includes(role));
}

export function getDecisionQuestion(id: string): DecisionQuestion | undefined {
  return DECISION_QUESTION_CATALOGUE.find((q) => q.id === id);
}
