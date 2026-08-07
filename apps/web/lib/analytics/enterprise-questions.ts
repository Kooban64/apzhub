/**
 * APZ Analytics — Enterprise Question Catalogue (N-03 Decision Companion).
 * Questions define the product. Dashboards are answers, not destinations.
 * Sourced from APPROVED ENTERPRISE-QUESTIONS + INSIGHT-HORIZONS.
 */

import type { AnalyticsSuiteKey } from "./routes";

export type InsightHorizon = "operational" | "tactical" | "strategic";

export type QuestionDomain =
  "projects" | "support" | "time" | "workflow" | "quality" | "portfolio" | "enterprise";

export type EnterpriseQuestion = {
  readonly id: string;
  readonly question: string;
  readonly domain: QuestionDomain;
  readonly horizon: InsightHorizon;
  readonly whyItMatters: string;
  readonly whatChanged: string;
  readonly possibleActions: readonly string[];
  readonly relatedProducts: readonly string[];
  readonly supportingEvidence: string;
  /** Curated insight answer surface (presentation) — never product identity. */
  readonly answerSuite?: AnalyticsSuiteKey;
};

export const INSIGHT_HORIZONS: readonly {
  readonly id: InsightHorizon;
  readonly title: string;
  readonly prompt: string;
  readonly description: string;
}[] = [
  {
    id: "operational",
    title: "Operational",
    prompt: "What is happening today?",
    description: "Attention, risk, and intervention needed now.",
  },
  {
    id: "tactical",
    title: "Tactical",
    prompt: "What changed?",
    description: "Trends, improvement, and emerging patterns this period.",
  },
  {
    id: "strategic",
    title: "Strategic",
    prompt: "What should we do?",
    description: "Investment, capability, and Product Board decisions.",
  },
] as const;

export const QUESTION_DOMAINS: readonly {
  readonly id: QuestionDomain;
  readonly title: string;
}[] = [
  { id: "projects", title: "Projects" },
  { id: "support", title: "Support" },
  { id: "time", title: "Time" },
  { id: "workflow", title: "Workflow" },
  { id: "quality", title: "Quality" },
  { id: "portfolio", title: "Portfolio" },
  { id: "enterprise", title: "Enterprise" },
] as const;

/**
 * Enterprise Question Catalogue — business questions before visualisations.
 */
