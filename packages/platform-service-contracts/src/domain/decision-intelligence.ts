/**
 * APZ Analytics Decision Intelligence (APZ-ANALYTICS-CAPABILITY-001).
 * Analytics consumes SoRs; never becomes one. No AI / predictive models.
 */

export type DecisionAudienceRole =
  "executive" | "manager" | "project_manager" | "support_manager" | "team_member";

export type DecisionTrendDomain =
  | "project_delivery"
  | "support_performance"
  | "workflow_throughput"
  | "operational_quality";

export type DecisionKpiStatus = "on_track" | "at_risk" | "off_track" | "unknown";

export interface DecisionQuestion {
  readonly id: string;
  readonly question: string;
  readonly audienceRoles: readonly DecisionAudienceRole[];
  readonly domain: string;
  readonly horizon: "operational" | "tactical" | "strategic";
  readonly whyItMatters: string;
  readonly evidenceSummary: string;
  readonly recommendedActions: readonly string[];
  readonly relatedProducts: readonly string[];
}

export interface DecisionIndicator {
  readonly label: string;
  readonly value: string;
  readonly direction: "up" | "down" | "flat";
  readonly significance: "positive" | "negative" | "neutral";
}

export interface DecisionPack {
  readonly id: string;
  readonly tenantId: string;
  readonly questionId: string;
  readonly question: string;
  readonly audienceRole: DecisionAudienceRole;
  readonly indicators: readonly DecisionIndicator[];
  readonly supportingEvidence: readonly string[];
  readonly trendSummary: string;
  readonly recommendedActions: readonly string[];
  readonly generatedAt: string;
  readonly createdAt: string;
}

export interface DecisionTrendPoint {
  readonly id: string;
  readonly tenantId: string;
  readonly domain: DecisionTrendDomain;
  readonly label: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly value: number;
  readonly unit: string;
  readonly note?: string;
  readonly createdAt: string;
}

export interface DecisionTrendSeries {
  readonly domain: DecisionTrendDomain;
  readonly title: string;
  readonly points: readonly DecisionTrendPoint[];
  readonly changeSummary: string;
}

export interface DecisionKpi {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly description: string;
  readonly owner: string;
  readonly targetValue: number;
  readonly currentValue: number;
  readonly unit: string;
  readonly domain: DecisionTrendDomain;
  readonly status: DecisionKpiStatus;
  readonly history: readonly { readonly at: string; readonly value: number }[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface DecisionTimelineEntry {
  readonly id: string;
  readonly tenantId: string;
  readonly title: string;
  readonly decision: string;
  readonly rationale: string;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly evidenceRefs: readonly string[];
  readonly relatedQuestionId?: string;
  readonly relatedProduct?: string;
  readonly sourceRecordRef?: string;
  readonly createdAt: string;
}
