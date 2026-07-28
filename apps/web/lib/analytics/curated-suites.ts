import type { AnalyticsSuiteKey } from "./routes";

export type AnalyticsCuratedSuite = {
  readonly key: AnalyticsSuiteKey;
  readonly title: string;
  readonly description: string;
  readonly tag: string;
  readonly categoryKey: string;
};

/** Release 1.0 curated dashboard suites (presentation labels only). */
export const ANALYTICS_CURATED_SUITES: readonly AnalyticsCuratedSuite[] = [
  {
    key: "executive",
    title: "Executive Dashboard",
    description: "High-level suite KPIs for sponsors and leaders.",
    tag: "executive",
    categoryKey: "executive",
  },
  {
    key: "operational",
    title: "Operational Dashboard",
    description: "Day-to-day operations scorecards.",
    tag: "operational",
    categoryKey: "operational",
  },
  {
    key: "projects",
    title: "Projects Dashboard",
    description: "Delivery and workload analytics over Projects.",
    tag: "projects",
    categoryKey: "projects",
  },
  {
    key: "time",
    title: "Time Dashboard",
    description: "Utilisation and time-entry aggregates.",
    tag: "time",
    categoryKey: "time",
  },
  {
    key: "support",
    title: "Support Dashboard",
    description: "Ticket and SLA style analytics views.",
    tag: "support",
    categoryKey: "support",
  },
  {
    key: "platform-health",
    title: "Platform Health",
    description: "Hierarchical platform health summary (consume, not Observe SoR).",
    tag: "platform-health",
    categoryKey: "platform-health",
  },
  {
    key: "repository-metrics",
    title: "Repository Metrics",
    description: "Selected engineering and quality indicators (metadata only).",
    tag: "repository-metrics",
    categoryKey: "repository-metrics",
  },
] as const;

export function getCuratedSuite(
  key: AnalyticsSuiteKey,
): AnalyticsCuratedSuite | undefined {
  return ANALYTICS_CURATED_SUITES.find((suite) => suite.key === key);
}