export const ENTERPRISE_QUESTION_CATALOGUE: readonly EnterpriseQuestion[] = [
  {
    id: "EQ-E01",
    question: "Are projects healthy?",
    domain: "projects",
    horizon: "operational",
    whyItMatters: "Leaders need a clear signal before they intervene in delivery.",
    whatChanged: "Compare current project health against the previous review window.",
    possibleActions: [
      "Escalate at-risk projects in APZ Projects",
      "Rebalance workload across teams",
      "Ask sponsors to remove a blocker",
    ],
    relatedProducts: ["APZ Projects", "APZ Workflow"],
    supportingEvidence: "Project health and open-work indicators from Projects.",
    answerSuite: "projects",
  },
  {
    id: "EQ-E02",
    question: "Where is work blocked?",
    domain: "projects",
    horizon: "operational",
    whyItMatters: "Blocked work is the fastest path to missed commitments.",
    whatChanged: "See which work items entered or left blocked state recently.",
    possibleActions: [
      "Unblock owners in APZ Projects",
      "Start a related business process in APZ Workflow",
      "Request a decision from the responsible approver",
    ],
    relatedProducts: ["APZ Projects", "APZ Workflow", "APZ Support"],
    supportingEvidence: "Blocked work and dependency signals from Projects.",
    answerSuite: "operational",
  },
  {
    id: "EQ-E03",
    question: "Which teams are overloaded?",
    domain: "enterprise",
    horizon: "operational",
    whyItMatters: "Overload predicts quality risk and delivery slip.",
    whatChanged: "Capacity pressure versus last week’s load.",
    possibleActions: [
      "Redistribute work in APZ Projects",
      "Review effort distribution in APZ Time",
      "Defer lower-priority work",
    ],
    relatedProducts: ["APZ Projects", "APZ Time"],
    supportingEvidence: "Workload and effort indicators across Projects and Time.",
    answerSuite: "executive",
  },
  {
    id: "EQ-P01",
    question: "Which projects are at risk?",
    domain: "projects",
    horizon: "operational",
    whyItMatters: "Early risk visibility lets leaders intervene before failure.",
    whatChanged: "Projects newly entering at-risk status.",
    possibleActions: [
      "Open the project in APZ Projects",
      "Schedule a recovery review",
      "Adjust scope or timeline with the sponsor",
    ],
    relatedProducts: ["APZ Projects"],
    supportingEvidence: "At-risk and intervention signals from Projects.",
    answerSuite: "projects",
  },
  {
    id: "EQ-M03",
    question: "Are SLAs improving?",
    domain: "support",
    horizon: "operational",
    whyItMatters: "SLA risk is a customer-trust signal that needs action today.",
    whatChanged: "SLA breach and near-breach movement versus the prior period.",
    possibleActions: [
      "Prioritise tickets in APZ Support",
      "Reassign overloaded queues",
      "Raise a process change in APZ Workflow",
    ],
    relatedProducts: ["APZ Support"],
    supportingEvidence: "SLA and queue indicators from Support.",
    answerSuite: "support",
  },
  {
    id: "EQ-OP01",
    question: "What needs attention today?",
    domain: "enterprise",
    horizon: "operational",
    whyItMatters:
      "A single attention list prevents leaders from hunting across dashboards.",
    whatChanged: "Items that newly require attention since yesterday.",
    possibleActions: [
      "Act on the highest-risk item first",
      "Delegate follow-up in the related product",
      "Defer non-critical noise",
    ],
    relatedProducts: ["APZ Projects", "APZ Support", "APZ Time", "APZ Workflow"],
    supportingEvidence: "Cross-product operational attention signals.",
    answerSuite: "operational",
  },
  {
    id: "EQ-M01",
    question: "Is delivery improving?",
    domain: "projects",
    horizon: "tactical",
    whyItMatters: "Trend direction tells managers whether interventions are working.",
    whatChanged: "Delivery movement this week versus the prior period.",
    possibleActions: [
      "Reinforce practices that improved throughput",
      "Investigate areas that slowed",
      "Adjust the tactical plan with project leads",
    ],
    relatedProducts: ["APZ Projects"],
    supportingEvidence: "Delivery trend indicators from Projects.",
    answerSuite: "projects",
  },
  {
    id: "EQ-M02",
    question: "Where are bottlenecks?",
    domain: "workflow",
    horizon: "tactical",
    whyItMatters: "Bottlenecks explain delay without blaming individual teams.",
    whatChanged: "Stages or queues where wait time increased.",
    possibleActions: [
      "Inspect the related process in APZ Workflow",
      "Rebalance participants",
      "Remove a policy or approval friction",
    ],
    relatedProducts: ["APZ Workflow", "APZ Projects"],
    supportingEvidence: "Throughput and wait signals across Workflow and Projects.",
    answerSuite: "operational",
  },
  {
    id: "EQ-S01",
    question: "What causes repeat incidents?",
    domain: "support",
    horizon: "tactical",
    whyItMatters: "Repeat incidents waste capacity and erode trust.",
    whatChanged: "Recurring incident patterns emerging this period.",
    possibleActions: [
      "Open a lasting fix in APZ Projects",
      "Update the support process in APZ Workflow",
      "Capture knowledge in APZ Documents",
    ],
    relatedProducts: ["APZ Support", "APZ Projects", "APZ Documents"],
    supportingEvidence: "Incident recurrence signals from Support.",
    answerSuite: "support",
  },
  {
    id: "EQ-W01",
    question: "Which processes create the most delay?",
    domain: "workflow",
    horizon: "tactical",
    whyItMatters: "Process delay is a governance issue, not a tooling issue.",
    whatChanged: "Processes with rising lead time this period.",
    possibleActions: [
      "Review the journey in APZ Workflow",
      "Simplify approvals",
      "Clarify ownership of slow stages",
    ],
    relatedProducts: ["APZ Workflow"],
    supportingEvidence: "Process delay indicators from Workflow.",
    answerSuite: "operational",
  },
  {
    id: "EQ-T01",
    question: "Where is effort being spent?",
    domain: "time",
    horizon: "tactical",
    whyItMatters: "Effort allocation reveals whether work matches strategy.",
    whatChanged: "Shift in effort across products and initiatives.",
    possibleActions: [
      "Rebalance capacity in APZ Time and Projects",
      "Stop low-value work",
      "Fund overloaded value streams",
    ],
    relatedProducts: ["APZ Time", "APZ Projects"],
    supportingEvidence: "Effort distribution from Time.",
    answerSuite: "time",
  },
  {
    id: "EQ-TC01",
    question: "What changed this week?",
    domain: "enterprise",
    horizon: "tactical",
    whyItMatters: "Leaders need a concise change narrative, not a chart gallery.",
    whatChanged: "Material movements across delivery, support, and capacity.",
    possibleActions: [
      "Investigate the largest negative change",
      "Celebrate and reinforce positive movement",
      "Brief stakeholders with evidence",
    ],
    relatedProducts: ["APZ Projects", "APZ Support", "APZ Time", "APZ Workflow"],
    supportingEvidence: "Week-over-week change across operational products.",
    answerSuite: "executive",
  },
  {
    id: "EQ-Q01",
    question: "Are releases becoming safer?",
    domain: "quality",
    horizon: "strategic",
    whyItMatters: "Release safety is a capability maturity signal for the board.",
    whatChanged: "Quality trend across recent releases.",
    possibleActions: [
      "Invest in quality capability",
      "Tighten release governance",
      "Fund remediation of systemic defects",
    ],
    relatedProducts: ["APZ Projects", "APZ Support"],
    supportingEvidence: "Release and quality indicators (metadata).",
    answerSuite: "repository-metrics",
  },
  {
    id: "EQ-ST01",
    question: "Which investments produce the greatest value?",
    domain: "portfolio",
    horizon: "strategic",
    whyItMatters: "Investment choices should follow evidenced value, not habit.",
    whatChanged: "Relative value signals across the portfolio.",
    possibleActions: [
      "Reprioritise the portfolio with the Product Board",
      "Protect high-value streams",
      "Sunset low-value work",
    ],
    relatedProducts: ["APZ Projects", "APZ Time"],
    supportingEvidence: "Portfolio value and effort signals.",
    answerSuite: "executive",
  },
  {
    id: "EQ-ST02",
    question: "Which capability requires attention?",
    domain: "enterprise",
    horizon: "strategic",
    whyItMatters: "Capability gaps compound into systemic risk.",
    whatChanged: "Capability areas trending worse or stagnant.",
    possibleActions: [
      "Fund a capability improvement initiative",
      "Assign an owner in APZ Projects",
      "Review related processes in APZ Workflow",
    ],
    relatedProducts: ["APZ Projects", "APZ Workflow", "APZ Support"],
    supportingEvidence: "Cross-product capability health signals.",
    answerSuite: "platform-health",
  },
  {
    id: "EQ-ST03",
    question: "What should the Product Board discuss?",
    domain: "portfolio",
    horizon: "strategic",
    whyItMatters: "The board needs a decision agenda — not a dashboard tour.",
    whatChanged: "Material risks, opportunities, and trade-offs this quarter.",
    possibleActions: [
      "Set the board agenda from the top risks and opportunities",
      "Request deeper evidence on one question",
      "Record decisions and owners",
    ],
    relatedProducts: ["APZ Projects", "APZ Support", "APZ Time", "APZ Workflow"],
    supportingEvidence: "Strategic risks, opportunities, and trends.",
    answerSuite: "executive",
  },
] as const;

export function getEnterpriseQuestion(id: string): EnterpriseQuestion | undefined {
  return ENTERPRISE_QUESTION_CATALOGUE.find((item) => item.id === id);
}

export function listQuestionsByHorizon(
  horizon: InsightHorizon,
): readonly EnterpriseQuestion[] {
  return ENTERPRISE_QUESTION_CATALOGUE.filter((item) => item.horizon === horizon);
}

export function listQuestionsByDomain(
  domain: QuestionDomain,
): readonly EnterpriseQuestion[] {
  return ENTERPRISE_QUESTION_CATALOGUE.filter((item) => item.domain === domain);
}

export function getInsightHorizon(id: string) {
  return INSIGHT_HORIZONS.find((horizon) => horizon.id === id);
}

export function isInsightHorizon(value: string): value is InsightHorizon {
  return INSIGHT_HORIZONS.some((horizon) => horizon.id === value);
}
