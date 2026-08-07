import type {
  ReportCatalogueKey,
  ReportDefinition,
} from "@apzhub/platform-service-contracts";

export const REPORT_DEFINITIONS: Record<ReportCatalogueKey, ReportDefinition> = {
  exceptions: {
    key: "exceptions",
    question: "What exceptions threaten delivery?",
    audience: "PM · PMO · Delivery Lead",
    inputs: "Exceptions by severity · age · outcome · scope",
    visual: "Severity table + ageing",
    drillHint: "Exception → unified timeline",
  },
  decision_latency: {
    key: "decision_latency",
    question: "Where are decisions stalling?",
    audience: "PM · Programme · PMO",
    inputs: "Pending decisions · age · level",
    visual: "Pending latency table",
    drillHint: "Decision conversation / timeline",
  },
  baseline_variance: {
    key: "baseline_variance",
    question: "Where has plan diverged from baseline?",
    audience: "PM · PMO",
    inputs: "Milestone/commitment variance · re-baseline history",
    visual: "Variance table",
    drillHint: "Milestone surface · baseline history",
  },
  forecast: {
    key: "forecast",
    question: "What is the 7/14/30 outlook?",
    audience: "PM · Executive · PMO",
    inputs: "Forecast shape — outcome · confidence · factors · actions",
    visual: "Explainable forecast bands",
    drillHint: "Factors → source objects",
  },
  trend: {
    key: "trend",
    question: "How are Health, Confidence, Exceptions, Waits moving?",
    audience: "PMO · Executive",
    inputs: "Operational indicator period deltas",
    visual: "Sparse period deltas",
    drillHint: "Indicator → live Scorecard/Cockpit",
  },
  waiting_ageing: {
    key: "waiting_ageing",
    question: "Where is the portfolio stuck on parties?",
    audience: "PM · PMO",
    inputs: "Waiting by category · age · chase owner",
    visual: "Ageing table",
    drillHint: "Waiting object surface",
  },
  governance_checkpoints: {
    key: "governance_checkpoints",
    question: "Gate status and waiver load?",
    audience: "Governance Lead · PMO",
    inputs: "Checkpoints · waivers · rejected · pending Workflow",
    visual: "Checkpoint status table",
    drillHint: "Checkpoint / Control surface",
  },
  delivery_capacity: {
    key: "delivery_capacity",
    question: "Where is delivery ability constrained?",
    audience: "PMO · Delivery Lead",
    inputs: "Delivery Capacity · Team Health · overload (indicative)",
    visual: "Capacity band table",
    drillHint: "Team surface",
  },
  strategic_objective_progress: {
    key: "strategic_objective_progress",
    question: "Are objectives on track?",
    audience: "Executive · PMO",
    inputs: "Objectives · contributing projects · status",
    visual: "Objective progress table",
    drillHint: "Portfolio Scorecard objective",
  },
  accountability_gaps: {
    key: "accountability_gaps",
    question: "Where is ownership missing or concentrated?",
    audience: "PMO · Delivery Lead",
    inputs: "Responsibility Matrix gaps · continuity cases",
    visual: "Gap table",
    drillHint: "Control Responsibility Matrix",
  },
};

export function listReportDefinitions(): readonly ReportDefinition[] {
  return Object.freeze(Object.values(REPORT_DEFINITIONS));
}
